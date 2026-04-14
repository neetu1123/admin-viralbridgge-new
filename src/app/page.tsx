import React from 'react';
import Header from '@/src/components/Header';
import Footer from '@/src/components/Footer';
import HeroSection from './home/components/HeroSection';
import SocialProofStrip from './home/components/SocialProofStrip';
import HowItWorks from './home/components/HowItWorks';
import FeaturedCampaigns from './home/components/FeaturedCampaigns';
import TopCreators from './home/components/TopCreators';
import CtaSection from './home/components/CtaSection';
export default function HomePage() {
  return (
    <main className="min-h-screen bg-bg-base overflow-x-hidden">
      <Header />
      <main>
        <HeroSection />
        <SocialProofStrip />
        <HowItWorks />
        <FeaturedCampaigns />
        <TopCreators />
        <CtaSection />
      </main>
      <Footer />
    </main>
  );
}