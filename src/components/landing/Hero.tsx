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
    <section className="relative min-h-[90vh] flex items-center justify-center px-4 overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--accent)] opacity-10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-400 opacity-5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full border border-[var(--border)] bg-[var(--card-bg)]">
          <span className="w-2 h-2 bg-[var(--success)] rounded-full animate-pulse" />
          <span className="text-sm text-[var(--muted)]">Now available for everyone</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--foreground)] leading-tight mb-6 tracking-tight">
          {headline}
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-[var(--muted)] max-w-2xl mx-auto mb-10 leading-relaxed">
          {subheadline}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onCtaClick}
            className="px-8 py-4 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-105"
          >
            {ctaText}
          </button>
          <button className="px-8 py-4 border border-[var(--border)] hover:border-[var(--muted)] text-[var(--foreground)] font-medium rounded-xl transition-all duration-200 hover:bg-[var(--card-bg)]">
            Learn More
          </button>
        </div>

        {/* Social proof */}
        <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 text-[var(--muted)]">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent)] to-blue-400 border-2 border-[var(--background)]"
                />
              ))}
            </div>
            <span className="text-sm">10k+ users</span>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            ))}
            <span className="text-sm ml-2">4.9/5 rating</span>
          </div>
        </div>
      </div>
    </section>
  );
}
