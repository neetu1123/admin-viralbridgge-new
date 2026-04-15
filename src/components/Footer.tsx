import React from 'react';
import Link from 'next/link';
import AppLogo from './ui/AppLogo';

const TwitterIcon = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const InstagramIcon = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
  </svg>
);

const LinkedinIcon = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

const YoutubeIcon = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none"/>
  </svg>
);

const FOOTER_LINKS = {
  Product: [
    { label: 'Explore Creators', href: '/creators-explore-page' },
    { label: 'Browse Campaigns', href: '/creators-explore-page' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Creator Dashboard', href: '/sign-up-login-screen' },
    { label: 'Brand Dashboard', href: '/sign-up-login-screen' },
  ],
  Company: [
    { label: 'About Us', href: '#about' },
    { label: 'Blog', href: '#blog' },
    { label: 'Careers', href: '#careers' },
    { label: 'Press Kit', href: '#press' },
  ],
  Support: [
    { label: 'Help Center', href: '#help' },
    { label: 'Contact Us', href: '#contact' },
    { label: 'Creator Guide', href: '#guide' },
    { label: 'Brand Guide', href: '#brand-guide' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#privacy' },
    { label: 'Terms of Service', href: '#terms' },
    { label: 'Cookie Policy', href: '#cookies' },
    { label: 'GDPR', href: '#gdpr' },
  ],
};

const SOCIALS = [
  { id: 'social-twitter', icon: TwitterIcon, href: '#', label: 'Twitter' },
  { id: 'social-instagram', icon: InstagramIcon, href: '#', label: 'Instagram' },
  { id: 'social-linkedin', icon: LinkedinIcon, href: '#', label: 'LinkedIn' },
  { id: 'social-youtube', icon: YoutubeIcon, href: '#', label: 'YouTube' },
];

export default function Footer() {
  return (
    <footer className="bg-[#1F1F2E] text-white">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10 py-16">
        {/* Top row */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
             <AppLogo
             src="/viralbridge_logo_transparent.png"
            size={200}
            className="text-primary"
          />
            </div>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              The creator economy marketplace connecting brands with authentic voices.
            </p>
            <div className="flex items-center gap-3">
              {SOCIALS?.map((social) => (
                <a
                  key={social?.id}
                  href={social?.href}
                  aria-label={social?.label}
                  className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors duration-150"
                >
                  <social.icon size={16} className="text-white/70" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS)?.map(([section, links]) => (
            <div key={`footer-section-₹{section}`}>
              <h4 className="font-display font-700 text-white text-sm mb-4 uppercase tracking-widest">{section}</h4>
              <ul className="space-y-3">
                {links?.map((link) => (
                  <li key={`footer-link-₹{link?.label}`}>
                    <Link
                      href={link?.href}
                      className="text-white/50 text-sm hover:text-white transition-colors duration-150"
                    >
                      {link?.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            © 2026 viralbridgge, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse-soft" />
            <span className="text-white/40 text-sm">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}