import React, { useState, useEffect } from 'react';
import { AIAnalysisForecast } from '../types';
import { Sparkles, Brain, AlertTriangle, HelpCircle, Activity, Heart, RefreshCw } from 'lucide-react';
import { apiFetch } from '../api';

const fetch = apiFetch;

export const ForecastIntel: React.FC = () => {
  const [data, setData] = useState<AIAnalysisForecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchForecast = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/gemini/forecast');
      if (!res.ok) throw new Error("Failed to secure AI analysis report");
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      console.error(err);
      setError("Unable to stream live forecasting model nodes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, []);

  const getRiskColor = (risk: string) => {
    switch (risk.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-red-50 text-red-700 border-red-250 ring-red-120 hover:bg-red-100';
      case 'HIGH':
        return 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 bg-red-100/80 rounded-xl flex items-center justify-center border border-red-200">
            <Brain className="h-5.5 w-5.5 text-red-600 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold font-sans text-slate-950 flex items-center gap-1.5 text-base">
              Predictive Logistic Intelligence
              <span className="bg-slate-900 text-slate-100 text-[10px] font-mono px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">Gemini v3.5 AI</span>
            </h3>
            <p className="text-[11px] text-slate-500 font-sans">
              Smart analytical shortage predictions based on real-time donation frequencies and passive emergency ratios.
            </p>
          </div>
        </div>
        <button 
          onClick={fetchForecast}
          disabled={loading}
          className="text-xs text-slate-600 font-sans hover:text-red-600 hover:bg-slate-100 border border-slate-250 p-2 rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          Refresh Models
        </button>
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400 font-mono">Synthesizing platform inventory telemetry...</p>
        </div>
      ) : error || !data ? (
        <div className="py-4 text-center">
          <p className="text-xs text-red-600">{error || "Forecasting unavailable"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Forecaster Cards */}
          <div className="lg:col-span-8 space-y-4">
            <h4 className="text-xs font-bold text-slate-400 font-mono tracking-wider uppercase">15-Day Shortage Risk Index</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {data.bloodShortageForecast.map((f, i) => (
                <div 
                  key={i} 
                  className={`border rounded-xl p-4 transition-all duration-300 ${getRiskColor(f.shortageRisk)} flex flex-col justify-between h-36`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs uppercase opacity-75 font-bold tracking-wide">Blood Type</span>
                      <h5 className="text-3xl font-bold tracking-tight text-slate-900">{f.bloodType}</h5>
                    </div>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full border bg-white/70 font-bold border-current shadow-xs">
                      {f.shortageRisk} Risk
                    </span>
                  </div>

                  <div className="mt-2.5">
                    <p className="text-[11px] leading-relaxed text-slate-600 line-clamp-2">
                      {f.explanation}
                    </p>
                  </div>

                  <div className="border-t border-slate-200/50 pt-2 flex items-center justify-between text-[11px] font-mono text-slate-500 font-semibold mt-1">
                    <span>Reserve Index:</span>
                    <span className="text-slate-900 font-bold">{f.predictedDaysOfSupply} Days of Supply</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Targeted AI campaigns */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-slate-950 text-white rounded-xl p-5 border border-slate-800 space-y-4 flex flex-col justify-between h-full">
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-rose-400">
                  <Sparkles className="h-4 w-4 fill-current text-rose-400 animate-pulse" />
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider">AI Donor Campaign Recommender</span>
                </div>
                
                {data.donorRecommendations && data.donorRecommendations.map((rec, i) => (
                  <div key={i} className="border-b border-slate-800 pb-3 last:border-b-0 last:pb-0 space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="bg-red-950 text-red-400 px-2 py-0.5 rounded-md font-bold text-[10px] border border-red-900">{rec.bloodType} Subgroup</span>
                      <span className="text-slate-400 font-mono text-[10px]">Invite {rec.recCount} Nearby Donors</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-100 italic">“{rec.targetedCampaignConcept}”</p>
                  </div>
                ))}
              </div>

              <div className="bg-slate-900 rounded-lg p-3 border border-slate-800/80 mt-2">
                <p className="text-[10px] leading-relaxed text-slate-400">
                  <Activity className="h-3 w-3 text-red-500 inline mr-1" />
                  LifeLink matching engine maps vectors for coordinates of responsive eligible O-negative donors instantly.
                </p>
              </div>
            </div>
          </div>

          {/* General clinical report assessment */}
          <div className="lg:col-span-12 bg-slate-50 border border-slate-200/80 rounded-xl p-4 mt-2">
            <h5 className="text-[11px] font-bold text-slate-400 font-mono tracking-wider uppercase mb-1.5 flex items-center gap-1">
              <Brain className="h-3.5 w-3.5 text-purple-600 fill-current" />
              Comprehensive Platform Assessment
            </h5>
            <p className="text-slate-700 text-xs leading-relaxed font-sans select-all select-text">
              {data.generalAssessment}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
