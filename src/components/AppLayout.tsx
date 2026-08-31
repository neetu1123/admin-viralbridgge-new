'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import BrandCampaignNudge from './BrandCampaignNudge';
import MobileTopBar from './MobileTopBar';

interface AppLayoutProps {
  children: React.ReactNode;
  role?: 'creator' | 'brand' | 'admin';
  topNavbar?: React.ReactNode;
}

export default function AppLayout({ children, role = 'creator', topNavbar }: AppLayoutProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = usePathname();

  const openMobileNav = useCallback(() => setMobileNavOpen(true), []);
  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);

  // Close drawer on route change
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  // Escape key closes drawer
  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileNavOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mobileNavOpen]);

  // Prevent background scroll while drawer is open
  useEffect(() => {
    if (!mobileNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileNavOpen]);

  const navbar =
    topNavbar && React.isValidElement(topNavbar)
      ? React.cloneElement(topNavbar as React.ReactElement<{ onMenuClick?: () => void }>, {
          onMenuClick: openMobileNav,
        })
      : topNavbar;

  return (
    <div className="flex h-dvh bg-slate-50 overflow-hidden">
      {/* Mobile backdrop */}
      {mobileNavOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[1px] lg:hidden"
          onClick={closeMobileNav}
        />
      )}

      <Sidebar role={role} mobileOpen={mobileNavOpen} onMobileClose={closeMobileNav} />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Creator / brand mobile top bar (admin uses AdminTopNavbar hamburger) */}
        {!navbar && <MobileTopBar role={role} onMenuClick={openMobileNav} />}
        {navbar}

        <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin">
          <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 xl:px-10 py-4 sm:py-6">
            {children}
          </div>
        </main>
      </div>

      {role === 'brand' && <BrandCampaignNudge />}
    </div>
  );
}
