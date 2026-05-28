import React from 'react';
import { User, UserRole } from '../types';
import { Shield, Hospital, Heart, Warehouse } from 'lucide-react';

interface RoleSwitcherProps {
  currentUser: User;
  onRoleSwitch: (userId: string) => void;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ currentUser, onRoleSwitch }) => {
  const accounts = [
    { id: 'donor_1', label: 'John (Donor)', role: 'DONOR', icon: Heart, desc: 'O- Donor, book drives', color: 'text-rose-500 bg-rose-50' },
    { id: 'hospital_1', label: 'Sarah (Hospital)', role: 'HOSPITAL', icon: Hospital, desc: 'Emergency broadcast', color: 'text-rose-650 bg-rose-50' },
    { id: 'blood_bank_1', label: 'Lisa (Blood Bank)', role: 'BLOOD_BANK', icon: Warehouse, desc: 'Manage stock & alerts', color: 'text-teal-600 bg-teal-50' },
    { id: 'admin_1', label: 'Admin Terminal', role: 'ADMIN', icon: Shield, desc: 'Global platform metrics', color: 'text-blue-600 bg-blue-50' }
  ];

  return (
    <div className="bg-slate-900 text-slate-100 py-3.5 px-4 shadow-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-rose-600 flex items-center justify-center animate-pulse shadow-md shadow-rose-900/30">
            <Heart className="h-5 w-5 text-white fill-current" />
          </div>
          <div>
            <span className="font-heading font-extrabold tracking-tight text-white text-lg lg:text-xl">LifeLink</span>
            <span className="text-rose-500 text-[10px] font-bold uppercase tracking-wider block bg-rose-950/40 px-1.5 py-0.5 rounded leading-none border border-rose-900/40 mt-0.5">Systems Pro</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-mono hidden lg:inline mr-2">Simulate Access Role:</span>
          {accounts.map((acc) => {
            const Icon = acc.icon;
            const isActive = currentUser.id === acc.id;
            return (
              <button
                key={acc.id}
                onClick={() => onRoleSwitch(acc.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200 ${
                  isActive 
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/30 ring-2 ring-rose-400 scale-[1.02]' 
                    : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700/50'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white font-bold' : 'text-slate-400'}`} />
                <div className="text-left font-sans">
                  <p className="leading-tight">{acc.label}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 border-l border-slate-800 pl-4 hidden md:flex">
          <img 
            src={currentUser.avatar} 
            alt={currentUser.name} 
            className="w-8 h-8 rounded-full border border-slate-700 object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="text-left">
            <p className="text-xs font-semibold text-slate-200">{currentUser.name}</p>
            <p className="text-[10px] text-slate-400 font-mono uppercase bg-slate-850 px-1 py-0.5 rounded border border-slate-800 inline-block">
              {currentUser.role}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
