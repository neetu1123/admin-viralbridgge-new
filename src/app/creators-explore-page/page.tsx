import React from 'react';
// import Navbar from '@/components/Navbar';
import CreatorsExploreClient from './components/CreatorsExploreClient';
import { Toaster } from 'sonner';

export default function CreatorsExplorePage() {
  return (
    <div className="min-h-screen bg-[#F8F7FC]">
      {/* <Navbar /> */}
      <Toaster position="bottom-right" richColors />
      <main className="pt-16">
        <CreatorsExploreClient />
      </main>
    </div>
  );
}