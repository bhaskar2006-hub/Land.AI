import React from 'react';
import { ShieldCheck, Lock, UserCheck, FileText, Database, Key } from 'lucide-react';

export const SecuritySection: React.FC = () => {
  const securityPoints = [
    {
      icon: ShieldCheck,
      title: 'Role-Based Authentication',
      desc: 'Access strictly segmented across ADMIN, REVENUE_OFFICER, and VIEWER roles to uphold administrative hierarchy.'
    },
    {
      icon: Lock,
      title: 'Supabase Authentication Gateway',
      desc: 'Industry-standard session management, JWT tokens, and encrypted transport protocols protecting officer credentials.'
    },
    {
      icon: Database,
      title: 'Database-Backed Role Validation',
      desc: 'Authorizations queried directly from public.profiles table on every session creation, preventing unauthorized privilege escalation.'
    },
    {
      icon: Key,
      title: 'Controlled Access & RLS',
      desc: 'Row-Level Security (RLS) enforcement ensures users only view and modify records permitted under their designated jurisdiction.'
    },
    {
      icon: FileText,
      title: 'Comprehensive Audit Logging',
      desc: 'Every document upload, field modification, human override, and approval event is persisted with an unalterable timestamp.'
    },
    {
      icon: UserCheck,
      title: 'Human-in-the-Loop Oversight',
      desc: 'Sensitive validations and conflict resolutions strictly require authorized officer sign-off before being finalized.'
    }
  ];

  return (
    <section id="security" className="py-20 bg-white border-b border-[#D9DEE5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="text-xs font-bold uppercase tracking-wider text-[#1B6B8F] mb-2">
            Governance &amp; Controls
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#123B5D] tracking-tight">
            Designed for Secure Administrative Workflows
          </h2>
          <p className="mt-4 text-base text-[#667085] leading-relaxed">
            LAND•AI enforces zero-trust architecture, robust access controls, and transparent traceability 
            tailored to institutional public sector requirements.
          </p>
        </div>

        {/* Security Feature Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {securityPoints.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="bg-[#F5F7FA] border border-[#D9DEE5] rounded-xl p-6 transition-all hover:border-[#1B6B8F] hover:shadow-xs"
              >
                <div className="w-10 h-10 rounded-lg bg-white border border-[#D9DEE5] text-[#123B5D] flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-[#123B5D] mb-1.5">
                  {item.title}
                </h3>
                <p className="text-xs text-[#667085] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
