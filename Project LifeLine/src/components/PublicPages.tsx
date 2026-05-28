import React, { useState } from 'react';
import { Heart, ShieldCheck, HelpCircle, Activity, Globe, Info, ClipboardList, BookOpen, AlertCircle, ArrowRight } from 'lucide-react';
import { BloodType } from '../types';

interface PublicPagesProps {
  onRegisterDonorCTA: () => void;
  onLoginCTA: () => void;
  isLoggedIn?: boolean;
}

export const PublicPages: React.FC<PublicPagesProps> = ({ onRegisterDonorCTA, onLoginCTA, isLoggedIn = false }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'guide' | 'matrix' | 'faq'>('home');
  const [screeningAnswers, setScreeningAnswers] = useState<Record<string, boolean>>({});
  const [showScreeningResult, setShowScreeningResult] = useState(false);
  const [isScreeningEligible, setIsScreeningEligible] = useState(false);

  // Health Screening Questionnaire Questions
  const screeningQuestions = [
    { id: 'age', text: 'Are you at least 17 years old (or 16 with parental consent)?' },
    { id: 'weight', text: 'Do you weigh at least 110 lbs (50 kg)?' },
    { id: 'healthy', text: 'Are you feeling healthy and well today?' },
    { id: 'cold', text: 'Are you currently free from cold, flu, or active virus symptoms?' },
    { id: 'tattoo', text: 'Have you avoided getting a tattoo or body piercing in the last 3 months?' },
    { id: 'interval', text: 'Have you avoided donating whole blood in the last 56-90 days (8-12 weeks)?' }
  ];

  const handleScreeningSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Eligible if all answers are YES
    const answeredAll = screeningQuestions.every(q => screeningAnswers[q.id] !== undefined);
    if (!answeredAll) {
      alert("Please answer all clinical health questions first.");
      return;
    }
    const eligible = screeningQuestions.every(q => screeningAnswers[q.id] === true);
    setIsScreeningEligible(eligible);
    setShowScreeningResult(true);
  };

  const handleResetScreening = () => {
    setScreeningAnswers({});
    setShowScreeningResult(false);
  };

  // Compatibility mapping matrix
  const compatibility: Record<BloodType, { give: string[]; receive: string[] }> = {
    'O-': { give: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], receive: ['O-'] },
    'O+': { give: ['O+', 'A+', 'B+', 'AB+'], receive: ['O-', 'O+'] },
    'A-': { give: ['A-', 'A+', 'AB-', 'AB+'], receive: ['O-', 'A-'] },
    'A+': { give: ['A+', 'AB+'], receive: ['O-', 'O+', 'A-', 'A+'] },
    'B-': { give: ['B-', 'B+', 'AB-', 'AB+'], receive: ['O-', 'B-'] },
    'B+': { give: ['B+', 'AB+'], receive: ['O-', 'O+', 'B-', 'B+'] },
    'AB-': { give: ['AB-', 'AB+'], receive: ['O-', 'A-', 'B-', 'AB-'] },
    'AB+': { give: ['AB+'], receive: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
      {/* Mini Visual Header Tabs */}
      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('home')}
          className={`px-5 py-3 text-xs md:text-sm font-semibold tracking-tight transition-all border-b-2 ${
            activeTab === 'home' ? 'border-red-600 text-red-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Activity className="h-4 w-4 inline mr-1.5" /> Landing Hub
        </button>
        <button 
          onClick={() => setActiveTab('guide')}
          className={`px-5 py-3 text-xs md:text-sm font-semibold tracking-tight transition-all border-b-2 ${
            activeTab === 'guide' ? 'border-red-600 text-red-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ClipboardList className="h-4 w-4 inline mr-1.5" /> Eligibility Guide & Screening
        </button>
        <button 
          onClick={() => setActiveTab('matrix')}
          className={`px-5 py-3 text-xs md:text-sm font-semibold tracking-tight transition-all border-b-2 ${
            activeTab === 'matrix' ? 'border-red-600 text-red-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="h-4 w-4 inline mr-1.5" /> Compatibility Grid
        </button>
        <button 
          onClick={() => setActiveTab('faq')}
          className={`px-5 py-3 text-xs md:text-sm font-semibold tracking-tight transition-all border-b-2 ${
            activeTab === 'faq' ? 'border-red-600 text-red-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <HelpCircle className="h-4 w-4 inline mr-1.5" /> Resources & QA
        </button>
      </div>

      {activeTab === 'home' && (
        <div className="space-y-12">
          {/* Hero Section */}
          <div className="text-center max-w-4xl mx-auto space-y-6 py-12 md:py-18">
            <span className="bg-red-50 text-red-600 border border-red-200 text-xs font-mono py-1 px-3 rounded-full uppercase tracking-wider font-bold">
              Real-time Emergency Response System
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 font-sans leading-[1.1]">
              Every Drop is a <span className="text-red-600 underline decoration-red-200">LifeLink</span> Between Emergency and Hope
            </h1>
            <p className="text-base md:text-lg text-slate-600 leading-relaxed font-sans max-w-2xl mx-auto">
              Welcome to the next generation of smart healthcare. Connecting hospitals in critical trauma demand, local blood banks, and verified matching emergency donors in absolute real time.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <button 
                onClick={onLoginCTA}
                className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold font-heading py-3.5 px-6 rounded-xl hover:scale-105 transition-all text-sm outline-none cursor-pointer flex items-center gap-1.5 shadow-lg shadow-slate-900/10"
              >
                {isLoggedIn ? "Go to System Console" : "Sign In to Workspace"} <ArrowRight className="h-4 w-4" />
              </button>
              <button 
                onClick={onRegisterDonorCTA}
                className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold font-heading py-3.5 px-6 rounded-xl hover:scale-105 transition-all text-sm outline-none cursor-pointer flex items-center gap-1.5 shadow-lg shadow-rose-600/20"
              >
                Register as New Donor
              </button>
              <button 
                onClick={() => setActiveTab('guide')}
                className="bg-white hover:bg-slate-50 text-slate-700 font-semibold font-sans py-3.5 px-6 rounded-xl border border-slate-200 transition-all text-sm cursor-pointer outline-none flex items-center gap-1"
              >
                Eligibility Validation Screening
              </button>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-6 space-y-3 shadow-xs">
              <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center border border-red-150">
                <Heart className="h-5 w-5 text-red-600 fill-current" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-sans">Verification Hub</h3>
              <p className="text-slate-600 text-xs leading-relaxed font-sans">
                Every hospital, donation clinic, and blood bank registered in LifeLink undergoes thorough validation, ensuring absolute clinical hygiene and protocol safety.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-6 space-y-3 shadow-xs">
              <div className="h-10 w-10 bg-rose-100 rounded-lg flex items-center justify-center border border-rose-150">
                <ShieldCheck className="h-5 w-5 text-rose-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-sans">Instant Match Escort</h3>
              <p className="text-slate-600 text-xs leading-relaxed font-sans">
                When hospitals raise an emergency alert, LifeLink calculating algorithms map geography vectors and immediately alert O-negative and exact criteria donors within 10 km.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-6 space-y-3 shadow-xs">
              <div className="h-10 w-10 bg-teal-100 rounded-lg flex items-center justify-center border border-teal-150">
                <Activity className="h-5 w-5 text-teal-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-sans">Real-Time Inventory</h3>
              <p className="text-slate-600 text-xs leading-relaxed font-sans">
                Blood shortages warnings update in real-time. lisa updates blood unit metrics, and the entire system immediately reacts with proactive alerts to balance supply deficits.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'guide' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Quick clinical details */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-red-50 border border-red-200/80 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-red-600" />
                <h4 className="font-extrabold text-slate-950 font-sans text-sm tracking-tight">Clinical Standards Check</h4>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-sans">
                To guarantee safe whole blood extraction, we adhere and validate donor profiles under standard Red Cross and FDA guidelines.
              </p>
              <ul className="text-xs text-slate-600 space-y-2 font-sans pl-1 list-none">
                <li className="flex items-start gap-1.5"><span className="text-red-500 font-bold">•</span> Average whole blood rest interval: 56 to 90 days.</li>
                <li className="flex items-start gap-1.5"><span className="text-red-500 font-bold">•</span> Vitals checking: Blood pressure must fall in 90/50 to 180/100 mmHg range.</li>
                <li className="flex items-start gap-1.5"><span className="text-red-500 font-bold">•</span> Hemoglobin level: &ge; 13.0 g/dL for men, &ge; 12.5 g/dL for women.</li>
              </ul>
            </div>
          </div>

          {/* Screening interactive questionnaire */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="space-y-1">
              <h3 className="font-bold font-sans text-slate-900 text-lg flex items-center gap-1.5">
                <ClipboardList className="h-5 w-5 text-red-600" />
                Am I Eligible? Screening Assessment
              </h3>
              <p className="text-xs text-slate-500 font-sans">
                This quick screening simulates doctor checklist validation. If fully qualified, proceed to schedule an appointment.
              </p>
            </div>

            {!showScreeningResult ? (
              <form onSubmit={handleScreeningSubmit} className="space-y-4 pt-2">
                <div className="space-y-3.5">
                  {screeningQuestions.map((q) => (
                    <div key={q.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/50 border border-slate-200 transition-all gap-3">
                      <span className="text-xs font-semibold text-slate-800 font-sans leading-relaxed">{q.text}</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setScreeningAnswers(prev => ({ ...prev, [q.id]: true }))}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono tracking-tight transition-all border cursor-pointer ${
                            screeningAnswers[q.id] === true 
                              ? 'bg-red-600 border-red-500 text-white' 
                              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-250'
                          }`}
                        >
                          YES
                        </button>
                        <button
                          type="button"
                          onClick={() => setScreeningAnswers(prev => ({ ...prev, [q.id]: false }))}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono tracking-tight transition-all border cursor-pointer ${
                            screeningAnswers[q.id] === false 
                              ? 'bg-slate-800 border-slate-700 text-white' 
                              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-250'
                          }`}
                        >
                          NO
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-slate-950 text-white font-semibold font-sans text-xs py-2.5 px-5 rounded-lg shadow-sm cursor-pointer hover:scale-[1.01] transition-all"
                  >
                    Submit Clinical Evaluation
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-8 space-y-4">
                {isScreeningEligible ? (
                  <div className="max-w-md mx-auto space-y-4">
                    <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200 animate-bounce">
                      <ShieldCheck className="h-7 w-7" />
                    </div>
                    <h4 className="text-xl font-bold font-sans text-slate-900 leading-tight">Verification Complete: Eligible Hero!</h4>
                    <p className="text-xs text-slate-605 leading-relaxed font-sans">
                      Congratulations, your clinical screen indicates you are fit to donate. We recommend staying hydrated, eating nutrition-rich spinach and protein, and booking a donation slots.
                    </p>
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <button 
                        onClick={onRegisterDonorCTA}
                        className="bg-red-600 hover:bg-red-700 text-white font-sans text-xs font-bold px-4 py-2.5 rounded-lg cursor-pointer"
                      >
                        Register Donor Profile
                      </button>
                      <button 
                        onClick={handleResetScreening}
                        className="text-xs font-semibold text-slate-650 hover:text-slate-900 px-3 cursor-pointer"
                      >
                        Retake Test
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-md mx-auto space-y-4">
                    <div className="h-12 w-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-250">
                      <AlertCircle className="h-6 w-6" />
                    </div>
                    <h4 className="text-lg font-bold font-sans text-slate-900 leading-tight">Deference Advised or Review Needed</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-sans">
                      Some feedback marks indicate you might not be eligible to donate whole blood today. Clinicians recommend deferrals if you are currently fighting a cold symptom, don't meet minimum weights, or recently blood donated.
                    </p>
                    <button 
                      onClick={handleResetScreening}
                      className="bg-slate-900 hover:bg-slate-950 text-white text-xs font-sans px-4 py-2.5 rounded-lg cursor-pointer"
                    >
                      Reset Evaluation Form
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'matrix' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-5 space-y-4">
            <h3 className="font-bold font-sans text-slate-900 text-lg">Compatibility Dynamics</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Red blood cells contain markers termed antigens (A, B, or Rh factor (+/-)). Correct matching is vital since mismatch transfusions trigger fatal immune system reactions.
            </p>
            <div className="bg-slate-55 shadow-xs border border-slate-200 border-l-4 border-l-red-500 rounded-xl p-4 text-[11px] leading-relaxed text-slate-650 space-y-2">
              <p className="font-semibold text-slate-800">O Negative Universal Value:</p>
              <p>Because O- negative has zero A, B, or Rh antigens on the red membrane cells, it can be transfused safely to anyone during critical multi-vehicle crashes with zero testing. Only 7% of world demographics carry this type!</p>
            </div>
          </div>

          <div className="md:col-span-7 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-rose-100 flex items-center gap-1.5">
              <Activity className="h-4.5 w-4.5 text-red-650 animate-pulse" />
              <span className="text-xs font-bold font-sans text-slate-700 tracking-tight">Standard Compatibility Ledger</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-mono text-[10px] text-slate-400">
                    <th className="p-3">Type</th>
                    <th className="p-3">Can Give Red Cells To</th>
                    <th className="p-3">Can Receive Red Cells From</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-sans">
                  {Object.entries(compatibility).map(([type, rule]) => (
                    <tr key={type} className="hover:bg-slate-50/50">
                      <td className="p-3 font-bold font-mono text-red-600 bg-red-50/30 text-center border-r border-slate-100">{type}</td>
                      <td className="p-3 font-mono text-slate-700 flex flex-wrap gap-1">
                        {rule.give.map(v => <span key={v} className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-[10px]">{v}</span>)}
                      </td>
                      <td className="p-3 font-mono text-slate-700">
                        <div className="flex flex-wrap gap-1">
                          {rule.receive.map(v => <span key={v} className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded text-[10px] font-semibold">{v}</span>)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'faq' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-1">
            <h3 className="font-bold text-slate-950 font-sans text-lg">Frequently Answered Questions</h3>
            <p className="text-xs text-slate-500 font-sans">Common operational queries regarding blood safety logistics.</p>
          </div>

          <div className="space-y-4">
            {[
              { q: "Is blood retrieval safe?", a: "Yes, absolutely. Blood donation is a completely sterile procedure. Every needle and kit is sterile, single-use, and discarded instantly. There is no risk of contracting disease from giving blood." },
              { q: "How long does a donation take?", a: "The entire clinic procedure, from check-in questionnaire to quick hemoglobin check, extraction, and post-rest snack center takes about 45 to 60 minutes. The actual blood draw is quick, averaging only 8-10 minutes." },
              { q: "How are blood units processed and stored?", a: "Extracted whole blood is processed inside labs, centrifuged to split into components (Packed Red cells, Fresh Frozen Plasma, and Cryoprecipitate). Red cells are stored at 2-6°C and expire in exactly 42 days." },
              { q: "Is there direct compensation?", a: "LifeLink operates strictly on the voluntary non-remunerated donation system, complying with global WHO safety mandates. We reward donors with badges, medals, and priorities in emergency triage." }
            ].map((faq, i) => (
              <div key={i} className="bg-slate-50 border border-slate-200/80 rounded-xl p-4.5 space-y-2 hover:bg-slate-100/30 transition-all">
                <h4 className="font-bold text-slate-900 font-sans text-sm flex gap-2">
                  <span className="text-red-500">Q:</span> {faq.q}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-sans pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
