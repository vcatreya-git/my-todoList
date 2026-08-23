'use client';

interface HeroProps {
  headline?: string;
  subheadline?: string;
  ctaText?: string;
  onCtaClick?: () => void;
}

export default function Hero({
  headline = "Organize Your Life, One Task at a Time",
  subheadline = "TaskList is the minimalist task management app designed for individuals who value simplicity and productivity. Stay focused, get things done.",
  ctaText = "Get Started Free",
  onCtaClick,
}: HeroProps) {
  return (
    <section className="min-h-[88vh] flex items-center justify-center px-4 pt-16">
      <div className="max-w-3xl mx-auto text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 rounded-full border border-[var(--border)] bg-[var(--card-bg)] text-xs text-[var(--muted)]">
          <span className="w-1.5 h-1.5 bg-[var(--success)] rounded-full" />
          Now available for everyone
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--foreground)] leading-tight mb-5 tracking-tight">
          {headline}
        </h1>

        {/* Subheadline */}
        <p className="text-base md:text-lg text-[var(--muted)] max-w-xl mx-auto mb-10 leading-relaxed">
          {subheadline}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onCtaClick}
            className="w-full sm:w-auto px-7 py-3 bg-[var(--foreground)] text-[var(--background)] font-medium rounded-lg hover:opacity-80 transition-opacity text-sm"
          >
            {ctaText}
          </button>
          <button className="w-full sm:w-auto px-7 py-3 border border-[var(--border)] hover:border-[var(--border-hover)] text-[var(--foreground)] font-medium rounded-lg transition-colors text-sm hover:bg-[var(--card-hover)]">
            Learn more
          </button>
        </div>

        {/* Social proof */}
        <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-[var(--muted)]">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5">
              {['#e9d5ff', '#bfdbfe', '#bbf7d0', '#fde68a'].map((c, i) => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-[var(--background)]" style={{ backgroundColor: c }} />
              ))}
            </div>
            <span>10k+ users</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-[var(--border)]" />
          <div className="flex items-center gap-1">
            {[1,2,3,4,5].map(i => (
              <svg key={i} className="w-4 h-4 text-[#f59e0b] fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            ))}
            <span className="ml-1">4.9 / 5</span>
          </div>
        </div>
      </div>
    </section>
  );
}
