import React from 'react';
import { Clock, Edit3, CheckCircle, MapPin, Eye, FileCheck, Layers } from 'lucide-react';

export const BenefitsSection: React.FC = () => {
  const benefits = [
    {
      icon: Clock,
      title: 'Faster Digitization',
      description: 'Significantly accelerates conversion of legacy physical archives into searchable digital records.'
    },
    {
      icon: Edit3,
      title: 'Reduced Manual Data Entry',
      description: 'Minimizes repetitive transcription errors by automating structured field population.'
    },
    {
      icon: CheckCircle,
      title: 'Improved Record Consistency',
      description: 'Standardizes land classifications, unit conversions, and name spellings across administrative nodes.'
    },
    {
      icon: MapPin,
      title: 'Easier GIS Reconciliation',
      description: 'Bridges the historical gap between textual registry deeds and spatial cadastral survey polygons.'
    },
    {
      icon: Eye,
      title: 'Confidence-Based Review',
      description: 'Routes only low-confidence or ambiguous fields to officers, optimizing expert human review time.'
    },
    {
      icon: FileCheck,
      title: 'Better Traceability',
      description: 'Captures verifiable timestamps, user actions, and change logs for institutional compliance.'
    },
    {
      icon: Layers,
      title: 'Structured Digital Records',
      description: 'Prepares land ownership databases for secure integration with state and national public services.'
    }
  ];

  return (
    <section className="py-20 bg-[#F5F7FA] border-b border-[#D9DEE5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="text-xs font-bold uppercase tracking-wider text-[#1B6B8F] mb-2">
            Administrative Impact
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#123B5D] tracking-tight">
            Key Benefits to Revenue Administration
          </h2>
          <p className="mt-4 text-base text-[#667085] leading-relaxed">
            LAND•AI delivers practical operational enhancements designed for state revenue departments, 
            district collectorates, and land survey directorates.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className="bg-white border border-[#D9DEE5] rounded-xl p-5 shadow-xs hover:border-[#1B6B8F] transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-[#E8F1F5] text-[#123B5D] flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-[#123B5D] mb-1.5">
                  {b.title}
                </h3>
                <p className="text-xs text-[#667085] leading-relaxed">
                  {b.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
