'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { nanoid } from 'nanoid';
import MRInput from '@/components/MRInput';
import DiffInput from '@/components/DiffInput';
import ReviewPanel from '@/components/ReviewPanel';
import Header from '@/components/Header';
import AuthPage from '@/components/AuthPage';
import ShareButton from '@/components/ShareButton';
import ExportMarkdownButton from '@/components/ExportMarkdownButton';
import { ReviewResponse } from '@/types/review';
import { sendReviewEmail } from '@/lib/emailjs';

export default function Page() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState<ReviewResponse | null>(null);
  const [error, setError] = useState('');
  const [inputMode, setInputMode] = useState<'url' | 'diff'>('url');
  const [emailSent, setEmailSent] = useState(false);

  // Listen for auth state changes
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  async function handleReview(mrUrl: string) {
    setLoading(true);
    setError('');
    setReview(null);

    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mrUrl }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to review the Merge Request.');
      }

      const data: ReviewResponse = await res.json();
      setReview(data);

      console.log("EmailJS Diagnostic — handleReview:", {
        userEmail: user?.email,
        serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
        publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ? "Present" : "Missing"
      });

      if (user?.email) {
        let shareUrl = '';
        try {
          const shareId = nanoid(10);
          await setDoc(doc(db, 'sharedReviews', shareId), {
            prData: data.prData,
            review: data,
            createdAt: serverTimestamp(),
            shareId,
          });
          shareUrl = `${window.location.origin}/share/${shareId}`;
        } catch (dbErr) {
          console.error("Failed to generate shared link:", dbErr);
        }

        sendReviewEmail({
          toEmail: user.email,
          prTitle: data.prData?.title || 'Merge Request Review',
          review: data,
          shareUrl,
        }).then(() => {
          setEmailSent(true);
          setTimeout(() => setEmailSent(false), 4000);
        }).catch((err) => {
          console.error("EmailJS Send Failed:", err);
        });
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRawDiffReview(diff: string) {
    setLoading(true);
    setError('');
    setReview(null);

    try {
      const res = await fetch('/api/review-diff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diff }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to review the diff.');
      }

      const data: ReviewResponse = await res.json();
      setReview(data);

      console.log("EmailJS Diagnostic — handleRawDiffReview:", {
        userEmail: user?.email,
        serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
        publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ? "Present" : "Missing"
      });

      if (user?.email) {
        let shareUrl = '';
        try {
          const shareId = nanoid(10);
          const prData = {
            title: 'Raw Diff Review',
            author: user.displayName || user.email || 'Anonymous',
            changedFiles: 0,
            additions: 0,
            deletions: 0,
            baseBranch: '',
            headBranch: '',
          };
          await setDoc(doc(db, 'sharedReviews', shareId), {
            prData,
            review: data,
            createdAt: serverTimestamp(),
            shareId,
          });
          shareUrl = `${window.location.origin}/share/${shareId}`;
        } catch (dbErr) {
          console.error("Failed to generate shared link, falling back:", dbErr);
        }

        sendReviewEmail({
          toEmail: user.email,
          prTitle: 'Raw Diff Review',
          review: data,
          shareUrl,
        }).then(() => {
          setEmailSent(true);
          setTimeout(() => setEmailSent(false), 4000);
        }).catch((err) => {
          console.error("EmailJS Send Failed:", err);
        });
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }


  // Show premium loading spinner while checking auth session
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center space-y-6">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-4 border-gray-800 border-t-orange-400 animate-spin" />
          <div className="absolute w-8 h-8 rounded-full bg-orange-400/10 animate-ping" />
        </div>
        <div className="text-gray-400 text-sm font-mono animate-pulse">
          Initializing MergeMinD Session...
        </div>
      </div>
    );
  }

  // If not logged in, render the beautiful AuthPage
  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-950">
      <Header user={user} />

      <main className="flex-1 text-white font-sans selection:bg-orange-500/30 selection:text-orange-300">
        <div className="max-w-4xl mx-auto px-6 py-16 flex flex-col items-center justify-start space-y-12">
          
          {/* Header Section */}
          <div className="text-center space-y-6 w-full">
            <h1 className="font-semibold text-5xl tracking-tight select-none">
              Merge<span className="text-orange-400 text-glow">MinD</span>
            </h1>
            
            <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">
              AI code review that thinks like a senior engineer
            </p>

            {/* Three Badge Pills */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-orange-500/10 border border-orange-500/20 text-orange-400 transition-all duration-300 hover:bg-orange-500/20">
                Powered by Gemini 2.5 Flash
              </span>
              <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-purple-500/10 border border-purple-500/20 text-purple-400 transition-all duration-300 hover:bg-purple-500/20">
                GitLab MCP
              </span>
              <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-400 transition-all duration-300 hover:bg-blue-500/20">
                Google Cloud Agent Platform
              </span>
            </div>
          </div>

          {/* Input Form Section */}
          <div className="w-full space-y-6">
            {/* Input Mode Toggle */}
            <div className="flex bg-gray-900/60 border border-gray-800 rounded-xl p-1 w-fit mx-auto sm:mx-0 shadow-inner">
              <button
                onClick={() => setInputMode('url')}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${
                  inputMode === 'url'
                    ? 'bg-orange-500 text-gray-950 shadow-md font-bold'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                🔗 GitLab MR URL
              </button>
              <button
                onClick={() => setInputMode('diff')}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${
                  inputMode === 'diff'
                    ? 'bg-orange-500 text-gray-950 shadow-md font-bold'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                📋 Paste Raw Diff
              </button>
            </div>

            {/* Input Components */}
            {inputMode === 'url' && (
              <MRInput onSubmit={handleReview} loading={loading} />
            )}
            {inputMode === 'diff' && (
              <DiffInput onSubmit={handleRawDiffReview} loading={loading} />
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-10 space-y-8 w-full">
              {/* Centered Spinner */}
              <div className="relative flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-4 border-gray-800 border-t-orange-400 animate-spin" />
                <div className="absolute w-8 h-8 rounded-full bg-orange-400/10 animate-ping" />
              </div>
              
              {/* 3 custom loading logs */}
              <div className="text-center font-mono space-y-2.5 max-w-md w-full px-6 py-4 rounded-xl bg-gray-900/40 border border-gray-800/50 shadow-inner font-normal">
                <div className="text-sm text-gray-400 flex items-center justify-center gap-2 animate-pulse">
                  <span className="inline-block w-2 h-2 rounded-full bg-orange-400 animate-ping" />
                  Fetching MR diff from GitLab...
                </div>
                <div className="text-sm text-gray-400 flex items-center justify-center gap-2 animate-pulse [animation-delay:0.3s]">
                  <span className="inline-block w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                  Reading past MRs for context...
                </div>
                <div className="text-sm text-gray-400 flex items-center justify-center gap-2 animate-pulse [animation-delay:0.6s]">
                  <span className="inline-block w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                  Gemini is reviewing your code...
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="w-full bg-red-500/10 border border-red-500/20 text-red-400 p-5 rounded-xl text-sm flex flex-col space-y-2 shadow-lg animate-shake">
              <div className="flex items-center gap-2 font-semibold">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Review Error Encountered
              </div>
              <p className="font-mono text-xs leading-relaxed">{error}</p>
            </div>
          )}

          {/* Email Sent Toast */}
          {emailSent && (
            <div className="w-full bg-orange-950/40 border border-orange-500/20 text-orange-300 p-4 rounded-xl text-sm flex items-center gap-2.5 shadow-lg animate-fade-in">
              <span>✅</span>
              <span>Review summary sent to <strong>{user?.email}</strong></span>
            </div>
          )}


          {/* Review Results Panel */}
          {review && !loading && (
            <div className="w-full transition-all duration-500 ease-out space-y-4">
              {review.prData && (
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <ShareButton prData={review.prData} review={review} />
                  <ExportMarkdownButton prData={review.prData} review={review} />
                </div>
              )}
              <ReviewPanel review={review} />
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
