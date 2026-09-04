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

import { useAuth } from '../context/AuthContext';
import { LoadingPage } from '../components/LoadingPage';

export const LandingPage: React.FC = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <LoadingPage
        message="Connecting to Ministry of Rural Development Gateway..."
        subMessage="Department of Land Resources (DoLR) • LAND•AI Portal"
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA] text-[#1F2937]">
      {/* 1. Official Government/Demonstration Banner */}
      <GovernmentBanner />

      {/* 2. Responsive Institutional Navigation Header */}
      <LandingHeader />

      {/* 2b. Official Ministry of Rural Development Identification Bar */}
      <div className="bg-[#0b243b] text-white py-2 px-4 border-b border-[#18466e] text-center shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs">
          <span className="text-amber-300 font-black uppercase tracking-wider flex items-center gap-1.5">
            <span>🏛️</span>
            <span>Ministry of Rural Development</span>
          </span>
          <span className="text-blue-300/60 hidden sm:inline">•</span>
          <span className="text-slate-200 font-medium">Department of Land Resources (DoLR)</span>
          <span className="text-blue-300/60 hidden sm:inline">•</span>
          <span className="text-emerald-400 font-semibold">
            Digital India Land Records Modernization Programme (DILRMP)
          </span>
        </div>
      </div>

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
