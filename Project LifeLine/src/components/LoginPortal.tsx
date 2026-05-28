import React, { useState } from 'react';
import { Heart, Shield, Hospital, Warehouse, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { apiFetch } from '../api';

const fetch = apiFetch;

interface LoginPortalProps {
  onLoginSuccess: (user: any) => void;
  onShowNotification: (title: string, msg: string) => void;
}

export const LoginPortal: React.FC<LoginPortalProps> = ({ onLoginSuccess, onShowNotification }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setErrorText('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || err.message || 'Authentication error');
      }

      const responseJson = await res.json();
      const userPayload = responseJson.data?.user || responseJson.user;
      const accessToken = responseJson.data?.accessToken || responseJson.accessToken;

      if (accessToken) {
        localStorage.setItem('lifelink_token', accessToken);
      }

      const mappedUser = {
        ...userPayload,
        name: userPayload?.fullName || userPayload?.name || 'User',
        avatar: userPayload?.profileImage || userPayload?.avatar,
      };

      onLoginSuccess(mappedUser);
      onShowNotification("Welcome Back! 🚀", `Logged in successfully as ${mappedUser.name || 'User'}.`);
    } catch (err: any) {
      setErrorText(err.message || 'Verification failed. Try donor@lifelink.org');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-16 flex flex-col items-center animate-fade-in">
      <div className="w-full text-center space-y-4 mb-8">
        <div className="inline-flex h-16 w-16 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 items-center justify-center shadow-lg shadow-rose-500/20 mb-2 animate-pulse">
          <Heart className="h-9 w-9 text-white fill-current" />
        </div>
        <h2 className="text-3xl md:text-4xl font-black font-heading text-slate-900 tracking-tight leading-none text-center">
          LifeLink Portal Gate
        </h2>
        <p className="text-slate-500 text-sm md:text-base max-w-xl mx-auto font-sans leading-relaxed text-center">
          Authorized smart clinical network connecting emergency surgical rooms, regional cold-storage banks, and rapid civilian donor networks. Live session credentials authentication required.
        </p>
      </div>

      <div className="items-center">
        {/* Left pane: Credentials Email Access */}
        <div className="md:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4 items-center">
            <h3 className="font-heading font-extrabold text-slate-900 text-lg flex items-center gap-2">
              <Mail className="h-5 w-5 text-rose-500" />
              Sign In Node
            </h3>
            <p className="text-xs text-slate-500 leading-normal">
              Provide your verified administrative or donor registry email associated with LifeLink credentials.
            </p>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-4 flex-1 flex flex-col justify-center text-left">
            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 font-bold block mb-1">
                Security Email Address
              </label>
              <input 
                type="email"
                required
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. donor@lifelink.org"
                className="w-full bg-slate-50 border border-slate-200 text-slate-805 text-xs rounded-xl p-3 outline-rose-500 font-sans transition-all disabled:opacity-60"
              />
            </div>

            {errorText && (
              <p className="text-[11px] text-rose-600 bg-rose-50 border border-rose-100 p-2.5 rounded-lg font-medium leading-normal animate-shake">
                ⚠️ {errorText}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-rose-600 hover:bg-rose-705 text-white font-bold font-heading text-xs py-3 px-5 rounded-xl cursor-pointer transition-all active:scale-[0.98] shadow-md shadow-rose-600/15 flex items-center justify-center gap-2 disabled:opacity-65"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  Granting Handshake...
                </>
              ) : (
                <>
                  Access Terminal
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-[10px] text-slate-400 text-center leading-normal pt-2 border-t border-slate-100 font-mono">
            IP SECURE CONNECTION • SSL 256 BIT KEY ENABLED
          </div>
        </div>

        {/* Right pane: Authorized Sandbox Nodes List */}
        {/*<div className="md:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 flex flex-col justify-between">*/}
        {/*  <div className="space-y-2 text-left">*/}
        {/*    <h3 className="font-heading font-extrabold text-slate-900 text-lg flex items-center gap-2">*/}
        {/*      <Shield className="h-5 w-5 text-slate-700" />*/}
        {/*      Verified Accounts Directory*/}
        {/*    </h3>*/}
        {/*    <p className="text-xs text-slate-500 leading-normal">*/}
        {/*      To log in, please enter one of the registered account emails below into the Sign In field. You must press the <strong className="text-rose-605">Access Terminal</strong> button to submit.*/}
        {/*    </p>*/}
        {/*  </div>*/}

        {/*  <div className="space-y-3.5">*/}
        {/*    {[*/}
        {/*      {*/}
        {/*        title: 'Emergency Donor Profile',*/}
        {/*        email: 'donor@lifelink.org',*/}
        {/*        role: 'DONOR',*/}
        {/*        desc: 'O- Universal savior dashboard setup to book donations & accept local trauma alerts',*/}
        {/*        icon: Heart,*/}
        {/*        color: 'text-rose-600 bg-rose-50/50 border border-rose-100'*/}
        {/*      },*/}
        {/*      {*/}
        {/*        title: 'Hospital Clinical Team',*/}
        {/*        email: 'hospital@lifelink.org',*/}
        {/*        role: 'HOSPITAL',*/}
        {/*        desc: 'Raise emergency trauma dispatches & manage nearby matched blood transfers',*/}
        {/*        icon: Hospital,*/}
        {/*        color: 'text-amber-600 bg-amber-50/50 border border-amber-100'*/}
        {/*      },*/}
        {/*      {*/}
        {/*        title: 'Regional Cold-Storage Bank',*/}
        {/*        email: 'bloodbank@lifelink.org',*/}
        {/*        role: 'BLOOD_BANK',*/}
        {/*        desc: 'Cold-storage inventory status mapping, warnings levels & barcode validations',*/}
        {/*        icon: Warehouse,*/}
        {/*        color: 'text-teal-600 bg-teal-50/50 border border-teal-100'*/}
        {/*      },*/}
        {/*      {*/}
        {/*        title: 'Central Operations Supervisor',*/}
        {/*        email: 'admin@lifelink.org',*/}
        {/*        role: 'ADMIN',*/}
        {/*        desc: 'Global supervision view to verify clinics, tracking live audits & drive camps',*/}
        {/*        icon: Shield,*/}
        {/*        color: 'text-blue-600 bg-blue-50/50 border border-blue-100'*/}
        {/*      }*/}
        {/*    ].map((account) => {*/}
        {/*      const Icon = account.icon;*/}
        {/*      return (*/}
        {/*        <div */}
        {/*          key={account.email}*/}
        {/*          className="p-4 rounded-2xl border border-slate-100 bg-slate-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left hover:bg-slate-50 transition-colors"*/}
        {/*        >*/}
        {/*          <div className="space-y-1">*/}
        {/*            <div className="flex flex-wrap items-center gap-2">*/}
        {/*              <span className={`p-1.5 rounded-lg ${account.color}`}>*/}
        {/*                <Icon className="h-4 w-4" />*/}
        {/*              </span>*/}
        {/*              <h4 className="font-heading font-extrabold text-slate-800 text-xs">*/}
        {/*                {account.title}*/}
        {/*              </h4>*/}
        {/*              <span className="text-[9px] font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 uppercase tracking-wider">*/}
        {/*                {account.role}*/}
        {/*              </span>*/}
        {/*            </div>*/}
        {/*            <p className="text-[11px] text-slate-500 leading-relaxed max-w-md">*/}
        {/*              {account.desc}*/}
        {/*            </p>*/}
        {/*          </div>*/}

        {/*          <button*/}
        {/*            type="button"*/}
        {/*            onClick={() => {*/}
        {/*              setEmail(account.email);*/}
        {/*              setErrorText('');*/}
        {/*            }}*/}
        {/*            className="self-start sm:self-center bg-white hover:bg-slate-50 text-slate-700 text-[10px] font-bold font-mono px-3 py-1.5 rounded-xl border border-slate-200 cursor-pointer shadow-xs hover:scale-102 transition-all flex items-center gap-1 shrink-0"*/}
        {/*          >*/}
        {/*            Select Email*/}
        {/*          </button>*/}
        {/*        </div>*/}
        {/*      );*/}
        {/*    })}*/}
        {/*  </div>*/}

        {/*  <div className="text-[10px] text-slate-450 font-mono leading-none pt-2 text-center md:text-left">*/}
        {/*    SANDBOX COMPLIANCE DEMO CREDENTIALS REGISTRY*/}
        {/*  </div>*/}
        {/*</div>*/}
      </div>
    </div>
  );
};
