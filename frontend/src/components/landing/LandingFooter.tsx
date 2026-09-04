import React from 'react';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="bg-[#0c2438] text-gray-300 text-xs border-t border-[#1a335a] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-8 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white tracking-tight">
                LAND<span className="text-[#1B6B8F]">•</span>AI
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                v1.0
              </span>
            </div>
            <p className="mt-1 text-gray-400 max-w-md text-xs leading-relaxed">
              Intelligent Land Record Digitization &amp; Validation System.
              Supporting multi-script OCR, automated schema extraction, and cadastral GIS reconciliation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-gray-300">
            <a href="#home" className="hover:text-white transition-colors">Home</a>
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <a href="#capabilities" className="hover:text-white transition-colors">Capabilities</a>
            <a href="#security" className="hover:text-white transition-colors">Security</a>
            <a href="#help" className="hover:text-white transition-colors">Help</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-400">
          <div>
            LAND•AI Demonstration Platform
          </div>
          <div>
            Designed for institutional land modernization workflows
          </div>
        </div>
      </div>
    </footer>
  );
};
