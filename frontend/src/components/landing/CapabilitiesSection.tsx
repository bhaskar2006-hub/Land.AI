import React from 'react';
import { ScanText, Database, ShieldAlert, Map, UserCheck, History } from 'lucide-react';

export const CapabilitiesSection: React.FC = () => {
  const capabilities = [
    {
      icon: ScanText,
      title: '1. AI-Powered OCR',
      description: 'Digitize legacy printed and handwritten land registers, deeds, and revenue records across multiple Indian languages and vernacular scripts.'
    },
    {
      icon: Database,
      title: '2. Intelligent Field Extraction',
      description: 'Extract critical parcel parameters including owner name, survey number, khasra/khata number, plot area, village, land classification, and mutation history.'
    },
    {
      icon: ShieldAlert,
      title: '3. Record Validation',
      description: 'Automated discrepancy detection comparing extracted fields against DILRMP standards, arithmetic area sums, and legal title patterns.'
    },
    {
      icon: Map,
      title: '4. GIS Reconciliation',
      description: 'Align alphanumeric land records with spatial cadastral boundaries, ISRO Bhuvan satellite basemaps, and geo-referenced parcel geometries.'
    },
    {
      icon: UserCheck,
      title: '5. Human Verification',
      description: 'Structured Human-in-the-Loop (HITL) review queues for authorized revenue officers to inspect, verify, and resolve edge-case anomalies.'
    },
    {
      icon: History,
      title: '6. Audit & Traceability',
      description: 'End-to-end cryptographic and state-level audit logs recording field alterations, verification notes, timestamps, and officer approval history.'
    }
  ];

  return (
    <section id="capabilities" className="py-20 bg-[#F5F7FA] border-b border-[#D9DEE5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="text-xs font-bold uppercase tracking-wider text-[#1B6B8F] mb-2">
            Platform Capabilities
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#123B5D] tracking-tight">
            Designed for Administrative Accuracy and Transparency
          </h2>
          <p className="mt-4 text-base text-[#667085] leading-relaxed">
            LAND•AI combines optical document parsing, semantic validation, and spatial alignment into an 
            integrated platform built specifically for departmental land administration.
          </p>
        </div>

        {/* 6 Capabilities Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="bg-white border border-[#D9DEE5] rounded-xl p-6 shadow-xs hover:border-[#1B6B8F] hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 rounded-lg bg-[#E8F1F5] text-[#123B5D] flex items-center justify-center mb-4 group-hover:bg-[#123B5D] group-hover:text-white transition-colors">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#123B5D] mb-2">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
