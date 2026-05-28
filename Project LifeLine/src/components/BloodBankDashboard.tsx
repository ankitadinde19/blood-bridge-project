import React, { useState } from 'react';
import { User, BloodBank, Appointment, BloodType } from '../types';
import { Warehouse, RefreshCw, AlertTriangle, Table, QrCode, CheckCircle2, Package, Inbox, TrendingUp } from 'lucide-react';

interface BloodBankDashboardProps {
  currentUser: User;
  bloodBanks: BloodBank[];
  appointments: Appointment[];
  onUpdateInventory: (data: { bloodBankId: string; bloodType: BloodType; units: number }) => Promise<void>;
  onVerifyAppointment: (apptId: string) => Promise<void>;
}

export const BloodBankDashboard: React.FC<BloodBankDashboardProps> = ({
  currentUser,
  bloodBanks,
  appointments,
  onUpdateInventory,
  onVerifyAppointment
}) => {
  const myBank = bloodBanks.find(b => b.id === 'bank_1') || bloodBanks[0];
  const [selectedType, setSelectedType] = useState<BloodType>('O-');
  const [updaterUnits, setUpdaterUnits] = useState(myBank.inventory['O-'] || 0);
  const [qrInput, setQrInput] = useState('');
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitLoading(true);
    try {
      await onUpdateInventory({
        bloodBankId: myBank.id,
        bloodType: selectedType,
        units: updaterUnits
      });
      alert(`Successfully updated ${selectedType} stock in ${myBank.name}!`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleQrCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrInput.trim()) return;
    
    // Find scheduled appointment matching scanned input value (either format)
    const match = appointments.find(a => 
      a.status === 'scheduled' && 
      (a.id === qrInput || a.qrCodeValue === qrInput)
    );

    if (!match) {
      alert("Invalid QR Check-In Node. Ensure the booking ID complies with scheduled standards.");
      return;
    }

    try {
      await onVerifyAppointment(match.id);
      alert(`QR Verified! Registered donor check-in for ${match.donorName}. 1 unit of ${match.bloodType} added to store.`);
      setQrInput('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-6 font-sans">
      {/* Top Banner Lisa Bank Portal */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4.5">
          <div className="h-12 w-12 bg-teal-600 rounded-xl flex items-center justify-center border border-teal-500 shadow-md">
            <Warehouse className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold font-heading tracking-tight">{myBank.name} Manager</h2>
            <p className="text-teal-400 text-xs font-mono uppercase tracking-wider">AUTHORIZED LOGISTICS PORTAL • WAREHOUSE MASTER</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl text-xs font-mono">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>Cold-Storage: Healthy (4.2°C)</span>
        </div>
      </div>

      {/* Grid: Live metrics tracker table & Modifier ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left column: modifier tables and modifier buttons */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-950 font-heading text-sm tracking-tight flex items-center gap-1.5">
                <Table className="h-4.5 w-4.5 text-teal-600" />
                Live Cold-Storage Vault Matrix
              </h3>
              <span className="text-slate-400 font-mono text-[10px]">REACTION SPEED: LIVE INJECT</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(myBank.inventory).map(([type, countValue]) => {
                const count = countValue as number;
                return (
                  <div 
                    key={type} 
                    className={`border rounded-xl p-4 transition-all duration-300 flex flex-col justify-between h-24 ${
                      count < 10 
                        ? 'border-rose-100 bg-rose-50/20 text-rose-800 shadow-sm' 
                        : 'border-slate-150 bg-slate-50 text-slate-800 hover:bg-slate-100/50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-xs">{type} Subgroup</span>
                      {count < 10 && (
                        <span className="bg-rose-100 border border-rose-200 text-[8px] font-bold px-1 rounded text-rose-750 font-mono">CRITICAL DRY</span>
                      )}
                    </div>
                    <strong className="text-3xl font-extrabold font-heading tracking-tight text-slate-900 block mt-2">
                      {count} <span className="text-sm font-normal text-slate-400 font-mono">Units</span>
                    </strong>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Modifier Form */}
          <form onSubmit={handleUpdate} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 max-w-xl text-left">
            <h4 className="font-mono font-bold text-[10px] text-slate-400 uppercase tracking-wider">Adjustment Regulator Block</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Target Blood</label>
                <select 
                  value={selectedType}
                  onChange={(e) => {
                    const t = e.target.value as BloodType;
                    setSelectedType(t);
                    setUpdaterUnits(myBank.inventory[t] || 0);
                  }}
                  className="w-full bg-slate-100 border border-slate-200 text-slate-805 text-xs rounded-lg p-2.5 outline-none font-sans"
                >
                  {Object.keys(myBank.inventory).map(t => (
                    <option key={t} value={t}>{t} Group</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Refreshed Stock count</label>
                <input 
                  type="number"
                  min="0"
                  max="100"
                  value={updaterUnits}
                  onChange={(e) => setUpdaterUnits(Number(e.target.value))}
                  className="w-full bg-slate-105 border border-slate-200 text-slate-805 text-xs rounded-lg p-2.5 outline-none font-sans"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitLoading}
                className="bg-teal-600 hover:bg-teal-750 text-white font-bold font-sans text-xs py-2 px-5 rounded-lg cursor-pointer transition-all active:scale-95 shadow-md flex items-center gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: isSubmitLoading ? '1s' : '0s' }} />
                Refresh Inventory Units
              </button>
            </div>
          </form>
        </div>

        {/* Right column: scanner elements & alerts lists */}
        <div className="lg:col-span-4 space-y-6">
          {/* QR scanner simulation block */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 text-left">
            <h4 className="font-bold text-slate-900 font-sans text-xs uppercase tracking-tight flex items-center gap-1.5">
              <QrCode className="h-4.5 w-4.5 text-teal-650" />
              QR check-in Scanner simulation
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              When scheduling donors present their credentials on-site, enter appointment IDs or click "Check-In" directly on the scheduled logs below to simulate an active QR check-in.
            </p>

            <form onSubmit={handleQrCheckIn} className="flex gap-2">
              <input 
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                placeholder="Paste APPT-100482 or reservation code..."
                className="flex-1 bg-slate-100 placeholder-slate-400 text-xs border border-slate-250 text-slate-800 rounded-lg p-2 outline-none font-sans"
              />
              <button
                type="submit"
                className="bg-slate-900 hover:bg-slate-950 text-white text-[11px] font-sans px-4 rounded-lg cursor-pointer font-bold select-none text-center"
              >
                Scan Code
              </button>
            </form>

            <div className="border-t border-slate-100 pt-3 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider block">Currently Scheduled Appointments ({appointments.filter(a => a.status === 'scheduled').length})</span>
              {appointments.filter(a => a.status === 'scheduled').length === 0 ? (
                <p className="text-[11px] text-slate-400 italic">No scheduled appointments pending.</p>
              ) : (
                <div className="space-y-1.5">
                  {appointments.filter(a => a.status === 'scheduled').map(appt => (
                    <div key={appt.id} className="bg-slate-50 rounded-lg p-2.5 border border-slate-150 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-800">{appt.donorName} ({appt.bloodType})</p>
                        <p className="text-[10px] text-slate-405 font-mono">{appt.date} • {appt.timeSlot}</p>
                        <span className="text-[9px] text-slate-400 font-mono select-all select-text block">QR ID: {appt.qrCodeValue}</span>
                      </div>
                      <button
                        onClick={() => {
                          onVerifyAppointment(appt.id);
                          alert(`Successfully checked-in ${appt.donorName}!`);
                        }}
                        className="bg-teal-650 hover:bg-teal-750 text-white font-bold font-sans text-[10px] py-1 px-2.5 rounded-lg shadow-sm cursor-pointer"
                      >
                        Check-In
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Expiry Alarm ledger */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3.5 text-left">
            <h4 className="font-bold text-slate-900 font-sans text-xs uppercase tracking-tight flex items-center gap-1.5 text-red-655">
              <AlertTriangle className="h-4 w-4 animate-bounce text-red-500" />
              Active Expiry Alarms List
            </h4>
            {myBank.expiryAlerts.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No approaching expiries registered. Pure inventory hygiene.</p>
            ) : (
              <div className="space-y-2">
                {myBank.expiryAlerts.map((e, index) => (
                  <div key={index} className="bg-red-50 border border-red-200/80 rounded-xl p-3 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-mono text-red-750 font-bold tracking-wide">Type {e.bloodType} Subgroup</span>
                      <p className="text-slate-650 text-[10px] font-sans pt-0.5">Deficit risk approaching under 72h.</p>
                    </div>
                    <strong className="text-right block">
                      <span className="text-red-700 text-sm font-mono block font-bold leading-none">{e.units} Units</span>
                      <span className="text-[9px] text-slate-400 font-mono">Expires: {e.daysToExpiry}d</span>
                    </strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
