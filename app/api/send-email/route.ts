import { NextRequest, NextResponse } from 'next/server';
import emailjs from '@emailjs/nodejs';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { toEmail, prTitle, review, shareUrl } = await req.json();

    const serviceId = process.env.EMAILJS_SERVICE_ID || process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.EMAILJS_TEMPLATE_ID || process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.EMAILJS_PUBLIC_KEY || process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      console.warn('EmailJS keys not configured on server');
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    const criticalCount = review.issues.filter((i: { severity: string }) => i.severity === 'CRITICAL').length;
    const warningsCount = review.issues.filter((i: { severity: string }) => i.severity === 'WARNING').length;
    const improvementsCount = review.issues.filter((i: { severity: string }) => i.severity === 'SUGGESTION').length;

    const templateParams = {
      to_email: toEmail,
      pr_title: prTitle,
      score: review.healthScore,
      verdict: review.healthScore >= 8 ? 'PASS' : review.healthScore >= 5 ? 'NEEDS IMPROVEMENTS' : 'FAIL',
      summary: review.summary,
      critical_count: criticalCount,
      warnings_count: warningsCount,
      improvements_count: improvementsCount,
      review_url: shareUrl || '',
    };

    await emailjs.send(serviceId, templateId, templateParams, {
      publicKey,
    });

    console.log('Review email sent successfully via server route');
    return NextResponse.json({ success: true });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('EmailJS server error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
