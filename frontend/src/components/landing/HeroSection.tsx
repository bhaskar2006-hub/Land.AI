import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Database, Layers, CheckCircle2 } from 'lucide-react';
import heroBg from '../../assets/land-record-hero.jpg';

export const HeroSection: React.FC = () => {
  const handleScrollToAbout = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.getElementById('about');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="relative text-white overflow-hidden bg-[#0c2438]">
      {/* Background Image with Crisp Cadastral Overlay */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
        style={{ backgroundImage: `url(${heroBg})` }}
      />

      {/* Institutional Navy/Slate Gradient Overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#0c2438]/95 via-[#123B5D]/85 to-[#0c2438]/90" />

      {/* Content Container */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="max-w-3xl">
          {/* Institutional Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1B6B8F]/40 border border-[#1B6B8F]/70 text-blue-100 text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-[#2E7D5B]" />
            <span>AI-Assisted Land Record Modernization Pipeline</span>
          </div>

          {/* Hero Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Transforming Legacy Land Records into{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-200">
              Intelligent Digital Records
            </span>
          </h1>

          {/* Subtitle / Description */}
          <p className="mt-6 text-base sm:text-lg text-gray-200 leading-relaxed font-normal">
            LAND•AI uses AI-assisted document processing, OCR, validation, and GIS reconciliation to help modernize land record workflows.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-lg bg-[#2E7D5B] hover:bg-[#25664a] text-white text-sm font-semibold shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#2E7D5B] focus:ring-offset-2 focus:ring-offset-[#123B5D]"
            >
              <span>Sign In to LAND•AI</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#about"
              onClick={handleScrollToAbout}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-white/10 hover:bg-white/15 text-white border border-white/20 text-sm font-medium backdrop-blur-sm transition-all hover:border-white/30 cursor-pointer"
            >
              <span>Learn More</span>
            </a>
          </div>

          {/* Highlights Row */}
          <div className="mt-12 pt-8 border-t border-white/15 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-gray-200">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#2E7D5B] flex-shrink-0" />
              <span>Multi-Script Document Processing</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Database className="w-4 h-4 text-cyan-300 flex-shrink-0" />
              <span>DILRMP-Aligned Data Schemas</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-blue-300 flex-shrink-0" />
              <span>ISRO Bhuvan GIS Parcel Reconciliation</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
