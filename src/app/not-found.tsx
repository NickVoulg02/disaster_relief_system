import React from 'react';
import Link from 'next/link';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 sm:p-8 text-center shadow-2xl">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 mb-4">
          <FileQuestion className="w-9 h-9" />
        </div>
        <div className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-1">
          HTTP Error 404
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          404 Not Found
        </h1>
        <p className="text-sm text-slate-400 mb-6">
          The page or resource you are looking for does not exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold transition shadow-lg shadow-rose-950/50"
          >
            <Home className="w-4 h-4" />
            Go to Dashboard
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Log In Page
          </Link>
        </div>
      </div>
    </div>
  );
}

