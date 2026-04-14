import React from 'react';
// import Navbar from '@/components/Navbar';
import Header from '@/src/components/Header';
import Footer from '@/src/components/Footer';
import CreatorsExploreClient from './components/CreatorsExploreClient';
import { Toaster } from 'sonner';

export default function CreatorsExplorePage() {
  return (
    <div className="min-h-screen bg-[#F8F7FC]">
      <Header />
      <Toaster position="bottom-right" richColors />
      <main className="pt-16">
        <CreatorsExploreClient />
      </main>
      <Footer />
    </div>
  );
}