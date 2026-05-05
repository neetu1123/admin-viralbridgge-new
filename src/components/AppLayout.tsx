import React from 'react';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  role?: 'creator' | 'brand' | 'admin';
  topNavbar?: React.ReactNode;
}

export default function AppLayout({ children, role = 'creator', topNavbar }: AppLayoutProps) {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {topNavbar && topNavbar}
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className={`mx-auto px-6 lg:px-8 xl:px-10 py-6 ${role === 'admin' ? 'max-w-screen-2xl' : 'max-w-screen-2xl'}`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}