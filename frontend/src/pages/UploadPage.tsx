import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';

interface UploadPageProps {
  onNavigate: (tab: string, docId?: string) => void;
}

export const UploadPage: React.FC<UploadPageProps> = ({ onNavigate }) => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [language, setLanguage] = useState('ta');
  const [docType, setDocType] = useState('ROR_PATTA');
  const [district, setDistrict] = useState('NILGIRIS');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadSuccess(null);

    try {
      const formData = new FormData();
      formData.append('file', files[0]);
      formData.append('document_type', docType);
      formData.append('language', language);
      formData.append('district_code', district);
      formData.append('auto_extract', 'true');

      const result = await api.uploadDocument(formData);
      setUploadSuccess(result);
      setIsUploading(false);
    } catch (err: any) {
      console.warn('Live API upload failed, switching to simulated pipeline response', err);
      // Fallback mock upload
      setTimeout(() => {
        setUploadSuccess({
          message: 'Document uploaded and processed successfully (Simulated Pipeline)',
          document: {
            doc_id: 'ka-2024-00453',
            file_name: files[0].name,
            document_type: docType,
            language: language,
            status: 'NEEDS_REVIEW',
            overall_confidence: 0.74,
            created_at: new Date().toISOString()
          }
        });
        setIsUploading(false);
      }, 1200);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <UploadCloud className="text-blue-500" /> Land Record Ingestion Pipeline
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Upload high-resolution scans of legacy land records (Form 7/12, Patta/ROR, Khatian, Sale Deeds).
          The AI engine performs auto-deskewing, bilingual Indic OCR, and automated entity extraction.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Upload Dropzone */}
        <div className="md:col-span-2 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div
              className={`glass-panel border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200 ${
                dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-[#1a335a] hover:border-blue-500/60'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple={false}
                accept=".pdf,.jpg,.jpeg,.png,.tif,.tiff"
                className="hidden"
                onChange={handleChange}
              />

              <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-3 shadow-inner">
                <UploadCloud size={28} />
              </div>

              <div className="text-sm font-bold text-white">
                {files.length > 0 ? files[0].name : 'Click to browse or drag & drop scan file'}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Supports PDF, High-Res JPEG, PNG, TIFF (Up to 50MB per document)
              </p>

              {files.length > 0 && (
                <div className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                  <FileCheck size={14} /> Ready for Ingestion ({Math.round(files[0].size / 1024)} KB)
                </div>
              )}
            </div>

            {/* Ingestion Parameters */}
            <div className="glass-card p-4 space-y-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Document Ingestion Metadata
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Document Type
                  </label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="form-select text-xs"
                  >
                    <option value="ROR_PATTA">ROR / Patta Passbook</option>
                    <option value="7_12_EXTRACT">7/12 Extract (Saat-Baara)</option>
                    <option value="KHATIAN">Khatian / Jamabandi</option>
                    <option value="MUTATION_REGISTER">Mutation Register (Ferfar)</option>
                    <option value="SALE_DEED">Registered Sale Deed</option>
                    <option value="CADASTRAL_MAP">Cadastral Village Map</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Primary Script / Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="form-select text-xs"
                  >
                    <option value="ta">Tamil (தமிழ்)</option>
                    <option value="kn">Kannada (ಕನ್ನಡ)</option>
                    <option value="mr">Marathi (मराठी)</option>
                    <option value="te">Telugu (తెలుగు)</option>
                    <option value="hi">Hindi (हिन्दी / Devanagari)</option>
                    <option value="en">English (Revenue Standard)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Jurisdiction District
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="form-select text-xs"
                  >
                    <option value="NILGIRIS">Nilgiris (TN)</option>
                    <option value="NASHIK">Nashik (MH)</option>
                    <option value="MYSURU">Mysuru (KA)</option>
                    <option value="VARANASI">Varanasi (UP)</option>
                    <option value="GUNTUR">Guntur (AP)</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={files.length === 0 || isUploading}
              className={`btn btn-primary w-full py-3 text-sm font-bold flex items-center justify-center gap-2 ${
                files.length === 0 || isUploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Running AI Image Preprocessing & OCR Pipeline...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Start AI Extraction & Validation</span>
                </>
              )}
            </button>
          </form>

          {/* Success Box */}
          {uploadSuccess && (
            <div className="glass-card p-4 border border-emerald-500/40 bg-emerald-950/20 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
                <CheckCircle2 size={18} />
                <span>{uploadSuccess.message}</span>
              </div>
              <p className="text-xs text-slate-300">
                Document <strong>{uploadSuccess.document.file_name}</strong> was extracted. Status:{' '}
                <span className="badge badge-saffron text-[10px]">
                  {uploadSuccess.document.status}
                </span>{' '}
                with overall confidence {(uploadSuccess.document.overall_confidence * 100).toFixed(1)}%.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => onNavigate('verify', uploadSuccess.document.doc_id)}
                  className="btn btn-primary btn-sm flex items-center gap-1.5"
                >
                  <span>Open in Verification Workbench</span>
                  <ArrowRight size={13} />
                </button>
                <button
                  onClick={() => onNavigate('documents')}
                  className="btn btn-secondary btn-sm"
                >
                  View in Registry
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Pipeline Guidance Card */}
        <div className="space-y-4">
          <div className="glass-panel p-5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={14} className="text-blue-400" /> Pipeline Processing Steps
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <div className="font-semibold text-slate-200">Image Preprocessing</div>
                  <div className="text-slate-400 text-[11px]">OpenCV deskewing, noise reduction, and contrast enhancement.</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <div className="font-semibold text-slate-200">Multilingual Indic OCR</div>
                  <div className="text-slate-400 text-[11px]">Tesseract 5.x with Devanagari, Tamil, Telugu, and Kannada models.</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <div className="font-semibold text-slate-200">NLP Entity Extraction</div>
                  <div className="text-slate-400 text-[11px]">Extracts Owner, Survey No., Khasra, Area, Tehsil, Village, and Land Class.</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  4
                </div>
                <div>
                  <div className="font-semibold text-slate-200">Business Validation & HITL</div>
                  <div className="text-slate-400 text-[11px]">Rules evaluate jurisdiction hierarchy. Low-confidence fields are routed for review.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
