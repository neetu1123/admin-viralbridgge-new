import React from 'react';
// import Navbar from '@/components/Navbar';
import Header from '@/src/components/Header';
import Footer from '@/src/components/Footer';
import CampaignsExploreClient from './components/CampaignsExploreClient';

export default function CampaignsExplorePage() {
  return (
    <div className="min-h-screen bg-[#F8F7FC]">
      <Header />
      <main className="pt-16">
        <CampaignsExploreClient />
      </main>
      <Footer />
    </div>
  );
}
