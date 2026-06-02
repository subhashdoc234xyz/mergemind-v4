'use client';
import { useState } from 'react';

interface Props {
  onSubmit: (diff: string) => void;
  loading: boolean;
}

export default function DiffInput({ onSubmit, loading }: Props) {
  const [diff, setDiff] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (diff.trim()) onSubmit(diff.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col space-y-4">
      <span className="text-gray-400 text-sm font-medium tracking-wide self-start">
        Paste Raw Git Diff
      </span>
      <textarea
        value={diff}
        onChange={e => setDiff(e.target.value)}
        placeholder={`Paste your raw git diff here...\n\nExample:\ndiff --git a/index.js b/index.js\n--- a/index.js\n+++ b/index.js\n@@ -1,5 +1,6 @@\n+const x = 1;`}
        rows={10}
        disabled={loading}
        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-400 transition-colors font-mono resize-none disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-gray-500 text-xs leading-relaxed">
          Run <code className="bg-gray-800 px-1.5 py-0.5 rounded text-gray-400 font-mono">git diff HEAD</code> in your terminal and paste the output above
        </p>
        <button
          type="submit"
          disabled={loading || !diff.trim()}
          className="bg-orange-400 hover:bg-orange-300 disabled:bg-gray-850 disabled:text-gray-600 text-gray-950 font-medium px-6 py-3 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap active:scale-[0.98] self-end sm:self-auto"
        >
          {loading ? 'Reviewing...' : 'Review Diff'}
        </button>
      </div>
    </form>
  );
}
