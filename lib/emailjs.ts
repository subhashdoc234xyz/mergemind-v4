import { ReviewResponse } from '@/types/review';

interface SendReviewEmailParams {
  toEmail: string;
  prTitle: string;
  review: ReviewResponse;
  shareUrl?: string;
}

export async function sendReviewEmail({ toEmail, prTitle, review, shareUrl }: SendReviewEmailParams) {
  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toEmail, prTitle, review, shareUrl }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to send email');
    }

    console.log('Review email sent successfully');
  } catch (err) {
    console.error('Email send error:', err);
    throw err;
  }
}
