'use client';

interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: PricingFeature[];
  ctaText: string;
  popular?: boolean;
}

interface PricingProps {
  title?: string;
  subtitle?: string;
  tiers?: PricingTier[];
}

const defaultTiers: PricingTier[] = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
    features: [
      { text: "Up to 50 tasks", included: true },
      { text: "3 folders", included: true },
      { text: "Basic task management", included: true },
      { text: "Mobile app access", included: true },
      { text: "Priority support", included: false },
      { text: "Advanced analytics", included: false },
    ],
    ctaText: "Get Started",
  },
  {
    name: "Pro",
    price: "$9",
    period: "per month",
    description: "For power users",
    features: [
      { text: "Unlimited tasks", included: true },
      { text: "Unlimited folders", included: true },
      { text: "Advanced task management", included: true },
      { text: "Mobile app access", included: true },
      { text: "Priority support", included: true },
      { text: "Advanced analytics", included: false },
    ],
    ctaText: "Start Free Trial",
    popular: true,
  },
  {
    name: "Team",
    price: "$29",
    period: "per month",
    description: "For small teams",
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Up to 10 team members", included: true },
      { text: "Shared folders", included: true },
      { text: "Team collaboration", included: true },
      { text: "Priority support", included: true },
      { text: "Advanced analytics", included: true },
    ],
    ctaText: "Contact Sales",
  },
];

export default function Pricing({
  title = "Simple, transparent pricing",
  subtitle = "Choose the plan that fits your needs. No hidden fees, cancel anytime.",
  tiers = defaultTiers,
}: PricingProps) {
  return (
    <section className="py-24 px-4" id="pricing">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-4">
            {title}
          </h2>
          <p className="text-lg text-[var(--muted)] max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Pricing grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {tiers.map((tier, index) => (
            <div
              key={index}
              className={`relative p-8 rounded-2xl border transition-all duration-300 ${
                tier.popular
                  ? 'bg-[var(--card-bg)] border-[var(--accent)] shadow-lg shadow-blue-500/10'
                  : 'bg-[var(--card-bg)] border-[var(--border)] hover:border-[var(--muted)]'
              }`}
            >
              {/* Popular badge */}
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[var(--accent)] text-white text-sm font-medium rounded-full">
                  Most Popular
                </div>
              )}

              {/* Tier header */}
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
                  {tier.name}
                </h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-[var(--foreground)]">
                    {tier.price}
                  </span>
                  <span className="text-[var(--muted)]">/{tier.period}</span>
                </div>
                <p className="text-sm text-[var(--muted)] mt-2">{tier.description}</p>
              </div>

              {/* Features list */}
              <ul className="space-y-4 mb-8">
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-3">
                    {feature.included ? (
                      <svg className="w-5 h-5 text-[var(--success)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-[var(--muted)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                    <span className={feature.included ? 'text-[var(--foreground)]' : 'text-[var(--muted)]'}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA button */}
              <button
                className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 ${
                  tier.popular
                    ? 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-lg shadow-blue-500/20'
                    : 'border border-[var(--border)] hover:border-[var(--accent)] text-[var(--foreground)] hover:bg-[var(--card-hover)]'
                }`}
              >
                {tier.ctaText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
