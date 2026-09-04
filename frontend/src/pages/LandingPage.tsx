import React from 'react';
import { GovernmentBanner } from '../components/landing/GovernmentBanner';
import { LandingHeader } from '../components/landing/LandingHeader';
import { HeroSection } from '../components/landing/HeroSection';
import { AboutSection } from '../components/landing/AboutSection';
import { CapabilitiesSection } from '../components/landing/CapabilitiesSection';
import { HowItWorksSection } from '../components/landing/HowItWorksSection';
import { BenefitsSection } from '../components/landing/BenefitsSection';
import { StatisticsSection } from '../components/landing/StatisticsSection';
import { SecuritySection } from '../components/landing/SecuritySection';
import { SignInCTASection } from '../components/landing/SignInCTASection';
import { LandingFooter } from '../components/landing/LandingFooter';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA] text-[#1F2937]">
      {/* 1. Official Government/Demonstration Banner */}
      <GovernmentBanner />

      {/* 2. Responsive Institutional Navigation Header */}
      <LandingHeader />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* 3. Hero Section */}
        <HeroSection />

        {/* 4. About System & Overview */}
        <AboutSection />

        {/* 5. Core 6 Capabilities */}
        <CapabilitiesSection />

        {/* 6. 7-Step Lifecycle Workflow */}
        <HowItWorksSection />

        {/* 7. Key Benefits to Revenue Administration */}
        <BenefitsSection />

        {/* 8. Demonstration Environment Statistics */}
        <StatisticsSection />

        {/* 9. Security, RLS & Controls */}
        <SecuritySection />

        {/* 10. Workspace Call-to-Action */}
        <SignInCTASection />
      </main>

      {/* 11. Institutional Footer */}
      <LandingFooter />
    </div>
  );
};
