import React, { useState, useEffect } from 'react';
import { ShieldCheck, Database, Layers, CheckCircle2 } from 'lucide-react';

interface LoadingPageProps {
  message?: string;
  subMessage?: string;
}

export const LoadingPage: React.FC<LoadingPageProps> = ({
  message = "Loading LAND•AI National Land Record System...",
  subMessage = "Ministry of Rural Development • Government of India"
}) => {
  const [progress, setProgress] = useState(15);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const steps = [
    "Initializing secure administrative gateway...",
    "Verifying Department of Land Resources credentials...",
    "Connecting to National Cadastral GIS & ISRO Bhuvan gateway...",
    "Loading multi-script Indic OCR & boundary verification models...",
    "Finalizing cryptographic security audit seals..."
  ];

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 95;
        const jump = Math.floor(Math.random() * 12) + 5;
        return Math.min(prev + jump, 95);
      });
    }, 350);

    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % steps.length);
    }, 1200);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, [steps.length]);

  return (
    <div className="min-h-screen w-full bg-[#071326] text-white flex flex-col justify-between relative overflow-hidden select-none font-sans">
      {/* Background Subtle National Grid Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="loading-cadastre-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#3b82f6" strokeWidth="0.75" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#loading-cadastre-grid)" />
        </svg>
      </div>

      {/* Ambient Gradient Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Institutional Header Bar */}
      <header className="relative z-10 w-full border-b border-[#16335c]/80 bg-[#050f1f]/80 backdrop-blur-md px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold text-slate-300">
              भारत सरकार • Government of India
            </span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="text-blue-300 font-bold hidden sm:inline">
              ग्रामीण विकास मंत्रालय • Ministry of Rural Development
            </span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            NIC-DILRMP Node: IND-CENTRAL-01
          </div>
        </div>
      </header>

      {/* Main Center Loading Hero Card */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center max-w-xl mx-auto">
        {/* Emblem & Portal Brand Icon */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#123B5D] to-[#0A1B2F] border-2 border-blue-500/40 flex items-center justify-center text-4xl shadow-2xl shadow-blue-500/20 relative z-10">
            🏛️
          </div>
          {/* Animated Spinner Ring around the Icon */}
          <div className="absolute -inset-2 rounded-3xl border-2 border-dashed border-blue-400/40 animate-spin" style={{ animationDuration: '10s' }} />
          <div className="absolute -inset-3.5 rounded-3xl border border-emerald-400/20 animate-pulse" />
        </div>

        {/* Institutional Ministry & App Headings */}
        <div className="space-y-1.5 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-[11px] font-bold uppercase tracking-wider mb-1">
            <ShieldCheck size={13} className="text-emerald-400" />
            <span>Digital India Land Records Modernization Programme</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Ministry of Rural Development
          </h1>
          <h2 className="text-xs sm:text-sm font-semibold text-blue-200">
            Department of Land Resources (DoLR)
          </h2>
          <div className="pt-2 flex items-center justify-center gap-2">
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-cyan-300">
              LAND<span className="text-blue-400">•</span>AI
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#132c4a] border border-blue-400/30 text-blue-300 font-mono font-bold">
              v1.0
            </span>
          </div>
        </div>

        {/* Dynamic Progress Card */}
        <div className="w-full bg-[#0a182e]/90 border border-[#1b3d6e] rounded-2xl p-5 shadow-2xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-white flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span>{message}</span>
            </span>
            <span className="font-mono text-cyan-300 font-bold">{progress}%</span>
          </div>

          {/* Smooth High-Tech Progress Bar */}
          <div className="w-full h-2 bg-[#051122] rounded-full overflow-hidden p-0.5 border border-[#16345d]">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 rounded-full transition-all duration-300 shadow-lg shadow-cyan-500/50"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Rotating Telemetry Step Notification */}
          <div className="min-h-[22px] flex items-center justify-center gap-2 text-xs text-slate-400 font-mono">
            <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <span className="truncate">{steps[currentStepIndex]}</span>
          </div>

          {subMessage && (
            <div className="pt-2 border-t border-[#142e54] text-[11px] text-slate-400">
              {subMessage}
            </div>
          )}
        </div>

        {/* Feature Badges */}
        <div className="mt-8 grid grid-cols-3 gap-3 w-full max-w-md text-[10px] text-slate-400 font-medium">
          <div className="bg-[#0a182e]/60 border border-[#16335a] p-2 rounded-xl flex items-center justify-center gap-1.5">
            <CheckCircle2 size={12} className="text-emerald-400" />
            <span>AI OCR Engine</span>
          </div>
          <div className="bg-[#0a182e]/60 border border-[#16335a] p-2 rounded-xl flex items-center justify-center gap-1.5">
            <Database size={12} className="text-cyan-400" />
            <span>DILRMP Schemas</span>
          </div>
          <div className="bg-[#0a182e]/60 border border-[#16335a] p-2 rounded-xl flex items-center justify-center gap-1.5">
            <Layers size={12} className="text-blue-400" />
            <span>ISRO Bhuvan GIS</span>
          </div>
        </div>
      </main>

      {/* Institutional Security Footer */}
      <footer className="relative z-10 w-full border-t border-[#16335c]/80 bg-[#050f1f]/80 backdrop-blur-md px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
          <div>
            Ministry of Rural Development • Department of Land Resources (DoLR)
          </div>
          <div className="flex items-center gap-3">
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck size={13} /> Official Government Gateway
            </span>
            <span className="text-slate-600">•</span>
            <span>AES-256 Encrypted</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
