import React from 'react';
import { UploadCloud, Cpu, FileSpreadsheet, ShieldCheck, MapPin, UserCheck, Award } from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Upload Document',
      description: 'Ingest scanned deeds, RoR extracts, cadastral survey maps, and revenue records in PDF, TIFF, or JPEG formats.',
      icon: UploadCloud
    },
    {
      num: '02',
      title: 'AI / OCR Processing',
      description: 'Multi-model computer vision and OCR engine extracts printed text, vernacular handwriting, and official table cells.',
      icon: Cpu
    },
    {
      num: '03',
      title: 'Structured Data Extraction',
      description: 'Converts raw recognized strings into structured key-value entities aligned with national land record standards.',
      icon: FileSpreadsheet
    },
    {
      num: '04',
      title: 'Validation & Consistency Rules',
      description: 'Performs rule-based checks: owner title completeness, survey number structure, and mathematical area reconciliation.',
      icon: ShieldCheck
    },
    {
      num: '05',
      title: 'GIS Reconciliation',
      description: 'Associates alphanumeric plot identifiers with geo-referenced cadastral map polygons and satellite GIS basemaps.',
      icon: MapPin
    },
    {
      num: '06',
      title: 'Human Verification (HITL)',
      description: 'Discrepancies, ambiguous handwriting, or boundary mismatches are queued for revenue officer review and digital sign-off.',
      icon: UserCheck
    },
    {
      num: '07',
      title: 'Verified Land Record',
      description: 'The finalized, validated record is registered into the digital cadastral index and stored with complete audit traceability.',
      icon: Award
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white border-b border-[#D9DEE5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="text-xs font-bold uppercase tracking-wider text-[#1B6B8F] mb-2">
            System Lifecycle
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#123B5D] tracking-tight">
            How LAND•AI Modernizes Document Processing
          </h2>
          <p className="mt-4 text-base text-[#667085] leading-relaxed">
            A structured seven-step pipeline guarantees high data fidelity, transparent accountability, and smooth integration with existing revenue workflows.
          </p>
        </div>

        {/* 7-Step Detailed Process Cards */}
        <div className="mt-14 space-y-4">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.num}
                className="bg-[#F5F7FA] border border-[#D9DEE5] rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 transition-all hover:bg-white hover:border-[#1B6B8F] hover:shadow-sm"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#123B5D] text-white flex items-center justify-center font-mono font-bold text-sm flex-shrink-0 shadow-xs">
                    {s.num}
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#123B5D] flex items-center gap-2">
                      <span>{s.title}</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-[#667085] mt-1 max-w-3xl leading-relaxed">
                      {s.description}
                    </p>
                  </div>
                </div>

                <div className="hidden lg:flex items-center justify-center w-10 h-10 rounded-full bg-white border border-[#D9DEE5] text-[#1B6B8F] flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
