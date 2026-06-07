import React, { useEffect, useState } from 'react';
import { Activity, Cpu, HardDrive, AlertTriangle, Wifi, RefreshCcw } from 'lucide-react';

export const InfrastructureIntelligence = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // פנייה ל-API של ה-AWS שמושך נתוני תשתית (CloudWatch)
    fetch('http://51.20.95.207:3001/api/aws')
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) return <div className="text-slate-800 p-8">Initializing Cloud Telemetry...</div>;

  const MetricCard = ({ label, value, sub, icon: Icon, color = "indigo" }: any) => (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
      <div className={`p-3 bg-${color}-50 rounded-2xl text-${color}-600 w-fit mb-4`}>
        <Icon size={24} />
      </div>
      <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">{label}</p>
      <div className="flex items-baseline gap-2 mt-1">
        <p className="text-3xl font-black text-slate-900">{value}</p>
        <p className="text-slate-500 text-sm font-medium">{sub}</p>
      </div>
    </div>
  );

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900">AWS Infrastructure Intelligence</h2>
          <p className="text-slate-500 mt-1">Stockholm Node Cluster // Live Cloud Metrics</p>
        </div>
      </div>
      
      {/* Infrastructure Core Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="CPU Usage" value={`${data?.resources?.cpu || 0}%`} sub="Avg. Utilization" icon={Cpu} color="indigo" />
        <MetricCard label="Heap Memory" value={`${data?.resources?.memory || 0} MB`} sub="Live Allocation" icon={HardDrive} color="violet" />
        <MetricCard label="Disk Usage" value={`${data?.resources?.disk || 0}%`} sub="Volume Load" icon={HardDrive} color="amber" />
        <MetricCard label="Active Errors" value={data?.resources?.errors || 0} sub="Cloud Agents" icon={AlertTriangle} color="rose" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard label="Network In" value={`${data?.resources?.netIn || 0} MB`} sub="Incoming Data" icon={Wifi} color="emerald" />
        <MetricCard label="Network Out" value={`${data?.resources?.netOut || 0} MB`} sub="Outgoing Data" icon={Wifi} color="blue" />
        <MetricCard label="Swap Usage" value={`${data?.resources?.swap || 0}%`} sub="Virtual Mem" icon={RefreshCcw} color="slate" />
      </div>
    </div>
  );
};