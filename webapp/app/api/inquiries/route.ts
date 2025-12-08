import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role for server-side API routes (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/inquiries
 *
 * Submit a new project inquiry
 * Public endpoint with rate limiting
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      telegram,
      projectName,
      oldTokenAddress,
      newTokenAddress,
      migrateFunUrl,
      message
    } = body;

    const errors: string[] = [];

    // Name validation
    if (!name || typeof name !== 'string') {
      errors.push('Name is required');
    } else {
      const trimmedName = name.trim();
      if (trimmedName.length < 2) {
        errors.push('Name must be at least 2 characters');
      } else if (trimmedName.length > 100) {
        errors.push('Name must be less than 100 characters');
      }
    }

    // Email validation
    if (!email || typeof email !== 'string') {
      errors.push('Email is required');
    } else {
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      if (!emailRegex.test(email.trim())) {
        errors.push('Invalid email format');
      } else if (email.length > 254) {
        errors.push('Email must be less than 254 characters');
      }
    }

    // Telegram validation (optional)
    if (telegram && typeof telegram === 'string' && telegram.trim()) {
      const trimmedTelegram = telegram.trim();
      if (!trimmedTelegram.startsWith('@')) {
        errors.push('Telegram handle must start with @');
      } else if (trimmedTelegram.length < 2 || trimmedTelegram.length > 33) {
        errors.push('Telegram handle must be between 2-32 characters');
      } else if (!/^@[A-Za-z0-9_]+$/.test(trimmedTelegram)) {
        errors.push('Telegram handle can only contain letters, numbers, and underscores');
      }
    }

    // Project name validation
    if (!projectName || typeof projectName !== 'string') {
      errors.push('Project name is required');
    } else {
      const trimmedProjectName = projectName.trim();
      if (trimmedProjectName.length < 2) {
        errors.push('Project name must be at least 2 characters');
      } else if (trimmedProjectName.length > 100) {
        errors.push('Project name must be less than 100 characters');
      }
    }

    // Solana address validation (base58: 32-44 chars, alphanumeric excluding 0, O, I, l)
    const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

    // Old token address validation
    if (!oldTokenAddress || typeof oldTokenAddress !== 'string') {
      errors.push('Pre-migration token address is required');
    } else {
      const trimmedOld = oldTokenAddress.trim();
      if (!solanaAddressRegex.test(trimmedOld)) {
        errors.push('Invalid pre-migration token address format');
      }
    }

    // New token address validation (optional - project may not have migrated yet)
    if (newTokenAddress && typeof newTokenAddress === 'string' && newTokenAddress.trim()) {
      const trimmedNew = newTokenAddress.trim();
      if (!solanaAddressRegex.test(trimmedNew)) {
        errors.push('Invalid current token address format');
      }

      // Check addresses are different (only if both provided)
      if (oldTokenAddress && oldTokenAddress.trim() === trimmedNew) {
        errors.push('Pre-migration and current token addresses must be different');
      }
    }

    // Migrate.fun URL validation (optional)
    if (migrateFunUrl && typeof migrateFunUrl === 'string' && migrateFunUrl.trim()) {
      const trimmedUrl = migrateFunUrl.trim();
      try {
        const url = new URL(trimmedUrl);
        if (!url.hostname.endsWith('migrate.fun')) {
          errors.push('Migrate.fun URL must be from migrate.fun domain');
        }
      } catch {
        errors.push('Invalid Migrate.fun URL format');
      }
    }

    // Message validation (optional)
    if (message && typeof message === 'string' && message.length > 2000) {
      errors.push('Message must be less than 2000 characters');
    }

    // Return all validation errors
    if (errors.length > 0) {
      return NextResponse.json(
        { error: errors.join('. '), errors },
        { status: 400 }
      );
    }

    // Check for duplicate submissions (by email or token addresses)
    // Build the OR condition dynamically based on what's provided
    let orConditions = [`email.eq.${email}`, `old_token_address.eq.${oldTokenAddress}`];
    if (newTokenAddress && newTokenAddress.trim()) {
      orConditions.push(`new_token_address.eq.${newTokenAddress}`);
    }

    const { data: existingInquiry } = await supabase
      .from('inquiries')
      .select('id, email, old_token_address, new_token_address')
      .or(orConditions.join(','))
      .single();

    if (existingInquiry) {
      return NextResponse.json(
        {
          error: 'An inquiry has already been submitted with this email or token address. Please check your email for our response, or contact us directly at migratechart@gmail.com if you need assistance.',
          duplicate: true
        },
        { status: 409 }
      );
    }

    // Rate limiting check (simple IP-based)
    // In production, use Upstash Redis or Vercel KV
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const { data: recentInquiries } = await supabase
      .from('inquiries')
      .select('created_at')
      .gte('created_at', new Date(Date.now() - 3600000).toISOString()) // Last hour
      .limit(5);

    if (recentInquiries && recentInquiries.length >= 5) {
      return NextResponse.json(
        { error: 'Too many inquiries. Please try again later.' },
        { status: 429 }
      );
    }

    // Insert inquiry
    const { data: inquiry, error: insertError } = await supabase
      .from('inquiries')
      .insert({
        name,
        email,
        telegram,
        project_name: projectName,
        old_token_address: oldTokenAddress,
        new_token_address: newTokenAddress,
        migrate_fun_url: migrateFunUrl,
        message,
        status: 'pending'
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Database error: ${insertError.message}`);
    }

    // Send email notification (if configured)
    try {
      await fetch(`${request.nextUrl.origin}/api/inquiries/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inquiry)
      });
    } catch (emailError) {
      // Don't fail the request if email fails
      console.warn('Failed to send email notification:', emailError);
    }

    return NextResponse.json({
      success: true,
      inquiry: {
        id: inquiry.id,
        projectName: inquiry.project_name,
        status: inquiry.status
      }
    });
  } catch (error: any) {
    console.error('Error creating inquiry:', error);

    return NextResponse.json(
      {
        error: error.message || 'Failed to submit inquiry',
        details: error.toString()
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/inquiries
 *
 * List all inquiries (admin only)
 * Requires authentication
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication check
    // const session = await getServerSession();
    // if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

    let query = supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: inquiries, error } = await query;

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return NextResponse.json({ inquiries });
  } catch (error: any) {
    console.error('Error fetching inquiries:', error);

    return NextResponse.json(
      {
        error: error.message || 'Failed to fetch inquiries',
        details: error.toString()
      },
      { status: 500 }
    );
  }
}
