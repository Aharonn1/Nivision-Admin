import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from "framer-motion";
import ReactECharts from "echarts-for-react";
import dataService from '../Service/DataService';

// Shadcn UI
import { Badge } from "../ui/badge";

const ConversionFunnel = () => {
  const { data: rawLeads, isLoading } = useQuery({
    queryKey: ["rawLeads"],
    queryFn: () => dataService.getRawLeadsData(),
    staleTime: 1000 * 60 * 5, 
  });

  const funnelData = useMemo(() => {
    if (!rawLeads || !Array.isArray(rawLeads)) return [];
    const validLeads = rawLeads.filter((l: any) => (Number(l.amount) || 0) > 0);
    const stats = {
      total: validLeads.length,
      engaged: validLeads.filter((l: any) => l.hs_lead_status && l.hs_lead_status !== 'NEW').length,
      inProgress: validLeads.filter((l: any) => l.hs_lead_status === 'IN_PROGRESS').length,
      closed: validLeads.filter((l: any) => l.hs_lead_status === 'closed').length
    };
    return [
      { name: 'לידים נכנסים', value: stats.total },
      { name: 'באינטראקציה', value: stats.engaged },
      { name: 'בטיפול פעיל', value: stats.inProgress },
      { name: 'עסקאות סגורות', value: stats.closed }
    ];
  }, [rawLeads]);

  const getOption = () => ({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#121931',
      textStyle: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
      borderRadius: 12,
      padding: 12,
      formatter: (params: any) => {
        const data = params[0].data;
        return `<div style="text-align:right;">
                  <b style="color:#6366f1; font-size:14px;">${data.name}</b><br/>
                  כמות: ${data.value.toLocaleString()}<br/>
                  אחוז מהסך: ${((data.value / funnelData[0].value) * 100).toFixed(1)}%
                </div>`;
      }
    },
    grid: { left: '3%', right: '12%', bottom: '5%', top: '5%', containLabel: true },
    xAxis: { type: 'value', splitLine: { show: false }, axisLabel: { show: false }, axisLine: { show: false } },
    yAxis: {
      type: 'category',
      data: funnelData.map(d => d.name).reverse(),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#121931', fontWeight: '900', fontSize: 14, fontStyle: 'italic', margin: 20 }
    },
    series: [
      {
        type: 'bar',
        data: funnelData.map(d => ({ name: d.name, value: d.value })).reverse(),
        barMaxWidth: 35,
        itemStyle: {
          color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: '#f1f5f9' }, { offset: 1, color: '#6366f1' }] },
          borderRadius: [0, 20, 20, 0]
        },
        label: { show: true, position: 'right', fontWeight: '900', fontSize: 14, color: '#121931', fontFamily: 'monospace', distance: 15 }
      }
    ]
  });

  if (isLoading) return (
    <div className="flex h-screen items-center justify-center font-black text-[#121931] animate-pulse italic uppercase tracking-[1.5em]">
      Analyzing Funnel Matrix... 🌪️
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-[1400px] mx-auto p-4 md:p-8 space-y-8 font-sans" dir="rtl">
      
      {/* Header Matrix Style */}
      <div className="bg-[#121931] rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden border-b-8 border-indigo-600">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] -mr-40 -mt-40"></div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
                <div className="space-y-3">
                    <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.5em] italic leading-none">Conversion Efficiency Audit</p>
                    <h1 className="text-5xl font-black text-white tracking-tighter italic uppercase leading-none">משפך המרה דינמי</h1>
                </div>

                <div className="flex gap-8">
                    <div className="bg-white/5 border border-white/10 backdrop-blur-md p-8 rounded-[2.5rem] text-center min-w-[200px]">
                        <span className="text-slate-400 text-[10px] font-black tracking-widest uppercase block mb-2">סה"כ לידים נכנסים</span>
                        <div className="text-4xl font-black text-indigo-400 italic tracking-tighter font-mono">{funnelData[0]?.value || 0}</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] text-center min-w-[200px]">
                        <span className="text-slate-400 text-[10px] font-black tracking-widest uppercase block mb-2">אחוז סגירה סופי</span>
                        <div className="text-4xl font-black text-blue-400 italic tracking-tighter font-mono">
                          {funnelData[0]?.value > 0 ? ((funnelData[3]?.value / funnelData[0]?.value) * 100).toFixed(1) : 0}%
                        </div>
                    </div>
                </div>
            </div>
      </div>

      {/* Main Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* הגרף */}
        <div className="lg:col-span-3 bg-white rounded-[4rem] shadow-xl overflow-hidden">
            <div className="px-12 py-10 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
                <h3 className="text-2xl font-black italic text-[#121931] tracking-tight uppercase leading-none">נפח לידים לפי שלבי תפעול</h3>
                <Badge className="bg-indigo-600 text-white font-black text-[10px] px-6 py-2 rounded-full uppercase tracking-widest">Efficiency Sync</Badge>
            </div>
            <div className="p-12 h-[550px]">
                <ReactECharts option={getOption()} style={{ height: '100%', width: '100%' }} />
            </div>
            <div className="bg-slate-900 p-8 text-center">
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-[1.2em] italic">Nivision Matrix Intelligence • Funnel Audit Control 2026</p>
            </div>
        </div>

        {/* כרטיסי אחוזים */}
        <div className="flex flex-col gap-4">
            {[...funnelData].map((item, index) => (
                <motion.div 
                    key={index}
                    whileHover={{ scale: 1.03, x: -5 }}
                    className="bg-white p-8 rounded-[2.5rem] shadow-lg flex flex-col justify-center h-full"
                >
                    <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-2 italic leading-none">{item.name}</div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-[#121931] italic leading-none">
                            {funnelData[0].value > 0 ? ((item.value / funnelData[0].value) * 100).toFixed(0) : 0}
                        </span>
                        <span className="text-sm font-black text-indigo-500 uppercase italic leading-none">% מהצנרת</span>
                    </div>
                </motion.div>
            ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ConversionFunnel;