import React from 'react';
import Header from '@/src/components/Header';
import Footer from '@/src/components/Footer';
import PricingClient from './components/PricingClient';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#F8F7FC]">
       <Header />
      <main className="pt-16">
        <PricingClient />
      </main>
      <Footer />
    </div>
  );
}
