import emailjs from '@emailjs/browser';
import { ReviewResponse } from '@/types/review';

interface SendReviewEmailParams {
  toEmail: string;
  prTitle: string;
  review: ReviewResponse;
}

export async function sendReviewEmail({ toEmail, prTitle, review }: SendReviewEmailParams) {
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
  const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

  if (!serviceId || !templateId || !publicKey) {
    console.warn('EmailJS keys not configured');
    return;
  }

  const criticalCount = review.issues.filter(i => i.severity === 'CRITICAL').length;
  const warningsCount = review.issues.filter(i => i.severity === 'WARNING').length;
  const improvementsCount = review.issues.filter(i => i.severity === 'SUGGESTION').length;

  const templateParams = {
    to_email: toEmail,
    pr_title: prTitle,
    score: review.healthScore,
    verdict: review.healthScore >= 8 ? 'PASS' : review.healthScore >= 5 ? 'NEEDS IMPROVEMENTS' : 'FAIL',
    summary: review.summary,
    critical_count: criticalCount,
    warnings_count: warningsCount,
    improvements_count: improvementsCount,
    review_url: typeof window !== 'undefined' ? window.location.href : '',
  };

  try {
    await emailjs.send(serviceId, templateId, templateParams, publicKey);
    console.log('Review email sent successfully');
  } catch (err) {
    console.error('EmailJS error:', err);
    throw err;
  }
}
