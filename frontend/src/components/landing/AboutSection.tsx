import React from 'react';
import { FileText, Cpu, KeyRound, CheckCircle2, MapPin, UserCheck, Award } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const steps = [
    { label: 'Document', icon: FileText, desc: 'Scanned & Legacy Records' },
    { label: 'OCR', icon: Cpu, desc: 'Multi-Lingual Text Recognition' },
    { label: 'Field Extraction', icon: KeyRound, desc: 'Structured Semantic Schema' },
    { label: 'Validation', icon: CheckCircle2, desc: 'Rule & Boundary Verification' },
    { label: 'GIS Reconciliation', icon: MapPin, desc: 'Cadastral Layer Linking' },
    { label: 'Human Verification', icon: UserCheck, desc: 'Audited HITL Approval' },
    { label: 'Verified Record', icon: Award, desc: 'Digitized Legal Parcel' }
  ];

  return (
    <section id="about" className="py-20 bg-white border-b border-[#D9DEE5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="text-xs font-bold uppercase tracking-wider text-[#1B6B8F] mb-2">
            System Overview &amp; Architecture
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#123B5D] tracking-tight">
            Modernizing Land Records Through Intelligent Technology
          </h2>
          <p className="mt-4 text-base text-[#667085] leading-relaxed">
            Revenue administrations manage vast archives of historical land records maintained across 
            scanned registers, handwritten deeds, mutation notices, cadastral village maps, and legacy databases.
            LAND•AI provides an AI-assisted digitization pipeline designed to convert complex unstructured 
            records into structured, searchable, and spatially-linked digital assets.
          </p>
        </div>

        {/* 7-Stage Pipeline Visual Workflow */}
        <div className="mt-14">
          <div className="text-xs font-semibold text-[#667085] uppercase tracking-wider mb-6">
            End-to-End Processing Workflow
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.label}
                  className="bg-[#F5F7FA] border border-[#D9DEE5] rounded-xl p-4 flex flex-col items-center text-center transition-all hover:border-[#1B6B8F] hover:shadow-sm"
                >
                  <div className="text-[10px] font-mono font-bold text-[#1B6B8F] mb-2">
                    0{idx + 1}
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-white border border-[#D9DEE5] flex items-center justify-center text-[#123B5D] mb-3 shadow-xs">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-xs font-bold text-[#123B5D] leading-tight">
                    {step.label}
                  </h3>
                  <p className="text-[11px] text-[#667085] mt-1 leading-snug">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
