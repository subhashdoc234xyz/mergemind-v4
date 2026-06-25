import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const runtime = 'nodejs';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { toEmail, prTitle, review, shareUrl } = await req.json();

    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

    if (!toEmail) {
      console.warn('No recipient email provided — user may have logged in via GitHub without email scope');
      return NextResponse.json({ error: 'No recipient email available. Please log in with an account that has an email.' }, { status: 400 });
    }

    if (!gmailUser || !gmailAppPassword || gmailUser === 'your_gmail@gmail.com') {
      console.warn('Gmail SMTP not configured — check GMAIL_USER and GMAIL_APP_PASSWORD in .env.local');
      return NextResponse.json({ error: 'Email service not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD in .env.local' }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    });

    const criticalCount = review.issues.filter((i: { severity: string }) => i.severity === 'CRITICAL').length;
    const warningsCount = review.issues.filter((i: { severity: string }) => i.severity === 'WARNING').length;
    const improvementsCount = review.issues.filter((i: { severity: string }) => i.severity === 'SUGGESTION').length;

    const verdict = review.healthScore >= 8 ? '✅ PASS' : review.healthScore >= 5 ? '⚠️ NEEDS IMPROVEMENTS' : '❌ FAIL';
    const verdictColor = review.healthScore >= 8 ? '#22c55e' : review.healthScore >= 5 ? '#f97316' : '#ef4444';

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#0d0d0d;font-family:'Segoe UI',sans-serif;color:#e5e5e5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0d;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid #1f1f1f;border-radius:16px;overflow:hidden;max-width:600px;">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a1a1a,#0d0d0d);padding:32px 40px;border-bottom:1px solid #1f1f1f;">
              <h1 style="margin:0;font-size:26px;font-weight:700;color:#fff;">
                Merge<span style="color:#f97316;">MinD</span>
              </h1>
              <p style="margin:6px 0 0;font-size:13px;color:#6b7280;">AI-Powered Code Review Report</p>
            </td>
          </tr>

          <!-- PR Title -->
          <tr>
            <td style="padding:32px 40px 20px;">
              <p style="margin:0 0 6px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;">Merge Request</p>
              <h2 style="margin:0;font-size:20px;font-weight:600;color:#fff;">${prTitle}</h2>
            </td>
          </tr>

          <!-- Score Card -->
          <tr>
            <td style="padding:0 40px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;">
                <tr>
                  <td style="padding:24px;" align="center">
                    <div style="font-size:56px;font-weight:800;color:#f97316;line-height:1;">${review.healthScore}<span style="font-size:24px;color:#6b7280;">/10</span></div>
                    <div style="margin-top:8px;font-size:16px;font-weight:700;color:${verdictColor};">${verdict}</div>
                    <p style="margin:16px 0 0;font-size:14px;color:#9ca3af;line-height:1.6;">${review.summary}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Issue Counts -->
          <tr>
            <td style="padding:0 40px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="33%" style="padding:0 6px 0 0;">
                    <table width="100%" style="background:#1a0a0a;border:1px solid #3f1515;border-radius:10px;" cellpadding="16" cellspacing="0">
                      <tr><td align="center">
                        <div style="font-size:28px;font-weight:800;color:#ef4444;">${criticalCount}</div>
                        <div style="font-size:11px;color:#9ca3af;margin-top:4px;text-transform:uppercase;letter-spacing:0.5px;">Critical</div>
                      </td></tr>
                    </table>
                  </td>
                  <td width="33%" style="padding:0 3px;">
                    <table width="100%" style="background:#1a1200;border:1px solid #3f2d00;border-radius:10px;" cellpadding="16" cellspacing="0">
                      <tr><td align="center">
                        <div style="font-size:28px;font-weight:800;color:#f59e0b;">${warningsCount}</div>
                        <div style="font-size:11px;color:#9ca3af;margin-top:4px;text-transform:uppercase;letter-spacing:0.5px;">Warnings</div>
                      </td></tr>
                    </table>
                  </td>
                  <td width="33%" style="padding:0 0 0 6px;">
                    <table width="100%" style="background:#001a0f;border:1px solid #003d1f;border-radius:10px;" cellpadding="16" cellspacing="0">
                      <tr><td align="center">
                        <div style="font-size:28px;font-weight:800;color:#22c55e;">${improvementsCount}</div>
                        <div style="font-size:11px;color:#9ca3af;margin-top:4px;text-transform:uppercase;letter-spacing:0.5px;">Suggestions</div>
                      </td></tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${shareUrl ? `
          <!-- CTA Button -->
          <tr>
            <td style="padding:0 40px 32px;" align="center">
              <a href="${shareUrl}" style="display:inline-block;background:#f97316;color:#000;font-weight:700;font-size:15px;text-decoration:none;padding:14px 32px;border-radius:10px;">
                View Full Review →
              </a>
            </td>
          </tr>
          ` : ''}

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #1f1f1f;" align="center">
              <p style="margin:0;font-size:12px;color:#4b5563;">
                Sent by <strong style="color:#f97316;">MergeMinD</strong> — AI code review powered by Gemini 2.5 Flash + GitLab MCP
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    await transporter.sendMail({
      from: `MergeMinD <${gmailUser}>`,
      to: toEmail,
      subject: `MergeMinD Review: ${prTitle} — Score ${review.healthScore}/10`,
      html,
    });

    console.log(`Review email sent successfully via Gmail SMTP to ${toEmail}`);
    return NextResponse.json({ success: true });

  } catch (err: unknown) {
    console.error('Email send error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
