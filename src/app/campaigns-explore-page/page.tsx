import React from 'react';
// import Navbar from '@/components/Navbar';
import CampaignsExploreClient from './components/CampaignsExploreClient';

export default function CampaignsExplorePage() {
  return (
    <div className="min-h-screen bg-[#F8F7FC]">
      {/* <Navbar /> */}
      <main className="pt-16">
        <CampaignsExploreClient />
      </main>
    </div>
  );
}
