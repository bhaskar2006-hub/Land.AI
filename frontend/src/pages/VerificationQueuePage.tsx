import React, { useEffect, useState } from 'react';
import {
  CheckSquare,
  Clock,
  ArrowRight,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import { VerificationTask } from '../types';

interface VerificationQueuePageProps {
  onNavigate: (tab: string, docId?: string) => void;
}

export const VerificationQueuePage: React.FC<VerificationQueuePageProps> = ({ onNavigate }) => {
  const [tasks, setTasks] = useState<VerificationTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getVerificationQueue().then((data) => {
      setTasks(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <CheckSquare className="text-amber-400" /> Human-in-the-Loop (HITL) Verification Queue
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Revenue officers and verification specialists review extractions with confidence &lt; 75%,
            handwritten annotations, or disputed survey numbers before committing to the master record.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
          <Clock size={14} />
          <span>{tasks.length} Pending Review Tasks</span>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="glass-panel p-8 text-center space-y-2">
            <CheckCircle2 size={32} className="mx-auto text-emerald-400" />
            <div className="text-sm font-bold text-white">All Clear! Queue is empty</div>
            <div className="text-xs text-slate-400">All pending land record extractions have been validated.</div>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.task_id}
              className="glass-card p-5 border-l-4 border-l-amber-500 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:bg-[#14284b]"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="badge badge-saffron text-[10px]">
                    PRIORITY {task.priority === 1 ? 'HIGH' : 'NORMAL'}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-200">
                    Doc #{task.doc_id}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    • {task.doc_id.includes('034') ? 'Survey #134 (Andhra Pradesh ROR-1B)' :
                       task.doc_id.includes('097') ? 'Survey #197 (Andhra Pradesh ROR-1B)' :
                       task.doc_id.includes('024') ? 'Survey #124 (Andhra Pradesh ROR-1B)' :
                       task.doc_id.includes('mh') ? 'Survey #142/2A (Maharashtra Form 7/12)' :
                       task.doc_id.includes('rj') ? 'Khasra #482 (Rajasthan Jamabandi)' :
                       'Survey #123/4A (Tamil Nadu Patta ROR)'}
                  </span>
                </div>

                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldAlert size={15} className={`shrink-0 ${task.priority === 1 ? 'text-rose-400' : 'text-amber-400'}`} />
                  <span className={task.priority === 1 ? 'text-rose-200' : 'text-white'}>
                    {task.notes || 'Low confidence detected in key titleholder fields'}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-[11px] text-slate-400">
                  <span>Assigned to: <strong className="text-slate-200">{task.assigned_to || 'Senior Verifier'}</strong></span>
                  <span>Created: {new Date(task.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              <button
                onClick={() => onNavigate('verify-detail', task.doc_id)}
                className="btn btn-primary text-xs flex items-center gap-2 shrink-0 self-end md:self-center"
              >
                <span>Launch Verification Workbench</span>
                <ArrowRight size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
