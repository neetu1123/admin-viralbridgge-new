import React from 'react';
import Link from 'next/link';
import AppLogo from './ui/AppLogo';

const navColumns = [
  {
    title: 'QUICK LINKS',
    links: [
      'Home',
      'Explore Creators',
      'Launch Campaign',
      'Pricing',
      'How It Works',
      'Analytics Dashboard',
      'Case Studies',
      'Creator Marketplace',
      'Brand Solutions',
      'Contact Us',
    ],
  },
  {
    title: 'CREATOR INDUSTRY',
  links: [
  'Fashion Influencers',
  'Fitness Influencers',
  'Tech Influencers',
  'Travel Influencers',
  'Beauty Influencers',
  'Food & Lifestyle Creators',
  'Gaming Influencers',
  'Business & Finance Creators',
  'Health & Wellness Influencers',
  'Micro Influencers',
],
    subSection: {
      title: 'SUPPORT',
      links: ['FAQs', 'Contact Support', 'Creator Support', 'Brand Support'],
    },
  },
  {
    title: 'CASE STUDIES',
  links: [
  'Fashion Brand Campaign Results',
  'Fitness Influencer Campaign ROI',
  'E-commerce Brand Growth Case Study',
  'SaaS Product Launch Campaign',
  'Beauty Brand Influencer Success',
  'Local Business Campaign Results',
  'Creator Monetization Case Study',
  'High-ROI TikTok Campaigns',
  'Instagram Growth Campaign Results',
  'YouTube Influencer Campaign Performance',
],
  },
  {
    title: 'LOCATIONS ',
    links: [
  'Fashion Influencers',
  'Fitness Influencers',
  'Tech Influencers',
  'Travel Influencers',
  'Beauty Influencers',
  'Food & Lifestyle Creators',
  'Gaming Influencers',
  'Business & Finance Creators',
  'Health & Wellness Influencers',
  'Micro Influencers',
],
    ctas: [
      { label: 'EXPLORE OUR WORK ↗', href: '#' },
      { label: 'READ OUR LATEST BLOGS ↗', href: '#' },
    ],
  },
  {
    title: 'About',
    links: ['About ViralBridgge', 'Careers', 'Blog', 'Partnerships'],
     subSection: {
      title: 'LEGAL',
      links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Disclaimer', 'Payment Terms'],
    },
    
  },
];

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-primary/20 text-fg relative overflow-hidden">

      {/* ── Top nav grid ── */}
      <div className="max-w-7xl mx-auto px-6 pt-14 pb-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-10">
          {navColumns.map((col) => (
            <div key={col.title} className="flex flex-col gap-3">
              {/* Column heading */}
              <p className="text-xs font-bold uppercase tracking-widest text-fg mb-1">
                {col.title}
              </p>

              {/* Primary links */}
              <ul className="flex flex-col gap-[7px]">
                {col.links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-[13px] text-fg-muted hover:text-accent transition-colors leading-snug"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Sub-section (Marketing under Development) */}
              {col.subSection && (
                <div className="mt-4 flex flex-col gap-[7px]">
                  <p className="text-xs font-bold uppercase tracking-widest text-fg mb-1">
                    {col.subSection.title}
                  </p>
                  {col.subSection.links.map((link) => (
                    <Link
                      key={link}
                      href="#"
                      className="text-[13px] text-fg-muted hover:text-accent transition-colors leading-snug"
                    >
                      {link}
                    </Link>
                  ))}
                </div>
              )}

              {/* CTA buttons (Hire Us column) */}
              {col.ctas && (
                <div className="mt-4 flex flex-col gap-3">
                  {col.ctas.map((cta) => (
                    <a
                      key={cta.label}
                      href={cta.href}
                      className="inline-flex items-center justify-between px-4 py-2 rounded-full outline-primary text-[11px] font-semibold tracking-wide text-fg hover:border-accent hover:text-accent transition-all duration-200 whitespace-nowrap"
                    >
                      {cta.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="border-t border-white/10" />

      {/* ── Contact bar ── */}
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Email */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-widest text-accent mb-1">Email</span>
          <a href="mailto:sales@viralbridgge.com" className="text-sm text-fg hover:text-accent transition-colors">
            sales@viralbridgge.com
          </a>
          <span className="text-[11px] text-fg-dim">(For Sales Inquiry)</span>
          <a href="mailto:hr@viralbridgge.com" className="text-sm text-fg hover:text-accent transition-colors mt-1">
            hr@viralbridgge.com
          </a>
          <span className="text-[11px] text-fg-dim">(For Hiring)</span>
        </div>

        {/* Call */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-widest text-accent mb-1">Call</span>
          <a href="tel:+917777997049" className="text-sm text-fg hover:text-accent transition-colors">
            +91 77779 97049
          </a>
          <span className="text-[11px] text-fg-dim">(For Sales Inquiry)</span>
          <a href="tel:+917016391962" className="text-sm text-fg hover:text-accent transition-colors mt-1">
            +91 70163 91962
          </a>
          <span className="text-[11px] text-fg-dim">(For Hiring)</span>
        </div>

        {/* Studio / Address */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-widest text-accent mb-1">Studio</span>
          <p className="text-sm text-fg leading-relaxed">
            E-206A, Ganesh Glory 11, Jagatpur Rd, nr. BSNL Office,
            Jagatpur, Ahmedabad, Gujarat 382470.
          </p>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="border-t border-white/10" />

      {/* ── Bottom bar ── */}
      <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-fg-dim">
        {/* Copyright */}
        <span>© 2026 Viralbridgge. All Rights Reserved</span>

        {/* Legal links */}
        <span className="flex gap-4">
          <Link href="#" className="hover:text-accent transition-colors">Privacy policy</Link>
          <Link href="#" className="hover:text-accent transition-colors">Terms of Use</Link>
        </span>

        {/* Social icons */}
        <div className="flex gap-3 items-center">
          <a href="#" aria-label="Behance" className="hover:text-accent transition-colors text-base">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M22 7h-7V5h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14H15.97c.13 1.2.851 1.867 2.01 1.867 1.129 0 1.656-.61 1.855-1.146l2.89.313zm-5.402-4.879c-.695 0-1.75.417-1.91 1.687h3.7c-.12-1.124-.826-1.687-1.79-1.687zM9.614 14.307c0 1.354-.832 2.1-2.197 2.1H5.5v-4.2h1.917c1.323 0 2.197.746 2.197 2.1zM5.5 8.8h1.7c1.184 0 1.901.597 1.901 1.636 0 1.005-.717 1.64-1.9 1.64H5.5V8.8zM12 4H0v16h12c3.203 0 5.5-1.702 5.5-4.5 0-1.868-.946-3.087-2.37-3.637 1.073-.55 1.87-1.639 1.87-3.113C17 5.718 14.91 4 12 4z"/>
            </svg>
          </a>
          <a href="#" aria-label="Dribbble" className="hover:text-accent transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 6.628 5.374 12 12 12 6.628 0 12-5.372 12-12 0-6.627-5.372-12-12-12zm7.369 5.833c1.344 1.613 2.16 3.67 2.187 5.911-2.61-.534-5.002-.48-7.188.14a27.73 27.73 0 0 0-.664-1.525c2.062-1.007 3.834-2.412 5.665-4.526zM12 2.252c2.222 0 4.27.78 5.879 2.07C16.15 6.41 14.53 7.7 12.62 8.627A44.474 44.474 0 0 0 9.287 2.65 9.9 9.9 0 0 1 12 2.252zm-4.565.94a42.36 42.36 0 0 1 3.282 5.79c-2.54.685-5.479 1.065-8.545 1.065-.36 0-.712-.007-1.064-.02.555-3.094 2.522-5.71 5.327-6.835zm-5.192 9.12c.38.01.764.016 1.152.016 3.41 0 6.65-.454 9.467-1.28.183.39.36.784.525 1.18-3.276 1.156-5.765 3.674-7.055 6.994A9.732 9.732 0 0 1 2.243 12c0-.232.008-.462.023-.688zm9.758 9.502c-1.217 0-2.376-.218-3.45-.612 1.152-3.01 3.4-5.3 6.38-6.4a31.84 31.84 0 0 1 1.618 7.254 9.78 9.78 0 0 1-4.548 1.758zm6.422-3.134a33.636 33.636 0 0 0-1.513-6.84c1.848-.38 3.835-.32 5.921.179-.486 2.876-2.088 5.37-4.408 6.661z"/>
            </svg>
          </a>
          <a href="#" aria-label="LinkedIn" className="hover:text-accent transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>
          <a href="#" aria-label="Instagram" className="hover:text-accent transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
            </svg>
          </a>
          <span className="ml-4 text-xs text-fg-dim hidden md:inline">Back to the top ↑</span>
        </div>
      </div>

      {/* ── Wordmark ── */}
      <div className="w-full overflow-hidden select-none pointer-events-none" aria-hidden="true">
        <p
          className="text-center font-display font-black leading-none tracking-tight text-fg/5"
          style={{ fontSize: 'clamp(4rem, 16vw, 13rem)', letterSpacing: '-0.03em' }}
        >
          viralbridgge
        </p>
      </div>

      {/* Decorative gradient blob */}
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none z-0" />
    </footer>
  );
}