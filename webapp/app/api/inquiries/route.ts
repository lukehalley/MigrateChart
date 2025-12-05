import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use anon key for public API endpoints - requires RLS policies
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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

    // Validation
    if (!name || !email || !projectName || !oldTokenAddress || !newTokenAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Token address validation (basic)
    if (oldTokenAddress.length < 32 || newTokenAddress.length < 32) {
      return NextResponse.json(
        { error: 'Invalid token address format' },
        { status: 400 }
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
