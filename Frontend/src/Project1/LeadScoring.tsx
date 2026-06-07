import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from "framer-motion";
import ReactECharts from "echarts-for-react";
import dataService from '../Service/DataService';

// Shadcn UI
import { Badge } from "../ui/badge";

const LeadScoring = () => {
  const { data: rawLeads, isLoading: isLeadsLoading } = useQuery({
    queryKey: ["rawLeads"],
    queryFn: () => dataService.getRawLeadsData(),
    staleTime: 1000 * 60 * 5,
  });

  const { data: financialStats } = useQuery({
    queryKey: ["financialStats"],
    queryFn: () => dataService.getFinancialStats(),
  });

  const { chartData, hotLeads, statsInfo } = useMemo(() => {
    if (!rawLeads || !Array.isArray(rawLeads)) return { chartData: [], hotLeads: [], statsInfo: { rate: 4 } };

    const rate = financialStats?.interest_rate_fixed ? parseFloat(financialStats.interest_rate_fixed) : 4;
    const hot = rawLeads
      .filter((l: any) => (Number(l.leadscore) || 0) >= 85 && l.hs_lead_status !== 'closed')
      .sort((a: any, b: any) => (Number(b.amount) || 0) - (Number(a.amount) || 0))
      .slice(0, 5);

    const ranges = [
      { name: '0-20', count: 0 }, { name: '21-40', count: 0 },
      { name: '41-60', count: 0 }, { name: '61-80', count: 0 },
      { name: '81-100', count: 0 }
    ];

    rawLeads.forEach((l: any) => {
      const score = Number(l.leadscore) || 0;
      const idx = Math.min(Math.floor(score / 20.1), 4);
      ranges[idx].count++;
    });

    return { chartData: ranges, hotLeads: hot, statsInfo: { rate } };
  }, [rawLeads, financialStats]);

  const getOption = () => ({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#121931',
      textStyle: { color: '#fff', fontSize: 11 },
      borderRadius: 12,
      padding: 8,
      formatter: (params: any) => `<div style="text-align:right;">איכות ${params[0].name}<br/><b>${params[0].value} לידים</b></div>`
    },
    grid: { left: '5%', right: '5%', bottom: '10%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: chartData.map(d => d.name),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#121931', fontWeight: '900', fontSize: 10 }
    },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } }, axisLabel: { show: false }, axisLine: { show: false } },
    series: [{
      name: 'כמות',
      type: 'line',
      smooth: true,
      data: chartData.map(d => d.count),
      symbolSize: 6,
      itemStyle: { color: '#6366f1' },
      lineStyle: { width: 3, color: '#6366f1' },
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(99, 102, 241, 0.25)' }, { offset: 1, color: 'rgba(99, 102, 241, 0)' }] } }
    }]
  });

  if (isLeadsLoading) return <div className="h-screen flex items-center justify-center font-black text-[#121931] animate-pulse italic uppercase tracking-[1.5em]">Loading Intelligence Matrix...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-[1400px] mx-auto h-auto p-4 md:p-8 space-y-8 font-sans" dir="rtl">
      
      {/* Header Matrix Style */}
      <div className="bg-[#121931] rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden border-b-8 border-indigo-600">
        <div className="absolute top-0 right-0 w-80 h-full bg-indigo-500/5 blur-[100px] pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="space-y-2 text-right">
                <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.5em] mb-1 italic">Quality & Retention Audit</p>
                <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none text-white">ניתוח איכות צנרת</h2>
                <Badge className="bg-indigo-500/20 text-indigo-300 border-none px-4 py-1 text-[10px] uppercase font-black">AI Scoring System</Badge>
            </div>
            <div className="bg-white/5 border border-white/10 backdrop-blur-md p-6 rounded-[2rem] text-center min-w-[180px]">
                <div className="text-[9px] text-slate-400 font-black uppercase mb-1 tracking-widest">מודל ריבית אסטרטגי</div>
                <div className="text-3xl font-black text-indigo-400 font-mono italic leading-none">{statsInfo.rate}%</div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* גרף איכות */}
        <div className="lg:col-span-8 bg-white rounded-[3.5rem] shadow-xl flex flex-col min-h-[580px]">
          <div className="p-10 pb-0 flex justify-between items-center">
            <h3 className="text-xl font-black italic text-[#121931] uppercase tracking-tight">התפלגות LeadScore</h3>
          </div>
          <div className="flex-1 px-6">
            <ReactECharts option={getOption()} style={{ height: '380px', width: '100%' }} />
          </div>
          <div className="p-8 mt-auto border-t border-slate-50">
             <p className="text-[10px] font-bold text-slate-400 italic uppercase tracking-widest text-center">Nivision Data Engine • Live Distribution Scan</p>
          </div>
        </div>

        {/* לידים חמים */}
        <div className="lg:col-span-4 bg-[#121931] rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden flex flex-col border-b-8 border-orange-500 min-h-[580px]">
          <div className="absolute top-0 right-0 w-32 h-full bg-orange-500/5 blur-[60px] pointer-events-none"></div>
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <h4 className="text-[10px] font-black text-orange-400 uppercase tracking-[0.3em] italic leading-none">🔥 לידים חמים (Top 5)</h4>
          </div>
          
          <div className="space-y-6 relative z-10 flex-1">
            <AnimatePresence>
              {hotLeads.map((lead: any, index: number) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: -5 }}
                  className="flex justify-between items-center cursor-default border-b border-white/5 pb-5 last:border-0"
                >
                  <div className="space-y-1.5">
                    <div className="text-base font-black text-white italic leading-none">{lead.firstname || 'לקוח'} {lead.lastname || ''}</div>
                    <div className="inline-flex bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 rounded-lg font-black italic text-[8px]">
                      SCORE: {lead.leadscore || 0}
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-lg font-mono font-black text-white tracking-tighter italic leading-none">
                      ₪{(Number(lead.amount) || 0).toLocaleString()}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LeadScoring;