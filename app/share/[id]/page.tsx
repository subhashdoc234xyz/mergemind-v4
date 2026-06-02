'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ReviewPanel from '@/components/ReviewPanel';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function SharedReviewPage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const docRef = doc(db, 'sharedReviews', id as string);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          throw new Error('Review not found');
        }
        setData(docSnap.data());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-bold text-xl shadow-lg animate-pulse mx-auto">
            🤖
          </div>
          <p className="text-gray-400 text-sm font-mono animate-pulse">Loading review...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 font-bold text-xl mx-auto">
            ⚠️
          </div>
          <p className="text-red-400 text-sm font-mono">Review not found: {error}</p>
          <p className="text-gray-500 text-xs font-sans">
            This review may have been deleted or the link is invalid.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white selection:bg-orange-500/30 selection:text-orange-300">
      {/* Header */}
      <header className="w-full border-b border-gray-800/80 bg-gray-950/60 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-bold text-lg shadow-lg border border-orange-400/20">
              🤖
            </div>
            <h1 className="text-xl font-bold tracking-tight select-none">
              Merge<span className="text-orange-400 text-glow-orange">MinD</span>
            </h1>
          </div>
          <span className="text-xs bg-gray-900 border border-gray-800 text-gray-500 px-3 py-1.5 rounded-full font-mono">
            Shared Review
          </span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* Shared badge */}
        <div className="flex items-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/10 border border-orange-500/20 text-orange-400">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            Shared Review — View Only
          </span>
        </div>

        {/* PR Meta */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 shadow-xl space-y-4">
          <h3 className="font-semibold text-lg text-white leading-tight">{data.prData.title}</h3>
          <div className="flex flex-wrap gap-2 text-xs font-mono text-gray-400">
            <span className="bg-gray-950 border border-gray-800 px-2.5 py-1 rounded">👤 {data.prData.author}</span>
            <span className="bg-gray-950 border border-gray-800 px-2.5 py-1 rounded">📁 {data.prData.changedFiles} files</span>
            <span className="bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded text-emerald-400">+{data.prData.additions}</span>
            <span className="bg-red-950/40 border border-red-800/40 px-2.5 py-1 rounded text-red-400">-{data.prData.deletions}</span>
            <span className="bg-gray-950 border border-gray-800 px-2.5 py-1 rounded">{data.prData.baseBranch} ← {data.prData.headBranch}</span>
          </div>
        </div>

        {/* Review Output */}
        <ReviewPanel review={data.review} />

        {/* Footer CTA */}
        <div className="mt-12 text-center border-t border-gray-850 pt-8 space-y-3">
          <p className="text-gray-400 text-sm">Want AI reviews for your own Merge Requests?</p>
          <a
            href="/"
            className="inline-block bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white hover:scale-[1.02] active:scale-[0.98] px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-md shadow-orange-500/10"
          >
            Try MergeMinD Free →
          </a>
        </div>
      </div>
    </main>
  );
}
