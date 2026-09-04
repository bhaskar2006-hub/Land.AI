import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  MapPin,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Command,
  CornerDownLeft,
  LogOut
} from 'lucide-react';
import { api } from '../services/api';

export interface PlotSearchResult {
  id: string;
  surveyNo: string;
  plotNo?: string;
  khasraNo?: string;
  ownerName: string;
  area: string;
  village: string;
  district: string;
  state: string;
  documentType: string;
  status: 'VALIDATED' | 'NEEDS_REVIEW' | 'DISPUTED';
  docId: string;
  issueNote?: string;
  ulpin?: string;
}

// Built-in comprehensive registry of Indian land record plots across states
const MASTER_PLOT_REGISTRY: PlotSearchResult[] = [
  {
    id: 'p-ka-00453',
    surveyNo: '123/4A',
    plotNo: 'Plot 4A',
    khasraNo: '456-B',
    ownerName: 'Ramesh Kumar',
    area: '2.50 Acres (1.012 Ha)',
    village: 'Kotagiri',
    district: 'Nilgiris',
    state: 'Tamil Nadu',
    documentType: 'ROR / Patta',
    status: 'NEEDS_REVIEW',
    docId: 'ka-2024-00453',
    issueNote: 'Owner Name & Land Class low confidence review',
    ulpin: 'TN6045123400453A'
  },
  {
    id: 'p-ka-00101',
    surveyNo: '123/4B',
    plotNo: 'Plot 4B',
    khasraNo: '456-C',
    ownerName: 'K. Subramanian',
    area: '2.10 Acres',
    village: 'Kotagiri',
    district: 'Nilgiris',
    state: 'Tamil Nadu',
    documentType: 'Patta Chitta',
    status: 'VALIDATED',
    docId: 'ka-2024-00453',
    ulpin: 'TN6045123400101B'
  },
  {
    id: 'p-mh-01089',
    surveyNo: '142/2A',
    plotNo: 'Plot 2A',
    khasraNo: '142/2',
    ownerName: 'Tukaram Patil',
    area: '4.50 Acres (1.821 Ha)',
    village: 'Dindori',
    district: 'Nashik',
    state: 'Maharashtra',
    documentType: '7/12 Extract',
    status: 'VALIDATED',
    docId: 'mh-2024-01089',
    ulpin: 'MH4224142200188A'
  },
  {
    id: 'p-ap-00034',
    surveyNo: '134',
    plotNo: 'Plot #134',
    khasraNo: 'KH00034',
    ownerName: 'Synthetic Owner 034',
    area: '15.36 Acres (vs GIS 14.22 Ac)',
    village: 'Penukonda',
    district: 'Anantapur',
    state: 'Andhra Pradesh',
    documentType: 'ROR 1B / Pahani',
    status: 'NEEDS_REVIEW',
    docId: 'DOC-00034',
    issueNote: 'Area mismatch: OCR 15.36 Acres vs GIS 14.22 Acres',
    ulpin: 'AP515113400034X'
  },
  {
    id: 'p-ap-00097',
    surveyNo: '197',
    plotNo: 'Plot #197',
    khasraNo: 'KH00097',
    ownerName: 'Synthetic Owner 115 (Flagged)',
    area: '14.22 Acres',
    village: 'Madakasira',
    district: 'Anantapur',
    state: 'Andhra Pradesh',
    documentType: 'ROR 1B / Pahani',
    status: 'NEEDS_REVIEW',
    docId: 'DOC-00097',
    issueNote: 'Owner Name mismatch vs Aadhaar/e-KYC registry',
    ulpin: 'AP515119700097Y'
  },
  {
    id: 'p-ap-00214',
    surveyNo: '214/1B',
    plotNo: 'Plot 1B',
    khasraNo: 'KH-214',
    ownerName: 'Venkateswara Rao',
    area: '2.50 Acres',
    village: 'Tenali',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    documentType: 'Adangal / Pahani',
    status: 'VALIDATED',
    docId: 'ka-2024-00453',
    ulpin: 'AP5220214001009B'
  },
  {
    id: 'p-rj-00482',
    surveyNo: '482/1',
    plotNo: 'Plot #482',
    khasraNo: 'Khasra 482',
    ownerName: 'Bhanwar Singh',
    area: '8.40 Acres',
    village: 'Balotra',
    district: 'Barmer',
    state: 'Rajasthan',
    documentType: 'Jamabandi Nakal',
    status: 'DISPUTED',
    docId: 'ka-2024-00453',
    issueNote: 'Active boundary dispute litigation recorded',
    ulpin: 'RJ344048200001Z'
  },
  {
    id: 'p-up-00078',
    surveyNo: '78/3',
    plotNo: 'Plot 78',
    khasraNo: 'Gata 78/3',
    ownerName: 'Ram Swaroop Yadav',
    area: '3.20 Acres',
    village: 'Bakshi Ka Talab',
    district: 'Lucknow',
    state: 'Uttar Pradesh',
    documentType: 'Khatauni',
    status: 'VALIDATED',
    docId: 'ka-2024-00453',
    ulpin: 'UP22600780003C'
  },
  {
    id: 'p-ka-00012',
    surveyNo: '12/A',
    plotNo: 'Plot 12',
    khasraNo: 'Hissa 12A',
    ownerName: 'Channappa Gowda',
    area: '1.80 Acres',
    village: 'Maddur',
    district: 'Mandya',
    state: 'Karnataka',
    documentType: 'Bhoomi RTC',
    status: 'VALIDATED',
    docId: 'ka-2024-00453',
    ulpin: 'KA57141200001A'
  },
  {
    id: 'p-mh-00561',
    surveyNo: '56/1',
    plotNo: 'Plot 56',
    khasraNo: 'Gat No. 56',
    ownerName: 'Anand Deshmukh',
    area: '6.10 Acres',
    village: 'Haveli',
    district: 'Pune',
    state: 'Maharashtra',
    documentType: '7/12 Extract',
    status: 'VALIDATED',
    docId: 'mh-2024-01089',
    ulpin: 'MH41105610001M'
  }
];

