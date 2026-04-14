'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLogo from './ui/AppLogo';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? 'py-3 bg-bg/80 backdrop-blur-xl border-b border-white/5' :'py-5 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <AppLogo
            src="/logo-viral-bridge.jpeg"
            size={110}
            className="text-primary"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          />
          {/* <span className="font-display font-800 text-lg tracking-tight gradient-text">
            Viralbridgge
          </span> */}
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-fg-muted">
          <a href="#how-it-works" className="hover:text-accent transition-colors">How it Works</a>
          <a href="/pricing" className="hover:text-accent transition-colors">Pricing</a>
          <a href="/campaigns-explore-page" className="hover:text-accent transition-colors">Explore</a>
          <a href="/creators-explore-page" className="hover:text-accent transition-colors">Creators</a>
        </nav>

        {/* CTA */}
        <a
          href="#final-cta"
          className="btn-primary text-white text-sm font-semibold px-6 py-2.5 rounded-full font-display shadow-lg transition-all duration-300 hover:scale-105"
          style={{ boxShadow: '0 4px 24px 0 #4e40f133' }}
        >
          Start Campaign
        </a>
      </div>
    </header>
  );
}