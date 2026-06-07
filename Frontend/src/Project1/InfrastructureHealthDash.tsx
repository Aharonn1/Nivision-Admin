import React, { useMemo, useEffect, useLayoutEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Activity, HardDrive, Cpu, Wifi, Skull, 
  RotateCcw, Server, ShieldAlert, Network, Clock, List
} from 'lucide-react';
import dataService from '../Service/DataService';
import { useNavigate } from '@tanstack/react-router';

export const InfrastructureHealthDash = () => {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [animated, setAnimated] = useState(false);

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token !== "true") {
      setIsAuthorized(false);
      setTimeout(() => navigate({ to: '/' }), 1500);
    } else {
      setIsAuthorized(true);
    }
  }, [navigate]);

  // האנימציה תופעל רק לאחר שהקומפוננטה ב-DOM
  useLayoutEffect(() => {
    if (isAuthorized) {
      const timer = setTimeout(() => setAnimated(true), 150);
      return () => clearTimeout(timer);
    }
  }, [isAuthorized]);

  const { data: infraData } = useQuery({
    queryKey: ['infra-health'],
    queryFn: () => dataService.getInfraHealth(),
    refetchInterval: 1000 * 60 * 5,
    enabled: isAuthorized === true,
  });

  const [awsData, setAwsData] = useState<any>(null);

  useEffect(() => {
    fetch("http://51.20.95.207:3001/api/system/intelligence")
      .then(r => r.json())
      .then(setAwsData)
      .catch(console.error);
  }, []);

  const health = useMemo(() => infraData ? (Array.isArray(infraData) ? infraData[0] : infraData)?.health : null, [infraData]);

  if (isAuthorized === null || !awsData || !health) return <div className="p-20 text-center font-black text-slate-500">טוען ניטור NiVision מלא...</div>;

  const metrics = [
    { label: "עומס מעבד (CPU)", val: awsData.resources?.cpu || "0%", icon: <Cpu /> },
    { label: "ניצול זיכרון", val: awsData.resources?.memory || "0%", icon: <Activity /> },
    { label: "ניצול דיסק", val: awsData.resources?.disk || "0%", icon: <HardDrive /> },
    { label: "שגיאות פעילות", val: String(awsData.resources?.errors || "0"), icon: <ShieldAlert /> },
    { label: "Net In (MB)", val: String(awsData.resources?.netIn || "0"), icon: <Network /> },
    { label: "Net Out (MB)", val: String(awsData.resources?.netOut || "0"), icon: <Wifi /> },
    { label: "Swap Usage", val: awsData.resources?.swap || "0%", icon: <RotateCcw /> },
    { label: "זמינות מערכת", val: awsData.status || "Unknown", icon: <Server /> }
  ];

  return (
    <div className="w-full max-w-[1400px] mx-auto p-8 space-y-8 font-sans" dir="rtl">
      {/* Header */}
      <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-950 tracking-tighter uppercase italic">AWS Infrastructure Intelligence</h1>
          <p className="text-blue-600 font-bold mt-1 text-xs uppercase tracking-widest italic">STOCKHOLM NODE CLUSTER // LIVE TELEMETRY</p>
        </div>
        <div className="bg-gray-50 px-6 py-3 rounded-2xl font-mono text-sm font-bold">{new Date().toLocaleTimeString()}</div>
      </div>

      {/* 8 Main Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {metrics.map((m, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm transition-all">
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="text-blue-500 w-4 h-4">{m.icon}</span> {m.label}
            </p>
            <p className="text-3xl font-black text-slate-900 mb-4">{m.val}</p>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all duration-[2500ms]" 
                  style={{ 
                    width: animated && typeof m.val === 'string' && m.val.includes('%') ? m.val : '0%',
                    transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' 
                  }}
                ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Deep Observability Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
           <h4 className="text-xl font-black italic uppercase mb-8 flex items-center gap-3"><List className="text-blue-600"/> חלוקת משאבי אפליקציה</h4>
           {health.memory_hogs?.map((proc: any, i: number) => (
             <div key={i} className="flex justify-between items-center py-4 border-b border-gray-50 last:border-0">
               <span className="font-bold text-sm uppercase font-mono">{proc.name}</span>
               <div className="flex items-center gap-4">
                 <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 transition-all duration-[2500ms]" 
                      style={{
                        width: animated ? proc.usage : '0%',
                        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)'
                      }}
                    ></div>
                 </div>
                 <span className="font-black text-blue-600 text-sm font-mono">{proc.usage}</span>
               </div>
             </div>
           ))}
        </div>
        
        <div className="bg-slate-900 p-8 rounded-[2rem] text-white">
           <h4 className="text-xl font-black italic uppercase mb-8">הקצאת זיכרון ליבה (RAM)</h4>
           <div className="space-y-8">
             <div className="flex justify-between border-b border-white/10 pb-4">
                <span className="font-bold">תהליכי אפליקציה</span>
                <span className="text-3xl font-black font-mono text-blue-400">{health.memory_hogs?.reduce((a:number, b:any) => a + parseFloat(b.usage), 0).toFixed(1)}%</span>
             </div>
             <div className="flex justify-between border-b border-white/10 pb-4">
                <span className="font-bold">ליבת שרת (Kernel)</span>
                <span className="text-3xl font-black font-mono text-slate-400">{(parseFloat(health.ram) - health.memory_hogs?.reduce((a:number, b:any) => a + parseFloat(b.usage), 0)).toFixed(1)}%</span>
             </div>
             <div className="flex gap-12 mt-10">
                <div className="text-center"><RotateCcw className="mx-auto mb-2 text-blue-400"/> <p className="text-2xl font-black">{health.docker_restarts || 0}</p></div>
                <div className="text-center"><Skull className="mx-auto mb-2 text-rose-500"/> <p className="text-2xl font-black">{health.zombies || 0}</p></div>
                <div className="text-center"><Clock className="mx-auto mb-2 text-emerald-400"/> <p className="text-xs font-bold mt-2">{health.uptime}</p></div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};