interface TopSearchBarProps {
  onNavigate: (tab: string, docId?: string) => void;
  onOpenMobileMenu?: () => void;
  onLogout?: () => void;
}

export const TopSearchBar: React.FC<TopSearchBarProps> = ({ onNavigate, onOpenMobileMenu, onLogout }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<PlotSearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut listener: Press '/' or 'Ctrl+K' to focus plot search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === '/' && document.activeElement !== inputRef.current) ||
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')
      ) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Perform search across plot numbers, survey numbers, khasra, owner, and district
  useEffect(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      setResults(MASTER_PLOT_REGISTRY.slice(0, 5));
      setSelectedIndex(-1);
      return;
    }

    const filtered = MASTER_PLOT_REGISTRY.filter((item) => {
      return (
        item.surveyNo.toLowerCase().includes(trimmed) ||
        (item.plotNo && item.plotNo.toLowerCase().includes(trimmed)) ||
        (item.khasraNo && item.khasraNo.toLowerCase().includes(trimmed)) ||
        item.ownerName.toLowerCase().includes(trimmed) ||
        item.village.toLowerCase().includes(trimmed) ||
        item.district.toLowerCase().includes(trimmed) ||
        item.state.toLowerCase().includes(trimmed) ||
        item.docId.toLowerCase().includes(trimmed) ||
        (item.ulpin && item.ulpin.toLowerCase().includes(trimmed))
      );
    });

    setResults(filtered);
    setSelectedIndex(-1);
  }, [query]);

  const handleSelectPlot = (plot: PlotSearchResult, destination: 'verify' | 'map' | 'documents' = 'verify') => {
    setIsOpen(false);
    if (destination === 'map') {
      onNavigate('map', plot.surveyNo);
    } else if (destination === 'documents') {
      onNavigate('documents', plot.docId);
    } else {
      // Default: open verification detail for immediate HITL audit of this plot
      onNavigate('verify-detail', plot.docId);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 < results.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = selectedIndex >= 0 ? results[selectedIndex] : results[0];
      if (target) {
        handleSelectPlot(target, 'verify');
      }
    }
  };

  return (
    <header className="sticky top-0 z-[1000] bg-[#0a1628]/95 backdrop-blur-md border-b border-[#1a335a] px-4 sm:px-6 py-3 shadow-md flex items-center justify-between gap-4">
      {/* Mobile Toggle Button */}
      {onOpenMobileMenu && (
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-lg bg-[#0e1e38] border border-[#1a335a] text-slate-300 hover:text-white"
          title="Open Menu"
        >
          <span className="text-lg">☰</span>
        </button>
      )}

      {/* Primary Global Plot Search Bar Container */}
      <div ref={containerRef} className="flex-1 max-w-4xl mx-auto relative">
        <div className="relative flex items-center">
          <div className="absolute left-3.5 text-blue-400 pointer-events-none flex items-center justify-center">
            <Search size={18} className="animate-pulse" />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search Plot / Survey No. across entire application (e.g. 123/4A, 142/2A, 134, 197, 482)..."
            className="w-full bg-[#070d18] border border-[#1a335a] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 rounded-xl pl-11 pr-28 py-2.5 text-sm text-white placeholder-slate-400 outline-none transition-all shadow-inner"
          />

          <div className="absolute right-2.5 flex items-center gap-1.5">
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
                title="Clear"
              >
                <X size={15} />
              </button>
            )}

            <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded bg-[#0e1e38] border border-[#1a335a] text-[11px] font-mono text-slate-400 pointer-events-none">
              <kbd>/</kbd>
              <span>plot search</span>
            </div>
          </div>
        </div>

        {/* Instant Search Results Dropdown */}
        {isOpen && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-[#0a1628] border border-[#1a335a] rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Header / Filter indicator */}
            <div className="px-4 py-2.5 bg-[#070d18]/80 border-b border-[#1a335a] flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <Sparkles size={13} className="text-blue-400" />
                {query ? `Search results for "${query}"` : 'Quick Jump to Notable Plots & Survey Records'}
              </span>
              <span className="text-[11px] text-slate-500">
                {results.length} plot{results.length === 1 ? '' : 's'} available
              </span>
            </div>

            {/* Results List */}
            <div className="max-h-[420px] overflow-y-auto divide-y divide-[#1a335a]/50">
              {results.length > 0 ? (
                results.map((plot, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={plot.id}
                      onClick={() => handleSelectPlot(plot, 'verify')}
                      className={`p-3.5 sm:px-4 cursor-pointer transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isSelected ? 'bg-blue-600/15 border-l-4 border-blue-500' : 'hover:bg-[#0e1e38]'
                      }`}
                    >
                      {/* Left: Plot Badge & Details */}
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600/30 to-cyan-500/20 border border-blue-500/30 flex flex-col items-center justify-center text-center flex-shrink-0">
                          <span className="text-[9px] uppercase font-bold text-blue-400 leading-none">Plot</span>
                          <span className="text-xs font-bold text-white leading-tight truncate px-1">
                            {plot.surveyNo.split('/')[0]}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-white flex items-center gap-1.5">
                              Survey No: <span className="text-cyan-300 underline underline-offset-2">{plot.surveyNo}</span>
                            </span>
                            {plot.khasraNo && (
                              <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                                {plot.khasraNo}
                              </span>
                            )}
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                plot.status === 'VALIDATED'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : plot.status === 'DISPUTED'
                                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              {plot.status === 'VALIDATED' ? '✓ Validated' : plot.status === 'DISPUTED' ? '⚠ Disputed' : '⏳ Review'}
                            </span>
                          </div>

                          <div className="text-xs text-slate-300 font-medium mt-1 flex items-center gap-2 flex-wrap">
                            <span className="text-white font-semibold">{plot.ownerName}</span>
                            <span className="text-slate-600">•</span>
                            <span>{plot.area}</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-slate-400">{plot.village}, {plot.district} ({plot.state})</span>
                          </div>

                          {plot.issueNote && (
                            <div className="mt-1 text-[11px] text-amber-400 flex items-center gap-1">
                              <AlertTriangle size={11} className="flex-shrink-0" />
                              <span className="truncate">{plot.issueNote}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Quick Action Buttons */}
                      <div className="flex items-center gap-1.5 self-end sm:self-auto flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectPlot(plot, 'verify');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1 shadow transition-colors"
                          title="Open Verification / HITL Detail"
                        >
                          <span>Audit</span>
                          <ChevronRight size={13} />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectPlot(plot, 'map');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#0e1e38] hover:bg-[#1a335a] border border-[#1a335a] text-cyan-300 hover:text-white text-xs font-medium flex items-center gap-1 transition-colors"
                          title="Locate on Bhuvan GIS Map"
                        >
                          <MapPin size={12} />
                          <span>Map</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center space-y-2">
                  <div className="text-2xl">🔍</div>
                  <div className="text-sm font-semibold text-white">No plot matching "{query}"</div>
                  <div className="text-xs text-slate-400 max-w-sm mx-auto">
                    Try searching by Survey No (e.g. 123/4A, 142/2A, 134, 197), Khasra No, or Landowner name.
                  </div>
                </div>
              )}
            </div>

            {/* Dropdown Footer Shortcuts */}
            <div className="px-4 py-2 bg-[#070d18] border-t border-[#1a335a] flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-[#0e1e38] border border-slate-700 text-slate-400 font-mono">↑↓</kbd>
                  to navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-[#0e1e38] border border-slate-700 text-slate-400 font-mono">↵</kbd>
                  to inspect
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-[#0e1e38] border border-slate-700 text-slate-400 font-mono">esc</kbd>
                  to close
                </span>
              </div>
              <span className="text-blue-400 font-medium">
                Land.Ai Plot Index
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Right side controls: live status pill & Logout */}
      <div className="flex items-center gap-2.5">
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#070d18] border border-[#1a335a] text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-300 font-medium">Bhuvan GIS</span>
          <span className="text-slate-600">•</span>
          <span className="text-emerald-400 font-semibold">Active</span>
        </div>

        {onLogout && (
          <button
            id="header-logout-button"
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0e1e38] hover:bg-rose-500/15 border border-[#1a335a] hover:border-rose-500/40 text-slate-300 hover:text-rose-400 text-xs font-medium transition-all shadow-sm group cursor-pointer"
            title="Sign Out of Land.Ai"
          >
            <LogOut size={14} className="group-hover:translate-x-0.5 transition-transform text-slate-400 group-hover:text-rose-400" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        )}
      </div>
    </header>
  );
};
