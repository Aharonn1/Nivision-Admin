import React, { useEffect, useState } from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, YAxis } from 'recharts';
import { Cpu, HardDrive, Activity, AlertTriangle, Gauge } from 'lucide-react';

interface ReliabilityData {
  p99_latency: number;
  recent_events: string[];
  error_rate: number;
  uptime_score: number;
  history: number[];
  system_load: { cpu: number[]; memory: { heapUsed: number; heapTotal: number } };
}

export const SystemReliabilityCenter = () => {
  const [data, setData] = useState<ReliabilityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://51.20.95.207:3001/api/reliability');
        const result = await response.json();
        setData(result);
      } catch (error) { console.error("Error:", error); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading || !data) return <div className="text-white p-8">Loading System Metrics...</div>;

  const MetricCard = ({ title, value, icon: Icon, color, dataKey, explanation, unit }: any) => (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between h-full transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer">
      <div>
        <p className="text-slate-400 text-[11px] font-bold uppercase flex items-center gap-1">
          <Icon size={12} /> {title}
        </p>
        <p className="text-3xl font-bold my-3 text-slate-800">{value}{unit}</p>
      </div>
      
      <div className="h-20">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={dataKey.map((val: number, i: number) => ({ val, i }))}>
            <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                formatter={(val: number) => [`${val.toFixed(2)}`, title]}
            />
            <Area type="monotone" dataKey="val" stroke={color} fill={color} fillOpacity={0.1} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[10px] text-slate-500 mt-4 leading-relaxed">{explanation}</p>
    </div>
  );

  return (
    <div className="p-8 space-y-6">
      <h2 className="text-2xl font-bold mb-6">Nivision System Observability</h2>

      {/* שורה ראשונה: 3 גרפים */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard title="P99 Latency" value={Math.round(data.p99_latency)} unit="ms" icon={Activity} color="#4f46e5" dataKey={data.history} explanation="זמן תגובה איטי ביותר ל-1% מהבקשות. מדד קריטי לחוויית משתמש." />
        <MetricCard title="CPU Load (1m)" value={data.system_load.cpu[0].toFixed(2)} unit="" icon={Cpu} color="#4f46e5" dataKey={data.system_load.cpu} explanation="עומס משימות על המעבד. ערך מעל 1.0 מצביע על תור המתנה למעבד." />
        <MetricCard title="Heap Memory" value={data.system_load.memory.heapUsed} unit="MB" icon={HardDrive} color="#4f46e5" dataKey={[data.system_load.memory.heapUsed]} explanation="צריכת זיכרון ב-Node.js. עלייה עקבית ללא ירידה מעידה על דליפת זיכרון." />
      </div>

      {/* שורה שנייה: 2 גרפים */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MetricCard title="Error Rate" value={data.error_rate.toFixed(1)} unit="%" icon={AlertTriangle} color="#e11d48" dataKey={[data.error_rate]} explanation="אחוז הבקשות שנכשלו. מדד זה משקף ישירות את אמינות המערכת." />
        <MetricCard title="Uptime Status" value={data.uptime_score} unit="%" icon={Gauge} color="#10b981" dataKey={[data.uptime_score - 0.1, data.uptime_score]} explanation="זמן זמינות המערכת. יעד של 99.9% הוא הסטנדרט למערכות Production." />
      </div>
    </div>
  );
};