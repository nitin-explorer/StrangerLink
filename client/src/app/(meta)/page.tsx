'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const AnimatedBackground = dynamic(
  () => import('@/components/landing/AnimatedBackground'),
  { ssr: false }
);

const FEATURES = [
  {
    icon: '🌍',
    title: 'Global Chat',
    description:
      'Join a public room with people from around the world. No walls, no filters — just real conversation.',
  },
  {
    icon: '🎲',
    title: 'Random Match',
    description:
      'Click once and get paired with a stranger instantly. Like Omegle, but faster and smoother.',
  },
  {
    icon: '🔒',
    title: 'Private Rooms',
    description:
      'Create invite-only rooms for deeper conversations. Your space, your rules.',
  },
] as const;

const STEPS = [
  { num: '01', title: 'Visit', description: 'Open StrangerLink. No download. No signup friction.' },
  { num: '02', title: 'Choose', description: 'Pick global, random, or private — your conversation style.' },
  { num: '03', title: 'Connect', description: 'Start talking instantly. Real people, real time.' },
] as const;

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-title', {
        y: 60,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out',
      });
      gsap.from('.hero-subtitle', {
        y: 40,
        opacity: 0,
        duration: 1,
        delay: 0.3,
        ease: 'power3.out',
      });
      gsap.from('.hero-cta', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        delay: 0.6,
        ease: 'power3.out',
      });

      gsap.from('.feature-card', {
        scrollTrigger: {
          trigger: featuresRef.current,
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse',
        },
        y: 80,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
      });

      gsap.from('.step-item', {
        scrollTrigger: {
          trigger: stepsRef.current,
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse',
        },
        x: -60,
        opacity: 0,
        duration: 0.7,
        stagger: 0.2,
        ease: 'power3.out',
      });

      gsap.from('.cta-section', {
        scrollTrigger: {
          trigger: ctaRef.current,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
        scale: 0.95,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="bg-[#09090b] min-h-screen text-white overflow-hidden">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center px-4"
      >
        <AnimatedBackground />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <p className="hero-subtitle text-indigo-400 text-sm font-medium tracking-[0.2em] uppercase mb-6">
            The modern way to meet strangers
          </p>

          <h1 className="hero-title text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05]">
            Talk to{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Anyone
            </span>
            <br />
            Anonymously
          </h1>

          <p className="hero-subtitle text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mt-8 leading-relaxed">
            StrangerLink is a free anonymous chat platform and Omegle alternative.
            Meet new people through global rooms, random matching, or private conversations — instantly.
          </p>

          <div className="hero-cta flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Link href="/global">
              <button className="group relative px-8 py-4 bg-indigo-600 rounded-full text-white font-semibold text-lg hover:bg-indigo-500 transition-all duration-300 hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]">
                Start Chatting
                <span className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </Link>
            <Link href="/random">
              <button className="px-8 py-4 border border-gray-700 rounded-full text-gray-300 font-semibold text-lg hover:border-gray-500 hover:text-white transition-all duration-300">
                Try Random Match
              </button>
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-500 rounded-full mt-2 animate-bounce" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        ref={featuresRef}
        className="relative py-32 px-4"
      >
        <div className="max-w-6xl mx-auto">
          <p className="text-indigo-400 text-sm font-medium tracking-[0.2em] uppercase text-center mb-4">
            Features
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-center mb-20 tracking-tight">
            Three ways to connect
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map((feature) => (
              <article
                key={feature.title}
                className="feature-card group p-8 rounded-3xl bg-[#111113] border border-[#222] hover:border-indigo-500/50 transition-all duration-500 hover:shadow-[0_0_40px_rgba(99,102,241,0.08)]"
              >
                <div className="text-4xl mb-6">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        ref={stepsRef}
        className="relative py-32 px-4 bg-[#0a0a0c]"
      >
        <div className="max-w-4xl mx-auto">
          <p className="text-indigo-400 text-sm font-medium tracking-[0.2em] uppercase text-center mb-4">
            How it works
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-center mb-20 tracking-tight">
            Three steps. Zero friction.
          </h2>

          <div className="space-y-16">
            {STEPS.map((step) => (
              <div key={step.num} className="step-item flex items-start gap-8">
                <span className="text-6xl font-bold text-indigo-500/20 shrink-0">
                  {step.num}
                </span>
                <div>
                  <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                  <p className="text-gray-400 text-lg leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="cta-section relative py-32 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 tracking-tight">
            Ready to talk?
          </h2>
          <p className="text-gray-400 text-lg mb-12 max-w-xl mx-auto">
            No accounts. No downloads. Just open and start talking to strangers from around the world.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/global">
              <button className="px-10 py-4 bg-white text-black rounded-full font-semibold text-lg hover:bg-gray-200 transition-all duration-300">
                Join Global Chat
              </button>
            </Link>
            <Link href="/random">
              <button className="px-10 py-4 border border-gray-700 rounded-full text-gray-300 font-semibold text-lg hover:border-gray-500 hover:text-white transition-all duration-300">
                Match Randomly
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* SEO Content Footer */}
      <section className="py-20 px-4 border-t border-[#1a1a1e]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">
            About StrangerLink
          </h2>
          <div className="text-gray-500 text-sm leading-relaxed space-y-4 max-w-3xl mx-auto">
            <p>
              StrangerLink is a free, modern alternative to Omegle and other anonymous chat platforms.
              Built with performance and privacy in mind, StrangerLink lets you talk to strangers online
              without creating an account. Whether you want to join a global chat room, get randomly
              matched with someone new, or create a private conversation — StrangerLink makes it instant.
            </p>
            <p>
              Unlike traditional chat roulette sites, StrangerLink uses real-time WebSocket connections
              for instant messaging with zero lag. The platform supports text chat, file sharing, and
              typing indicators across all chat modes. Connect with people from around the world,
              share moments, and have genuine conversations — all anonymously.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
