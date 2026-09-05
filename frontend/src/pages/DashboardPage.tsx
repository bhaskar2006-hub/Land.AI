import React, { useEffect, useState } from 'react';
import {
  FileText,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Download,
  Plus,
  ArrowRight,
  ChevronRight,
  Activity,
  ShieldCheck,
  Globe,
  ExternalLink,
  Cpu,
  Database,
  Sparkles,
  Radio,
  Layers,
  AlertTriangle,
  MapPin,
  FileCheck,
  Eye,
  Lock,
  Zap,
  Check
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { api } from '../services/api';
import { DashboardStats } from '../types';
interface DashboardPageProps {
  onNavigate: (tab: string, docId?: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  // Initialize immediately from synchronous cached/default stats for instantaneous rendering without loading screen
  const [stats, setStats] = useState<DashboardStats>(() => api.getCachedDashboardStats());
  const [activeTab, setActiveTab] = useState<'overview' | 'states' | 'languages'>('overview');

  useEffect(() => {
    // Seamless background refresh
    api.getDashboardStats().then((data) => {
      setStats(data);
    });
  }, []);

  const { kpis, state_metrics, accuracy_trends, language_metrics } = stats;

  const mockLiveFeed = [
    { id: 'ka-2024-00453', survey: '126/1', owner: 'Tukaram G. Patil', village: 'Pimpalgaon', status: 'VERIFIED', conf: 98, time: '2m ago' },
    { id: 'mh-2024-01089', survey: '142/2A', owner: 'Rajesh Sharma', village: 'Farooqnagar', status: 'CONFLICT', conf: 62, issue: 'Area Overstated (+8.1%)', time: '5m ago' },
    { id: 'ts-2024-08892', survey: '214/1B', owner: 'Venkateswara Rao', village: 'Angalakuduru', status: 'HITL QUEUE', conf: 74, issue: 'Ink-bleed on Khasra', time: '8m ago' },
    { id: 'ta-2024-03411', survey: '88/4A', owner: 'Ramesh Kumar', village: 'Kodanad', status: 'VERIFIED', conf: 96, time: '12m ago' },
    { id: 'up-2024-09912', survey: '1042-क', owner: 'Rakesh S. Yadav', village: 'Babatpur', status: 'VERIFIED', conf: 95, time: '15m ago' }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1a335a]/60 pb-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-semibold text-blue-400 uppercase tracking-wider">
            <Globe size={12} className="text-blue-400" />
            <span>National Land Record Digitization Control Tower</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> Live Processing
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-0.5">
            Operations & Digitization Overview
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('reports')}
            className="px-3.5 py-2 rounded-xl bg-[#0a1b38] hover:bg-[#132c57] text-slate-200 text-xs font-bold border border-[#1b3d75] transition-all flex items-center gap-1.5 shadow"
          >
            <Download size={13} /> Export Telemetry Report
          </button>
          <button
            onClick={() => onNavigate('upload')}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-blue-600/30"
          >
            <Plus size={14} /> Ingest New Land Record
          </button>
        </div>
      </div>

      {/* Urgent HITL Review Banner */}
      <div className="p-3.5 bg-gradient-to-r from-amber-950/60 via-[#1f1506] to-amber-950/60 border border-amber-500/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3 text-xs text-amber-200">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <AlertTriangle size={16} className="animate-bounce" />
          </div>
          <div>
            <div className="font-bold text-amber-300 flex items-center gap-2">
              <span>Urgent HITL Review Action Required</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                {kpis.review_queue.toLocaleString()} Pending Items
              </span>
            </div>
            <div className="text-[11px] text-amber-200/80 mt-0.5">
              Survey No. 126/1 (Pahani Extract) flagged with 62% confidence due to ink bleed on Khata Owner Name field.
            </div>
          </div>
        </div>
        <button
          onClick={() => onNavigate('verify', 'ka-2024-00453')}
          className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all flex items-center gap-1.5 shrink-0 shadow"
        >
          <span>Inspect Queue</span>
          <ArrowRight size={13} />
        </button>
      </div>

      {/* Clean Enterprise KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Ingested */}
        <div className="glass-card p-4 hover:border-blue-500/50 transition-all bg-gradient-to-b from-[#091730] to-[#050e1f]">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Total Ingested Records</span>
            <FileText size={16} className="text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {kpis.total_documents.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1 mt-1.5">
            <ArrowUpRight size={13} /> +1,842 this week
          </div>
        </div>

        {/* Validated & Sealed */}
        <div className="glass-card p-4 hover:border-emerald-500/50 transition-all bg-gradient-to-b from-[#061e1b] to-[#030e0c]">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Validated & Notarized</span>
            <CheckCircle2 size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2">
            {kpis.validated_documents.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-300/80 font-medium mt-1.5">
            {((kpis.validated_documents / kpis.total_documents) * 100).toFixed(1)}% sealed on DILRMP
          </div>
        </div>

        {/* Review Queue */}
        <div
          className="glass-card p-4 hover:border-amber-400/60 cursor-pointer transition-all bg-gradient-to-b from-[#1c1404] to-[#0c0801]"
          onClick={() => onNavigate('verify')}
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[10px]">HITL Verification Queue</span>
            <Clock size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 mt-2">
            {kpis.review_queue.toLocaleString()}
          </div>
          <div className="text-[11px] text-amber-300 font-bold mt-1.5 flex items-center gap-1">
            <span>Requires human verification</span> <ChevronRight size={12} />
          </div>
        </div>

        {/* Pipeline Accuracy */}
        <div className="glass-card p-4 hover:border-purple-500/50 transition-all bg-gradient-to-b from-[#150a2b] to-[#0a0417]">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Pipeline Extraction Accuracy</span>
            <TrendingUp size={16} className="text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {kpis.overall_accuracy_pct}%
          </div>
          <div className="text-[11px] text-emerald-400 font-bold mt-1.5 flex items-center gap-1">
            <ArrowUpRight size={13} /> +1.8% active learning gain
          </div>
        </div>
      </div>

      {/* Live Ingestion & Processing Pipeline Tracker Widget */}
      <div className="glass-panel p-5 space-y-3 border-blue-500/30 bg-[#061124]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#16335c] pb-2.5">
          <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Cpu size={15} className="text-blue-400" /> Live Multimodal Land Record Processing Pipeline
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Avg Latency: <span className="text-emerald-400 font-bold">{kpis.avg_processing_time_sec}s / doc</span> · 5-Stage Automated Workflow
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 pt-1">
          {/* Stage 1 */}
          <div className="bg-[#030914] p-3 rounded-xl border border-[#142e54] space-y-1.5 relative">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold uppercase">
              <span>Stage 1</span>
              <FileText size={12} className="text-blue-400" />
            </div>
            <div className="text-xs font-bold text-white">Scanned Document</div>
            <div className="text-[10px] text-slate-400">7/12, Patta, Pahani PDF</div>
            <div className="pt-1 flex items-center gap-1 text-[10px] text-emerald-400 font-mono font-bold">
              <Check size={11} /> {kpis.total_documents.toLocaleString()} Ingested
            </div>
          </div>

          {/* Stage 2 */}
          <div className="bg-[#030914] p-3 rounded-xl border border-blue-500/40 space-y-1.5 relative">
            <div className="flex items-center justify-between text-[10px] text-blue-400 font-semibold uppercase">
              <span>Stage 2</span>
              <Zap size={12} className="text-amber-400 animate-pulse" />
            </div>
            <div className="text-xs font-bold text-white">Vision OCR / HTR</div>
            <div className="text-[10px] text-slate-400">Indic Neural Recognition</div>
            <div className="pt-1 flex items-center gap-1 text-[10px] text-blue-300 font-mono font-bold">
              <Activity size={11} className="animate-spin" /> {kpis.processing_documents} Active Batch
            </div>
          </div>

          {/* Stage 3 */}
          <div className="bg-[#030914] p-3 rounded-xl border border-[#142e54] space-y-1.5 relative">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold uppercase">
              <span>Stage 3</span>
              <Layers size={12} className="text-purple-400" />
            </div>
            <div className="text-xs font-bold text-white">NER Field Parsing</div>
            <div className="text-[10px] text-slate-400">MuRIL Model Schema</div>
            <div className="pt-1 flex items-center gap-1 text-[10px] text-purple-300 font-mono font-bold">
              <Check size={11} /> 96.4% Match Rate
            </div>
          </div>

          {/* Stage 4 */}
          <div className="bg-[#030914] p-3 rounded-xl border border-amber-500/40 space-y-1.5 relative">
            <div className="flex items-center justify-between text-[10px] text-amber-400 font-semibold uppercase">
              <span>Stage 4</span>
              <Clock size={12} className="text-amber-400" />
            </div>
            <div className="text-xs font-bold text-amber-300">HITL Review Queue</div>
            <div className="text-[10px] text-slate-400">Officer Verification</div>
            <div className="pt-1 flex items-center gap-1 text-[10px] text-amber-400 font-mono font-bold">
              <span>⏳ {kpis.review_queue.toLocaleString()} Pending</span>
            </div>
          </div>

          {/* Stage 5 */}
          <div className="bg-[#030914] p-3 rounded-xl border border-emerald-500/40 space-y-1.5 relative">
            <div className="flex items-center justify-between text-[10px] text-emerald-400 font-semibold uppercase">
              <span>Stage 5</span>
              <ShieldCheck size={12} className="text-emerald-400" />
            </div>
            <div className="text-xs font-bold text-emerald-300">Sealed Cadastre</div>
            <div className="text-[10px] text-slate-400">Blockchain Notarized</div>
            <div className="pt-1 flex items-center gap-1 text-[10px] text-emerald-400 font-mono font-bold">
              <CheckCircle2 size={11} /> {kpis.validated_documents.toLocaleString()} Sealed
            </div>
          </div>
        </div>
      </div>

      {/* 60/40 Split Main Analytics & Live Operations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN (60%): Interactive Analytics Tabs & Dual-Line Trend Chart */}
        <div className="lg:col-span-7 glass-panel p-5 space-y-4 border-blue-500/30">

          {/* Active Navigation Tabs */}
          <div className="flex items-center justify-between border-b border-[#16335c] pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-1.5 bg-[#030a17] p-1 rounded-xl border border-[#16335c]">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'overview'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Accuracy Progression & Trends
              </button>
              <button
                onClick={() => setActiveTab('states')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'states'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                State Revenue Index
              </button>
              <button
                onClick={() => setActiveTab('languages')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'languages'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Indic Script Benchmarks
              </button>
            </div>
          </div>

          {/* TAB 1: OVERVIEW DUAL-LINE ACCURACY TREND CHART */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Activity size={15} className="text-blue-400" /> Multi-Script OCR & HTR Accuracy Benchmark
                  </h3>
                  <p className="text-[11px] text-slate-400">7-Day Performance Comparison: Printed OCR vs. Handwritten Records</p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5 text-blue-400 font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm"></span> Printed (99.1%)
                  </span>
                  <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm"></span> Handwritten (88.4%)
                  </span>
                </div>
              </div>

              {/* Dual Line Chart with Dual-Tone Gradient Fills */}
              <div className="h-64 w-full bg-[#030a17] p-2 rounded-xl border border-[#142e54]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={accuracy_trends} margin={{ top: 15, right: 15, left: -15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPrintedClean" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="colorHandwrittenClean" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.30}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#162e54" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis
                      domain={[80, 100]}
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      unit="%"
                      label={{ value: '% Accuracy', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#071329', borderColor: '#1b3d75', borderRadius: '10px', fontSize: '11px', color: '#fff' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="printed_accuracy"
                      stroke="#3b82f6"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorPrintedClean)"
                      name="Printed OCR (99.1%)"
                    />
                    <Area
                      type="monotone"
                      dataKey="handwritten_accuracy"
                      stroke="#f59e0b"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorHandwrittenClean)"
                      name="Handwritten HTR (88.4%)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Mini Script Accuracy Breakdown Bar */}
              <div className="bg-[#030914] p-3.5 rounded-xl border border-[#142e54] space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span className="uppercase tracking-wider text-[10px] text-slate-400">Accuracy Across Indic Language Scripts</span>
                  <span className="text-blue-400">MuRIL Fine-Tuned Model Engine</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-300 font-bold">
                      <span>Devanagari</span>
                      <span className="text-emerald-400">98.4%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#091833] rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '98.4%' }}></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-300 font-bold">
                      <span>Marathi</span>
                      <span className="text-emerald-400">97.8%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#091833] rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '97.8%' }}></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-300 font-bold">
                      <span>Telugu</span>
                      <span className="text-blue-400">96.2%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#091833] rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '96.2%' }}></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-300 font-bold">
                      <span>Tamil</span>
                      <span className="text-blue-400">95.8%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#091833] rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '95.8%' }}></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-300 font-bold">
                      <span>Kannada</span>
                      <span className="text-amber-400">94.1%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#091833] rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: '94.1%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STATE REVENUE INDEX */}
          {activeTab === 'states' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">State-wise Land Digitization Progress</h3>
                <span className="text-[11px] text-slate-400">5 Major State Portals</span>
              </div>
              <div className="space-y-2.5">
                {state_metrics.map(st => (
                  <div key={st.state_code} className="bg-[#030914] p-3 rounded-xl border border-[#142e54] space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-white">{st.state_name}</span>
                      <span className="text-blue-400 font-mono">{st.completion_rate_pct}% Complete</span>
                    </div>
                    <div className="w-full h-2 bg-[#081730] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" style={{ width: `${st.completion_rate_pct}%` }}></div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{st.validated.toLocaleString()} Sealed Records</span>
                      <span>{st.in_review} Pending Review</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: INDIC SCRIPT BENCHMARKS */}
          {activeTab === 'languages' && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Indic Multi-Script Recognition Benchmarks</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {language_metrics.map(lang => (
                  <div key={lang.language_code} className="bg-[#030914] p-3.5 rounded-xl border border-[#142e54] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">{lang.language_name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{lang.total_docs.toLocaleString()} docs processed</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {(lang.avg_confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN (40%): Live Processing Feed & Cadastral GIS Quick Map Preview */}
        <div className="lg:col-span-5 space-y-4">

          {/* Live Processing Feed & Discrepancies Table */}
          <div className="glass-panel p-4 space-y-3 border-blue-500/30">
            <div className="flex items-center justify-between border-b border-[#16335c] pb-2">
              <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Activity size={14} className="text-blue-400 animate-pulse" /> Live Extraction & Discrepancy Stream
              </div>
              <button
                onClick={() => onNavigate('documents')}
                className="text-[10px] text-blue-400 hover:underline font-bold"
              >
                View All →
              </button>
            </div>

            <div className="space-y-2">
              {mockLiveFeed.map(item => (
                <div
                  key={item.id}
                  onClick={() => onNavigate('verify-detail', item.id)}
                  className="bg-[#030914] p-2.5 rounded-xl border border-[#142e54] hover:border-blue-500/50 cursor-pointer transition-all space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white font-mono">Survey {item.survey}</span>
                    <span className={`px-2 py-0.2 rounded text-[9px] font-bold ${
                      item.status === 'VERIFIED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : item.status === 'CONFLICT'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 flex items-center justify-between">
                    <span>{item.owner} · {item.village}</span>
                    <span className="text-[10px] text-slate-400">{item.time}</span>
                  </div>
                  {item.issue && (
                    <div className="text-[10px] text-amber-300 bg-amber-950/30 px-2 py-0.5 rounded border border-amber-500/20 font-mono">
                      ⚠️ {item.issue}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* GIS Cadastral Quick Preview Map Tile */}
          <div className="glass-panel p-4 space-y-3 border-blue-500/30 bg-[#051124]">
            <div className="flex items-center justify-between border-b border-[#16335c] pb-2">
              <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <MapPin size={14} className="text-amber-400" /> Cadastral GIS Sync (ISRO Bhuvan)
              </div>
              <span className="badge badge-emerald text-[9px]">19,850 Parcels Synced</span>
            </div>

            {/* Mini Map Canvas Box */}
            <div
              className="w-full h-36 bg-[#030814] rounded-xl border border-blue-500/40 relative overflow-hidden cursor-pointer group flex items-center justify-center p-3"
              onClick={() => onNavigate('map')}
            >
              <svg className="absolute inset-0 w-full h-full opacity-25">
                <defs>
                  <pattern id="dash-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#3b82f6" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#dash-grid)" />
              </svg>

              <svg className="w-full h-full relative z-10" viewBox="0 0 300 120">
                <polygon points="30,15 180,25 210,105 45,95" fill="rgba(59, 130, 246, 0.2)" stroke="#3b82f6" strokeWidth="2" />
                <polygon points="180,25 280,35 290,110 210,105" fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" strokeWidth="2" />
                <circle cx="120" cy="60" r="4" fill="#fbbf24" />
                <text x="120" y="50" textAnchor="middle" fill="#fbbf24" fontSize="9" fontWeight="bold">Survey 126/1</text>
              </svg>

              <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-[#07152b] border border-blue-400/40 text-[10px] text-blue-300 font-bold group-hover:bg-blue-600 group-hover:text-white transition-all flex items-center gap-1 shadow">
                <span>Open Master GIS Map</span>
                <ArrowRight size={11} />
              </div>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Boundary Overlap Rule: <strong className="text-emerald-400">0 Disputes Detected</strong></span>
              <span className="font-mono text-purple-300 font-bold">EPSG:4326</span>
            </div>
          </div>

        </div>
      </div>

      {/* Overview Dashboard Footer Elements */}
      <div className="pt-6 border-t border-[#1a335a]/80 space-y-5">
        {/* Row 1: Real-time National Grid Telemetry */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 1: Bhuvan GIS */}
          <div className="p-3.5 rounded-xl bg-[#0a1628] border border-[#1a335a] flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Globe size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-white">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Bhuvan WMS Gateway</span>
              </div>
              <div className="text-[11px] text-slate-400 truncate">Cadastral Sync • 38ms Latency</div>
            </div>
          </div>

          {/* Card 2: Indic OCR Models */}
          <div className="p-3.5 rounded-xl bg-[#0a1628] border border-[#1a335a] flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
              <Cpu size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-white">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                <span>MuRIL Indic OCR Engine</span>
              </div>
              <div className="text-[11px] text-slate-400 truncate">Tamil, Marathi, Devanagari, Telugu</div>
            </div>
          </div>

          {/* Card 3: Audit Ledger */}
          <div className="p-3.5 rounded-xl bg-[#0a1628] border border-[#1a335a] flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-white">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>CAG Statutory Audit Chain</span>
              </div>
              <div className="text-[11px] text-slate-400 truncate">SHA-256 Chained • Block #8,421</div>
            </div>
          </div>

          {/* Card 4: DILRMP Protocol */}
          <div className="p-3.5 rounded-xl bg-[#0a1628] border border-[#1a335a] flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0">
              <Database size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-white">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                <span>DILRMP Central Protocol</span>
              </div>
              <div className="text-[11px] text-slate-400 truncate">NIC Spatial Schema v2.4 Active</div>
            </div>
          </div>
        </div>

        {/* Row 2: Statutory Standards & Quick Action Hub */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0a1628] via-[#0e1e38] to-[#0a1628] border border-[#1a335a] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles size={14} className="text-blue-400" />
                Land.Ai Governance & Statutory Standards
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold">
                DILRMP Certified
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                ISO/IEC 27001
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 font-semibold">
                Survey of India Cadastre 2026
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Automated human-in-the-loop validation platform verifying survey boundaries, revenue patta extracts, and mutation entries with real-time cadastral georeferencing.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap flex-shrink-0">
            <button
              onClick={() => onNavigate('reports')}
              className="px-3 py-1.5 rounded-xl bg-[#070d18] hover:bg-slate-800 border border-[#1a335a] text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <Download size={13} />
              <span>Export Compliance Report</span>
            </button>
            <button
              onClick={() => onNavigate('audit')}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white flex items-center gap-1.5 shadow-lg shadow-blue-600/20 transition-all"
            >
              <ShieldCheck size={13} />
              <span>Inspect Audit Trail</span>
            </button>
          </div>
        </div>

        {/* Row 3: Cluster Info & Operational Status */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2 px-1">
          <div className="flex items-center gap-3 flex-wrap">
            <span>Cluster: <strong className="text-slate-400">delhi-central-01</strong></span>
            <span>•</span>
            <span>Uptime: <strong className="text-emerald-400">99.98%</strong></span>
            <span>•</span>
            <span>Processing Speed: <strong className="text-blue-400">{kpis.avg_processing_time_sec}s avg</strong></span>
          </div>

          <div>
            National Land Record Digitization &amp; Validation Network • Digital India
          </div>
        </div>
      </div>

      {/* Audit Trail Quick-Peek Telemetry Footer Bar */}
      <div className="sticky bottom-0 z-40 bg-[#061021]/95 backdrop-blur-md border-t border-blue-500/40 px-4 py-2.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xl text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Lock size={13} className="text-emerald-400" />
          <span className="font-bold text-white">Last Sealed Block:</span>
          <span className="font-mono text-amber-300">RoR_MH_40291</span>
          <span className="text-slate-600">•</span>
          <span className="font-mono text-slate-400 text-[11px]">Hash: 0x8f3b92...12c</span>
          <span className="text-slate-600">•</span>
          <span className="text-emerald-400 text-[11px] font-semibold">3m ago</span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
          <span className="flex items-center gap-1 text-emerald-400 font-bold">
            <CheckCircle2 size={12} /> DILRMP Blockchain Notarized
          </span>
          <span className="text-blue-400 font-bold">ISRO Bhuvan GIS Synced</span>
        </div>
      </div>
    </div>
  );
};
