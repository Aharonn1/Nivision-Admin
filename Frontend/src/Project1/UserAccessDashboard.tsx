import React, { useMemo, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import ReactECharts from 'echarts-for-react';
import { Users, Activity, Clock, Globe, ShieldCheck, PieChart, Search, User, SlidersHorizontal } from 'lucide-react';
import dataService from '../Service/DataService';
import { useNavigate } from '@tanstack/react-router';
import { Badge } from '../ui/badge';

export const UserAccessDashboard = () => {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token !== "true") {
      setIsAuthorized(false);
      setTimeout(() => navigate({ to: '/' }), 1500);
    } else {
      setIsAuthorized(true);
    }
  }, [navigate]);

  const { data: logs, isLoading } = useQuery({
    queryKey: ['access-logs'],
    queryFn: () => dataService.getUserLogins(),
    enabled: isAuthorized === true,
  });

  const safeLogs = useMemo(() => (Array.isArray(logs) ? logs : []), [logs]);

  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return safeLogs;
    return safeLogs.filter(log => 
      log.userName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [safeLogs, searchQuery]);

  const chartData = useMemo(() => {
    if (filteredLogs.length === 0) return { timeline: [], users: [] };
    const userCounts: Record<string, number> = {};
    const hourlyCounts: Record<string, number> = {};

    for (let i = 0; i < 24; i++) hourlyCounts[`${i}:00`] = 0;

    filteredLogs.forEach(log => {
      userCounts[log.userName] = (userCounts[log.userName] || 0) + 1;
      const date = new Date(log.timestamp);
      const hour = `${date.getHours()}:00`;
      hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1;
    });

    return {
      users: Object.entries(userCounts).map(([name, value]) => ({ name, value })),
      timeline: Object.entries(hourlyCounts).sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    };
  }, [filteredLogs]);

  const lineOption = {
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(15, 23, 42, 0.95)', borderWidth: 0, textStyle: { color: '#fff', fontSize: 12, fontWeight: 'bold' }, formatter: '{b}: {c} כניסות מאובטחות' },
    grid: { top: '8%', left: '4%', right: '4%', bottom: '8%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: chartData.timeline.map(d => d[0]), axisLine: { show: false }, axisLabel: { color: '#94a3b8', fontSize: 10, fontWeight: '800', fontFamily: 'monospace' } },
    yAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } }, axisLabel: { color: '#94a3b8', fontWeight: '700' }, axisLine: { show: false } },
    series: [{
      data: chartData.timeline.map(d => d[1]),
      type: 'line',
      smooth: 0.4,
      symbolSize: 6,
      itemStyle: { color: '#2563eb' },
      lineStyle: { width: 4, color: '#2563eb' },
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(37, 99, 235, 0.35)' }, { offset: 1, color: 'rgba(37, 99, 235, 0)' }] } }
    }]
  };

  const pieOption = {
    tooltip: { trigger: 'item', backgroundColor: 'rgba(15, 23, 42, 0.95)', borderWidth: 0, textStyle: { color: '#fff', fontWeight: 'bold', fontSize: 12 }, formatter: '{b}: {c} הפעלות ({d}%)' },
    series: [{
      type: 'pie',
      radius: ['55%', '82%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 12, borderColor: '#fff', borderWidth: 3 },
      label: { show: false },
      data: chartData.users,
      color: ['#2563eb', '#4f46e5', '#06b6d4', '#6366f1', '#1d4ed8', '#64748b']
    }]
  };

  if (isAuthorized === null || isLoading) return (
    <div className="flex h-screen w-full items-center justify-center bg-transparent">
      <Activity className="h-16 w-16 text-blue-600 animate-spin" />
    </div>
  );

  return (
    <div className="w-full max-w-[1400px] mx-auto p-4 md:p-8 space-y-8 font-sans" dir="rtl">

      {/* Header Summary */}
      <div className="w-full bg-slate-900 p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden border-b-[12px] border-blue-600">
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px]"></div>
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-8">
          <div className="text-right">
            <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none mb-3">ניטור גישה מרכזי</h2>
            <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.4em] flex items-center gap-2 italic">
                <ShieldCheck size={18} className="text-blue-500" />
                Audit Logs // Real-time Telemetry v2.6
            </p>
          </div>
          
          <div className="flex items-center gap-6 bg-white/5 backdrop-blur-md px-8 py-4 rounded-[2.5rem] border border-white/10">
            <div className="text-center">
              <span className="block text-blue-400 text-[9px] font-black uppercase mb-1 tracking-widest italic">Total Operations</span>
              <span className="text-5xl font-black text-white font-mono tracking-tighter leading-none">{filteredLogs.length}</span>
            </div>
            <div className="bg-blue-600 p-4 rounded-3xl shadow-xl">
              <Users className="text-white h-8 w-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Row */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        <div className="bg-white p-8 rounded-[3.5rem] border-none shadow-xl hover:shadow-2xl transition-all">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-blue-50 rounded-2xl text-blue-600 border border-blue-100"><Activity size={20} /></div>
              <h3 className="font-black text-slate-900 text-2xl italic tracking-tighter uppercase leading-none text-right">דופק תעבורה שעתית</h3>
            </div>
          </div>
          <ReactECharts option={lineOption} style={{ height: '340px' }} />
        </div>

        <div className="bg-white p-8 rounded-[3.5rem] border-none shadow-xl hover:shadow-2xl transition-all">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600 border border-indigo-100"><PieChart size={20} /></div>
              <h3 className="font-black text-slate-900 text-2xl italic tracking-tighter uppercase leading-none text-right">פילוח משתמשי קצה</h3>
            </div>
          </div>
          <ReactECharts option={pieOption} style={{ height: '340px' }} />
        </div>
      </div>

      {/* Log Feed */}
      <div className="w-full bg-white p-8 rounded-[3.5rem] shadow-xl border-none relative z-10 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pb-4 border-b border-slate-100">
           <div className="flex items-center gap-4">
              <div className="p-4 bg-slate-900 text-blue-400 rounded-2xl shadow-lg">
                <Activity size={24} />
              </div>
              <div className="text-right">
                <h3 className="font-black text-slate-900 text-2xl italic tracking-tighter uppercase leading-none">יומן גישה בשידור חי</h3>
                <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] mt-1.5 italic">Encrypted Activity Log // STOCKHOLM_NODE</p>
              </div>
           </div>

           <div className="w-full md:w-[380px] relative">
              <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="חפש לפי שם משתמש..." 
                  className="w-full bg-slate-50 border border-slate-200 rounded-[1.6rem] px-5 py-4 text-sm font-bold text-slate-800 outline-none placeholder:text-slate-400 italic text-right pl-4"
              />
           </div>
        </div>

        <div className="space-y-4 max-h-[520px] overflow-y-auto">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log: any, index: number) => (
              <div key={index} className="group flex flex-col md:flex-row justify-between items-center p-6 rounded-[2.2rem] bg-slate-50 hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-6 w-full md:w-auto">
                  <div className="h-16 w-16 bg-white rounded-[1.5rem] flex items-center justify-center font-black text-slate-300 text-3xl border border-slate-100">
                    {log.userName ? log.userName.charAt(0).toUpperCase() : <User size={24} />}
                  </div>
                  <div className="text-right flex-1">
                    <p className="font-black text-slate-800 text-xl mb-1.5 italic">{log.userName}</p>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2 text-[11px] font-black text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-100">
                        <Clock size={14} className="text-blue-500" />
                        {new Date(log.timestamp).toLocaleString('he-IL')}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-black text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-100 font-mono">
                        <Globe size={14} className="text-indigo-500" />
                        {log.ip}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 px-6 py-3 bg-slate-900 text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck size={16} /> Secure Session
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20">
               <p className="text-md font-black italic text-slate-400 uppercase">לא נמצאו תוצאות אימות</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};