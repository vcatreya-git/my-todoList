'use client';

import { useState, useEffect, useCallback } from 'react';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  avatar?: string;
}

interface TestimonialsProps {
  title?: string;
  testimonials?: Testimonial[];
  autoPlayInterval?: number;
}

const defaultTestimonials: Testimonial[] = [
  {
    quote: "TaskList has completely transformed how I manage my daily tasks. It's simple, elegant, and just works. I've tried dozens of apps, but this one stuck.",
    author: "Sarah Chen",
    role: "Freelance Designer",
  },
  {
    quote: "Finally, a task app that doesn't overwhelm me with features I'll never use. TaskList keeps me focused on what matters most.",
    author: "Marcus Johnson",
    role: "Software Developer",
  },
  {
    quote: "I love the minimalist design. It's beautiful and functional. My productivity has increased significantly since switching to TaskList.",
    author: "Emily Rodriguez",
    role: "Content Creator",
  },
  {
    quote: "The folder organization is a game-changer. I can finally separate my work and personal tasks without any hassle.",
    author: "David Park",
    role: "Project Manager",
  },
];

export default function Testimonials({
  title = "Loved by thousands",
  testimonials = defaultTestimonials,
  autoPlayInterval = 5000,
}: TestimonialsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToSlide = (index: number) => {
    setActiveIndex(index);
    setIsAutoPlaying(false);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(interval);
  }, [isAutoPlaying, autoPlayInterval, nextSlide]);

  return (
    <section className="py-24 px-4 bg-[var(--card-bg)]" id="testimonials">
      <div className="max-w-4xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-4">
            {title}
          </h2>
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Quote icon */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-[var(--accent)] flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
          </div>

          {/* Testimonial content */}
          <div className="pt-12 pb-8 px-8 md:px-16 text-center min-h-[280px] flex flex-col justify-center">
            <p className="text-xl md:text-2xl text-[var(--foreground)] leading-relaxed mb-8 transition-opacity duration-300">
              "{testimonials[activeIndex].quote}"
            </p>

            <div className="flex flex-col items-center gap-2">
              {/* Avatar placeholder */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--accent)] to-blue-400" />
              <div>
                <p className="font-semibold text-[var(--foreground)]">
                  {testimonials[activeIndex].author}
                </p>
                <p className="text-sm text-[var(--muted)]">
                  {testimonials[activeIndex].role}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-[var(--background)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors"
            aria-label="Previous testimonial"
          >
            <svg className="w-5 h-5 text-[var(--foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-[var(--background)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors"
            aria-label="Next testimonial"
          >
            <svg className="w-5 h-5 text-[var(--foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dots indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === activeIndex
                    ? 'w-8 bg-[var(--accent)]'
                    : 'bg-[var(--border)] hover:bg-[var(--muted)]'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
