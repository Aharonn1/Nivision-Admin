import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Cpu, Database, HardDrive, Activity, AlertTriangle, 
  CheckCircle2, Zap, ShieldAlert, Clock, 
  Info, ActivitySquare, Gauge, Server
} from 'lucide-react';
import dataService from '../Service/DataService';

export const SystemIntelligenceDash = () => {
  const { data: rawData, isLoading, error } = useQuery({
    queryKey: ['system-intelligence'],
    queryFn: () => dataService.getSystemIntelligence(),
    refetchInterval: 1000 * 15,
  });

  const stats = useMemo(() => (Array.isArray(rawData) ? rawData[0] : rawData), [rawData]);

  const healthMetrics = useMemo(() => {
    if (!stats) return { score: 0, status: 'Unknown', color: 'slate' };
    const cpu = parseFloat(stats.server.cpu) || 0;
    const ram = parseFloat(stats.server.memory.percent) || 0;
    const evictions = parseInt(stats.redis.evicted_keys) || 0;
    
    let score = 100;
    score -= (cpu > 70 ? (cpu - 70) * 1.5 : 0);
    score -= (ram > 80 ? (ram - 80) * 2 : 0);
    score -= (evictions > 0 ? 20 : 0);
    score = Math.max(0, Math.min(100, Math.round(score)));
    
    if (score > 85) return { score, color: 'emerald', label: 'בינה אופטימלית' };
    if (score > 60) return { score, color: 'amber', label: 'נדרשת תשומת לב' };
    return { score, color: 'red', label: 'עומס קריטי' };
  }, [stats]);

  if (isLoading) return (
  <div className="flex h-screen w-full items-center justify-center">
      <div className="relative">
        <ActivitySquare className="h-16 w-16 text-blue-600 animate-spin" />
        <div className="absolute inset-0 h-16 w-16 bg-blue-400 rounded-full blur-[140px] opacity-20 animate-pulse"></div>
      </div>
      <p className="text-slate-400 font-black tracking-[0.4em] uppercase text-xs font-mono animate-pulse">
        Initializing Intelligence Matrix...
      </p>
    </div>
  );

  if (error || !stats || !stats.server) return (
    <div className="m-10 p-16 bg-white rounded-[4rem] border-4 border-rose-100 shadow-2xl flex items-center gap-10" dir="rtl">
      <div className="bg-rose-500 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-rose-200">
        <ShieldAlert size={60} className="animate-bounce" />
      </div>
      <div className="text-right">
        <p className="text-5xl font-black text-slate-900 mb-4 tracking-tighter italic uppercase">Signal Lost</p>
        <p className="text-lg font-bold text-rose-500 uppercase tracking-widest font-mono">
          Infrastructure Node Offline // Stockholm Cluster Restricted
        </p>
      </div>
    </div>
  );

  return (
    /* 🚀 הריפוד עודכן ל-p-4 md:p-6 והוספנו מקסימום רוחב מרוכז max-w-[1400px] mx-auto כדי למחוק את הגלילה הצידית */
    <div className="w-full max-w-[1400px] mx-auto min-h-screen space-y-10 p-4 md:p-6 relative overflow-hidden font-sans select-none" dir="rtl">
      
      {/* Background Decorative Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-200/30 rounded-full blur-[150px] pointer-events-none" />
      
      {/* Main Admin Header */}
      <div className={`p-8 md:p-12 rounded-[3.5rem] flex flex-col lg:flex-row items-center justify-between transition-all duration-1000 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] relative z-10 ${
        healthMetrics.color === 'red' ? 'bg-rose-600' : 'bg-slate-900'
      }`}>
        <div className="flex flex-col sm:flex-row items-center gap-6 md:gap-10 text-white w-full lg:w-auto text-center sm:text-right">
          <div className="relative h-28 w-28 md:h-32 md:w-32 flex items-center justify-center bg-white/10 rounded-[2.5rem] border border-white/20 backdrop-blur-xl rotate-3 flex-shrink-0">
            <span className="text-5xl md:text-6xl font-black tracking-tighter italic">{healthMetrics.score}</span>
            <div className="absolute -top-3 -right-3 bg-blue-500 p-2 rounded-xl shadow-lg border-2 border-slate-900">
               <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-3 italic uppercase leading-none">{healthMetrics.label}</h2>
            <div className="flex items-center justify-center sm:justify-start gap-4">
              <div className={`h-3 w-3 rounded-full animate-pulse ${healthMetrics.color === 'red' ? 'bg-white' : 'bg-emerald-400 shadow-[0_0_15px_#34d399]'}`}></div>
              <p className="text-xs font-black opacity-60 uppercase tracking-[0.4em] font-mono italic">Audit Engine // v2.6.4 Stable</p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 sm:gap-6 mt-8 lg:mt-0 w-full sm:w-auto justify-center">
          <div className="bg-white/5 backdrop-blur-md px-6 py-4 md:px-8 md:py-5 rounded-[2rem] border border-white/10 text-center flex-1 sm:flex-none">
            <span className="block text-[10px] font-black text-blue-400 uppercase mb-1 tracking-widest">Global Node</span>
            <span className="text-white font-black text-md md:text-xl italic font-mono">SE-STK-1</span>
          </div>
          <div className="bg-white/5 backdrop-blur-md px-6 py-4 md:px-8 md:py-5 rounded-[2rem] border border-white/10 text-left flex-1 sm:flex-none">
            <span className="block text-[10px] font-black text-blue-400 uppercase mb-1 tracking-widest">Server Time</span>
            <span className="text-white font-mono font-black text-md md:text-xl">{new Date().toLocaleTimeString('he-IL')}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 md:gap-12 relative z-10">
        
        {/* --- EC2 Resource Management --- */}
        <div className="bg-white/80 backdrop-blur-md p-8 md:p-12 rounded-[4rem] border-2 border-white shadow-[0_30px_80px_-15px_rgba(0,0,0,0.08)] hover:shadow-[0_45px_90px_-20px_rgba(15,23,42,0.12)] transition-all duration-300 ease-out hover:-translate-y-1.5 relative overflow-hidden group cursor-pointer">
          <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-700">
            <Server size={350} />
          </div>
          
          <div className="flex justify-between items-center mb-12 md:mb-16 relative z-10">
            <div className="flex items-center gap-6">
              <div className="p-5 bg-slate-900 rounded-[1.8rem] text-blue-400 shadow-2xl rotate-2">
                <Cpu size={32} />
              </div>
              <div className="text-right">
                <h4 className="font-black text-slate-900 text-3xl md:text-4xl tracking-tighter italic uppercase leading-none">ניהול משאבים</h4>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2 font-mono">Kernel-Level Monitoring</p>
              </div>
            </div>
          </div>

          <div className="space-y-12 md:space-y-16 relative z-10">
            {/* CPU Metric */}
            <div className="bg-slate-50/50 p-6 md:p-8 rounded-[3rem] border border-slate-100 shadow-inner">
              <div className="flex justify-between items-end mb-6 px-2">
                <div className="flex flex-col text-right">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest italic">עומס מעבד מרכזי</span>
                  <span className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter font-mono italic">{stats.server.cpu}</span>
                </div>
                <div className="bg-white p-3 rounded-2xl shadow-sm">
                  <Zap size={20} className="text-blue-600" />
                </div>
              </div>
              <div className="h-4 bg-slate-200/50 rounded-full p-1 border border-white shadow-inner">
                <div className="h-full rounded-full bg-slate-900 transition-all duration-1000 shadow-[0_0_15px_rgba(0,0,0,0.2)]" style={{ width: stats.server.cpu }}></div>
              </div>
            </div>

            {/* RAM Metric - High Contrast */}
            <div className="relative p-6 md:p-10 bg-slate-900 rounded-[3.5rem] border-b-8 border-blue-600 shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-blue-600/5 pointer-events-none" />
              <div className="flex justify-between items-end mb-8 relative z-10">
                <div className="text-right">
                   <span className="text-[11px] font-black text-blue-400 uppercase tracking-widest font-mono italic">Physical RAM Index</span>
                   <p className="text-5xl md:text-6xl font-black tracking-tighter text-white font-mono italic leading-none mt-2">{stats.server.memory.percent}</p>
                </div>
                <Database size={40} className="text-slate-700" />
              </div>
              
              <div className="h-12 bg-black/40 rounded-[1.5rem] overflow-hidden p-2 shadow-inner border border-white/5 relative z-10">
                <div 
                  className={`h-full rounded-xl transition-all duration-1000 shadow-[0_0_20px_rgba(59,130,246,0.5)] ${healthMetrics.color === 'red' ? 'bg-rose-500' : 'bg-blue-600'}`} 
                  style={{ width: stats.server.memory.percent }}
                ></div>
              </div>
              
              <div className="flex justify-between mt-8 px-2 relative z-10">
                <div className="flex gap-6 md:gap-10">
                   <div className="flex flex-col text-right">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Available</span>
                      <span className="text-md md:text-lg font-black text-slate-200 font-mono italic">{stats.server.memory.free}</span>
                   </div>
                   <div className="flex flex-col text-right">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Capacity</span>
                      <span className="text-md md:text-lg font-black text-slate-200 font-mono italic">{stats.server.memory.total}</span>
                   </div>
                </div>
                <div className="text-left flex flex-col items-end">
                   <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest italic">Disk I/O Status</span>
                   <span className="text-md md:text-lg font-black text-emerald-400 flex items-center gap-2 font-mono italic"><HardDrive size={16}/> {stats.server.disk}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- Redis Intelligence Matrix --- */}
        <div className="bg-slate-900 p-8 md:p-12 rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] hover:shadow-[0_60px_110px_-25px_rgba(37,99,235,0.15)] transition-all duration-300 ease-out hover:-translate-y-1.5 relative overflow-hidden text-white border border-slate-800 group border-t-8 border-blue-500 cursor-pointer">
          <div className="absolute -bottom-20 -right-20 opacity-[0.05] text-blue-500 rotate-12 transition-transform duration-[4s] group-hover:rotate-45">
            <Activity size={400} />
          </div>

          <div className="flex justify-between items-start mb-12 md:mb-16 relative z-10">
            <div className="text-right">
              <h4 className="font-black text-3xl md:text-4xl tracking-tighter mb-2 italic uppercase">Redis Matrix</h4>
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] font-mono italic underline underline-offset-8">Neural Data Layer // Synchronization</p>
            </div>
            <div className="bg-blue-600 px-4 py-2 md:px-6 rounded-2xl border-b-4 border-blue-800 text-[10px] font-black uppercase tracking-widest italic active:translate-y-1 transition-all">
              Live Link
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 md:gap-8 relative z-10 mb-12">
            <div className="bg-white/5 backdrop-blur-2xl p-6 md:p-10 rounded-[3rem] border border-white/10 hover:bg-white/10 transition-all group/card shadow-2xl">
              <span className="block text-[10px] font-black text-blue-400 uppercase mb-4 tracking-widest italic">סשנים פעילים</span>
              <div className="flex items-baseline gap-2 md:gap-4">
                <span className="text-5xl md:text-7xl font-black tracking-tighter italic font-mono leading-none">{stats.redis.active_sessions}</span>
                <span className="text-xs font-bold text-slate-500 uppercase italic font-mono">Keys</span>
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-2xl p-6 md:p-10 rounded-[3rem] border border-white/10 hover:bg-white/10 transition-all shadow-2xl">
              <span className="block text-[10px] font-black text-blue-400 uppercase mb-4 tracking-widest italic">Cache Usage</span>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl md:text-5xl font-black tracking-tighter italic font-mono leading-none">{stats.redis.memory_usage}</span>
              </div>
            </div>
          </div>

          {/* Micro-Telemetry Grid */}
          <div className="grid grid-cols-3 gap-4 md:gap-6 relative z-10 bg-black/40 p-6 md:p-8 rounded-[3rem] border border-white/5 shadow-inner">
             <div className="text-center border-l border-white/10 last:border-0">
                <span className="block text-[9px] font-black text-slate-500 uppercase mb-2 tracking-widest">Ops/Sec</span>
                <div className="flex items-center justify-center gap-2">
                  <Zap size={14} className="text-amber-400 animate-pulse" />
                  <span className="text-xl md:text-2xl font-black font-mono italic">{stats.redis.ops_per_sec}</span>
                </div>
             </div>
             <div className="text-center border-l border-white/10 last:border-0">
                <span className="block text-[9px] font-black text-slate-500 uppercase mb-2 tracking-widest">Hit Rate</span>
                <div className="flex items-center justify-center gap-2">
                  <Gauge size={14} className="text-emerald-400" />
                  <span className="text-xl md:text-2xl font-black font-mono italic">{stats.redis.cache_hit_rate}</span>
                </div>
             </div>
             <div className="text-center">
                <span className="block text-[9px] font-black text-slate-500 uppercase mb-2 tracking-widest">Evicted</span>
                <span className={`text-xl md:text-2xl font-black font-mono italic ${parseInt(stats.redis.evicted_keys) > 0 ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`}>
                  {stats.redis.evicted_keys}
                </span>
             </div>
          </div>

          <div className="mt-12 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10 opacity-40 group-hover:opacity-80 transition-opacity">
            <div className="flex items-center gap-6 md:gap-10">
               <div className="flex flex-col text-right">
                  <span className="text-[9px] font-black text-slate-600 uppercase">Uptime Pulse</span>
                  <span className="text-xs font-black text-slate-300 font-mono italic">{stats.redis.uptime}</span>
               </div>
               <div className="h-8 w-[1px] bg-slate-800" />
               <div className="flex flex-col text-right">
                  <span className="text-[9px] font-black text-slate-600 uppercase">Persistence</span>
                  <span className={`text-xs font-black flex items-center gap-2 font-mono ${stats.redis.persistence === 'ok' ? 'text-emerald-400' : 'text-rose-400'}`}>
                     <CheckCircle2 size={12}/> {stats.redis.persistence?.toUpperCase()}
                  </span>
               </div>
            </div>
            <div className="flex flex-col items-end">
               <span className="text-[9px] font-black text-slate-600 uppercase italic">Encryption Node</span>
               <span className="text-xs font-black text-blue-500 font-mono tracking-[0.2em]">NV-REDIS-SECURE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};