import React from 'react';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  role?: 'creator' | 'brand' | 'admin';
}

export default function AppLayout({ children, role = 'creator' }: AppLayoutProps) {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar role={role} />
      <main className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 xl:px-10 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}