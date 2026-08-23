'use client';

import { useState } from 'react';

interface EmailSignupProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  placeholder?: string;
  onSubmit?: (email: string) => void;
}

export default function EmailSignup({
  title = "Ready to get organized?",
  subtitle = "Join thousands of users who've simplified their lives with TaskList. Start free, no credit card required.",
  buttonText = "Get Early Access",
  placeholder = "Enter your email",
  onSubmit,
}: EmailSignupProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');

    // Simulate API call
    setTimeout(() => {
      setStatus('success');
      onSubmit?.(email);
      setEmail('');
    }, 1000);
  };

  return (
    <section className="py-24 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="p-12 rounded-2xl bg-[#f7f6f3] border border-[#2383e2]">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#9b9a97] mb-4">
              Get started
            </p>
            <h2 className="text-3xl font-bold text-[#37352f] mb-3 tracking-tight">
              {title}
            </h2>
            <p className="text-base text-[#787774] mb-8 max-w-md mx-auto leading-relaxed">
              {subtitle}
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={placeholder}
                required
                className="flex-1 px-4 py-2.5 rounded-lg bg-white border border-[#e9e9e7] text-[#37352f] placeholder-[#9b9a97] focus:outline-none focus:border-[#c7c7c5] text-sm transition-colors"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-5 py-2.5 bg-[#37352f] text-white text-sm font-medium rounded-lg hover:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {status === 'loading' ? (
                  'Sending...'
                ) : status === 'success' ? (
                  '✓ Subscribed!'
                ) : (
                  buttonText
                )}
              </button>
            </form>

            <p className="text-xs text-[#9b9a97] mt-4">
              No spam, ever. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
