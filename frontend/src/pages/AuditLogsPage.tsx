import React, { useEffect, useState } from 'react';
import { ShieldCheck, User, Clock } from 'lucide-react';
import { api } from '../services/api';
import { AuditLog } from '../types';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAuditLogs().then((data) => {
      setLogs(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <ShieldCheck className="text-blue-500" /> Security & Compliance Audit Trail
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Immutable event log recording all document ingestion, automated OCR evaluations, and human verifier interventions.
        </p>
      </div>

      {/* Logs Table */}
      <div className="glass-panel overflow-hidden">
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Operator / Verifier</th>
                <th>Target Entity</th>
                <th>Timestamp</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.log_id}>
                  <td>
                    <span className="badge badge-blue font-mono font-bold text-[10px]">
                      {log.action}
                    </span>
                  </td>
                  <td>
                    <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <User size={13} className="text-slate-400" />
                      <span>{log.user_name || 'System Auto-Processor'}</span>
                    </div>
                  </td>
                  <td>
                    <span className="text-xs font-mono text-slate-300">
                      {log.entity_type}: {log.entity_id}
                    </span>
                  </td>
                  <td>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </td>
                  <td>
                    <span className="text-[11px] font-mono text-slate-400 truncate max-w-xs block">
                      {log.new_value || '—'}
                    </span>
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
