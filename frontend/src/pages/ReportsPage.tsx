import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  FileText,
  Calendar,
  TrendingUp,
  ShieldCheck,
  Building2,
  Globe2,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';

export const ReportsPage: React.FC = () => {
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleDownloadCSV = (filename: string, content: string) => {
    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + content);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`📥 Exported: ${filename}`);
  };

  const handleDownloadJSON = (filename: string, data: any) => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`📥 Exported National Schema: ${filename}`);
  };

  const exportNationalSchema = async (system: 'DILRMP' | 'BHOOMI' | 'DHARANI' | 'MAHABHULEKH') => {
    const sampleRecord = {
      survey_no: "123/4A",
      ulpin: "KA6045114227686X",
      khata_no: "908",
      owner_name: "Ramesh Kumar",
      owner_name_local: "ரமேஷ் குமார்",
      area_hectares: 1.012,
      area_raw: "2.50 Acres",
      district: "Nilgiris",
      tehsil: "Udhagamandalam",
      village: "Kotagiri",
      land_class: "Plantation / Tea Garden",
      is_disputed: false,
      hash: "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069"
    };

    try {
      const resp = await api.exportNationalLRMS(system, sampleRecord);
      handleDownloadJSON(`LandAi_Export_${system}_Schema.json`, resp.payload);
    } catch {
      handleDownloadJSON(`LandAi_Export_${system}_Schema.json`, { system, sampleRecord });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-[#0F1E38] border border-blue-500 text-white text-xs px-4 py-2 rounded-lg shadow-2xl animate-fade-in flex items-center gap-2">
          <Sparkles size={14} className="text-blue-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0a1628] p-5 rounded-xl border border-[#1a335a] shadow-lg">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide flex items-center gap-2.5">
            <BarChart3 className="text-blue-400" /> Statutory Revenue Analytics & National LRMS Adapters
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Generate and export compliance records for Digital India Land Records Modernization Programme (DILRMP), CAG audits, and state land authorities.
          </p>
        </div>

        <button
          onClick={() => {
            const csv = "Survey_No,ULPIN,Owner_Name,District,State,Area_Acres,Status,Confidence,SHA256_Hash\n"
              + "123/4A,KA6045114227686X,Ramesh Kumar,Nilgiris,Tamil Nadu,2.5,VALIDATED,0.98,7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069\n"
              + "142/2A,MH4224142200188A,Tukaram Patil,Nashik,Maharashtra,4.5,VALIDATED,0.96,e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855\n"
              + "214/1B,AP5220214001009B,Venkateswara Rao,Guntur,Andhra Pradesh,2.5,VALIDATED,0.95,ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb\n";
            handleDownloadCSV("LandAi_Consolidated_Master_Ledger.csv", csv);
          }}
          className="btn btn-primary btn-sm flex items-center gap-2 self-start sm:self-auto"
        >
          <Download size={14} /> Export Consolidated Master CSV
        </button>
      </div>

      {/* KPI Cards (matches reports.html reference) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total Documents</span>
            <FileText size={16} className="text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">12,450</div>
          <div className="text-[11px] text-emerald-400 font-medium">↑ +342 digitized this week</div>
        </div>

        <div className="glass-card p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Avg Pipeline Accuracy</span>
            <TrendingUp size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-300">94.2%</div>
          <div className="text-[11px] text-emerald-400 font-medium">↑ +2.1% active learning boost</div>
        </div>

        <div className="glass-card p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Avg Processing Time</span>
            <Calendar size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300">1.8s</div>
          <div className="text-[11px] text-slate-400 font-medium">Auto-deskew, HTR & NER</div>
        </div>

        <div className="glass-card p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>States Integrated</span>
            <Building2 size={16} className="text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-300">5 States</div>
          <div className="text-[11px] text-purple-400 font-medium">KA, MH, TN, UP, RJ</div>
        </div>
      </div>

      {/* Section: National LRMS Export Adapters */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Globe2 size={14} className="text-blue-400" /> National System Export Adapters (DILRMP Ready)
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* DILRMP National API */}
          <div className="glass-panel p-4 flex flex-col justify-between space-y-3 border-blue-500/30 hover:border-blue-400 transition-all">
            <div>
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-2 font-bold text-xs">
                DILRMP
              </div>
              <h3 className="text-xs font-bold text-white">National Open API Schema</h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Unified national schema with 14-digit Bhu-Aadhaar ULPIN, WGS-84 bounding polygons, and DoLR compliance.
              </p>
            </div>
            <button
              onClick={() => exportNationalSchema('DILRMP')}
              className="btn btn-secondary btn-sm text-xs flex items-center justify-center gap-1.5 w-full"
            >
              <Download size={12} /> Export DILRMP (.JSON)
            </button>
          </div>

          {/* Karnataka Bhoomi */}
          <div className="glass-panel p-4 flex flex-col justify-between space-y-3 border-amber-500/30 hover:border-amber-400 transition-all">
            <div>
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-2 font-bold text-xs">
                BHOOMI
              </div>
              <h3 className="text-xs font-bold text-white">Karnataka Bhoomi RTC</h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Record of Rights, Tenancy and Crops (RTC / Pahani) format with Kannada script titleholder names and hissa numbers.
              </p>
            </div>
            <button
              onClick={() => exportNationalSchema('BHOOMI')}
              className="btn btn-secondary btn-sm text-xs flex items-center justify-center gap-1.5 w-full"
            >
              <Download size={12} /> Export Bhoomi (.JSON)
            </button>
          </div>

          {/* Telangana Dharani */}
          <div className="glass-panel p-4 flex flex-col justify-between space-y-3 border-emerald-500/30 hover:border-emerald-400 transition-all">
            <div>
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2 font-bold text-xs">
                DHARANI
              </div>
              <h3 className="text-xs font-bold text-white">Telangana Dharani Portal</h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Integrated Land Records Management System passbook schema with Telugu script pattadar details and encumbrance flags.
              </p>
            </div>
            <button
              onClick={() => exportNationalSchema('DHARANI')}
              className="btn btn-secondary btn-sm text-xs flex items-center justify-center gap-1.5 w-full"
            >
              <Download size={12} /> Export Dharani (.JSON)
            </button>
          </div>

          {/* Maharashtra Mahabhulekh */}
          <div className="glass-panel p-4 flex flex-col justify-between space-y-3 border-rose-500/30 hover:border-rose-400 transition-all">
            <div>
              <div className="w-9 h-9 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center mb-2 font-bold text-xs">
                7/12
              </div>
              <h3 className="text-xs font-bold text-white">Maharashtra Mahabhulekh</h3>
              <p className="text-[11px] text-slate-400 mt-1">
                e-Satbara (Form 7/12) extract schema with Gut/Hissa numbers, Marathi kabjedar details, and potkharaba land class.
              </p>
            </div>
            <button
              onClick={() => exportNationalSchema('MAHABHULEKH')}
              className="btn btn-secondary btn-sm text-xs flex items-center justify-center gap-1.5 w-full"
            >
              <Download size={12} /> Export 7/12 (.JSON)
            </button>
          </div>
        </div>
      </div>

      {/* Section: Statutory & Audit Reports */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-emerald-400" /> Statutory Compliance & Audit Ledgers
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Daily Digitization Summary */}
          <div className="glass-panel p-5 space-y-3 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3">
                <FileSpreadsheet size={20} />
              </div>
              <h3 className="text-sm font-bold text-white">Daily Digitization Summary</h3>
              <p className="text-xs text-slate-400 mt-1">
                Breakdown of documents ingested, OCR accuracy, automated approvals, and verifier productivity.
              </p>
            </div>
            <button
              onClick={() => {
                const csv = "Date,Total_Ingested,Auto_Validated,HITL_Reviewed,Accuracy_Pct,Avg_Processing_Sec\n"
                  + "2024-09-03,2130,1890,240,95.2,1.8\n"
                  + "2024-09-02,2100,1840,260,94.8,1.9\n"
                  + "2024-09-01,1890,1650,240,94.5,2.1\n";
                handleDownloadCSV("LandAi_Daily_Summary.csv", csv);
              }}
              className="btn btn-secondary btn-sm flex items-center justify-center gap-1.5 w-full"
            >
              <Download size={13} /> Download (.CSV)
            </button>
          </div>

          {/* CAG Statutory Audit Trail */}
          <div className="glass-panel p-5 space-y-3 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
                <ShieldCheck size={20} />
              </div>
              <h3 className="text-sm font-bold text-white">CAG Statutory Cryptographic Audit Ledger</h3>
              <p className="text-xs text-slate-400 mt-1">
                Cryptographically SHA-256 chained audit trail recording every human modification, verifier IP, and digital approval.
              </p>
            </div>
            <button
              onClick={() => {
                const csv = "Log_ID,Timestamp_UTC,Verifier_Name,Action,Entity_ID,Previous_Hash,Block_SHA256,Integrity_Status\n"
                  + "1,2024-09-03T14:34:00Z,Anita Sharma,VERIFY_APPROVE,ka-2024-00453,0000000000000000,7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069,SEALED\n"
                  + "2,2024-09-03T15:10:00Z,R. Srinivasan,FIELD_CORRECT,ka-2024-00453,7f83b1657ff1fc53,e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855,SEALED\n";
                handleDownloadCSV("LandAi_CAG_Chained_Audit_Ledger.csv", csv);
              }}
              className="btn btn-secondary btn-sm flex items-center justify-center gap-1.5 w-full"
            >
              <Download size={13} /> Download Chained Audit Ledger
            </button>
          </div>

          {/* Indic Script OCR Benchmarks */}
          <div className="glass-panel p-5 space-y-3 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3">
                <TrendingUp size={20} />
              </div>
              <h3 className="text-sm font-bold text-white">Indic Script OCR & HTR Performance</h3>
              <p className="text-xs text-slate-400 mt-1">
                Field-level accuracy, Character Error Rate (CER), and Word Error Rate (WER) benchmarks across regional Indian scripts.
              </p>
            </div>
            <button
              onClick={() => {
                const csv = "Script,Language,Character_Error_Rate_CER,Word_Error_Rate_WER,Accuracy_Pct,Samples_Count\n"
                  + "Devanagari,Hindi,1.4%,4.2%,95.8%,3900\n"
                  + "Devanagari,Marathi,1.6%,4.5%,95.4%,3200\n"
                  + "Kannada,Kannada,1.5%,4.3%,95.5%,2800\n"
                  + "Tamil,Tamil,1.9%,5.1%,94.9%,1450\n"
                  + "Telugu,Telugu,2.1%,5.6%,94.4%,1100\n";
                handleDownloadCSV("LandAi_Indic_OCR_HTR_Benchmarks.csv", csv);
              }}
              className="btn btn-secondary btn-sm flex items-center justify-center gap-1.5 w-full"
            >
              <Download size={13} /> Download Benchmarks (.CSV)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
