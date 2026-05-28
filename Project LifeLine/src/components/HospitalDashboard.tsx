import React, { useState } from 'react';
import { User, EmergencyRequest, BloodBank, BloodType, RequestPriority } from '../types';
import { AlertCircle, Plus, ClipboardList, CheckCircle2, UserCheck, Warehouse, MapPin, Heart, Clock, Loader2 } from 'lucide-react';

interface HospitalDashboardProps {
  currentUser: User;
  emergencyRequests: EmergencyRequest[];
  bloodBanks: BloodBank[];
  onCreateEmergencyRequest: (data: {
    bloodType: BloodType;
    unitsRequired: number;
    priority: RequestPriority;
    description: string;
    locationName: string;
    latitude: number;
    longitude: number;
  }) => Promise<void>;
  onCompleteTransfusion: (reqId: string, responseId: string) => Promise<void>;
}

export const HospitalDashboard: React.FC<HospitalDashboardProps> = ({
  currentUser,
  emergencyRequests,
  bloodBanks,
  onCreateEmergencyRequest,
  onCompleteTransfusion
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRequestType, setNewRequestType] = useState<BloodType>('O-');
  const [newUnits, setNewUnits] = useState(4);
  const [newPriority, setNewPriority] = useState<RequestPriority>('critical');
  const [newDesc, setNewDesc] = useState('');
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<'tracker' | 'banks'>('tracker');

  // Filter hospital's requests
  const myRequests = emergencyRequests; // In this sandbox model, we list all requests in the shared registry

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc.trim()) {
      alert("Provide a description outlining the trauma or medical surgical scenario.");
      return;
    }
    setIsSubmitLoading(true);
    try {
      await onCreateEmergencyRequest({
        bloodType: newRequestType,
        unitsRequired: newUnits,
        priority: newPriority,
        description: newDesc,
        locationName: "St. Jude General Hospital, San Francisco",
        latitude: 37.7556,
        longitude: -122.4047
      });
      setShowAddForm(false);
      setNewDesc('');
      alert("Emergency critical broadcast raised! Local matching donors are receiving pushed alerts.");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-6 font-sans">
      {/* Top Banner Hospital Control */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4.5">
          <div className="h-12 w-12 bg-rose-600 rounded-xl flex items-center justify-center border border-rose-500 shadow-md">
            <AlertCircle className="h-6 w-6 text-white animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold font-heading tracking-tight">Hospital Administrative Console</h2>
            <p className="text-slate-400 text-xs font-mono uppercase tracking-wider">AUTHORIZED PERSONNEL • ST. JUDE GENERAL (SF)</p>
          </div>
        </div>

        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-rose-600 hover:bg-rose-700 text-white font-bold font-heading text-xs px-4 py-2.5 rounded-xl cursor-pointer flex items-center gap-2 transition-all hover:scale-105 active:scale-95 text-center shrink-0 shadow-lg shadow-rose-950/20"
        >
          <Plus className="h-4 w-4" /> Raise Emergency Request
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md space-y-4 max-w-2xl mx-auto animate-fade-in relative">
          <h3 className="font-extrabold text-slate-900 font-heading text-base pb-2 border-b border-slate-100 flex items-center gap-1.5 text-rose-650">
            <AlertCircle className="h-5 w-5" />
            Establish Clinical Trauma Broadcast
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 font-bold block mb-1">Target Blood Group</label>
              <select 
                value={newRequestType}
                onChange={(e) => setNewRequestType(e.target.value as BloodType)}
                className="w-full bg-slate-50 border border-slate-250 text-slate-800 text-xs rounded-lg p-2.5 outline-none font-sans"
              >
                <option value="O-">O- (Universal Red Group)</option>
                <option value="O+">O+</option>
                <option value="A-">A-</option>
                <option value="A+">A+</option>
                <option value="B-">B-</option>
                <option value="B+">B+</option>
                <option value="AB-">AB-</option>
                <option value="AB+">AB+</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 font-bold block mb-1">Required Bags (Units)</label>
              <input 
                type="number"
                min="1"
                max="15"
                value={newUnits}
                onChange={(e) => setNewUnits(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-250 text-slate-800 text-xs rounded-lg p-2 outline-none font-sans"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 font-bold block mb-1">Emergency Level</label>
              <select 
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as RequestPriority)}
                className="w-full bg-slate-50 border border-slate-250 text-slate-800 text-xs rounded-lg p-2.5 outline-none font-sans"
              >
                <option value="critical">Critical (Immediate danger)</option>
                <option value="high">High (Surgical prep)</option>
                <option value="medium">Medium (Replenish reserve)</option>
                <option value="low">Low (Standard buffer)</option>
              </select>
            </div>
          </div>          <div>
            <label className="text-[10px] uppercase font-mono text-slate-400 font-bold block mb-1">Clinical Context Scenario Description</label>
            <textarea 
              rows={3}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="e.g., Surgery trauma victim in intensive care requiring rapid universal O- subtype transfusion. No current inventory in St. Jude."
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg p-2.5 outline-rose-500 font-sans"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)}
              className="text-xs font-semibold text-slate-505 hover:text-slate-800 px-4 cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitLoading}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold font-heading text-xs py-2 px-5 rounded-lg cursor-pointer flex items-center gap-1 transition-all"
            >
              {isSubmitLoading ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : "Initiate System Broadcast"}
            </button>
          </div>
        </form>
      )}

      {/* Menu Navigation buttons */}
      <div className="flex gap-2 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('tracker')}
          className={`pb-3 text-xs md:text-sm font-bold transition-all border-b-2 px-3.5 cursor-pointer ${
            activeTab === 'tracker' ? 'border-rose-600 text-rose-600 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-805'
          }`}
        >
          Urgent Requests Tracker ({myRequests.length})
        </button>
        <button 
          onClick={() => setActiveTab('banks')}
          className={`pb-3 text-xs md:text-sm font-bold transition-all border-b-2 px-3.5 cursor-pointer ${
            activeTab === 'banks' ? 'border-rose-600 text-rose-600 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-805'
          }`}
        >
          Nearby Verified Blood Banks
        </button>
      </div>

      {activeTab === 'tracker' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
          {/* List of ACTIVE raised emergency demands */}
          <div className="lg:col-span-8 space-y-4">
            {myRequests.length === 0 ? (
              <p className="text-slate-400 text-sm italic">Zero active emergency demands. High safety status.</p>
            ) : (
              myRequests.map((req) => (
                <div key={req.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                  
                  {/* Card head: status, priority, type */}
                  <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-rose-600 text-white text-[10px] font-bold font-mono uppercase px-2 py-0.5 rounded">
                        {req.bloodType} Type
                      </span>
                      <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border ${
                        req.priority === 'critical' ? 'bg-rose-50 text-rose-850 border-rose-200 font-semibold' : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {req.priority}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-400 font-mono text-[10px]">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className={`px-2 py-0.5 rounded font-mono text-[9px] uppercase font-bold border ${
                        req.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-250 animate-pulse'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                  </div>

                  {/* Body description */}
                  <div className="space-y-1.5 text-left">
                    <h4 className="font-extrabold text-slate-900 font-sans text-sm">{req.hospitalName} Emergency</h4>
                    <p className="text-slate-650 text-xs leading-relaxed font-sans">{req.description}</p>
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 text-slate-400" /> Location: {req.locationName}
                    </span>
                  </div>

                  {/* Fulfill tracking and Donor Acceptance list! */}
                  <div className="bg-slate-50 border border-slate-150 rounded-xl p-4.5 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-950 font-sans tracking-tight">Demand Pipeline status:</span>
                      <span className="text-xs font-mono font-bold text-slate-700">{req.unitsFulfilled} / {req.unitsRequired} Units Secured</span>
                    </div>

                    {/* Progress tracking gauge */}
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${req.status === 'completed' ? 'bg-emerald-500' : 'bg-rose-600 animate-pulse'}`}
                        style={{ width: `${Math.min(100, (req.unitsFulfilled / req.unitsRequired) * 100)}%` }}
                      ></div>
                    </div>

                    {/* Pending matches and matching en route list! */}
                    <div className="space-y-2">
                      <h5 className="text-[10px] uppercase font-mono text-slate-400 font-bold tracking-wider">Donor Responses Real-Time Check-In</h5>
                      {req.responses.length === 0 ? (
                        <p className="text-[11px] text-slate-505 italic">Searching nearby GPS coordinates. No donors responded yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {req.responses.map((resp) => (
                            <div key={resp.id} className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-left">
                              <div className="space-y-0.5">
                                <p className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                                  <UserCheck className="h-3.5 w-3.5 text-rose-600" />
                                  {resp.donorName}
                                  <span className="bg-rose-50 text-rose-600 border border-rose-150 font-mono text-[9px] px-1 rounded font-bold">{resp.bloodType}</span>
                                </p>
                                <p className="text-slate-650 italic text-[11px]">“{resp.message || "En-route!"}”</p>
                                <span className="text-[10px] text-slate-400 font-mono">Distance: {resp.distanceKm} km • Phone: {resp.phone}</span>
                              </div>

                              <div className="flex items-center gap-2 sm:justify-end">
                                <span className={`text-[10px] tracking-wide font-mono uppercase font-semibold px-2 py-0.5 rounded border ${
                                  resp.status === 'completed' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-amber-50 border-amber-250 text-amber-700 animate-pulse'
                                }`}>
                                  {resp.status}
                                </span>

                                {resp.status === 'accepted' && (
                                  <button
                                    onClick={() => onCompleteTransfusion(req.id, resp.id)}
                                    className="bg-emerald-600 hover:bg-emerald-750 text-white font-bold font-sans text-[10px] py-1 px-2.5 rounded-lg shadow-sm cursor-pointer transition-all"
                                  >
                                    Verify Transfusion Complete
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* St. Jude active inventory details inside sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <h4 className="font-bold text-slate-900 font-sans text-xs uppercase tracking-tight flex items-center gap-1">Available Hospital Bedding Metrics</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                Emergency trauma triage counts for St. Jude General facilities:
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-100 pb-1 mr-1">
                  <span className="text-slate-550">Active ICU Bed Reserve:</span>
                  <strong className="text-slate-900">4 / 20 Available</strong>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1 mr-1">
                  <span className="text-slate-550">Severe Incidents Active:</span>
                  <strong className="text-rose-650">3 Trauma cases</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'banks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in text-left">
          {bloodBanks.map(bank => (
            <div key={bank.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-950 font-sans text-base flex items-center gap-1.5">
                  <Warehouse className="h-5 w-5 text-teal-600" />
                  {bank.name}
                </h4>
                <p className="text-[11px] text-slate-500 font-mono uppercase font-semibold">Active Vault Registry ID: {bank.id}</p>
                <p className="text-xs text-slate-650 pb-2 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-teal-600" /> {bank.address}
                </p>
              </div>

              {/* Grid representation of blood bank units */}
              <div className="space-y-2">
                <h5 className="text-[10px] uppercase font-mono text-slate-400 font-bold tracking-wider">Live Inventory Stock metrics</h5>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(bank.inventory).map(([bType, countValue]) => {
                    const count = countValue as number;
                    return (
                      <div 
                        key={bType} 
                        className={`border rounded-xl p-2.5 text-center flex flex-col justify-between ${
                          count < 10 
                            ? 'border-rose-200 bg-rose-50/20 text-rose-800' 
                            : 'border-slate-150 bg-slate-50 text-slate-800'
                        }`}
                      >
                        <span className="font-mono font-bold text-xs">{bType}</span>
                        <strong className={`text-lg block tracking-tight ${count < 10 ? 'text-rose-600 font-extrabold' : 'text-slate-900 font-bold'}`}>
                          {count} <span className="text-[10px] font-normal leading-none font-mono">U</span>
                        </strong>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
