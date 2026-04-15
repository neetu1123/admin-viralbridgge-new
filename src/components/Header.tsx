'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLogo from './ui/AppLogo';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Campaign', href: '/campaigns-explore-page' },
    { label: 'Creators', href: '/creators-explore-page' },
    { label: 'Pricing', href: '/pricing' },
  ];

  return (
    <>
      <header
        className={`fixed pt-4 top-0 left-0 right-0 z-50 transition-all duration-300 ₹{
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-nav'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-screen-xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
             <AppLogo
           src="/viralbridge_logo_transparent.png"
            size={150}
            className="text-primary"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          />
        
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks?.map((link) => (
              <Link
                key={`nav-₹{link?.label}`}
                href={link?.href}
                className="text-[#6B6B8A] hover:text-[#1F1F2E] font-medium text-[15px] transition-colors duration-150"
              >
                {link?.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/sign-up-login-screen"
              className="text-[#6B6B8A] hover:text-[#1F1F2E] font-medium text-[15px] transition-colors duration-150 px-4 py-2"
            >
              Login
            </Link>
            <Link
              href="/sign-up-login-screen"
              className="btn-primary text-sm px-5 py-2.5 inline-block"
            >
              Sign Up Free
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 rounded-xl hover:bg-[#F2F3F7] transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X size={22} className="text-[#1F1F2E]" />
            ) : (
              <Menu size={22} className="text-[#1F1F2E]" />
            )}
          </button>
        </div>
      </header>
      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ₹{
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={`absolute top-0 right-0 h-full w-72 bg-white shadow-xl transition-transform duration-300 ₹{
            mobileOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="p-6 pt-20 flex flex-col gap-2">
            {navLinks?.map((link) => (
              <Link
                key={`mobile-nav-₹{link?.label}`}
                href={link?.href}
                onClick={() => setMobileOpen(false)}
                className="text-[#1F1F2E] font-medium text-base py-3 px-4 rounded-xl hover:bg-[#F2F3F7] transition-colors"
              >
                {link?.label}
              </Link>
            ))}
            <hr className="my-4 border-[#E5E7EB]" />
            <Link
              href="/sign-up-login-screen"
              onClick={() => setMobileOpen(false)}
              className="text-[#6B6B8A] font-medium text-base py-3 px-4 rounded-xl hover:bg-[#F2F3F7] transition-colors"
            >
              Login
            </Link>
            <Link
              href="/sign-up-login-screen"
              onClick={() => setMobileOpen(false)}
              className="btn-primary text-center mt-2"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}