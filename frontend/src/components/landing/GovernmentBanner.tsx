import React from 'react';

export const GovernmentBanner: React.FC = () => {
  return (
    <div className="bg-[#123B5D] text-white text-[11px] py-1.5 px-4 sm:px-6 border-b border-[#1B6B8F]/40 font-medium">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#2E7D5B]" />
          <span className="tracking-wide">
            LAND•AI — Government Technology Demonstration Platform
          </span>
          <span className="hidden md:inline text-blue-200/60">•</span>
          <span className="hidden md:inline text-blue-100">
            Land Records • Digitization • Validation • GIS
          </span>
        </div>

        <div className="flex items-center gap-4 text-blue-100 text-[11px]">
          <span className="hover:text-white cursor-pointer transition-colors">Accessibility</span>
          <span>•</span>
          <span className="hover:text-white cursor-pointer transition-colors">Help</span>
          <span>•</span>
          <span className="hover:text-white cursor-pointer transition-colors">Contact</span>
        </div>
      </div>
    </div>
  );
};
