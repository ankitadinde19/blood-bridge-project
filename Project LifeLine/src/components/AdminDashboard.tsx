import React, { useState } from 'react';
import { User, Hospital, DonorProfile, BloodCamp } from '../types';
import { ShieldCheck, Users, Activity, FileText, ClipboardList, Trash2, Plus, Calendar, Settings, Lock } from 'lucide-react';

interface AuditLogItem {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  details: string;
}

interface AdminDashboardProps {
  currentUser: User;
  hospitals: Hospital[];
  donors: (DonorProfile & { name: string; email: string; avatar?: string })[];
  camps: BloodCamp[];
  auditLogs: AuditLogItem[];
  onRegisterHospital: (data: Omit<Hospital, 'id'>) => Promise<void>;
  onRegisterCamp: (campId: string) => Promise<void>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  hospitals,
  donors,
  camps,
  auditLogs,
  onRegisterHospital,
}) => {
  const [showHospForm, setShowHospForm] = useState(false);
  const [hospName, setHospName] = useState('');
  const [hospAddress, setHospAddress] = useState('');
  const [hospPhone, setHospPhone] = useState('');
  const [hospVerified, setHospVerified] = useState(true);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  const [activeSubTab, setActiveSubTab] = useState<'users' | 'hospitals' | 'logs'>('logs');

  const handleCreateHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospName || !hospAddress) return;
    setIsSubmitLoading(true);
    try {
      await onRegisterHospital({
        name: hospName,
        address: hospAddress,
        phone: hospPhone || "+1 (555) 123-0000",
        latitude: 37.7749 + (Math.random() - 0.5) * 0.05,
        longitude: -122.4194 + (Math.random() - 0.5) * 0.05,
        verified: hospVerified
      });
      setHospName('');
      setHospAddress('');
      setHospPhone('');
      setShowHospForm(false);
      alert("New Hospital successfully added to LifeLink registry!");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-6 font-sans">
      {/* Top Banner Admin Control */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-rose-600 rounded-xl flex items-center justify-center border border-rose-500 shadow-md">
            <ShieldCheck className="h-6 w-6 text-white animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold font-heading tracking-tight">Super Admin Operations Tower</h2>
            <p className="text-rose-450 text-xs font-mono uppercase tracking-wider">GLOBAL SECURITY CONSOLE • ROOT LEVEL SECURE ACCESS</p>
          </div>
        </div>

        <button 
          onClick={() => setShowHospForm(!showHospForm)}
          className="bg-rose-600 hover:bg-rose-700 text-white font-bold font-heading text-xs px-4 py-2.5 rounded-xl cursor-pointer flex items-center gap-2 transition-all hover:scale-105 active:scale-95 text-center shrink-0 shadow-lg shadow-rose-950/20 border border-rose-500"
        >
          <Plus className="h-4 w-4" /> Onboard Verified Hospital
        </button>
      </div>

      {showHospForm && (
        <form onSubmit={handleCreateHospital} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md space-y-4 max-w-xl mx-auto text-left animate-fade-in relative">
          <div className="border-b border-slate-100 pb-2 flex items-center gap-2 text-rose-600">
            <Lock className="h-5 w-5" />
            <h3 className="font-bold font-heading text-slate-900 text-base">Onboard Hospital Registry node</h3>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Institution Name</label>
              <input 
                type="text"
                required
                value={hospName}
                onChange={(e) => setHospName(e.target.value)}
                placeholder="e.g. SF General Traumatology & Burn Clinic"
                className="w-full bg-slate-100 border border-slate-250 text-slate-800 text-xs rounded-lg p-2.5 outline-none font-sans"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Clinic Physical Location (Address)</label>
              <input 
                type="text"
                required
                value={hospAddress}
                onChange={(e) => setHospAddress(e.target.value)}
                className="w-full bg-slate-100 border border-slate-250 text-slate-800 text-xs rounded-lg p-2.5 outline-none font-sans text-left"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Contact Hotline</label>
                <input 
                  type="text"
                  value={hospPhone}
                  onChange={(e) => setHospPhone(e.target.value)}
                  className="w-full bg-slate-100 border border-slate-250 text-slate-800 text-xs rounded-lg p-2 outline-none font-sans text-left"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Verification Status</label>
                <select 
                  value={hospVerified ? 'yes' : 'no'}
                  onChange={(e) => setHospVerified(e.target.value === 'yes')}
                  className="w-full bg-slate-100 border border-slate-250 text-slate-800 text-xs rounded-lg p-2 outline-none font-sans"
                >
                  <option value="yes">VERIFIED CLEAN</option>
                  <option value="no">PENDING INSPECTION</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button 
              type="button" 
              onClick={() => setShowHospForm(false)}
              className="text-xs font-semibold text-slate-505 hover:text-slate-805 px-4 cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitLoading}
              className="bg-rose-600 hover:bg-rose-705 text-white font-bold font-heading text-xs py-2 px-5 rounded-lg cursor-pointer transition-all active:scale-95 shadow-md shadow-rose-650/10"
            >
              Onboard Hospital Entity
            </button>
          </div>
        </form>
      )}

      {/* 4 Multi-Metrics Analytics widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4 text-left">
          <div className="p-3 bg-rose-50 text-rose-605 rounded-xl border border-rose-100">
            <Users className="h-5.5 w-5.5 text-rose-600" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-mono uppercase font-semibold">Total Verified Donors</span>
            <strong className="text-xl font-extrabold font-heading block tracking-tight text-slate-900">{donors.length} Verified</strong>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4 text-left">
          <div className="p-3 bg-red-105 text-red-655 rounded-xl border border-red-100">
            <Activity className="h-5.5 w-5.5 animate-pulse text-red-650" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-mono uppercase font-semibold">Hospital Registry Nodes</span>
            <strong className="text-xl font-extrabold font-heading block tracking-tight text-slate-900">{hospitals.length} Hospitals</strong>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4 text-left">
          <div className="p-3 bg-emerald-50 text-emerald-650 rounded-xl border border-emerald-100">
            <ShieldCheck className="h-5.5 w-5.5 text-emerald-600" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-mono uppercase font-semibold">Platform Security Level</span>
            <strong className="text-xl font-extrabold font-heading block tracking-tight text-emerald-600">ISO 27001</strong>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4 text-left">
          <div className="p-3 bg-amber-50 text-amber-655 rounded-xl border border-amber-100">
            <Calendar className="h-5.5 w-5.5 text-amber-600" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-mono uppercase font-semibold">Active Blood Camps</span>
            <strong className="text-xl font-extrabold font-heading block tracking-tight text-slate-900">{camps.length} Drives</strong>
          </div>
        </div>
      </div>

      {/* Tab select console */}
      <div className="flex gap-2 border-b border-slate-205 mt-6 animate-fade-in">
        <button 
          onClick={() => setActiveSubTab('logs')}
          className={`pb-3 text-xs md:text-sm font-bold transition-all border-b-2 px-3.5 cursor-pointer ${
            activeSubTab === 'logs' ? 'border-rose-600 text-rose-600 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-805'
          }`}
        >
          Security Audit Logs Monitor ({auditLogs.length})
        </button>
        <button 
          onClick={() => setActiveSubTab('users')}
          className={`pb-3 text-xs md:text-sm font-bold transition-all border-b-2 px-3.5 cursor-pointer ${
            activeSubTab === 'users' ? 'border-rose-600 text-rose-600 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-805'
          }`}
        >
          Manage Platform Donors List
        </button>
        <button 
          onClick={() => setActiveSubTab('hospitals')}
          className={`pb-3 text-xs md:text-sm font-bold transition-all border-b-2 px-3.5 cursor-pointer ${
            activeSubTab === 'hospitals' ? 'border-rose-600 text-rose-600 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-805'
          }`}
        >
          Onboarded Hospital Registry Listing
        </button>
      </div>

      {activeSubTab === 'logs' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs animate-fade-in text-left">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <span className="font-bold text-xs text-slate-700 font-mono flex items-center gap-1.5"><FileText className="h-4.5 w-4.5 text-blue-600" /> Platform Security Tracking Trail</span>
            <span className="text-slate-400 font-mono text-[9px] uppercase">READ-ONLY ACCREDITED</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-205 font-mono text-[9px] text-slate-400 font-bold">
                  <th className="p-3">Reference ID</th>
                  <th className="p-3">User Node</th>
                  <th className="p-3">Protocol Event Action</th>
                  <th className="p-3">Time Node</th>
                  <th className="p-3">Details Summary</th>
                </tr>
              </thead>
              <tbody className="text-xs font-sans divide-y divide-slate-100">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-mono text-slate-400 font-semibold">{log.id}</td>
                    <td className="p-3 text-slate-900 font-semibold">{log.user}</td>
                    <td className="p-3">
                      <span className="bg-slate-100 font-mono font-bold text-[9px] px-2 py-0.5 rounded border border-slate-200 uppercase text-slate-700">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500 font-mono">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="p-3 text-slate-650 leading-relaxed font-sans select-all select-text">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'users' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs animate-fade-in text-left">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <span className="font-bold text-xs text-slate-700 font-mono flex items-center gap-1.5"><Users className="h-4.5 w-4.5 text-blue-600" /> Active Platform Donors Database</span>
            <span className="text-slate-400 font-mono text-[10px] uppercase">READ/WRITE RECORDS</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-205 font-mono text-[9px] text-slate-400 font-bold">
                  <th className="p-3">Donor Name</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Blood Subgroup</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-center">Eligibility Countdown</th>
                </tr>
              </thead>
              <tbody className="text-xs font-sans divide-y divide-slate-100">
                {donors.map(donor => (
                  <tr key={donor.id} className="hover:bg-slate-50/50">
                    <td className="p-3 flex items-center gap-3">
                      <img src={donor.avatar} alt={donor.name} className="h-7 w-7 rounded-full object-cover" referrerPolicy="no-referrer" />
                      <span className="font-bold text-slate-900">{donor.name}</span>
                    </td>
                    <td className="p-3 text-slate-600 font-mono">{donor.email}</td>
                    <td className="p-3">
                      <span className="bg-red-50 text-red-650 border border-red-200 text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                        {donor.bloodType} Type
                      </span>
                    </td>
                    <td className="p-3 text-slate-500 font-mono">{donor.phone}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] border font-bold uppercase font-mono ${
                        donor.isAvailable ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {donor.isAvailable ? 'Available' : 'Snoozed'}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`font-mono font-bold ${donor.eligibilityCountdown === 0 ? 'text-emerald-600 animate-pulse' : 'text-slate-600'}`}>
                        {donor.eligibilityCountdown === 0 ? "FULLY ELIGIBLE" : `${donor.eligibilityCountdown} days remaining`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'hospitals' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs animate-fade-in text-left">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <span className="font-bold text-xs text-slate-700 font-mono flex items-center gap-1.5"><ClipboardList className="h-4.5 w-4.5 text-blue-600" /> Onboarded Hospital Registry</span>
            <span className="text-slate-400 font-mono text-[10px] uppercase">VERIFIED ENTITIES</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-205 font-mono text-[9px] text-slate-400 font-bold">
                  <th className="p-3">Hospital Registry ID</th>
                  <th className="p-3">Institution Name</th>
                  <th className="p-3">Telephone Hotline</th>
                  <th className="p-3">Physical Street Address</th>
                  <th className="p-3 text-center">Access Credentials Verification</th>
                </tr>
              </thead>
              <tbody className="text-xs font-sans divide-y divide-slate-100">
                {hospitals.map(h => (
                  <tr key={h.id} className="hover:bg-slate-50/50 animate-fade-in">
                    <td className="p-3 font-mono text-slate-405 font-semibold">{h.id}</td>
                    <td className="p-3 text-slate-905 font-bold">{h.name}</td>
                    <td className="p-3 text-slate-505 font-mono">{h.phone}</td>
                    <td className="p-3 text-slate-655 font-sans leading-relaxed">{h.address}</td>
                    <td className="p-3 text-center">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded font-mono font-bold uppercase border ${
                        h.verified ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-100 border-slate-200 text-slate-550'
                      }`}>
                        {h.verified ? 'Verified Active' : 'Pending inspection'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
