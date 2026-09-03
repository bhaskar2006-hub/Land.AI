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
  Activity
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
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'states' | 'languages'>('overview');

  useEffect(() => {
    api.getDashboardStats().then((data) => {
      setStats(data);
      setLoading(false);
    });
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const { kpis, state_metrics, accuracy_trends, language_metrics } = stats;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1a335a]/60 pb-5">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-semibold text-blue-400 uppercase tracking-wider">
            <span>National Land Record Digitization</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">Live Status</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">
            Operations & Digitization Overview
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('reports')}
            className="btn btn-secondary text-xs flex items-center gap-1.5 px-3 py-1.5"
          >
            <Download size={13} /> Export Report
          </button>
          <button
            onClick={() => onNavigate('upload')}
            className="btn btn-primary text-xs flex items-center gap-1.5 px-3.5 py-1.5 font-semibold"
          >
            <Plus size={14} /> Ingest Scans
          </button>
        </div>
      </div>

      {/* Clean KPI Cards (4 metrics with balanced hierarchy) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Documents */}
        <div className="glass-card p-4 hover:border-blue-500/40 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Ingested</span>
            <FileText size={15} className="text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-1.5">
            {kpis.total_documents.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 mt-1">
            <ArrowUpRight size={12} /> +342 this week
          </div>
        </div>

        {/* Validated Records */}
        <div className="glass-card p-4 hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Validated & Sealed</span>
            <CheckCircle2 size={15} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1.5">
            {kpis.validated_documents.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-1">
            {((kpis.validated_documents / kpis.total_documents) * 100).toFixed(1)}% complete
          </div>
        </div>

        {/* Review Queue */}
        <div
          className="glass-card p-4 hover:border-amber-400/60 cursor-pointer transition-colors bg-amber-500/[0.03]"
          onClick={() => onNavigate('verify')}
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>HITL Review Queue</span>
            <Clock size={15} className="text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400 mt-1.5">
            {kpis.review_queue.toLocaleString()}
          </div>
          <div className="text-[11px] text-amber-400/90 font-medium mt-1 flex items-center gap-1">
            <span>Needs review</span> <ChevronRight size={11} />
          </div>
        </div>

        {/* Accuracy */}
        <div className="glass-card p-4 hover:border-blue-500/40 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Pipeline Accuracy</span>
            <TrendingUp size={15} className="text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-1.5">
            {kpis.overall_accuracy_pct}%
          </div>
          <div className="text-[11px] text-emerald-400 font-medium mt-1">
            ↑ +1.4% active learning
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs to organize complex views */}
      <div className="flex items-center gap-1 border-b border-[#1a335a] pt-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 ${
            activeTab === 'overview'
              ? 'border-blue-500 text-blue-400 bg-blue-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Accuracy Progression & Trends
        </button>
        <button
          onClick={() => setActiveTab('states')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 ${
            activeTab === 'states'
              ? 'border-blue-500 text-blue-400 bg-blue-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          State Revenue Index
        </button>
        <button
          onClick={() => setActiveTab('languages')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 ${
            activeTab === 'languages'
              ? 'border-blue-500 text-blue-400 bg-blue-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Indic Script Performance
        </button>
      </div>

      {/* Tab 1: Overview Chart & Action Hub */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Main Area Chart */}
          <div className="lg:col-span-8 glass-panel p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity size={15} className="text-blue-400" /> Extraction Accuracy Progression
                </h2>
                <p className="text-[11px] text-slate-400">Printed Indic OCR vs. Handwritten Records</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-blue-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span> Printed (99.1%)
                </span>
                <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span> Handwritten (88.4%)
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={accuracy_trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPrintedClean" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1e6fff" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#1e6fff" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorHandwrittenClean" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff9500" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#ff9500" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 2" stroke="#162c4e" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis domain={[80, 100]} stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0a1628', borderColor: '#1a335a', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Area type="monotone" dataKey="printed_accuracy" stroke="#1e6fff" strokeWidth={2} fillOpacity={1} fill="url(#colorPrintedClean)" name="Printed OCR" />
                  <Area type="monotone" dataKey="handwritten_accuracy" stroke="#ff9500" strokeWidth={2} fillOpacity={1} fill="url(#colorHandwrittenClean)" name="Handwritten OCR" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Operations Strip */}
          <div className="lg:col-span-4 glass-panel p-5 flex flex-col justify-between space-y-3">
            <div>
              <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
                Core Operations
              </h2>
              <div className="space-y-2">
                <button
                  onClick={() => onNavigate('verify')}
                  className="w-full p-3 rounded-xl bg-[#070d18] hover:bg-[#14284b] border border-[#1a335a] flex items-center justify-between text-left transition-colors group"
                >
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-amber-400">
                      Resolve Review Queue
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {kpis.review_queue} records awaiting confirmation
                    </div>
                  </div>
                  <ArrowRight size={13} className="text-slate-500 group-hover:text-amber-400" />
                </button>

                <button
                  onClick={() => onNavigate('map')}
                  className="w-full p-3 rounded-xl bg-[#070d18] hover:bg-[#14284b] border border-[#1a335a] flex items-center justify-between text-left transition-colors group"
                >
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-blue-400">
                      Cadastral GIS Map
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {kpis.total_parcels_mapped.toLocaleString()} PostGIS parcels
                    </div>
                  </div>
                  <ArrowRight size={13} className="text-slate-500 group-hover:text-blue-400" />
                </button>

                <button
                  onClick={() => onNavigate('documents')}
                  className="w-full p-3 rounded-xl bg-[#070d18] hover:bg-[#14284b] border border-[#1a335a] flex items-center justify-between text-left transition-colors group"
                >
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-emerald-400">
                      Document Registry
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Browse all ingested land records
                    </div>
                  </div>
                  <ArrowRight size={13} className="text-slate-500 group-hover:text-emerald-400" />
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-500/20 text-[11px] text-slate-300">
              <span className="font-semibold text-blue-400">DILRMP Live Sync:</span> Average automated processing latency is <strong className="text-white">{kpis.avg_processing_time_sec}s</strong> per document.
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: State Progress */}
      {activeTab === 'states' && (
        <div className="glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">State-wise Digitization Completion</h2>
            <span className="text-xs text-slate-400">Ranked by volume</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {state_metrics.map((st) => (
              <div key={st.state_code} className="bg-[#070d18] p-4 rounded-xl border border-[#1a335a] space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-white">{st.state_name}</span>
                  <span className="text-blue-400">{st.completion_rate_pct}%</span>
                </div>
                <div className="w-full h-2 bg-[#0a1628] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                    style={{ width: `${st.completion_rate_pct}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>{st.validated.toLocaleString()} validated</span>
                  <span>{st.in_review} in review queue</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Indic Script Recognition Benchmarks */}
      {activeTab === 'languages' && (
        <div className="glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Multilingual Indic Script Benchmarks</h2>
              <p className="text-xs text-slate-400">MuRIL fine-tuned NER + Tesseract 5.x Indic language models</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {language_metrics.map((lang) => (
              <div key={lang.language_code} className="bg-[#070d18] p-3.5 rounded-xl border border-[#1a335a] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">{lang.language_name}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{lang.total_docs.toLocaleString()} docs processed</div>
                </div>
                <span className="badge badge-green text-xs font-bold">
                  {(lang.avg_confidence * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
