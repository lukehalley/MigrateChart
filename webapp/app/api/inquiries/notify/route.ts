import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/inquiries/notify
 *
 * Send email notification for new inquiry
 * Uses Resend if configured, otherwise logs to console
 */
export async function POST(request: NextRequest) {
  try {
    const inquiry = await request.json();

    // Check if Resend is configured
    if (process.env.RESEND_API_KEY && process.env.ADMIN_EMAIL) {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);

      const emailHtml = `
        <h2>New Project Inquiry</h2>
        <p><strong>From:</strong> ${inquiry.name} (${inquiry.email})</p>
        ${inquiry.telegram ? `<p><strong>Telegram:</strong> ${inquiry.telegram}</p>` : ''}

        <h3>Project Details</h3>
        <p><strong>Project Name:</strong> ${inquiry.project_name}</p>
        <p><strong>Pre-Migration Token:</strong> <code>${inquiry.old_token_address}</code></p>
        ${inquiry.new_token_address ? `<p><strong>Post-Migration Token:</strong> <code>${inquiry.new_token_address}</code></p>` : '<p><em>Project has not migrated yet</em></p>'}
        ${inquiry.migrate_fun_url ? `<p><strong>Migrate.Fun:</strong> <a href="${inquiry.migrate_fun_url}">${inquiry.migrate_fun_url}</a></p>` : ''}

        ${inquiry.message ? `
          <h3>Message</h3>
          <p>${inquiry.message}</p>
        ` : ''}

        <hr />
        <p><small>Submitted: ${new Date(inquiry.created_at).toLocaleString()}</small></p>
        <p><small>View in dashboard: ${process.env.NEXTAUTH_URL}/admin/inquiries</small></p>
      `;

      // Send admin notification email
      const adminResult = await resend.emails.send({
        from: 'Migrate Chart <notifications@migrate-chart.fun>',
        to: process.env.ADMIN_EMAIL,
        subject: `New Inquiry: ${inquiry.project_name}`,
        html: emailHtml
      });

      console.log('✅ Admin email sent via Resend:', {
        to: process.env.ADMIN_EMAIL,
        subject: `New Inquiry: ${inquiry.project_name}`,
        id: adminResult.data?.id,
        error: adminResult.error
      });

      // Send user confirmation email
      const userEmailHtml = `
        <h2>Thank You for Your Submission</h2>
        <p>Hi ${inquiry.name},</p>

        <p>We've received your listing request for <strong>${inquiry.project_name}</strong> and are reviewing it now.</p>

        <h3>What Happens Next?</h3>
        <p>Our team will review your submission within 24-48 hours. We'll reach out via email or Telegram if we need any additional information.</p>

        <h3>Your Submission Details</h3>
        <p><strong>Project Name:</strong> ${inquiry.project_name}</p>
        <p><strong>Pre-Migration Token:</strong> <code>${inquiry.old_token_address}</code></p>
        ${inquiry.new_token_address ? `<p><strong>Post-Migration Token:</strong> <code>${inquiry.new_token_address}</code></p>` : '<p><em>No post-migration token provided</em></p>'}
        ${inquiry.migrate_fun_url ? `<p><strong>Migrate.Fun:</strong> <a href="${inquiry.migrate_fun_url}">${inquiry.migrate_fun_url}</a></p>` : ''}

        <hr />
        <p><small>If you have any questions, please contact us at <a href="mailto:migratechart@gmail.com">migratechart@gmail.com</a></small></p>
        <p><small>Submitted: ${new Date(inquiry.created_at).toLocaleString()}</small></p>
      `;

      const userResult = await resend.emails.send({
        from: 'Migrate Chart <notifications@migrate-chart.fun>',
        to: inquiry.email,
        subject: `Submission Received: ${inquiry.project_name}`,
        html: userEmailHtml
      });

      console.log('✅ User confirmation email sent via Resend:', {
        to: inquiry.email,
        subject: `Submission Received: ${inquiry.project_name}`,
        id: userResult.data?.id,
        error: userResult.error
      });

      return NextResponse.json({
        success: true,
        method: 'resend',
        adminEmailId: adminResult.data?.id,
        userEmailId: userResult.data?.id
      });
    }

    // Fallback: log to console (for development)
    console.log('=== NEW INQUIRY ===');
    console.log('Name:', inquiry.name);
    console.log('Email:', inquiry.email);
    console.log('Project:', inquiry.project_name);
    console.log('Old Token:', inquiry.old_token_address);
    console.log('New Token:', inquiry.new_token_address);
    console.log('Migrate.Fun:', inquiry.migrate_fun_url);
    console.log('Message:', inquiry.message);
    console.log('==================');

    return NextResponse.json({ success: true, method: 'console' });
  } catch (error: any) {
    console.error('Error sending notification:', error);

    // Don't fail the request - notification is best-effort
    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: 200 } // Still return 200 so inquiry submission succeeds
    );
  }
}
