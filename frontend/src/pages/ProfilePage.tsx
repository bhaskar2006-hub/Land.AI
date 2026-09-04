import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Shield,
  Building2,
  CheckCircle2,
  LogOut,
  ShieldCheck,
  Edit3,
  Save,
  Lock,
  UserCheck,
  Award
} from 'lucide-react';

const DEPARTMENTS = [
  'Revenue & Cadastral Administration',
  'Land Records & Survey Department',
  'Registration & Stamps Department',
  'Settlement & Survey Office',
  'District Magistrate & Revenue Collectorate'
];

const STATES = [
  { code: 'TN', name: 'Tamil Nadu' },
  { code: 'TS', name: 'Telangana' },
  { code: 'AP', name: 'Andhra Pradesh' },
  { code: 'MH', name: 'Maharashtra' },
  { code: 'RJ', name: 'Rajasthan' },
  { code: 'KA', name: 'Karnataka' },
  { code: 'UP', name: 'Uttar Pradesh' }
];

const DISTRICTS = [
  'NILGIRIS',
  'RANGAREDDY',
  'NASHIK',
  'GUNTUR',
  'VARANASI',
  'JAIPUR',
  'BHOOMI-BLR'
];

const JURISDICTIONS = [
  'Nilgiris District / Kotagiri Mandal',
  'Rangareddy District / Farooqnagar Mandal',
  'Nashik District / Niphad Taluka',
  'Guntur District / Tenali Mandal',
  'Varanasi District / Pindra Tehsil',
  'Jaipur District / Sanganer Tehsil',
  'Bengaluru Rural / Devanahalli Taluk'
];

