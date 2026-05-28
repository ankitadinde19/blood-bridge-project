import React, {useEffect, useRef, useState} from 'react';
import {
  Appointment,
  BloodBank,
  BloodCamp,
  BloodType,
  DonorProfile,
  EmergencyRequest,
  Hospital,
  RequestPriority,
  SystemNotification,
  User
} from './types';
import {LoginPortal} from './components/LoginPortal';
import {PublicPages} from './components/PublicPages';
import {DonorDashboard} from './components/DonorDashboard';
import {HospitalDashboard} from './components/HospitalDashboard';
import {BloodBankDashboard} from './components/BloodBankDashboard';
import {AdminDashboard} from './components/AdminDashboard';
import {ChatbotSentinel} from './components/ChatbotSentinel';
import {ForecastIntel} from './components/ForecastIntel';
import {Heart, RefreshCw, Sparkles} from 'lucide-react';
import {apiFetch} from './api';

interface AuditLogItem {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  details: string;
}

const fetch = apiFetch;

export default function App() {
  const refreshingRef = useRef(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [emergencyRequests, setEmergencyRequests] = useState<EmergencyRequest[]>([]);
  const [bloodBanks, setBloodBanks] = useState<BloodBank[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [camps, setCamps] = useState<BloodCamp[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [donors, setDonors] = useState<(DonorProfile & { name: string; email: string; avatar?: string })[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);


  // Navigation tabs
  const [navigationTab, setNavigationTab] = useState<'public' | 'dashboard' | 'analytics'>('dashboard');
  
  // Registration Dialog simulation
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regBlood, setRegBlood] = useState<BloodType>('O-');
  const [regPhone, setRegPhone] = useState('');
  const [regLocation, setRegLocation] = useState('');

  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing'>('idle');

  // ==========================================
  // STATE SYNCING & FETCHERS
  // ==========================================

  const refreshState = async (silent = false) => {

    // Prevent overlapping requests
    if (refreshingRef.current) {
      return;
    }

    refreshingRef.current = true;

    if (!silent) {
      setLoading(true);
    }

    setSyncStatus('syncing');

    try {

      // =========================
      // AUTH CHECK
      // =========================

      const token = localStorage.getItem('lifelink_token');

      if (token) {

        const meRes = await fetch('/api/auth/me');

        if (meRes.status === 401) {

          localStorage.removeItem('lifelink_token');
          setCurrentUser(null);

          refreshingRef.current = false;
          return;
        }

        if (meRes.ok) {

          const meData = await meRes.json();

          const verifiedUser =
              meData.success
                  ? meData.data?.user || meData.data
                  : meData;

          // Normalize frontend user object
          const mappedUser = {

            ...verifiedUser,

            // Keep compatibility
            name:
                verifiedUser?.fullName ||
                verifiedUser?.name ||
                '',

            avatar:
                verifiedUser?.profileImage ||
                verifiedUser?.avatar ||
                '',

            // Standard fields
            fullName:
                verifiedUser?.fullName ||
                verifiedUser?.name ||
                '',

            profileImage:
                verifiedUser?.profileImage ||
                verifiedUser?.avatar ||
                '',

          };

          setCurrentUser(mappedUser);
        }

      }

      // =========================
      // PARALLEL REQUESTS
      // =========================

// =========================
// PUBLIC APIs
// =========================

      const publicRequests = await Promise.allSettled([
        fetch('/api/emergency-requests'),
        fetch('/api/inventory'),
        fetch('/api/camps'),
        fetch('/api/hospitals')
      ]);

      const [
        erRes,
        bbRes,
        campRes,
        hospRes
      ] = publicRequests;


// =========================
// PROTECTED APIs
// =========================

      let apptRes: any = null;
      let logRes: any = null;
      let notifRes: any = null;
      let donorRes: any = null;

      if (token) {
        [
          apptRes,
          logRes,
          notifRes,
          donorRes
        ] = await Promise.allSettled([
          fetch('/api/appointments'),
          fetch('/api/audit-logs'),
          fetch('/api/notifications'),
          fetch('/api/donors')
        ]);
      }

      // =========================
      // HANDLE RESPONSES SAFELY
      // =========================

      // Emergency Requests
      if (erRes.status === 'fulfilled' && erRes.value.ok) {
        const data = await erRes.value.json();
        setEmergencyRequests(data.success ? data.data : data);
      }

      // Inventory
      if (bbRes.status === 'fulfilled' && bbRes.value.ok) {
        const data = await bbRes.value.json();
        setBloodBanks(data.success ? data.data : data);
      }

      // Appointments
      if (
          apptRes &&
          apptRes.status === 'fulfilled' &&
          apptRes.value.ok
      ) {
        const data = await apptRes.value.json();
        setAppointments(data.success ? data.data : data);
      }

      // Camps
      if (campRes && campRes.status === 'fulfilled' && campRes.value.ok) {
        const data = await campRes.value.json();
        setCamps(data.success ? data.data : data);
      }

      // Audit Logs
      if (logRes && logRes.status === 'fulfilled' && logRes.value.ok) {
        const data = await logRes.value.json();
        setAuditLogs(data.success ? data.data : data);
      }

      // Notifications
      if (notifRes && notifRes.status === 'fulfilled' && notifRes.value.ok) {
        const data = await notifRes.value.json();
        setNotifications(data.success ? data.data : data);
      }

      // Donors
      if (donorRes && donorRes.status === 'fulfilled' && donorRes.value.ok) {
        const data = await donorRes.value.json();
        setDonors(data.success ? data.data : data);
      }

      // Hospitals
      if (hospRes && hospRes.status === 'fulfilled' && hospRes.value.ok) {
        const data = await hospRes.value.json();
        setHospitals(data.success ? data.data : data);
      }

    } catch (err) {

      console.error('Critical syncing block failed:', err);

    } finally {

      refreshingRef.current = false;

      if (!silent) {
        setLoading(false);
      }

      setTimeout(() => {
        setSyncStatus('idle');
      }, 500);
    }
  };

  useEffect(() => {
    refreshState();
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        refreshState(true);
      }
    }, 30000);

    return () => {
      clearInterval(interval);
    };

  }, []);

  // ==========================================
  // EVENT TRIGGER CONTROLLERS
  // ==========================================

  const handleRoleSwitch = async (userId: string) => {
    try {
      const res = await fetch('/api/auth/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.data?.user || data.user);
        // Instant refreshing metrics
        await refreshState(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleNewDonorRegister = async (
      e: React.FormEvent
  ) => {

    e.preventDefault();

    if (!regName || !regEmail) {

      alert('Please enter name and email.');

      return;
    }

    try {

      const res = await fetch('/api/auth/register', {

        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({

          // Match backend fields
          fullName: regName,

          email: regEmail,

          // Required password
          password: 'LifeLink@123',

          role: 'DONOR',

          bloodGroup: regBlood,

          phone: regPhone,

          address:
              regLocation || 'San Francisco, CA',

        }),

      });

      // Parse error safely
      const data = await res.json();

      if (!res.ok) {

        throw new Error(
            data?.message || 'Registration failed'
        );
      }

      // Extract response safely
      const userPayload =
          data?.data?.user || null;

      const accessToken =
          data?.data?.accessToken || null;

      // Save token
      if (accessToken) {

        localStorage.setItem(
            'lifelink_token',
            accessToken
        );
      }

      // Map frontend user model
      const mappedUser = {

        ...userPayload,

        name:
            userPayload?.fullName ||
            regName,

        avatar:
            userPayload?.profileImage ||
            '',

      };

      // Update state
      setCurrentUser(mappedUser);

      // Close modal
      setShowRegisterModal(false);

      // Navigate dashboard
      setNavigationTab('dashboard');

      // DO NOT immediately refresh all APIs
      // await refreshState(false);

      // Optional delayed refresh
      setTimeout(() => {
        refreshState(true);
      }, 1000);

      alert(
          `Welcome to LifeLink, ${regName}!`
      );

    } catch (err: any) {

      console.error(
          'Registration Error:',
          err
      );

      alert(
          err?.message ||
          'Registration failed'
      );
    }
  };

  const handleCreateEmergencyRequest = async (
      data: {
        bloodType: BloodType;
        unitsRequired: number;
        priority: RequestPriority;
        description: string;
        locationName: string;
        latitude: number;
        longitude: number;
      }
  ) => {

    try {

      const token =
          localStorage.getItem('lifelink_token');

      if (!token) {

        alert('Please login first.');

        return;
      }

      const res = await fetch(
          '/api/emergency/create',
          {
            method: 'POST',

            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },

            body: JSON.stringify({

              bloodGroup: data.bloodType,

              unitsRequired: data.unitsRequired,

              urgencyLevel: data.priority,

              description: data.description,

              locationName: data.locationName,

              latitude: data.latitude,

              longitude: data.longitude,

            }),
          }
      );

      const responseData =
          await res.json();

      if (!res.ok) {

        console.error(
            'Emergency Create Error:',
            responseData
        );

        throw new Error(
            responseData?.message ||
            'Failed to create emergency request'
        );
      }

      await refreshState(true);

      alert(
          'Emergency request created successfully.'
      );

    } catch (error: any) {

      console.error(error);

      alert(
          error?.message ||
          'Failed to create emergency demand.'
      );
    }
  };

  const handleRespondEmergency = async (reqId: string, status: 'accepted' | 'cancelled', message?: string) => {
    const res = await fetch(`/api/emergency-requests/${reqId}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, message })
    });
    if (!res.ok) throw new Error("Failed to respond to emergency alert.");
    await refreshState(true);
  };

  const handleCompleteTransfusion = async (reqId: string, responseId: string) => {
    const res = await fetch(`/api/emergency-requests/${reqId}/complete-response`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ responseId })
    });
    if (!res.ok) throw new Error("Failed to submit transfusion completion.");
    await refreshState(true);
  };

  const handleUpdateInventory = async (data: { bloodBankId: string; bloodType: BloodType; units: number }) => {
    const res = await fetch('/api/inventory/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to modify warehouse unit levels");
    await refreshState(true);
  };

  const handleBookAppointment = async (data: { bloodBankId: string; date: string; timeSlot: string; bloodType: BloodType }) => {
    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to lock clinical reservation.");
    await refreshState(true);
  };

  const handleVerifyAppointmentInScanner = async (apptId: string) => {
    const res = await fetch(`/api/appointments/${apptId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' })
    });
    if (!res.ok) throw new Error("Failed to run scan verification pipeline");
    await refreshState(true);
  };

  const handleRegisterCampCheckIn = async (campId: string) => {
    const res = await fetch(`/api/camps/${campId}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error("Failed to register camp spot.");
    await refreshState(true);
  };

  const handleOnboardHospitalAdmin = async (data: Omit<Hospital, 'id'>) => {
    const res = await fetch('/api/hospitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to onboard hospital node.");
    await refreshState(true);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error(err);
    } finally {
      localStorage.removeItem('lifelink_token');
      setCurrentUser(null);
      setNavigationTab('dashboard');
    }
  };

  // Find if there is an active high/critical priority request raised
  const activeCriticalAlert = emergencyRequests.find(r => r.status === 'pending' && r.priority === 'critical');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans selection:bg-red-500 selection:text-white">
      


      {/* Global Trauma Critical Alert Broadcast Banner */}
      {activeCriticalAlert && currentUser?.role === 'DONOR' && (
        <div className="bg-rose-600 text-white py-3.5 px-4 shadow-md border-b border-rose-750 animate-pulse">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="bg-white text-rose-700 text-[10px] font-black uppercase px-2.5 py-0.5 rounded font-mono tracking-wide">CRITICAL DISPATCH</span>
              <p className="text-xs md:text-sm font-sans font-bold leading-normal select-text pl-1">
                🚨 RED ALERT: Urgently matching O-Negative donors needed at <strong className="underline decoration-wavy decoration-rose-350">{activeCriticalAlert.hospitalName}</strong> nearby!
              </p>
            </div>
            <button 
              onClick={() => { setNavigationTab('dashboard'); }}
              className="bg-white hover:bg-rose-50 text-rose-600 text-xs font-black font-heading py-1.5 px-3.5 rounded-lg shadow-sm cursor-pointer shrink-0 transition-transform active:scale-[0.98]"
            >
              Respond Instant
            </button>
          </div>
        </div>
      )}

      {/* Navigation and Title Bar */}
      <nav className="bg-white border-b border-slate-200 py-4 px-4 shadow-xs sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setNavigationTab('public')}>
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center shadow-md shadow-rose-500/20">
                <Heart className="h-5 w-5 text-white fill-current animate-pulse" />
              </div>
              <h1 className="font-heading font-black text-slate-900 tracking-tight text-xl leading-none">LifeLink</h1>
            </div>

            {/* Nav anchors */}
            <div className="hidden md:flex gap-1.5 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setNavigationTab('public')}
                className={`px-4.5 py-2 rounded-lg text-xs font-bold font-heading cursor-pointer transition-all ${
                  navigationTab === 'public' ? 'bg-white text-rose-650 shadow-xs font-black' : 'text-slate-500 hover:text-slate-805'
                }`}
              >
                Public Resources Guide
              </button>
              <button
                onClick={() => setNavigationTab('dashboard')}
                className={`px-4.5 py-2 rounded-lg text-xs font-bold font-heading cursor-pointer transition-all flex items-center gap-1.5 ${
                  navigationTab === 'dashboard' ? 'bg-white text-rose-650 shadow-xs font-black' : 'text-slate-505 hover:text-slate-805'
                }`}
              >
                My Safe Console
                <span className="h-2 w-2 bg-rose-600 rounded-full animate-ping"></span>
              </button>
              <button
                onClick={() => setNavigationTab('analytics')}
                className={`px-4.5 py-2 rounded-lg text-xs font-bold font-heading cursor-pointer transition-all flex items-center gap-1.5 ${
                  navigationTab === 'analytics' ? 'bg-white text-rose-650 shadow-xs font-black' : 'text-slate-505 hover:text-slate-805'
                }`}
              >
                <Sparkles className="h-3 w-3 text-amber-500 fill-current animate-bounce" />
                AI Logistics Forecasts
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Syncing status */}
            <span className="text-[10px] font-mono text-slate-400 uppercase hidden sm:flex items-center gap-1.5 border border-slate-200 px-2.5 py-1 rounded bg-slate-50/50">
              <RefreshCw className={`h-2.5 w-2.5 ${syncStatus === 'syncing' ? 'animate-spin text-rose-500' : ''}`} />
              {syncStatus === 'syncing' ? 'Sync' : 'Cloud Secure'}
            </span>

            {/* Quick CTAs */}
            <button 
              onClick={() => setShowRegisterModal(true)}
              className="bg-rose-600 hover:bg-rose-705 text-white font-bold font-heading text-xs py-2 px-4 rounded-xl cursor-pointer hover:scale-[1.01] active:scale-95 shadow-md shadow-rose-600/15 transition-all text-center leading-none"
            >
              Sign Up as Donor
            </button>

            {currentUser ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name} 
                  className="w-8 h-8 rounded-xl object-cover border border-slate-200"
                  referrerPolicy="no-referrer"
                />
                <div className="text-left hidden lg:block leading-none">
                  <p className="text-slate-800 text-[11px] font-extrabold tracking-tight">{currentUser.name}</p>
                  <p className="text-rose-500 font-mono text-[9px] font-bold uppercase tracking-wider">{currentUser.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-[11px] font-bold text-slate-500 hover:text-rose-605 border border-slate-200 hover:border-rose-200 bg-slate-50 hover:bg-rose-50/10 px-3 py-1.5 rounded-lg transition-all cursor-pointer font-sans"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <button 
                onClick={() => { setNavigationTab('dashboard'); }}
                className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-bold font-heading text-xs py-2 px-4 rounded-xl cursor-pointer hover:scale-[1.01] active:scale-95 transition-all text-center"
              >
                Access Portal
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Container Core */}
      <main className="flex-1 bg-slate-50/50">
        {loading ? (
          <div className="py-24 text-center space-y-3.5 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-450 font-mono tracking-widest uppercase">Securing LifeLink clinical logs...</p>
          </div>
        ) : (
          <div className="animate-fade-in">
            {navigationTab === 'public' && (
              <PublicPages 
                onRegisterDonorCTA={() => setShowRegisterModal(true)} 
                onLoginCTA={() => setNavigationTab('dashboard')} 
                isLoggedIn={!!currentUser} 
              />
            )}

            {navigationTab === 'analytics' && (
              currentUser ? (
                <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
                  <ForecastIntel />
                </div>
              ) : (
                <LoginPortal 
                  onLoginSuccess={(u) => {
                    setCurrentUser(u);
                    setNavigationTab('analytics');
                  }}
                  onShowNotification={(title, msg) => {
                    console.log(title, msg);
                  }}
                />
              )
            )}

            {navigationTab === 'dashboard' && (
              currentUser ? (
                <div className="animate-fade-in">
                  {currentUser.role === 'DONOR' && (
                    <DonorDashboard 
                      currentUser={currentUser}
                      emergencyRequests={emergencyRequests}
                      onRespondEmergency={handleRespondEmergency}
                      appointments={appointments}
                      onBookAppointment={handleBookAppointment}
                      camps={camps}
                      onRegisterCamp={handleRegisterCampCheckIn}
                    />
                  )}

                  {currentUser.role === 'HOSPITAL' && (
                    <HospitalDashboard 
                      currentUser={currentUser}
                      emergencyRequests={emergencyRequests}
                      bloodBanks={bloodBanks}
                      onCreateEmergencyRequest={handleCreateEmergencyRequest}
                      onCompleteTransfusion={handleCompleteTransfusion}
                    />
                  )}

                  {currentUser.role === 'BLOOD_BANK' && (
                    <BloodBankDashboard 
                      currentUser={currentUser}
                      bloodBanks={bloodBanks}
                      appointments={appointments}
                      onUpdateInventory={handleUpdateInventory}
                      onVerifyAppointment={handleVerifyAppointmentInScanner}
                    />
                  )}

                  {currentUser.role === 'ADMIN' && (
                    <AdminDashboard 
                      currentUser={currentUser}
                      hospitals={hospitals}
                      donors={donors}
                      camps={camps}
                      auditLogs={auditLogs}
                      onRegisterHospital={handleOnboardHospitalAdmin}
                      onRegisterCamp={handleRegisterCampCheckIn}
                    />
                  )}
                </div>
              ) : (
                <LoginPortal 
                  onLoginSuccess={(u) => {
                    setCurrentUser(u);
                    setNavigationTab('dashboard');
                  }}
                  onShowNotification={(title, msg) => {
                    console.log(title, msg);
                  }}
                />
              )
            )}
          </div>
        )}
      </main>

      {/* Footer Branding details */}
      <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800 font-sans mt-12 pb-24">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-rose-600 flex items-center justify-center">
                <Heart className="h-3 w-3 text-white fill-current animate-pulse" />
              </div>
              <h4 className="font-heading font-extrabold text-white text-sm">LifeLink Smart System</h4>
            </div>
            <p className="text-xs leading-relaxed max-w-sm">
              Connecting medical centers, local storage banks, and heroic donors in real time to secure critical blood subgroups during emergent surgical triages.
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <h5 className="font-bold text-white text-xs uppercase tracking-wider font-mono">Simulation Parameters</h5>
            <p><strong>System Time</strong>: 2026-05-27 (Simulated)</p>
            <p><strong>Universal Subgroups</strong>: O-Negative prioritized</p>
            <p><strong>Clinical Rest Gaps</strong>: WHO compliant 90-day rest periods validated</p>
          </div>

          <div className="space-y-2 text-xs text-left">
            <h5 className="font-bold text-white text-[11px] uppercase tracking-wider font-mono">Platform Integrity Metrics</h5>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 bg-emerald-400 rounded-full animate-ping"></span>
              <span>All Node Connections Healthy (200 OK)</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-normal">
              LifeLink Sentinel operates context-aware model predictions with HIPAA, GDPR mock standards tracking.
            </p>
          </div>
        </div>
      </footer>

      {/* Shared Register Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs font-sans animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl relative text-left">
            <div className="border-b border-slate-100 pb-2.5 flex items-center gap-2 text-rose-600 mb-4">
              <Heart className="h-5 w-5 fill-current animate-pulse" />
              <h3 className="font-heading font-extrabold text-slate-900 text-base">Register LifeLink Donor profile</h3>
            </div>

            <form onSubmit={handleNewDonorRegister} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-mono text-slate-400 font-bold block mb-1">Full Legal Name</label>
                <input 
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg p-2 outfit outline-rose-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-mono text-slate-400 font-bold block mb-1">Email Node Address</label>
                  <input 
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg p-2 outline-rose-500 font-sans"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-mono text-slate-400 font-bold block mb-1">Blood Group type</label>
                  <select 
                    value={regBlood}
                    onChange={(e) => setRegBlood(e.target.value as BloodType)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg p-2 outline-rose-500 font-sans"
                  >
                    <option value="O-">O- (Rare savior)</option>
                    <option value="O+">O+</option>
                    <option value="A-">A-</option>
                    <option value="A+">A+</option>
                    <option value="B-">B-</option>
                    <option value="B+">B+</option>
                    <option value="AB-">AB-</option>
                    <option value="AB+">AB+</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-mono text-slate-400 font-bold block mb-1">Contact Telephone</label>
                  <input 
                    type="text"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+1 (555) 019-9231"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg p-2 outline-rose-500 font-sans"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-mono text-slate-400 font-bold block mb-1">General Location</label>
                  <input 
                    type="text"
                    value={regLocation}
                    onChange={(e) => setRegLocation(e.target.value)}
                    placeholder="Castro, SF"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg p-2 outline-rose-500 font-sans"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowRegisterModal(false)}
                  className="text-xs font-semibold text-slate-505 hover:text-slate-800 px-4 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold font-heading text-xs py-2 px-5 rounded-lg cursor-pointer transition-all active:scale-95 shadow-md shadow-rose-600/15"
                >
                  Confirm Donor Registry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating AI Chat Sentinel Helper */}
      <ChatbotSentinel />
    </div>
  );
}
