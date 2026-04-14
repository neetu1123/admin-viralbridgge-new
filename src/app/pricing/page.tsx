import React from 'react';
// import Navbar from '@/components/Navbar';
// import Footer from '@/app/homepage/components/Footer';
import PricingClient from './components/PricingClient';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#F8F7FC]">
      {/* <Navbar /> */}
      <main className="pt-16">
        <PricingClient />
      </main>
      {/* <Footer /> */}
    </div>
  );
}
