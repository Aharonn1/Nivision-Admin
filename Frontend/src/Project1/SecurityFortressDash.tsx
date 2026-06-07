import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  ShieldCheck, Lock, Globe, ShieldX, KeyRound, Server, Zap, Shield,
  Eye, Radio, CheckCircle, Box, Activity, Fingerprint
} from 'lucide-react';
import dataService from '../Service/DataService';
import { Toaster } from "sonner";

export const SecurityFortressDash = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['security-intelligence'],
    queryFn: () => dataService.getSecurityIntelligence(),
    refetchInterval: 1000 * 60 * 5, 
  });

  const security = useMemo(() => {
    const raw = Array.isArray(data) ? data[0]?.security : data?.security;
    return raw || null;
  }, [data]);

  if (isLoading) return (
    <div className="p-20 flex flex-col items-center justify-center space-y-6">
      <div className="relative">
        <Lock className="h-16 w-16 text-blue-600 animate-pulse" />
        <div className="absolute inset-0 h-16 w-16 bg-blue-400 rounded-full blur-3xl opacity-20 animate-ping"></div>
      </div>
      <p className="text-slate-400 font-black tracking-[0.3em] uppercase text-xs animate-pulse text-center">
        Initializing NiVision Security Fortress...<br/>
        <span className="text-[10px] opacity-50 italic">Establishing SSH Tunnel to Stockholm Node</span>
      </p>
    </div>
  );

  if (error || !security) return (
    <div className="m-10 p-12 bg-red-50 rounded-[3rem] border-2 border-red-200 flex items-center gap-8 shadow-2xl">
      <ShieldX size={60} className="text-red-500 animate-bounce" />
      <div className="text-right">
        <h3 className="text-2xl font-black text-red-700 mb-2 tracking-tighter">כשל באימות תשתית ההגנה</h3>
        <p className="text-sm font-bold text-red-500 opacity-70 uppercase tracking-widest">
          Auth Failed • SSH Access Denied • Stockholm Node Restricted
        </p>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-[1400px] mx-auto h-auto space-y-8 p-4 md:p-10 font-sans select-none overflow-hidden" dir="rtl">
      <Toaster position="top-center" richColors />
      
      {/* Background Decorative Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-200/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row items-center justify-between p-10 bg-slate-900 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden border-b-4 border-blue-600">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-emerald-500 to-blue-600 opacity-50"></div>
        
        <div className="flex items-center gap-8 relative z-10">
          <div className="p-6 bg-blue-600 rounded-[2rem] shadow-xl shadow-blue-500/20 group hover:rotate-12 transition-transform">
            <ShieldCheck size={40} className="text-white" />
          </div>
          <div className="text-right">
            <h3 className="text-3xl font-black tracking-tighter mb-1 italic uppercase">מרכז בקרת חוסן (SOC)</h3>
            <div className="flex items-center gap-3">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_15px_#34d399]"></div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Neural Defense Protocol: {security.firewall_status?.toUpperCase() || 'ACTIVE'}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 lg:mt-0 flex gap-4 relative z-10">
          <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md text-center min-w-[130px]">
            <span className="block text-[9px] font-black text-blue-400 uppercase mb-1 tracking-tighter">Last Audit Scan</span>
            <span className="text-sm font-black font-mono tracking-widest">
              {security.last_audit ? new Date(security.last_audit).toLocaleTimeString('he-IL') : '--:--:--'}
            </span>
          </div>
          <div className={`px-6 py-3 rounded-2xl shadow-lg text-center min-w-[130px] border-b-4 ${security.rate_limit_status === 'STABLE' ? 'bg-blue-600 border-blue-800 shadow-blue-500/20' : 'bg-red-600 border-red-800 animate-pulse shadow-red-500/20'}`}>
            <span className="block text-[9px] font-black text-blue-100 uppercase mb-1">Node Status</span>
            <span className="text-sm font-black uppercase tracking-widest">{security.rate_limit_status}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        
        {/* Intelligence Card (Dark) */}
        <div className="p-10 bg-slate-900 rounded-[3rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] hover:shadow-[0_45px_80px_-20px_rgba(37,99,235,0.15)] transition-all duration-300 ease-out hover:-translate-y-1.5 border border-slate-800 relative overflow-hidden group text-white cursor-pointer">
          <Radio className="absolute -bottom-6 -left-6 text-blue-500/10 size-32 group-hover:scale-110 transition-transform duration-700" />
          <div className="flex justify-between items-start mb-8 relative z-10">
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest italic">Threat Intelligence</span>
            <Eye size={18} className="text-blue-400 animate-pulse" />
          </div>
          <div className="space-y-8 relative z-10">
             <div className="flex justify-between items-end border-b border-white/5 pb-4">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-right leading-relaxed">חסימות Nginx<br/>(Global 403)</span>
                <span className="text-5xl font-black text-white tracking-tighter italic">{security.nginx_blocked_requests || 0}</span>
             </div>
             <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-right leading-relaxed">ניסיונות חדירה<br/>(Window: 10m)</span>
                <span className={`text-5xl font-black tracking-tighter italic ${security.failed_logins > 0 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                  {security.failed_logins || 0}
                </span>
             </div>
          </div>
        </div>

        {/* SSL Card (Highlighted White) */}
        <div className="p-10 bg-white rounded-[3.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.03)] hover:shadow-2xl transition-all duration-300 ease-out hover:-translate-y-1.5 border-2 border-transparent group text-right hover:border-blue-400 cursor-pointer">
          <div className="flex justify-between items-start mb-10">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-right font-mono">SSL/TLS Certification</span>
            <Globe size={22} className="text-blue-500 group-hover:rotate-12 transition-transform" />
          </div>
          <h4 className="text-3xl font-black text-slate-900 mb-4 italic tracking-tighter">תעודה מאובטחת</h4>
          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 mb-6 shadow-inner">
            <span className="text-[10px] font-black text-slate-400 uppercase block mb-2 tracking-widest">Expiration Protocol</span>
            <span className="text-md font-mono font-black text-blue-600 tracking-tighter">{security.ssl_expiry || 'N/A'}</span>
          </div>
          <div className="flex items-center justify-end gap-3 text-[10px] font-black text-emerald-600 uppercase italic">
             Auto-renewal Active (Certbot)
             <CheckCircle className="text-emerald-500" size={16} />
          </div>
        </div>

        {/* Ports Card (Highlighted White) */}
        <div className="p-10 bg-white rounded-[3.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.03)] hover:shadow-2xl transition-all duration-300 ease-out hover:-translate-y-1.5 border-2 border-transparent relative group overflow-hidden hover:border-purple-400 cursor-pointer">
          <Server className="absolute -top-10 -left-10 text-slate-50 size-40 group-hover:rotate-12 transition-transform duration-1000" />
          <div className="flex justify-between items-start mb-8 relative z-10">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic font-mono">Network Ports</span>
            <Zap size={22} className="text-purple-500 animate-bounce" />
          </div>
          <div className="flex flex-wrap gap-3 relative z-10 justify-start">
            {security.open_ports?.length > 0 ? security.open_ports.map((port: string) => (
              <div key={port} className="px-4 py-2 bg-slate-900 rounded-2xl flex items-center gap-2 border-b-4 border-slate-950 hover:translate-y-[-2px] transition-transform shadow-xl shadow-slate-200">
                <div className="h-2 w-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-xs font-black text-white font-mono tracking-tighter">{port}</span>
              </div>
            )) : <span className="text-xs text-slate-400 italic font-black uppercase tracking-widest">No Open Ports Scanned</span>}
          </div>
        </div>

        {/* Container Orchestration Intelligence */}
        <div className="lg:col-span-3 space-y-6 pt-6">
          <div className="flex items-center gap-3 pr-4">
            <Box size={18} className="text-blue-600" />
            <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] italic">
              Virtualization Layer // Active Containers
            </h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {security.containers?.length > 0 ? security.containers.map((container: any) => (
              <div key={container.name} className="p-8 bg-white border-2 border-transparent rounded-[2.8rem] flex justify-between items-center shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] hover:shadow-2xl hover:border-blue-500/40 transition-all duration-300 ease-out hover:-translate-y-1.5 group cursor-pointer">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-slate-900 text-white rounded-[1.5rem] group-hover:bg-blue-600 transition-colors shadow-lg border-b-4 border-slate-950">
                    <Server size={24} />
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-slate-900 tracking-tighter italic uppercase">{container.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{container.uptime}</p>
                  </div>
                </div>
                <div className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase border-2 tracking-[0.2em] ${
                  container.status.includes('Up') 
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
                  : 'bg-red-50 text-red-600 border-red-100 animate-pulse'
                }`}>
                  {container.status.includes('Up') ? 'Live' : 'Stopped'}
                </div>
              </div>
            )) : (
              <div className="lg:col-span-3 p-16 bg-white border-2 border-dashed border-slate-200 rounded-[3rem] text-center shadow-inner">
                <Activity className="mx-auto mb-4 text-slate-300 animate-spin-slow" size={40} />
                <span className="text-xs text-slate-400 italic font-black uppercase tracking-widest">Scanning Network For Active Containers...</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer RBAC Matrix */}
        <div className="p-12 bg-slate-900 rounded-[4rem] text-white lg:col-span-3 border-t-4 border-blue-500">
          <Fingerprint className="absolute -top-10 -left-10 text-blue-500/10 rotate-12" size={260} />
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-12 text-right">
            <div className="w-full lg:w-2/3">
              <span className="block text-[10px] font-black text-blue-400 uppercase mb-4 tracking-[0.5em] italic font-mono">Security Access Management</span>
              <h4 className="text-4xl font-black tracking-tighter mb-6 italic uppercase">ניהול הרשאות ופרוטוקול RBAC</h4>
              <div className="grid grid-cols-2 gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {/* 🚀 התיקון הארכיטקטוני הראשי: הוסר border-white/5 והוחלף ב-border-transparent כדי לנקות את המסגרת הבהירה למטה */}
                <div className="flex items-center justify-end gap-3 bg-white/5 p-5 rounded-2xl border border-transparent hover:bg-white/10 transition-all cursor-default group"><span className="text-right group-hover:text-blue-400">IAM Policy: Strict</span><KeyRound size={18} className="text-blue-500" /></div>
                <div className="flex items-center justify-end gap-3 bg-white/5 p-5 rounded-2xl border border-transparent hover:bg-white/10 transition-all cursor-default group"><span className="text-right group-hover:text-blue-400">MFA Global Protocol</span><Shield size={18} className="text-blue-500" /></div>
                <div className="flex items-center justify-end gap-3 bg-white/5 p-5 rounded-2xl border border-transparent hover:bg-white/10 transition-all cursor-default group"><span className="text-right group-hover:text-blue-400">Audit Log: Active</span><Activity size={18} className="text-blue-500" /></div>
                <div className="flex items-center justify-end gap-3 bg-white/5 p-5 rounded-2xl border border-transparent hover:bg-white/10 transition-all cursor-default group"><span className="text-right group-hover:text-blue-400">Real-time Scanning</span><Radio size={18} className="text-blue-500" /></div>
              </div>
            </div>
            <div className="bg-blue-600 px-14 py-10 rounded-[3.5rem] shadow-[0_25px_60px_rgba(37,99,235,0.4)] flex flex-col items-center border-b-8 border-blue-800 transition-all hover:scale-105 active:scale-95 group">
               <span className="text-[11px] font-black uppercase mb-1 opacity-80 tracking-[0.3em]">Encryption Standard</span>
               <span className="text-3xl font-black tracking-[0.1em] font-mono">{security?.encryption || 'AES-256'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};