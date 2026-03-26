import React from 'react';
import Header from '@/src/components/Header';
import Footer from '@/src/components/Footer';
import HeroSection from './home/components/HeroSection';
import SocialProofSection from './home/components/SocialProofSection';
import FeaturesSection from './home/components/FeaturesSection';
import LiveActivitySection from './home/components/LiveActivitySection';
import CreatorMarketplaceSection from './home/components/CreatorMarketplaceSection';
import ForBrandsCreatorsSection from './home/components/ForBrandsCreatorsSection';
import HowItWorksSection from './home/components/HowItWorksSection';
import CaseStudiesSection from './home/components/CaseStudiesSection';
import AnalyticsDashboardSection from './home/components/AnalyticsDashboardSection';
import PricingSection from './home/components/PricingSection';
import ComparisonSection from './home/components/ComparisonSection';
import FAQSection from './home/components/FAQSection';
import FinalCTASection from './home/components/FinalCTASection';
export default function HomePage() {
  return (
    <main className="min-h-screen bg-bg-base overflow-x-hidden">
      <Header />
      <HeroSection />
      <SocialProofSection />
      <FeaturesSection />
      <LiveActivitySection />
      <CreatorMarketplaceSection />
      <ForBrandsCreatorsSection />
      <HowItWorksSection />
      <CaseStudiesSection />
      <AnalyticsDashboardSection />
      <PricingSection />
      <ComparisonSection />
      <FAQSection />
      <FinalCTASection />
      <Footer />
    </main>
  );
}