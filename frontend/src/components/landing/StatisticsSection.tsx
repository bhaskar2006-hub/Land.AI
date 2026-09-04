import React from 'react';
import { Database, Cpu, MapPin, UserCheck } from 'lucide-react';

export const StatisticsSection: React.FC = () => {
  const stats = [
    {
      icon: Database,
      value: '500+',
      label: 'Demo Land Parcels',
      detail: 'Cadastral test plots indexed across multiple states'
    },
    {
      icon: Cpu,
      value: 'Multi-Script',
      label: 'AI-Assisted OCR',
      detail: 'Handwritten & printed document parsing'
    },
    {
      icon: MapPin,
      value: '100%',
      label: 'GIS Parcel Reconciliation',
      detail: 'Linked to ISRO Bhuvan geospatial boundaries'
    },
    {
      icon: UserCheck,
      value: 'Audited',
      label: 'Human-in-the-Loop',
      detail: 'Strict role-governed verification workflow'
    }
  ];

  return (
    <section className="py-16 bg-[#123B5D] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-block text-[11px] font-mono uppercase tracking-widest text-[#2E7D5B] bg-[#E8F1F5] px-2.5 py-1 rounded font-bold mb-2">
            Demonstration Environment
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Operational Prototype Metrics
          </h2>
          <p className="text-xs text-blue-100 mt-2">
            The figures below reflect the currently loaded sandbox dataset for testing digitization and validation accuracy.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="bg-[#0f324f] border border-[#1B6B8F]/40 rounded-xl p-6 text-center hover:border-blue-400/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-[#1B6B8F]/30 text-blue-200 flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {s.value}
                </div>
                <div className="text-xs font-semibold text-blue-100 mt-1 uppercase tracking-wider">
                  {s.label}
                </div>
                <div className="text-[11px] text-gray-300 mt-1">
                  {s.detail}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
