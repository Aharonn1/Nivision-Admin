import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Box, Activity, ShieldCheck, Cpu, 
  RefreshCcw, Zap, Globe, ShieldAlert, Layers
} from 'lucide-react';
import dataService from '../Service/DataService';
import { useNavigate } from '@tanstack/react-router';

export const ServiceNodesDash = () => {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token !== "true") {
      setIsAuthorized(false);
      setTimeout(() => navigate({ to: '/' }), 1500);
    } else {
      setIsAuthorized(true);
    }
  }, [navigate]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['container-nodes'],
    queryFn: () => dataService.getContainer(),
    refetchInterval: 1000 * 30,
    enabled: isAuthorized === true,
  });

  const { containerList, siteStatus } = React.useMemo(() => {
    const rawData = Array.isArray(data) ? data[0] : data;
    return {
      containerList: rawData?.services || [],
      siteStatus: rawData?.site_status || "N/A"
    };
  }, [data]);

  // 🚀 התיקון: טעינה שטוחה לחלוטין ללא קופסאות
  if (isAuthorized === null || isLoading) return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-transparent">
      <Layers className="h-16 w-16 text-blue-600 animate-pulse mb-6 opacity-40" />
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 font-mono animate-pulse">Mapping Virtualization Layers...</p>
    </div>
  );

  if (isAuthorized === false) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-white">
        <ShieldAlert size={80} className="text-rose-500 mb-6 animate-pulse" />
        <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 uppercase">Access Restricted</h1>
      </div>
    );
  }

  return (
    /* 🚀 הוסרו כל הגדרות ה-Background וה-Padding החיצוניים של הקופסה */
    <div className="w-full max-w-[1400px] mx-auto h-auto p-4 md:p-10 space-y-8 font-sans overflow-hidden" dir="rtl">
      
      {/* Banner */}
      <div className={`w-full p-8 rounded-[3rem] backdrop-blur-xl border border-white transition-all shadow-xl ${siteStatus === '200' ? 'bg-white/80' : 'bg-orange-50'}`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className={`p-5 rounded-3xl ${siteStatus === '200' ? 'bg-emerald-500 text-white' : 'bg-orange-500 text-white'}`}>
              <Globe size={24} />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Public Connectivity Status</p>
              <h4 className="text-2xl font-black italic tracking-tight text-slate-900">
                {siteStatus === '200' ? 'המערכת זמינה לציבור' : `שיבוש תקשורת: ${siteStatus}`}
              </h4>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-4">
        <div className="flex items-center gap-8">
          <div className="p-6 bg-slate-900 text-white rounded-[2.5rem] shadow-2xl rotate-2">
            <Box size={32} className="text-blue-400" />
          </div>
          <div className="text-right">
            <h3 className="text-5xl font-black text-slate-900 italic tracking-tighter uppercase leading-none mb-2">ניהול קונטיינרים</h3>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] font-mono italic">Virtual Nodes Cluster // Active Sync</p>
          </div>
        </div>

        <button onClick={() => refetch()} className="flex items-center gap-3 px-8 py-4 bg-white hover:bg-slate-50 rounded-2xl border border-slate-100 shadow-md transition-all active:scale-95">
          <RefreshCcw size={18} className="text-blue-600" />
          <span className="text-xs font-black text-slate-900 uppercase tracking-widest italic">רענון צמתים</span>
        </button>
      </div>

      {/* Nodes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {containerList.map((service: any, idx: number) => (
          <div key={idx} className="group bg-white rounded-[3.5rem] p-10 shadow-lg border border-slate-50 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-start justify-between mb-10">
              <div className="flex items-center gap-6">
                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <Cpu size={28} className="text-blue-600" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">{service.name}</p>
                  <p className="text-[11px] font-bold text-blue-500 font-mono tracking-widest uppercase italic">{service.image.split(':')[0]}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-slate-50 p-6 rounded-[2rem] text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Uptime</p>
                <p className="text-lg font-black text-slate-900 font-mono italic">{service.uptime}</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-[2rem] text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Status</p>
                <p className="text-lg font-black text-blue-600 font-mono italic uppercase">Synchronized</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Footer */}
      <div className="w-full bg-slate-900 p-10 rounded-[3rem] shadow-2xl">
        <p className="text-xs font-bold text-slate-400 leading-relaxed text-right italic">
             <span className="text-white italic font-black uppercase tracking-widest block mb-1">NiVision Auto-Healing Protocol Active:</span> 
             המערכת מבצעת ניטור רציף על {containerList.length} צמתים. כל שיבוש ב-Kernel יפעיל מנגנון שחזור אוטומטי.
        </p>
      </div>
    </div>
  );
};