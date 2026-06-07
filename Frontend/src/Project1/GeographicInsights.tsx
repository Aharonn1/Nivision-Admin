import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from "framer-motion";
import ReactECharts from "echarts-for-react";
import dataService from '../Service/DataService';

// Shadcn UI
import { Badge } from "../ui/badge";

const GeographicInsights = () => {
  const { data: rawLeads, isLoading } = useQuery({
    queryKey: ["rawLeads"],
    queryFn: () => dataService.getRawLeadsData(),
    staleTime: 1000 * 60 * 5, 
  });

  const { chartData, totals } = useMemo(() => {
    if (!rawLeads || !Array.isArray(rawLeads)) return { chartData: [], totals: { amount: 0, leads: 0 } };

    const cityMap: { [key: string]: { amount: number, count: number } } = {};
    let totalAmount = 0;
    let totalValidLeads = 0;

    rawLeads.forEach((l: any) => {
      const amount = Number(l.amount) || 0;
      if (amount > 0) {
        const city = (l.city || 'לא צוין').trim();
        if (!cityMap[city]) cityMap[city] = { amount: 0, count: 0 };
        cityMap[city].amount += amount;
        cityMap[city].count += 1;
        totalAmount += amount;
        totalValidLeads += 1;
      }
    });

    const formatted = Object.keys(cityMap).map(city => ({
      name: city,
      value: cityMap[city].amount,
      leadCount: cityMap[city].count
    })).sort((a, b) => b.value - a.value);

    return { 
      chartData: formatted,
      totals: { amount: totalAmount, leads: totalValidLeads }
    };
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
                  הון פעיל: ₪${data.value.toLocaleString()}<br/>
                  כמות לידים: ${data.leadCount}
                </div>`;
      }
    },
    grid: { left: '3%', right: '15%', bottom: '5%', top: '5%', containLabel: true },
    xAxis: { type: 'value', splitLine: { show: false }, axisLabel: { show: false }, axisLine: { show: false } },
    yAxis: {
      type: 'category',
      data: chartData.map(d => d.name).reverse(),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#121931', fontWeight: '900', fontSize: 14, fontStyle: 'italic', margin: 20 }
    },
    series: [
      {
        type: 'bar',
        data: chartData.map(d => ({ name: d.name, value: d.value, leadCount: d.leadCount })).reverse(),
        barMaxWidth: 22,
        itemStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [{ offset: 0, color: '#f1f5f9' }, { offset: 1, color: '#6366f1' }]
          },
          borderRadius: [0, 20, 20, 0]
        },
        label: { show: true, position: 'right', formatter: (params: any) => `₪${params.value.toLocaleString()}`, fontWeight: '900', fontSize: 12, color: '#121931', fontFamily: 'monospace', distance: 10 }
      }
    ],
    animationDuration: 2000
  });

  if (isLoading) return (
    <div className="flex h-screen items-center justify-center font-black text-[#121931] animate-pulse italic uppercase tracking-[1.5em]">
      Scanning Geo Matrix... 🛰️
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="w-full max-w-[1400px] mx-auto h-auto p-4 md:p-8 space-y-8 font-sans" 
      dir="rtl"
    >
      
      {/* Header Matrix Style */}
      <div className="bg-[#121931] rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden border-b-8 border-indigo-600">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] -mr-40 -mt-40 pointer-events-none"></div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
                <div className="space-y-3 text-right">
                    <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.5em] italic leading-none">Geographic Potential Audit</p>
                    <h1 className="text-5xl font-black text-white tracking-tighter italic uppercase leading-none">פריסת הון גיאוגרפית</h1>
                </div>

                <div className="flex gap-8">
                    <div className="bg-white/5 border border-white/10 backdrop-blur-md p-8 rounded-[2.5rem] text-center min-w-[220px]">
                        <span className="text-slate-400 text-[10px] font-black tracking-widest uppercase block mb-2">סך הון פעיל במחוזות</span>
                        <div className="text-4xl font-black text-indigo-400 italic tracking-tighter font-mono">₪{totals.amount.toLocaleString()}</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] text-center min-w-[140px]">
                        <span className="text-slate-400 text-[10px] font-black tracking-widest uppercase block mb-2">פניות</span>
                        <div className="text-4xl font-black text-blue-400 italic tracking-tighter">{totals.leads}</div>
                    </div>
                </div>
            </div>
      </div>

      {/* Main Analysis Section - 🚀 הוסרו המסגרות והצללים */}
      <div className="w-full bg-white rounded-[3.5rem] overflow-hidden">
            <div className="px-12 py-10 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                <h3 className="text-2xl font-black italic text-[#121931] tracking-tight uppercase">Audit Trail: Regional Analysis</h3>
                <Badge className="bg-indigo-600 text-white font-black text-[10px] px-6 py-2 rounded-full uppercase tracking-widest">Live Sync</Badge>
            </div>
            
            <div className="p-12">
                <div style={{ height: Math.max(600, chartData.length * 50) }}>
                    <ReactECharts option={getOption()} style={{ height: '100%', width: '100%' }} />
                </div>
            </div>

            <div className="bg-slate-900 p-8 text-center">
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-[1.2em] italic">
                    Nivision Neural Engine • Geographic Intelligence Terminal
                </p>
            </div>
      </div>
    </motion.div>
  );
};

export default GeographicInsights;