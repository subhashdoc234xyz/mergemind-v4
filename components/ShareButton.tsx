'use client';
import { useState } from 'react';

interface Props {
  prData: {
    title: string;
    author: string;
    changedFiles: number;
    additions: number;
    deletions: number;
    baseBranch: string;
    headBranch: string;
  };
  review: any;
}

export default function ShareButton({ prData, review }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'copied' | 'error'>('idle');

  async function handleShare() {
    setStatus('loading');
    try {
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prData, review }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const shareUrl = `${window.location.origin}/share/${data.shareId}`;
      await navigator.clipboard.writeText(shareUrl);
      setStatus('copied');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      console.error(err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  }

  return (
    <button
      onClick={handleShare}
      disabled={status === 'loading'}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-300 cursor-pointer hover:scale-[1.02] active:scale-[0.98]
        ${status === 'copied'
          ? 'bg-orange-500/10 border-orange-500/30 text-orange-400 shadow-md shadow-orange-500/5'
          : status === 'error'
          ? 'bg-red-500/10 border-red-500/30 text-red-400'
          : 'bg-gray-900 border-gray-800 text-gray-300 hover:border-orange-500/30 hover:text-orange-400 hover:bg-gray-900/80'
        }`}
    >
      {status === 'loading' && (
        <svg className="w-4 h-4 animate-spin text-orange-400" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
      )}
      {status === 'idle' && (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      )}
      {status === 'copied' ? '✓ Link Copied!' : status === 'error' ? '⚠ Error' : status === 'loading' ? 'Sharing...' : 'Share Review'}
    </button>
  );
}
