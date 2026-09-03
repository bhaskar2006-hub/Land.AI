import React, { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Flame,
  Sparkles,
  Database,
  Users,
  Maximize2,
  Printer,
  Tag,
  FileSpreadsheet
} from 'lucide-react';
import { api } from '../services/api';
import { GeoJSONFeatureCollection } from '../types';

interface GISMapPageProps {
  onNavigate: (tab: string, docId?: string) => void;
}

export const GISMapPage: React.FC<GISMapPageProps> = ({ onNavigate }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const geojsonLayerRef = useRef<L.GeoJSON | null>(null);
  const labelLayerGroupRef = useRef<L.LayerGroup | null>(null);

  const [activeDataset, setActiveDataset] = useState<'burgul' | '500_parcels' | 'nilgiris'>('burgul');
  const [geojsonData, setGeojsonData] = useState<GeoJSONFeatureCollection | null>(null);
  const [selectedParcel, setSelectedParcel] = useState<any | null>(null);
  const [searchSurvey, setSearchSurvey] = useState('');

  const [mapStyleMode, setMapStyleMode] = useState<'sheet' | 'sat' | 'dark'>('sheet');
  const [tileLayerRef, setTileLayerRef] = useState<L.TileLayer | null>(null);
  const [showSurveyLabels, setShowSurveyLabels] = useState(true);
  const [showWatermark, setShowWatermark] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [borderWeight, setBorderWeight] = useState<'standard' | 'heavy'>('heavy');
  const [issueFilter, setIssueFilter] = useState<'all' | 'conflicts' | 'area_mismatch' | 'owner_mismatch' | 'clean'>('all');

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Load GIS Data according to selected dataset
  const loadDataset = async (dataset: 'burgul' | '500_parcels' | 'nilgiris') => {
    setActiveDataset(dataset);
    setSelectedParcel(null);

    let data: GeoJSONFeatureCollection;

    if (dataset === 'burgul') {
      data = await api.getBurgulParcelsGeoJSON();
      showToast('🏛 Loaded Official Burgul Village Cadastral Map (Telangana LandGrid — 613 Surveys)');
    } else if (dataset === '500_parcels') {
      data = await api.get500ParcelsGeoJSON();
      showToast('Loaded 500-Parcel Benchmark Dataset (Anantapur, AP)');
    } else {
      data = await api.getCadastralGeoJSON('NILGIRIS');
      showToast('Loaded Kotagiri Nilgiris Field Survey Dataset');
    }

    setGeojsonData(data);

    if (mapInstanceRef.current) {
      renderGeoJSON(mapInstanceRef.current, data, showHeatmap, issueFilter, mapStyleMode, showSurveyLabels);
      if (geojsonLayerRef.current) {
        mapInstanceRef.current.fitBounds(geojsonLayerRef.current.getBounds(), { padding: [25, 25] });
      }
    }
  };

  const fitVillageBounds = () => {
    if (mapInstanceRef.current && geojsonLayerRef.current) {
      mapInstanceRef.current.fitBounds(geojsonLayerRef.current.getBounds(), { padding: [25, 25] });
      showToast('📍 Centered on Full Village Cadastral Boundary');
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Initialize map centered at Burgul
    const map = L.map(mapContainerRef.current, {
      center: [17.0650, 78.1870],
      zoom: 15,
      zoomControl: true
    });

    mapInstanceRef.current = map;

    // Default to Cadastral Sheet mode (clean paper, no satellite noise)
    if (mapContainerRef.current) {
      mapContainerRef.current.classList.add('cadastral-paper-container');
    }

    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      void e;
    });

    // Default load Burgul Village Cadastral Map (Telangana LandGrid)
    loadDataset('burgul');

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update base tiles when mapStyleMode changes
  const applyMapStyle = (mode: 'sheet' | 'sat' | 'dark') => {
    setMapStyleMode(mode);
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // Remove existing tile layer if any
    if (tileLayerRef) {
      map.removeLayer(tileLayerRef);
      setTileLayerRef(null);
    }

    if (mapContainerRef.current) {
      if (mode === 'sheet') {
        mapContainerRef.current.classList.add('cadastral-paper-container');
      } else {
        mapContainerRef.current.classList.remove('cadastral-paper-container');
      }
    }

    if (mode === 'sat') {
      const satTiles = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: '&copy; ISRO Bhuvan, Esri Satellite, Digital India Land Records',
          maxZoom: 19
        }
      ).addTo(map);
      setTileLayerRef(satTiles);
      showToast('🛰 Satellite Hybrid Imagery Activated');
    } else if (mode === 'dark') {
      const darkTiles = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; OpenStreetMap, CartoDB',
          maxZoom: 19
        }
      ).addTo(map);
      setTileLayerRef(darkTiles);
      showToast('🌙 Dark Cadastral Base Layer Activated');
    } else {
      showToast('📜 Official Village Cadastral Sheet (Telangana LandGrid Naksha)');
    }

    if (geojsonData) {
      renderGeoJSON(map, geojsonData, showHeatmap, issueFilter, mode, showSurveyLabels);
    }
  };

  // Render GeoJSON with Authentic Cadastral Styling & Survey Labels
  const renderGeoJSON = (
    map: L.Map,
    data: GeoJSONFeatureCollection,
    heatmapActive: boolean,
    filter: string,
    styleMode: 'sheet' | 'sat' | 'dark',
    labelsEnabled: boolean
  ) => {
    if (geojsonLayerRef.current) {
      map.removeLayer(geojsonLayerRef.current);
    }
    if (labelLayerGroupRef.current) {
      map.removeLayer(labelLayerGroupRef.current);
    }

    const filteredFeatures = data.features.filter((f: any) => {
      const p = f.properties;
      const status = p.verification_status || (p.is_disputed ? 'Conflict' : 'Verified');
      const issue = (p.validation_issue || '').toLowerCase();

      if (filter === 'conflicts') return status === 'Conflict' || status === 'CONFLICT';
      if (filter === 'area_mismatch') return issue.includes('area mismatch');
      if (filter === 'owner_mismatch') return issue.includes('owner mismatch');
      if (filter === 'clean') return status === 'Verified' || status === 'VERIFIED';
      return true;
    });

    const layer = L.geoJSON(
      { ...data, features: filteredFeatures } as any,
      {
        style: (feature) => {
          const props = feature?.properties || {};
          const status = props.verification_status || (props.is_disputed ? 'Conflict' : 'Verified');
          const issue = (props.validation_issue || '').toLowerCase();
          const isSelected = selectedParcel && selectedParcel.parcel_id === props.parcel_id;

          if (isSelected) {
            return {
              color: '#020617', // Dark black accent outline
              weight: 4.5,
              fillColor: '#60a5fa', // Bright electric blue
              fillOpacity: 0.85
            };
          }

          const currentBorderWeight = borderWeight === 'heavy' ? 2.8 : 2.0;

          if (styleMode === 'sheet') {
            // Authentic Village Cadastral Sheet: Dark Crisp Borders + Light Transparent Heatmap Fills
            if (heatmapActive && issue.includes('area mismatch')) {
              return {
                color: '#991b1b', // Deep dark crimson border
                weight: currentBorderWeight + 0.5,
                fillColor: '#ef4444', // Light transparent red
                fillOpacity: 0.32,
                dashArray: '4, 3'
              };
            } else if (heatmapActive && (issue.includes('owner mismatch') || status === 'Conflict' || status === 'CONFLICT')) {
              return {
                color: '#9a3412', // Deep dark burnt-orange border
                weight: currentBorderWeight + 0.5,
                fillColor: '#f97316', // Light transparent orange
                fillOpacity: 0.32
              };
            } else if (heatmapActive && (status === 'Review Required' || status === 'REVIEW_REQUIRED')) {
              return {
                color: '#854d0e', // Deep dark amber border
                weight: currentBorderWeight + 0.3,
                fillColor: '#eab308', // Light transparent yellow
                fillOpacity: 0.28
              };
            } else {
              // Classic Cadastral Parcel: DEEP DARK CRISP BORDER + LIGHT TRANSLUCENT PARCHMENT
              return {
                color: '#0f172a', // Razor-sharp deep dark slate/black border
                weight: currentBorderWeight,
                fillColor: heatmapActive ? '#22c55e' : '#faf5e3', // Subtle light mint if heatmap active, else warm ivory
                fillOpacity: heatmapActive ? 0.15 : 0.45
              };
            }
          } else {
            // Satellite / Dark mode: Dark Borders + Light Transparent Heatmap Fills (Satellite Visible Below)
            if (heatmapActive) {
              if (issue.includes('area mismatch')) {
                return { color: '#000000', weight: 3.0, fillColor: '#ef4444', fillOpacity: 0.38, dashArray: '4, 4' };
              } else if (issue.includes('owner mismatch') || status === 'Conflict' || status === 'CONFLICT') {
                return { color: '#000000', weight: 3.0, fillColor: '#f97316', fillOpacity: 0.38 };
              } else if (status === 'Review Required' || status === 'REVIEW_REQUIRED') {
                return { color: '#000000', weight: 2.6, fillColor: '#facc15', fillOpacity: 0.32 };
              } else {
                return { color: '#000000', weight: 2.2, fillColor: '#22c55e', fillOpacity: 0.22 };
              }
            }
            return { color: '#020617', weight: 2.4, fillColor: '#38bdf8', fillOpacity: 0.30 };
          }
        },
        onEachFeature: (feature, l) => {
          const p = feature.properties;
          l.on('click', () => {
            setSelectedParcel(p);
          });

          const issueBadge = p.validation_issue
            ? `<div style="color:#dc2626;font-weight:bold;margin-top:2px;">⚠️ ${p.validation_issue}</div>`
            : `<div style="color:#15803d;font-weight:bold;margin-top:2px;">🟢 Validated Clean Title</div>`;

          l.bindTooltip(
            `<div style="font-family:sans-serif;font-size:11px;">
              <strong>Survey #${p.survey_no || p.survey_display}</strong> (${p.parcel_id})<br/>
              <strong>Owner:</strong> ${p.owner_name}<br/>
              <strong>Area:</strong> ${p.area_acres ? p.area_acres + ' Acres' : (p.plot_area_raw || p.area_hectares + ' Ha')}<br/>
              <strong>Village:</strong> ${p.village || 'Burgul'}, ${p.mandal || 'Farooqnagar'}
              ${issueBadge}
            </div>`,
            { className: 'leaflet-tooltip-dark', sticky: true }
          );
        }
      }
    ).addTo(map);

    geojsonLayerRef.current = layer;

    // Render Centered Survey Numbers on every single polygon (like sample-map-burgul.pdf)
    if (labelsEnabled) {
      const labelGroup = L.layerGroup();

      filteredFeatures.forEach((f: any) => {
        const p = f.properties;
        const surveyNo = p.survey_no || p.survey_display;
        if (!surveyNo) return;

        let lat = p.centroid_lat;
        let lon = p.centroid_lon;

        // Fallback centroid from geometry if missing
        if (!lat || !lon) {
          if (f.geometry && f.geometry.coordinates && f.geometry.coordinates[0]) {
            const ring = f.geometry.coordinates[0];
            let sumLat = 0;
            let sumLon = 0;
            ring.forEach((c: [number, number]) => {
              sumLon += c[0];
              sumLat += c[1];
            });
            lon = sumLon / ring.length;
            lat = sumLat / ring.length;
          }
        }

        if (!lat || !lon) return;

        const issue = (p.validation_issue || '').toLowerCase();
        const isAreaMismatch = issue.includes('area mismatch');
        const isOwnerMismatch = issue.includes('owner mismatch');

        const labelColor = isAreaMismatch ? '#7f1d1d' : isOwnerMismatch ? '#7c2d12' : '#020617';

        const labelIcon = L.divIcon({
          className: 'cadastral-survey-label',
          html: `<span style="font-size:11px; font-weight:800; color:${labelColor}; text-shadow:0 0 3px #ffffff, 0 0 4px #ffffff, 0 0 1px #ffffff; line-height:1; font-family:ui-sans-serif, system-ui, -apple-system, sans-serif; letter-spacing:-0.2px;">${surveyNo}</span>`,
          iconSize: [32, 14],
          iconAnchor: [16, 7]
        });

        L.marker([lat, lon], { icon: labelIcon, interactive: false }).addTo(labelGroup);
      });

      labelGroup.addTo(map);
      labelLayerGroupRef.current = labelGroup;
    }
  };

  const handleFilterChange = (filter: 'all' | 'conflicts' | 'area_mismatch' | 'owner_mismatch' | 'clean') => {
    setIssueFilter(filter);
    if (mapInstanceRef.current && geojsonData) {
      renderGeoJSON(mapInstanceRef.current, geojsonData, showHeatmap, filter, mapStyleMode, showSurveyLabels);
    }
  };

  const toggleLabels = () => {
    const next = !showSurveyLabels;
    setShowSurveyLabels(next);
    if (mapInstanceRef.current && geojsonData) {
      renderGeoJSON(mapInstanceRef.current, geojsonData, showHeatmap, issueFilter, mapStyleMode, next);
    }
    showToast(next ? '🏷 Survey Number Labels Visible on All Parcels' : 'Labels Hidden');
  };

  const toggleHeatmap = () => {
    const next = !showHeatmap;
    setShowHeatmap(next);
    if (mapInstanceRef.current && geojsonData) {
      renderGeoJSON(mapInstanceRef.current, geojsonData, next, issueFilter, mapStyleMode, showSurveyLabels);
    }
    showToast(next ? '🔥 Discrepancy & Verification Heatmap Activated' : 'Standard Cadastral Boundary View');
  };

  const toggleBorderWeight = () => {
    const next = borderWeight === 'heavy' ? 'standard' : 'heavy';
    setBorderWeight(next);
    if (mapInstanceRef.current && geojsonData) {
      renderGeoJSON(mapInstanceRef.current, geojsonData, showHeatmap, issueFilter, mapStyleMode, showSurveyLabels);
    }
    showToast(next === 'heavy' ? '⬛ Dark Bold Borders (2.8px) Activated' : 'Dark Standard Borders (2.0px) Activated');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!geojsonData || !searchSurvey.trim()) return;

    const term = searchSurvey.trim().toLowerCase();
    const matched = geojsonData.features.find((f) => {
      const p = f.properties;
      const sNo = (p.survey_no || p.survey_display || '').toString().toLowerCase();
      const pId = (p.parcel_id || '').toLowerCase();
      const owner = (p.owner_name || '').toLowerCase();
      return sNo === term || sNo.includes(term) || pId.includes(term) || owner.includes(term);
    });

    if (matched && mapInstanceRef.current) {
      setSelectedParcel(matched.properties);
      const coords = matched.geometry.coordinates[0][0];
      mapInstanceRef.current.flyTo([coords[1], coords[0]], 17);
      showToast(`Located Parcel: Survey #${matched.properties.survey_no || matched.properties.survey_display}`);
    } else {
      showToast(`No parcel found matching "${searchSurvey}"`);
    }
  };

  const selectParcelItem = (properties: any) => {
    setSelectedParcel(properties);
    if (!mapInstanceRef.current || !geojsonData) return;

    const matched = geojsonData.features.find(
      (f) => f.properties.parcel_id === properties.parcel_id
    );
    if (matched && matched.geometry.coordinates) {
      const coords = matched.geometry.coordinates[0][0];
      mapInstanceRef.current.flyTo([coords[1], coords[0]], 17);
    }
  };

  // Filtered parcels count
  const displayedParcels = (geojsonData?.features || []).filter((f: any) => {
    const p = f.properties;
    const status = p.verification_status || (p.is_disputed ? 'Conflict' : 'Verified');
    const issue = (p.validation_issue || '').toLowerCase();

    if (issueFilter === 'conflicts') return status === 'Conflict' || status === 'CONFLICT';
    if (issueFilter === 'area_mismatch') return issue.includes('area mismatch');
    if (issueFilter === 'owner_mismatch') return issue.includes('owner mismatch');
    if (issueFilter === 'clean') return status === 'Verified' || status === 'VERIFIED';
    return true;
  });

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-[#0F1E38] border border-blue-500 text-white text-xs px-4 py-2 rounded-lg shadow-2xl animate-fade-in flex items-center gap-2">
          <Sparkles size={14} className="text-blue-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Header with Dataset Selector & Status */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-[#0a1628] p-4 rounded-xl border border-[#1a335a] shadow-lg">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
              🗺 Village Cadastral Map & Cross-Verification Registry
            </h1>
            <span className="badge badge-green text-[10px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              TELANGANA LANDGRID ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Official village revenue naksha / cadastral survey with real-time deed cross-verification and polygon boundary audit.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Dataset Switcher */}
          <div className="flex items-center bg-[#070d18] border border-[#1a335a] rounded-lg p-1 text-xs">
            <Database size={13} className="text-emerald-400 mx-1.5" />
            <select
              value={activeDataset}
              onChange={(e) => loadDataset(e.target.value as any)}
              className="bg-transparent text-slate-200 text-xs font-semibold outline-none pr-2 cursor-pointer"
            >
              <option value="burgul">🏛 Burgul Village (Rangareddy, Telangana — 613 Surveys)</option>
              <option value="500_parcels">500-Parcel Benchmark (Anantapur, AP)</option>
              <option value="nilgiris">Kotagiri Cadastral Sheet (Nilgiris, TN)</option>
            </select>
          </div>

          {/* Style Mode Switcher */}
          <div className="flex items-center bg-[#070d18] border border-[#1a335a] rounded-lg p-1 text-xs">
            <button
              onClick={() => applyMapStyle('sheet')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                mapStyleMode === 'sheet' ? 'bg-emerald-700 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Official Village Cadastral Naksha (Burgul PDF Style)"
            >
              Cadastral Sheet
            </button>
            <button
              onClick={() => applyMapStyle('sat')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                mapStyleMode === 'sat' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="ISRO Bhuvan / Satellite Imagery"
            >
              Satellite
            </button>
            <button
              onClick={() => applyMapStyle('dark')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                mapStyleMode === 'dark' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Dark
            </button>
          </div>

          {/* Survey Numbers Toggle */}
          <button
            onClick={toggleLabels}
            className={`btn btn-sm text-xs flex items-center gap-1.5 ${
              showSurveyLabels ? 'bg-blue-600 text-white border-blue-500' : 'btn-secondary text-slate-300'
            }`}
            title="Display survey numbers directly on all parcels"
          >
            <Tag size={13} />
            <span>{showSurveyLabels ? 'Labels ON' : 'Labels OFF'}</span>
          </button>

          {/* Heatmap Toggle */}
          <button
            onClick={toggleHeatmap}
            className={`btn btn-sm text-xs flex items-center gap-1.5 ${
              showHeatmap ? 'bg-amber-600 text-white border-amber-500' : 'btn-secondary text-slate-300'
            }`}
          >
            <Flame size={13} />
            <span>{showHeatmap ? 'Audit Heatmap' : 'Plain View'}</span>
          </button>

          {/* Dark Border Toggle */}
          <button
            onClick={toggleBorderWeight}
            className={`btn btn-sm text-xs flex items-center gap-1.5 ${
              borderWeight === 'heavy' ? 'bg-slate-900 text-white border-slate-700 font-bold shadow' : 'btn-secondary text-slate-300'
            }`}
            title="Toggle between Heavy Dark Borders (2.8px) and Standard Dark Borders (2.0px)"
          >
            <ShieldCheck size={13} />
            <span>{borderWeight === 'heavy' ? 'Borders: Dark Heavy' : 'Borders: Dark'}</span>
          </button>

          {/* Fit Village Boundary Button */}
          <button
            onClick={fitVillageBounds}
            className="btn btn-secondary btn-sm text-xs flex items-center gap-1.5"
            title="Center and fit entire village boundary into view"
          >
            <Maximize2 size={13} />
            <span>Fit Village</span>
          </button>

          {/* Print / Export Button */}
          <button
            onClick={() => window.print()}
            className="btn btn-secondary btn-sm text-xs flex items-center gap-1.5"
            title="Print or Export Village Cadastral Map"
          >
            <Printer size={13} />
            <span>Print Map</span>
          </button>
        </div>
      </div>

      {/* Metrics Summary Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        <div className="glass-card p-2.5 flex items-center justify-between border-blue-500/30">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">Total Surveys</div>
            <div className="text-base font-bold text-white">
              {activeDataset === 'burgul' ? '613 Surveys' : activeDataset === '500_parcels' ? '500 Parcels' : '3 Parcels'}
            </div>
          </div>
          <FileSpreadsheet size={18} className="text-blue-400 opacity-70" />
        </div>

        <div className="glass-card p-2.5 flex items-center justify-between border-emerald-500/40">
          <div>
            <div className="text-[10px] text-emerald-400 uppercase font-bold">Auto-Verified</div>
            <div className="text-base font-bold text-emerald-300">
              {activeDataset === 'burgul' ? '538 (87.8%)' : '344 (68.8%)'}
            </div>
          </div>
          <CheckCircle2 size={18} className="text-emerald-400" />
        </div>

        <div className="glass-card p-2.5 flex items-center justify-between border-amber-500/40">
          <div>
            <div className="text-[10px] text-amber-400 uppercase font-bold">Review Required</div>
            <div className="text-base font-bold text-amber-300">
              {activeDataset === 'burgul' ? '45 Surveys' : '106 Parcels'}
            </div>
          </div>
          <AlertTriangle size={18} className="text-amber-400" />
        </div>

        <div className="glass-card p-2.5 flex items-center justify-between border-rose-500/40">
          <div>
            <div className="text-[10px] text-rose-400 uppercase font-bold">Area Mismatches</div>
            <div className="text-base font-bold text-rose-300">
              {activeDataset === 'burgul' ? '15 Parcels (>1%)' : '18 Parcels (>1%)'}
            </div>
          </div>
          <Flame size={18} className="text-rose-400" />
        </div>

        <div className="glass-card p-2.5 flex items-center justify-between border-purple-500/40 col-span-2 sm:col-span-1">
          <div>
            <div className="text-[10px] text-purple-400 uppercase font-bold">Owner Mismatches</div>
            <div className="text-base font-bold text-purple-300">
              {activeDataset === 'burgul' ? '15 Parcels' : '19 Parcels'}
            </div>
          </div>
          <Users size={18} className="text-purple-400" />
        </div>
      </div>

      {/* Main Grid: Sidebar (Parcels, Search, Filter) + Authentic Cadastral Map Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[700px]">
        {/* Left Sidebar */}
        <div className="lg:col-span-4 glass-panel flex flex-col overflow-hidden">
          {/* Search Header */}
          <div className="p-3.5 border-b border-[#1a335a] bg-[#070d18]/60">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Cadastral Survey Search & Filter
            </div>
            <form onSubmit={handleSearch} className="flex gap-1.5">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchSurvey}
                  onChange={(e) => setSearchSurvey(e.target.value)}
                  placeholder="Search Survey # (e.g. 134, 197, 348, 412), Owner…"
                  className="form-input text-xs pl-8 w-full bg-[#050b14]"
                />
              </div>
              <button type="submit" className="btn btn-primary btn-sm px-3 text-xs">
                Go
              </button>
            </form>

            {/* Filter Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2 border-t border-[#1a335a]/60">
              <button
                onClick={() => handleFilterChange('all')}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                  issueFilter === 'all'
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-[#0e1e38] text-slate-400 hover:text-white'
                }`}
              >
                All ({geojsonData?.features.length || 0})
              </button>
              <button
                onClick={() => handleFilterChange('conflicts')}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                  issueFilter === 'conflicts'
                    ? 'bg-rose-600 text-white shadow'
                    : 'bg-rose-950/40 text-rose-300 border border-rose-800/60'
                }`}
              >
                Conflicts ({activeDataset === 'burgul' ? 30 : 50})
              </button>
              <button
                onClick={() => handleFilterChange('area_mismatch')}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                  issueFilter === 'area_mismatch'
                    ? 'bg-rose-600 text-white shadow'
                    : 'bg-rose-950/40 text-rose-300 border border-rose-800/60'
                }`}
              >
                Area Diff &gt; 1% ({activeDataset === 'burgul' ? 15 : 18})
              </button>
              <button
                onClick={() => handleFilterChange('owner_mismatch')}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                  issueFilter === 'owner_mismatch'
                    ? 'bg-orange-600 text-white shadow'
                    : 'bg-orange-950/40 text-orange-300 border border-orange-800/60'
                }`}
              >
                Owner Diff ({activeDataset === 'burgul' ? 15 : 19})
              </button>
              <button
                onClick={() => handleFilterChange('clean')}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                  issueFilter === 'clean'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/60'
                }`}
              >
                Clean ({activeDataset === 'burgul' ? 538 : 344})
              </button>
            </div>
          </div>

          {/* List of Parcels */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#1a335a]/50 max-h-[560px]">
            {displayedParcels.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No cadastral parcels match the selected filter.
              </div>
            ) : (
              displayedParcels.slice(0, 100).map((f: any) => {
                const props = f.properties;
                const isSelected = selectedParcel && selectedParcel.parcel_id === props.parcel_id;
                const status = (props.verification_status || 'VERIFIED').toUpperCase();
                const issue = props.validation_issue || '';
                const isConflict = status === 'CONFLICT' || issue.length > 0;
                const isAreaMismatch = issue.toLowerCase().includes('area mismatch');
                const isOwnerMismatch = issue.toLowerCase().includes('owner mismatch');

                return (
                  <div
                    key={props.parcel_id}
                    onClick={() => selectParcelItem(props)}
                    className={`p-3 transition-all cursor-pointer hover:bg-[#14284b] ${
                      isSelected
                        ? 'bg-blue-600/20 border-l-4 border-l-blue-500 shadow-sm'
                        : isConflict
                        ? 'border-l-4 border-l-rose-500/70'
                        : 'border-l-4 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-blue-400 font-mono">
                          Survey #{props.survey_no || props.survey_display}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ({props.parcel_id})
                        </span>
                      </div>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          isAreaMismatch
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                            : isOwnerMismatch
                            ? 'bg-orange-950/80 text-orange-300 border border-orange-800'
                            : isConflict
                            ? 'bg-rose-950/70 text-rose-300 border border-rose-800'
                            : 'bg-emerald-950/70 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {isAreaMismatch ? 'AREA DIFF' : isOwnerMismatch ? 'OWNER DIFF' : status}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-slate-200 pl-1 mt-1">
                      {props.owner_name}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 pl-1">
                      <span>Area: <strong className="text-slate-300">{props.area_acres} Acres</strong></span>
                      <span>{props.village || 'Burgul'}</span>
                    </div>

                    {issue && (
                      <div className="mt-1.5 text-[10px] text-rose-300 flex items-center gap-1 bg-rose-950/40 p-1 rounded border border-rose-800/40">
                        <AlertTriangle size={11} className="text-rose-400 flex-shrink-0" />
                        <span className="truncate">{issue}</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Map Canvas Styled Exactly like sample-map-burgul.pdf */}
        <div className="lg:col-span-8 flex flex-col rounded-xl overflow-hidden border border-[#1a335a] shadow-2xl relative bg-[#fdfbf7]">
          {/* Authentic Green Header Banner (Matches sample-map-burgul.pdf) */}
          <div className="bg-[#1e5927] text-white p-3 px-5 border-b border-[#16451e] flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-md z-[400] relative">
            <div>
              <div className="text-sm md:text-base font-black tracking-wider uppercase font-sans text-emerald-50">
                {activeDataset === 'burgul'
                  ? 'TELANGANA LANDGRID'
                  : activeDataset === '500_parcels'
                  ? 'ANDHRA PRADESH REVENUE MAP (DILRMP)'
                  : 'TAMIL NADU CADASTRAL SURVEY (PATTA)'}
              </div>
              <div className="text-xs text-emerald-100 font-medium tracking-wide mt-0.5">
                {activeDataset === 'burgul'
                  ? 'District: Rangareddy | Mandal: Farooqnagar | Village: Burgul'
                  : activeDataset === '500_parcels'
                  ? 'District: Anantapur | Mandal: Example Mandal | Village: Example Village'
                  : 'District: Nilgiris | Taluk: Udhagamandalam | Village: Kotagiri'}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2 sm:mt-0 text-[11px]">
              <span className="bg-emerald-900/80 text-emerald-200 px-2 py-0.5 rounded border border-emerald-700/60 font-mono font-bold">
                {activeDataset === 'burgul' ? '613 Surveys' : '500 Surveys'}
              </span>
              <button
                onClick={() => setShowWatermark(!showWatermark)}
                className="bg-emerald-800/60 hover:bg-emerald-800 text-emerald-100 px-2 py-0.5 rounded border border-emerald-600/40 transition-all"
                title="Toggle Sample Watermark"
              >
                {showWatermark ? 'Watermark ON' : 'Watermark OFF'}
              </button>
            </div>
          </div>

          {/* North Arrow / Compass Rose (Top-Right inside map frame, as in sample-map-burgul.pdf) */}
          <div className="absolute top-16 right-4 z-[400] bg-white/95 p-1.5 rounded-full shadow-lg border border-slate-300 flex flex-col items-center justify-center w-11 h-11 pointer-events-none">
            <div className="text-[10px] font-black text-slate-900 leading-none mb-0.5">N</div>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-slate-800">
              <polygon points="12,2 17,21 12,17 7,21" fill="#1e5927" stroke="#14401c" strokeWidth="1.5" />
            </svg>
          </div>

          {/* Subtle Watermark across map (as in sample-map-burgul.pdf) */}
          {showWatermark && (
            <div className="absolute inset-0 z-[350] pointer-events-none flex items-center justify-center overflow-hidden">
              <div className="transform -rotate-[32deg] text-red-600/[0.09] font-black text-5xl md:text-7xl tracking-widest uppercase select-none font-serif">
                SAMPLE • TELANGANA LANDGRID
              </div>
            </div>
          )}

          {/* The Interactive Leaflet Map Container */}
          <div className="relative flex-1 w-full min-h-[580px]">
            <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
          </div>

          {/* Official Disclaimer & Metadata Footer (Matches sample-map-burgul.pdf) */}
          <div className="border-t border-amber-500/50 bg-[#fffbeb] p-2.5 px-4 flex flex-col md:flex-row items-start md:items-center justify-between text-[11px] gap-2 z-[400] relative">
            <div>
              <span className="font-bold text-amber-900 uppercase tracking-wide text-[10px] block">
                DISCLAIMER - FOR REFERENCE ONLY
              </span>
              <p className="text-slate-600 text-[10px] mt-0.5 max-w-3xl leading-snug">
                This village survey map is generated from Telangana LandGrid / ILRDVS for reference purposes only. It must NOT be used for legal, judicial, revenue, or official proceedings. For the official certified village map, contact your local MRO (Mandal Revenue Officer).
              </p>
            </div>
            <div className="text-left md:text-right shrink-0 text-[10px] text-slate-600">
              <div className="font-bold text-slate-800">
                Total Surveys: {geojsonData?.features.length || 613}
              </div>
              <div>Generated by Telangana LandGrid | Dt 07/12/26</div>
            </div>
          </div>

          {/* Floating Side-by-Side Cross-Verification Drawer */}
          {selectedParcel && (
            <div className="absolute top-16 right-4 z-[450] w-84 sm:w-96 glass-panel p-4 bg-[#0a1628]/95 border-2 border-blue-500 shadow-2xl animate-fade-in text-xs space-y-3 rounded-xl max-h-[85%] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[#1a335a] pb-2">
                <div className="flex items-center gap-2">
                  <span className="badge badge-saffron text-[10px]">
                    SURVEY #{selectedParcel.survey_no || selectedParcel.survey_display}
                  </span>
                  <span className="text-[11px] font-mono text-cyan-400 font-bold">
                    {selectedParcel.parcel_id}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedParcel(null)}
                  className="text-slate-400 hover:text-white text-sm px-1"
                >
                  ✕
                </button>
              </div>

              {/* Side-by-Side Comparison: Document OCR vs Authoritative GIS */}
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Cross-System Verification Audit
                </div>

                <div className="grid grid-cols-2 gap-2 bg-[#050b14] p-2.5 rounded-lg border border-[#1a335a]">
                  {/* Left: Document OCR */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-blue-400 flex items-center gap-1">
                      <span>📄 Extracted Deed</span>
                    </div>
                    <div className="text-[11px] font-semibold text-slate-200 truncate">
                      {selectedParcel.ocr_owner || selectedParcel.owner_name}
                    </div>
                    <div className="text-xs font-mono font-bold text-white">
                      {selectedParcel.ocr_area_acres ? `${selectedParcel.ocr_area_acres} Ac` : `${selectedParcel.area_acres} Ac`}
                    </div>
                  </div>

                  {/* Right: Authoritative GIS Cadastre */}
                  <div className="space-y-1 border-l border-[#1a335a] pl-2">
                    <div className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                      <span>🗺 GIS Cadastre</span>
                    </div>
                    <div className="text-[11px] font-semibold text-slate-200 truncate">
                      {selectedParcel.owner_name}
                    </div>
                    <div className="text-xs font-mono font-bold text-white">
                      {selectedParcel.area_acres} Ac
                    </div>
                  </div>
                </div>

                {/* Mathematical Area Check */}
                {selectedParcel.ocr_area_acres && selectedParcel.area_acres && (
                  <div className="flex items-center justify-between text-[11px] px-2 py-1 bg-[#070d18] rounded border border-[#1a335a]">
                    <span className="text-slate-400">Area Tolerance Check:</span>
                    <span
                      className={`font-mono font-bold ${
                        Math.abs(Number(selectedParcel.ocr_area_acres) - Number(selectedParcel.area_acres)) / Number(selectedParcel.area_acres) > 0.01
                          ? 'text-rose-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {Math.abs(Number(selectedParcel.ocr_area_acres) - Number(selectedParcel.area_acres)) / Number(selectedParcel.area_acres) > 0.01
                        ? `FAILED (${(Math.abs(Number(selectedParcel.ocr_area_acres) - Number(selectedParcel.area_acres)) / Number(selectedParcel.area_acres) * 100).toFixed(1)}% diff > 1.0%)`
                        : 'PASSED (≤ 1.0% diff)'}
                    </span>
                  </div>
                )}

                {/* Discrepancy & Validation Issue Banner */}
                {selectedParcel.validation_issue ? (
                  <div className="p-2 rounded bg-rose-950/50 border border-rose-500/70 text-rose-300 text-[11px] flex items-center gap-1.5">
                    <AlertTriangle size={14} className="text-rose-400 flex-shrink-0" />
                    <span>
                      <strong>Audit Flag:</strong> {selectedParcel.validation_issue}
                    </span>
                  </div>
                ) : (
                  <div className="p-1.5 rounded bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-[10px] flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-400" />
                    <span>Deed OCR text matches physical cadastral boundary.</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-1 flex gap-2">
                <button
                  onClick={() => onNavigate('verify-detail', selectedParcel.document_id || selectedParcel.parcel_id || 'DOC-BRG-0134')}
                  className="btn btn-primary btn-sm flex-1 text-xs flex items-center justify-center gap-1"
                >
                  <ExternalLink size={12} /> Launch HITL Workbench
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
