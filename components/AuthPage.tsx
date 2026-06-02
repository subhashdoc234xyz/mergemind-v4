'use client';

import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError("");
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setError(err.message.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      const provider = new GithubAuthProvider();
      provider.addScope('user:email');
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setError(err.message.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-radial-glow opacity-60 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-radial-purple-glow opacity-40 pointer-events-none" />

      {/* Card container */}
      <div className="w-full max-w-md glass-panel rounded-2xl p-8 z-10 border border-gray-800/80 shadow-2xl relative overflow-hidden scanline">
        
        {/* Brand/Logo Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-orange-500/10 border border-orange-400/20 mb-4 animate-bounce [animation-duration:3s]">
            🤖
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight select-none">
            Merge<span className="text-orange-400 text-glow-orange">MinD</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            AI-Powered GitLab MR Review Agent
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 bg-gray-900/80 border border-gray-800 rounded-xl p-1.5 mb-6">
          <button
            onClick={() => { setIsLogin(true); setError(""); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${
              isLogin
                ? "bg-gray-800 text-white shadow-sm border border-gray-700/50"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(""); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${
              !isLogin
                ? "bg-gray-800 text-white shadow-sm border border-gray-700/50"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form Welcome Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white">
            {isLogin ? "Welcome back" : "Create your account"}
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            {isLogin
              ? "Sign in to start reviewing GitLab Merge Requests"
              : "Register to empower your code reviews"}
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2.5 font-mono shadow-inner">
            <span className="flex-shrink-0 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Form Inputs */}
        <div className="space-y-4 mb-8">
          <div>
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="you@example.com"
              className="w-full bg-gray-900/60 border border-gray-800 hover:border-gray-700 focus:border-orange-500 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none transition-all duration-300 shadow-inner"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="••••••••"
              className="w-full bg-gray-900/60 border border-gray-800 hover:border-gray-700 focus:border-orange-500 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none transition-all duration-300 shadow-inner"
            />
            {!isLogin && (
              <p className="text-xs text-gray-500 mt-2 font-mono">
                Must be at least 6 characters
              </p>
            )}
          </div>
        </div>

        {/* Submit Action */}
        <button
          onClick={handleSubmit}
          disabled={loading || !email || !password}
          className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 cursor-pointer shadow-lg ${
            loading || !email || !password
              ? "bg-gray-850 border border-gray-800/80 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white hover:scale-[1.02] active:scale-[0.98] pulse-glow"
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              {isLogin ? "Signing In..." : "Creating Account..."}
            </span>
          ) : isLogin ? (
            "🤖 Sign In"
          ) : (
            "🤖 Create Account"
          )}
        </button>
        
        {/* Divider */}
        <div className="relative flex items-center my-6">
          <div className="flex-grow border-t border-gray-800/60"></div>
          <span className="flex-shrink mx-4 text-gray-500 text-xs font-mono select-none">OR CONTINUE WITH</span>
          <div className="flex-grow border-t border-gray-800/60"></div>
        </div>

        {/* OAuth Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gray-900/60 border border-gray-800 hover:border-gray-700 hover:bg-gray-900 text-white text-sm font-semibold transition-all duration-300 cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </button>
          <button
            onClick={handleGithubSignIn}
            disabled={loading}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gray-900/60 border border-gray-800 hover:border-gray-700 hover:bg-gray-900 text-white text-sm font-semibold transition-all duration-300 cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
            GitHub
          </button>
        </div>

        {/* Toggle Footer */}
        <p className="text-xs text-gray-400 text-center mt-6">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => { setIsLogin(!isLogin); setError(""); }}
            className="text-orange-400 hover:text-orange-300 font-semibold transition-all duration-300 hover:underline cursor-pointer ml-1"
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>

      <p className="text-xs text-gray-500 mt-8 font-mono select-none">
        Powered by <span className="text-orange-400/80">Firebase</span>
      </p>
    </div>
  );
}
