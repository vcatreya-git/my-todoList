'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

type Mode = 'signin' | 'signup' | 'magic';

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, isLoading, signInWithEmail, signUpWithEmail, signInWithMagicLink } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      if (mode === 'signin') {
        const err = await signInWithEmail(email, password);
        if (err) setError(err.message);
      } else if (mode === 'signup') {
        const err = await signUpWithEmail(email, password);
        if (err) {
          setError(err.message);
        } else {
          setSuccess('Account created! Check your email to confirm your account, then sign in.');
        }
      } else {
        const err = await signInWithMagicLink(email);
        if (err) {
          setError(err.message);
        } else {
          setSuccess('Magic link sent! Check your email to sign in.');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ background: 'var(--background)', minHeight: '100vh' }} className="flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div
      style={{ background: 'var(--background)', color: 'var(--foreground)' }}
      className="min-h-screen flex items-center justify-center p-4"
    >
      <div
        style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}
        className="w-full max-w-md rounded-2xl p-8 shadow-xl"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--foreground)] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
              </svg>
            </div>
            <span className="text-xl font-bold">TaskList</span>
          </div>
          <h1 className="text-2xl font-bold mb-1">
            {mode === 'signin' ? 'Welcome back' : mode === 'signup' ? 'Create account' : 'Magic link'}
          </h1>
          <p style={{ color: 'var(--muted)' }} className="text-sm">
            {mode === 'signin' ? 'Sign in to access your tasks' : mode === 'signup' ? 'Start organizing your tasks today' : 'Get a one-click sign-in link'}
          </p>
        </div>

        {/* Mode tabs */}
        <div style={{ background: 'var(--card-hover)', border: '1px solid var(--border)' }} className="flex rounded-xl p-1 mb-6 gap-1">
          {(['signin', 'signup', 'magic'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(null); setSuccess(null); }}
              style={mode === m ? { background: 'var(--foreground)', color: 'var(--background)' } : { color: 'var(--muted)' }}
              className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200"
            >
              {m === 'signin' ? 'Sign In' : m === 'signup' ? 'Sign Up' : 'Magic Link'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label style={{ color: 'var(--muted)' }} className="block text-xs font-medium mb-1.5 uppercase tracking-wide">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={{ background: 'var(--card-hover)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>

          {mode !== 'magic' && (
            <div>
              <label style={{ color: 'var(--muted)' }} className="block text-xs font-medium mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                style={{ background: 'var(--card-hover)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>
          )}

          {error && (
            <p style={{ color: 'var(--danger)', background: 'var(--card-hover)', border: '1px solid var(--border)' }} className="text-sm px-4 py-3 rounded-xl">
              {error}
            </p>
          )}

          {success && (
            <p style={{ color: 'var(--success)', background: 'var(--card-hover)', border: '1px solid var(--border)' }} className="text-sm px-4 py-3 rounded-xl">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{ background: 'var(--foreground)', opacity: isSubmitting ? 0.7 : 1 }}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? 'Please wait…'
              : mode === 'signin'
              ? 'Sign In'
              : mode === 'signup'
              ? 'Create Account'
              : 'Send Magic Link'}
          </button>
        </form>

        <p style={{ color: 'var(--muted)' }} className="text-center text-xs mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
