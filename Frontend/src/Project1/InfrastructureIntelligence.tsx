import React, { useEffect, useState } from 'react';
import { Cpu, HardDrive, AlertTriangle, Wifi, RefreshCcw } from 'lucide-react';

export const InfrastructureIntelligence = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('http://51.20.95.207:3001/api/aws')
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  // מפת צבעים מפורשת כדי ש-Tailwind יזהה אותם בוודאות
  const colorStyles: any = {
    indigo: "bg-indigo-50 text-indigo-600",
    violet: "bg-violet-50 text-violet-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    slate: "bg-slate-100 text-slate-600",
  };

  if (!data) return <div className="p-12 text-center text-slate-400 font-medium">Initializing Cloud Telemetry...</div>;

  const MetricCard = ({ label, value, sub, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-30Conversation">
      <div className={`p-3 rounded-2xl w-fit mb-4 ${colorStyles[color]}`}>
        <Icon size={24} />
      </div>
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
      <div className="flex items-baseline gap-2 mt-1">
        <p className="text-3xl font-black text-slate-900">{value}</p>
        <p className="text-sm font-medium text-slate-500">{sub}</p>
      </div>
    </div>
  );

  return (
    <div className="">
      <header className="mb-10">
        <h2 className="text-4xl font-black text-slate-900">AWS Infrastructure Intelligence</h2>
        <p className="text-slate-500 mt-2 text-lg">Stockholm Node Cluster // Real-time Cloud Metrics</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <MetricCard label="CPU Usage" value={`${data?.resources?.cpu || 0}%`} sub="Avg. Utilization" icon={Cpu} color="indigo" />
        <MetricCard label="Heap Memory" value={`${data?.resources?.memory || 0} MB`} sub="Live Allocation" icon={HardDrive} color="violet" />
        <MetricCard label="Disk Usage" value={`${data?.resources?.disk || 0}%`} sub="Volume Load" icon={HardDrive} color="amber" />
        <MetricCard label="Active Errors" value={data?.resources?.errors || 0} sub="Cloud Agents" icon={AlertTriangle} color="rose" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard label="Network In" value={`${data?.resources?.netIn || 0} MB`} sub="Incoming Data" icon={Wifi} color="emerald" />
        <MetricCard label="Network Out" value={`${data?.resources?.netOut || 0} MB`} sub="Outgoing Data" icon={Wifi} color="blue" />
        <MetricCard label="Swap Usage" value={`${data?.resources?.swap || 0}%`} sub="Virtual Mem" icon={RefreshCcw} color="slate" />
      </div>
    </div>
  );
};