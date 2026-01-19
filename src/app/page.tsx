'use client';

import {
  Navbar,
  Hero,
  Features,
  Testimonials,
  Pricing,
  EmailSignup,
  Footer,
} from '@/components/landing';

export default function LandingPage() {
  const handleGetStarted = () => {
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar onCtaClick={handleGetStarted} />

      <main>
        <Hero onCtaClick={handleGetStarted} />
        <Features />
        <Testimonials />
        <Pricing />
        <EmailSignup />
      </main>

      <Footer />
    </div>
  );
}