export const ProfilePage: React.FC = () => {
  const { user, role, setRole, updateProfile, signOut } = useAuth();

  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    fullName: user.fullName,
    officerId: user.officerId,
    department: user.department || DEPARTMENTS[0],
    jurisdiction: user.jurisdiction || JURISDICTIONS[0],
    stateCode: user.stateCode || 'TN',
    districtCode: user.districtCode || 'NILGIRIS'
  });

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1a335a] pb-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <User className="text-blue-400" /> User Profile & Credentials Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your official revenue officer profile, department jurisdiction, and RBAC role permissions.
          </p>
        </div>

        {/* Role Quick Switcher */}
        <div className="flex items-center gap-2 bg-[#09152b] p-1.5 rounded-xl border border-blue-500/30">
          <span className="text-[11px] font-bold text-slate-400 px-2">Active Role:</span>
          <button
            onClick={() => setRole('officer')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              role === 'officer'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck size={12} />
            <span>Officer</span>
          </button>
          <button
            onClick={() => setRole('admin')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              role === 'admin'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award size={12} />
            <span>District Admin</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>Profile changes saved successfully to your officer account record.</span>
        </div>
      )}

      {/* Main Profile Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Left Column: User Card & Role Credentials */}
        <div className="md:col-span-1 space-y-4">
          <div className="glass-panel p-6 text-center space-y-4 border-blue-500/30 bg-gradient-to-b from-[#0a1e3f] via-[#071329] to-[#040b17] shadow-xl">
            <div className="relative w-20 h-20 mx-auto">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-400 shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 border-2 border-blue-400/50 flex items-center justify-center text-white text-2xl font-black shadow-lg">
                  {getInitials(user.fullName)}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-5 h-5 rounded-full border-2 border-[#071329] flex items-center justify-center">
                <CheckCircle2 size={12} className="text-slate-950 font-bold" />
              </div>
            </div>

            <div>
              <h2 className="text-lg font-black text-white">{user.fullName}</h2>
              <p className="text-xs text-blue-300 font-mono mt-0.5">{user.email}</p>
            </div>

            <div className="pt-2 border-t border-[#1a335a] flex justify-center gap-2 flex-wrap">
              {role === 'officer' ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1.5">
                  <Shield size={13} className="text-blue-400" /> Revenue Officer
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                  <Award size={13} className="text-amber-400" /> District Admin
                </span>
              )}

              <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                {user.stateCode || 'TN'}
              </span>
            </div>

            <div className="p-3 bg-[#040c1b] rounded-xl border border-[#142d54] text-left space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Officer ID:</span>
                <span className="font-mono text-slate-200 font-bold">{user.officerId}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Department:</span>
                <span className="text-slate-200 text-right font-semibold">{user.department}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Jurisdiction:</span>
                <span className="text-slate-200 text-right font-semibold">{user.jurisdiction}</span>
              </div>
            </div>

            <button
              onClick={signOut}
              className="w-full py-2 px-4 rounded-xl border border-rose-500/30 text-rose-300 hover:bg-rose-950/40 text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <LogOut size={14} />
              <span>Sign Out of Session</span>
            </button>
          </div>

          {/* Active Permissions Box */}
          <div className="glass-card p-4 space-y-3 border-blue-500/30">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-blue-400" /> Role Capabilities ({role.toUpperCase()})
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-300">
                <CheckCircle2 size={13} className="shrink-0 text-emerald-400" />
                <span>Multimodal Indic AI OCR & Digitization</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-300">
                <CheckCircle2 size={13} className="shrink-0 text-emerald-400" />
                <span>Cadastral Deed Cross-Verification</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-300">
                <CheckCircle2 size={13} className="shrink-0 text-emerald-400" />
                <span>GeoJSON Polygon & GIS Parcel Marking</span>
              </div>

              {role === 'admin' ? (
                <>
                  <div className="flex items-center gap-2 text-amber-300 font-semibold">
                    <Award size={13} className="shrink-0 text-amber-400" />
                    <span>System Audit Trail & Security Logs</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-300 font-semibold">
                    <Award size={13} className="shrink-0 text-amber-400" />
                    <span>National Land System Analytics & Reports</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-300 font-semibold">
                    <Award size={13} className="shrink-0 text-amber-400" />
                    <span>Officer Role & User Governance</span>
                  </div>
                </>
              ) : (
                <div className="pt-1 text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Lock size={12} className="text-slate-500" />
                  <span>Audit Logs & Admin Reports require Admin role</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Profile Editor & Details with Dropdowns */}
        <div className="md:col-span-2 space-y-4">
          <div className="glass-panel p-6 space-y-5 border-blue-500/30">
            <div className="flex items-center justify-between border-b border-[#1a335a] pb-3">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <Building2 size={16} className="text-blue-400" /> Official Department & Jurisdiction Record
              </div>

              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Edit3 size={13} />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
                >
                  Cancel
                </button>
              )}
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#040c1b] border border-[#16335c] text-white text-xs font-semibold focus:outline-none focus:border-blue-400 disabled:opacity-75"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#030814] border border-[#16335c] text-slate-400 text-xs font-mono opacity-80 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Officer Registration ID</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.officerId}
                    onChange={e => setFormData({ ...formData, officerId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#040c1b] border border-[#16335c] text-white text-xs font-mono font-semibold focus:outline-none focus:border-blue-400 disabled:opacity-75"
                  />
                </div>

                {/* Department Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Department</label>
                  <select
                    disabled={!isEditing}
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#040c1b] border border-[#16335c] text-white text-xs font-semibold focus:outline-none focus:border-blue-400 disabled:opacity-75 cursor-pointer"
                  >
                    {DEPARTMENTS.map(dept => (
                      <option key={dept} value={dept} className="bg-[#071329] text-white">
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Revenue Jurisdiction Dropdown */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Revenue Jurisdiction</label>
                <select
                  disabled={!isEditing}
                  value={formData.jurisdiction}
                  onChange={e => setFormData({ ...formData, jurisdiction: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#040c1b] border border-[#16335c] text-white text-xs font-semibold focus:outline-none focus:border-blue-400 disabled:opacity-75 cursor-pointer"
                >
                  {JURISDICTIONS.map(jur => (
                    <option key={jur} value={jur} className="bg-[#071329] text-white">
                      {jur}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* State Code Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">State Code</label>
                  <select
                    disabled={!isEditing}
                    value={formData.stateCode}
                    onChange={e => setFormData({ ...formData, stateCode: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#040c1b] border border-[#16335c] text-white text-xs font-mono font-semibold focus:outline-none focus:border-blue-400 disabled:opacity-75 cursor-pointer"
                  >
                    {STATES.map(st => (
                      <option key={st.code} value={st.code} className="bg-[#071329] text-white font-mono">
                        {st.code} - {st.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* District Code Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">District Code</label>
                  <select
                    disabled={!isEditing}
                    value={formData.districtCode}
                    onChange={e => setFormData({ ...formData, districtCode: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#040c1b] border border-[#16335c] text-white text-xs font-mono font-semibold focus:outline-none focus:border-blue-400 disabled:opacity-75 cursor-pointer"
                  >
                    {DISTRICTS.map(dist => (
                      <option key={dist} value={dist} className="bg-[#071329] text-white font-mono">
                        {dist}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {isEditing && (
                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg flex items-center gap-2"
                  >
                    <Save size={14} />
                    <span>Save Profile Updates</span>
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};
