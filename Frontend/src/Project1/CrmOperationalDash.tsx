import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Globe, ShieldCheck, Zap, Activity, 
  RefreshCcw, Clock, Database, Server, Search
} from 'lucide-react';
import dataService from '../Service/DataService';

export const CrmOperationalDash = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['crm-hubspot'],
    queryFn: () => dataService.getCrmHubspot(),
    refetchInterval: 1000 * 30, 
  });

  const health = useMemo(() => {
    if (!data) return null;
    const rawData = Array.isArray(data) ? data[0] : data;
    return rawData?.health || null;
  }, [data]);

  const getSpeedStatus = (msStr: string) => {
    const ms = parseInt(msStr);
    if (ms < 400) return { label: 'ביצועי שיא', color: 'text-blue-600' };
    if (ms < 900) return { label: 'אופטימלי', color: 'text-indigo-500' };
    return { label: 'זוהה שיהוי', color: 'text-slate-500' };
  };

  // 🚀 התיקון: במקום Div עוטף עם רקע, משתמשים ב-Null או בטעינה נקייה ללא קופסאות
  if (isLoading) return (
    <div className="w-full h-screen flex items-center justify-center">
      <Globe className="h-12 w-12 text-blue-600 animate-spin-slow opacity-20" />
    </div>
  );

  if (error || !health) return null;

  const speed = getSpeedStatus(health.latency_ms);

  return (
    /* 🚀 הוסרו כל צבעי הרקע והמסגרות החיצוניות - הקומפוננטה כעת שטוחה */
    <div className="w-full max-w-[1400px] mx-auto h-auto p-4 md:p-8 space-y-8 font-sans overflow-hidden" dir="rtl">
      
      {/* Header Section */}
      <div className="w-full bg-[#121931] p-8 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl border-b-8 border-blue-600">
        <div className="flex items-center gap-6">
          <div className="p-5 bg-white/10 text-white rounded-3xl">
            <Globe size={28} className="text-blue-400" />
          </div>
          <div className="text-right">
            <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">ניהול CRM תפעולי</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2 italic">GATEWAY: {health.portal} // LIVE STREAM</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-2xl border border-white/10">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">סנכרון רשת: {health.last_sync}</p>
            <RefreshCcw size={14} className="text-blue-400 animate-spin-slow" />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
            { label: 'שיהוי תגובה', val: health.latency_ms, unit: 'ms', icon: Clock, color: speed.color },
            { label: 'רשומות מסונכרנות', val: health.contacts_count, unit: 'OBJS', icon: Database, color: 'text-slate-900' },
            { label: 'דופק מערכת', val: 'STABLE', unit: 'STATUS', icon: Activity, color: 'text-indigo-600' }
        ].map((item, idx) => (
            <div key={idx} className="bg-white p-8 rounded-[2.5rem] shadow-sm flex flex-col gap-6 hover:shadow-lg transition-all">
                <div className="flex justify-between items-start">
                    <div className="p-3 bg-slate-50 rounded-2xl text-slate-400"><item.icon size={20} /></div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{item.label}</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className={`text-5xl font-black font-mono italic tracking-tighter ${item.color}`}>{item.val}</span>
                    <span className="text-sm font-black text-slate-300 italic">{item.unit}</span>
                </div>
            </div>
        ))}
      </div>

      {/* Secondary Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-slate-50 rounded-2xl text-slate-400"><Server size={20} /></div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Server Ttfb</p>
                <p className="text-lg font-black text-slate-900 font-mono tracking-tighter italic">{health.ttfb}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-slate-50 rounded-2xl text-slate-400"><Search size={20} /></div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Dns Handshake</p>
                <p className="text-lg font-black text-slate-900 font-mono tracking-tighter italic">{health.dns_lookup}</p>
              </div>
            </div>
          </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-900 p-8 rounded-[2.5rem] text-right">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] italic">
             Nivision Matrix Intelligence • Audit 2026 // {speed.label}
          </p>
      </div>
    </div>
  );
};