import React, { useEffect, useState, useCallback } from 'react';
import {
  Search,
  FileText,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { Document } from '../types';

interface DocumentsPageProps {
  onNavigate: (tab: string, docId?: string) => void;
}

export const DocumentsPage: React.FC<DocumentsPageProps> = ({ onNavigate }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDocs = useCallback(() => {
    setLoading(true);
    api.listDocuments(statusFilter || undefined, languageFilter || undefined, searchQuery || undefined)
      .then((docs) => {
        setDocuments(docs);
        setLoading(false);
      });
  }, [statusFilter, languageFilter, searchQuery]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDocs();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VALIDATED':
        return <span className="badge badge-green">VALIDATED</span>;
      case 'NEEDS_REVIEW':
        return <span className="badge badge-saffron">NEEDS REVIEW</span>;
      case 'PROCESSING':
        return <span className="badge badge-blue">PROCESSING</span>;
      case 'REJECTED':
        return <span className="badge badge-red">REJECTED</span>;
      default:
        return <span className="badge badge-blue">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <FileText className="text-blue-500" /> Land Record Document Registry
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Search, filter, inspect OCR extracts, and track validation status for all ingested revenue deeds.
          </p>
        </div>

        <button
          onClick={() => onNavigate('upload')}
          className="btn btn-primary btn-sm flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>Ingest New Document</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 flex flex-col md:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by file name, survey number, or record ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input pl-9 text-xs"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-select text-xs w-full md:w-40"
          >
            <option value="">All Statuses</option>
            <option value="VALIDATED">Validated</option>
            <option value="NEEDS_REVIEW">Needs Review</option>
            <option value="PROCESSING">Processing</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="form-select text-xs w-full md:w-36"
          >
            <option value="">All Languages</option>
            <option value="ta">Tamil (ta)</option>
            <option value="mr">Marathi (mr)</option>
            <option value="kn">Kannada (kn)</option>
            <option value="hi">Hindi (hi)</option>
            <option value="te">Telugu (te)</option>
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div className="glass-panel overflow-hidden">
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : documents.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No matching land records found. Try adjusting filters or upload a new scan.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Document File</th>
                <th>Type</th>
                <th>Language</th>
                <th>District</th>
                <th>Confidence</th>
                <th>Status</th>
                <th>Ingested</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.doc_id}>
                  <td>
                    <div className="font-semibold text-white flex items-center gap-2">
                      <FileText size={14} className="text-blue-400 shrink-0" />
                      <span className="truncate max-w-xs">{doc.file_name}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      ID: {doc.doc_id}
                    </div>
                  </td>
                  <td>
                    <span className="text-xs text-slate-300 font-medium">
                      {doc.document_type.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-blue uppercase">{doc.language}</span>
                  </td>
                  <td>
                    <span className="text-xs text-slate-300">
                      {doc.district_code || 'Nilgiris'}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-[#070d18] rounded-full overflow-hidden border border-[#1a335a]">
                        <div
                          className={`h-full rounded-full ${
                            doc.overall_confidence > 0.75 ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${doc.overall_confidence * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-slate-200">
                        {(doc.overall_confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td>{getStatusBadge(doc.status)}</td>
                  <td>
                    <span className="text-xs text-slate-400">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="text-right">
                    <button
                      onClick={() => onNavigate('verify', doc.doc_id)}
                      className="btn btn-secondary btn-sm inline-flex items-center gap-1 text-[11px]"
                    >
                      <span>Inspect</span>
                      <ExternalLink size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
