import React, { useState, useEffect } from 'react';
import { User, EmergencyRequest, Appointment, BloodCamp, BloodType } from '../types';
import { Heart, Calendar, MapPin, Award, CheckCircle2, Clock, Map, AlertTriangle, MessageSquare, Info } from 'lucide-react';

interface DonorDashboardProps {
  currentUser: User;
  emergencyRequests: EmergencyRequest[];
  onRespondEmergency: (reqId: string, status: 'accepted' | 'cancelled', message?: string) => Promise<void>;
  appointments: Appointment[];
  onBookAppointment: (data: { bloodBankId: string; date: string; timeSlot: string; bloodType: BloodType }) => Promise<void>;
  camps: BloodCamp[];
  onRegisterCamp: (campId: string) => Promise<void>;
}

export const DonorDashboard: React.FC<DonorDashboardProps> = ({
  currentUser,
  emergencyRequests,
  onRespondEmergency,
  appointments,
  onBookAppointment,
  camps,
  onRegisterCamp
}) => {
  const [eligibilityDays, setEligibilityDays] = useState(0); // 0 = eligible!
  const [selectedBankId, setSelectedBankId] = useState('bank_1');
  const [apptDate, setApptDate] = useState('2026-05-28');
  const [apptTime, setApptTime] = useState('11:00 AM - 11:30 AM');
  const [responseMsg, setResponseMsg] = useState('En route to help! I will arrive in 15 mins.');
  const [activeRequestMsgId, setActiveRequestMsgId] = useState<string | null>(null);
  const [isSubmitApptLoading, setIsSubmitApptLoading] = useState(false);

  // Filter requests matching universal compatibility (O-) or direct match
  const filteredEmergencies = emergencyRequests.filter(req => req.status !== 'completed');

  const checkEligibility = () => {
    // John Doe's eligibility countdown is 0
    setEligibilityDays(0);
  };

  useEffect(() => {
    checkEligibility();
  }, [currentUser]);

  const handleBookAppt = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitApptLoading(true);
    try {
      await onBookAppointment({
        bloodBankId: selectedBankId,
        date: apptDate,
        timeSlot: apptTime,
        bloodType: 'O-' // Simulating John's rare O-
      });
      alert("Appointment reserved successfully! Present your QR Code on arrival.");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitApptLoading(false);
    }
  };

  const [activeTab, setActiveTab2] = useState<'alerts' | 'schedule' | 'history'>('alerts');

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-6 font-sans">
      {/* Top Banner Dashboard Core Overview */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Donor Banner Info */}
        <div className="col-span-1 md:col-span-8 bg-gradient-to-br from-rose-600 via-rose-700 to-rose-800 text-white p-6 rounded-2xl shadow-lg shadow-rose-950/15 space-y-4">
          <div className="flex items-center gap-4">
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name} 
              className="w-16 h-16 rounded-full border-2 border-white object-cover"
              referrerPolicy="no-referrer"
            />
            <div>
              <h2 className="text-xl md:text-2xl font-bold font-heading">Welcome Back, {currentUser.name}!</h2>
              <p className="text-rose-100 text-xs font-mono uppercase tracking-wide">Verified O-Negative Gold Medalist Donor</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 pt-2 border-t border-white/20">
            <span className="bg-white/15 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <Award className="h-3.5 w-3.5 text-yellow-300 fill-current animate-bounce" />
              O- Elite Hero
            </span>
            <span className="bg-white/15 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
              First Responder
            </span>
            <span className="bg-white/15 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <Award className="h-3.5 w-3.5 text-cyan-300" />
              Lifesaver Medal
            </span>
          </div>
        </div>

        {/* Eligibility Countdown Gauge Card */}
        <div className="col-span-1 md:col-span-4 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center space-y-3 h-full">
          <div className="p-3.5 bg-emerald-100 text-emerald-600 rounded-full border border-emerald-250 animate-pulse">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">Donation Eligibility Indicator</span>
            <h4 className="text-xl font-extrabold text-slate-900">Fully Eligible Today</h4>
            <p className="text-xs text-slate-500 font-sans leading-snug">It has been 101 days since your last donation. Help restock reserves!</p>
          </div>
        </div>
      </div>

      {/* Nav Menu */}
      <div className="flex gap-2 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab2('alerts')}
          className={`pb-3 text-xs md:text-sm font-bold transition-all border-b-2 px-3.5 cursor-pointer ${
            activeTab === 'alerts' ? 'border-rose-600 text-rose-600 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Active Emergencies ({filteredEmergencies.length})
        </button>
        <button 
          onClick={() => setActiveTab2('schedule')}
          className={`pb-3 text-xs md:text-sm font-bold transition-all border-b-2 px-3.5 cursor-pointer ${
            activeTab === 'schedule' ? 'border-rose-600 text-rose-600 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Book Clinical Slots & Camps
        </button>
      </div>

      {activeTab === 'alerts' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Active Emergency Broadcast Cards */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 font-mono tracking-wider uppercase flex items-center gap-1.5 leading-none">
              <span className="h-2 w-2 bg-rose-600 rounded-full animate-ping"></span>
              Live Priority Broadcast alerts nearby (Within 10km)
            </h3>

            {filteredEmergencies.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center space-y-2">
                <p className="text-slate-500 text-sm">No active emergency dispatches right now. Thank you for your availability!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEmergencies.map((req) => {
                  const hasResponded = req.responses?.some(res => res.donorName === currentUser.name && res.status === 'accepted');

                  return (
                    <div 
                      key={req.id} 
                      className={`border rounded-xl p-5 shadow-xs transition-all flex flex-col justify-between ${
                        req.priority === 'critical' 
                          ? 'border-rose-200 bg-rose-50/25' 
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="bg-rose-600 text-white text-[10px] font-bold font-mono uppercase px-2 py-0.5 rounded">
                            {req.bloodType} Subgroup
                          </span>
                          <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border font-semibold ${
                            req.priority === 'critical' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-slate-100 border-slate-200 text-slate-700'
                          }`}>
                            {req.priority}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">Raised {new Date(req.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>

                      <div className="my-4 space-y-1.5 text-left">
                        <h4 className="font-extrabold text-slate-900 font-sans text-base">{req.hospitalName}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed font-sans">{req.description}</p>
                        <div className="flex items-center gap-1 text-slate-500 font-mono text-[10px] pt-1">
                          <MapPin className="h-3 w-3 text-red-500" />
                          <span>Distance: 0.8 km • {req.locationName}</span>
                        </div>
                      </div>

                      {/* Submitting response controls */}
                      <div className="border-t border-slate-100 pt-4 flex flex-wrap items-center justify-between gap-3">
                        <span className="text-xs font-mono text-slate-500 font-semibold">
                          Required: <strong className="text-slate-900">{req.unitsRequired} units</strong>
                        </span>

                        {hasResponded ? (
                          <div className="flex items-center gap-2">
                            <span className="bg-emerald-100 border border-emerald-250 text-emerald-800 font-bold px-3 py-1 text-xs rounded-lg flex items-center gap-1 animate-pulse">
                              <CheckCircle2 className="h-3.5 w-3.5" /> En Route to Hospital
                            </span>
                            <button
                              onClick={() => {
                                if (confirm("Do you want to cancel this emergency deployment?")) {
                                  onRespondEmergency(req.id, 'cancelled');
                                }
                              }}
                              className="text-xs font-semibold text-red-600 hover:text-red-800 px-2.5 py-1 text-xs border border-red-200 hover:bg-neutral-100 cursor-pointer rounded-lg font-sans transition-all"
                            >
                              Cancel Deployment
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                            {activeRequestMsgId === req.id ? (
                              <div className="flex flex-col gap-2 w-full pt-2">
                                <input 
                                  value={responseMsg}
                                  onChange={(e) => setResponseMsg(e.target.value)}
                                  placeholder="Message to hospital (e.g., I'm leaving now...)"
                                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-sans"
                                />
                                <div className="flex sm:justify-end gap-1.5">
                                  <button
                                    onClick={() => onRespondEmergency(req.id, 'accepted', responseMsg).then(() => setActiveRequestMsgId(null))}
                                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold font-heading text-xs px-3.5 py-1.8 rounded-lg shadow-sm cursor-pointer transition-colors"
                                  >
                                    Confirm Acceptance
                                  </button>
                                  <button
                                    onClick={() => setActiveRequestMsgId(null)}
                                    className="bg-white hover:bg-slate-50 text-slate-700 font-sans text-xs border border-slate-200 px-2.5 py-1.5 rounded-lg cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setResponseMsg("I am O- negative and en route. I will arrive in approximately 15 minutes.");
                                  setActiveRequestMsgId(req.id);
                                }}
                                className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold font-heading text-xs py-2 px-4.5 rounded-lg cursor-pointer shadow-md shadow-rose-500/10 flex items-center gap-1.5 transition-all text-center leading-none"
                              >
                                Accept Emergency Call <Heart className="h-3.5 w-3.5 text-white" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Map Simulation Panel details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="font-bold text-slate-900 font-heading text-xs uppercase tracking-tight flex items-center gap-1">
                  <Map className="h-4.5 w-4.5 text-rose-600" />
                  Live Navigation Simulator
                </h4>
                <span className="bg-green-100 text-green-700 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase animate-pulse">GPS Tracking</span>
              </div>

              {/* CSS Built Map Mock */}
              <div className="h-56 bg-gradient-to-br from-blue-100 via-rose-50 to-emerald-50 border border-slate-150 rounded-xl relative overflow-hidden flex items-center justify-center shadow-inner">
                {/* Simulated Street Grid Lines */}
                <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:1.5rem_1.5rem]"></div>
                
                {/* Hospital Marker St. Jude */}
                <div className="absolute top-1/4 left-1/3 text-center space-y-1 animate-pulse">
                  <div className="h-7 w-7 rounded-full bg-red-650 flex items-center justify-center shadow-lg border border-white">
                    <AlertTriangle className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="bg-slate-950 text-white font-mono text-[8px] font-semibold px-1 rounded block">St. Jude Emergency</span>
                </div>

                {/* Patient John Doe center */}
                <div className="absolute top-2/3 left-1/2 text-center space-y-1">
                  <div className="h-7 w-7 rounded-full bg-slate-900 flex items-center justify-center shadow-lg border border-white">
                    <Heart className="h-3.5 w-3.5 text-red-500 fill-current animate-pulse" />
                  </div>
                  <span className="bg-red-50 text-red-800 border border-red-200 font-mono text-[8px] px-1 rounded block font-bold">John Doe (You)</span>
                </div>

                {/* Metro Blood bank center */}
                <div className="absolute top-1/2 left-3/4 text-center space-y-1">
                  <div className="h-6 w-6 rounded-full bg-teal-600 flex items-center justify-center shadow-md border border-white">
                    <MapPin className="h-3 w-3 text-white" />
                  </div>
                  <span className="bg-slate-950 text-white font-mono text-[8px] px-1 rounded block select-none">Metro Bank</span>
                </div>

                <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-xs px-2 py-1 border border-slate-200 rounded text-[9px] font-mono text-slate-500">
                  Mission District, SF Grid
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 text-slate-650 text-xs leading-relaxed space-y-1.5 border border-slate-150">
                <p className="font-semibold text-slate-900">Recommended Prep Checklist:</p>
                <ul className="list-disc pl-4 space-y-1 text-slate-500 font-sans">
                  <li>Drink an extra 16 oz of water before leaving.</li>
                  <li>Have a small, healthy low-fat meal.</li>
                  <li>Bring driving license or medical ID.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'schedule' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
          {/* Scheduling application Form */}
          <form onSubmit={handleBookAppt} className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold font-heading text-slate-950 text-base flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Calendar className="h-5 w-5 text-rose-650 animate-pulse" />
              Book Clinical Slot Reservation
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-mono text-slate-400 font-bold block mb-1">Preferred Facility Center</label>
                <select 
                  value={selectedBankId}
                  onChange={(e) => setSelectedBankId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg p-2.5 outline-rose-500 font-sans"
                >
                  <option value="bank_1">Metro Blood Center (Downtown SF)</option>
                  <option value="bank_2">Red Cross Bay Area (Geary Blvd)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-mono text-slate-400 font-bold block mb-1">Preferred Date</label>
                  <input 
                    type="date"
                    value={apptDate}
                    onChange={(e) => setApptDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg p-2 outline-rose-500 font-sans"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-mono text-slate-400 font-bold block mb-1">Time Window</label>
                  <select 
                    value={apptTime}
                    onChange={(e) => setApptTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg p-2 outline-rose-500 font-sans"
                  >
                    <option value="09:00 AM - 09:30 AM">09:00 AM - 09:30 AM</option>
                    <option value="11:00 AM - 11:30 AM">11:00 AM - 11:30 AM</option>
                    <option value="02:00 PM - 02:30 PM">02:00 PM - 02:30 PM</option>
                    <option value="04:00 PM - 04:30 PM">04:00 PM - 04:30 PM</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitApptLoading}
                  className="w-full bg-slate-900 hover:bg-slate-950 text-white font-bold font-sans text-xs py-2.5 px-4 rounded-lg cursor-pointer transition-all shadow-md active:scale-95"
                >
                  {isSubmitApptLoading ? "Locking reservation..." : "Finalize Appointment Booking ID"}
                </button>
              </div>
            </div>
          </form>

          {/* Blood drive campaigns camps registry */}
          <div className="lg:col-span-6 space-y-4">
            <h3 className="font-bold font-sans text-slate-950 text-sm tracking-tight flex items-center gap-1">Camp Community Donation Drives</h3>
            {camps.map(camp => (
              <div key={camp.id} className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 space-y-3 shadow-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-900 font-sans text-sm">{camp.title}</h4>
                    <p className="text-[10px] text-slate-500 font-mono uppercase">{camp.organizer}</p>
                  </div>
                  <span className="bg-red-50 border border-red-205 text-red-650 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                    {camp.registeredCount} / {camp.capacity} Spots Filled
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{camp.description}</p>

                <div className="flex flex-wrap items-center justify-between border-t border-slate-200/50 pt-3 gap-2">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-mono">
                    <Clock className="h-3 w-3 text-slate-400" />
                    <span>{camp.date} • {camp.time}</span>
                  </div>
                  <button
                    onClick={() => {
                      onRegisterCamp(camp.id).then(() => alert(`Successfully registered for ${camp.title}!`));
                    }}
                    className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-250 text-xs px-3.5 py-1.5 font-bold rounded-lg cursor-pointer transition-all active:scale-95"
                  >
                    Quick Check-In Registration
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
