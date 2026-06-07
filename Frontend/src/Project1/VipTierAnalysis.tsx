import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import ReactECharts from "echarts-for-react";
import { motion } from "framer-motion";
import dataService from '../Service/DataService';

const VipTierAnalysis = () => {
  const { data: rawLeads, isLoading } = useQuery({
    queryKey: ["rawLeads"],
    queryFn: () => dataService.getRawLeadsData(),
    staleTime: 1000 * 60 * 5,
  });

  const { chartData, vipStats, breakdown } = useMemo(() => {
    if (!rawLeads || !Array.isArray(rawLeads)) {
      return { 
        chartData: [], 
        vipStats: { vipCount: 0, regCount: 0, vipShare: "0", avgVipAmount: 0, vipAvgScore: 0 },
        breakdown: { scoreOnly: 0, amountOnly: 0, both: 0 }
      };
    }

    const parseAmount = (val: any) => parseFloat(String(val).replace(/[^0-9.-]+/g, "")) || 0;
    const closedLeads = rawLeads.filter((l: any) => String(l.hs_lead_status || "").toLowerCase() === 'closed');
    const scoreOver90 = closedLeads.filter((l: any) => Number(l.leadscore) >= 90);
    const amountOver500k = closedLeads.filter((l: any) => parseAmount(l.amount) >= 500000);
    const both = closedLeads.filter((l: any) => Number(l.leadscore) >= 90 && parseAmount(l.amount) >= 500000);

    const isVip = (l: any) => (Number(l.leadscore) >= 90 || parseAmount(l.amount) >= 500000);
    const vipLeads = closedLeads.filter(isVip);
    const regularLeads = closedLeads.filter((l: any) => !isVip(l));
    
    const vipTotalAmount = vipLeads.reduce((acc, curr) => acc + parseAmount((curr as any).amount), 0);
    const regTotalAmount = regularLeads.reduce((acc, curr) => acc + parseAmount((curr as any).amount), 0);

    return { 
      chartData: [
        { name: 'לקוחות VIP', value: vipTotalAmount, color: '#fbbf24' }, 
        { name: 'לקוחות רגילים', value: regTotalAmount, color: '#e2e8f0' }
      ], 
      vipStats: {
        vipCount: vipLeads.length,
        regCount: regularLeads.length,
        vipShare: (vipLeads.length + regularLeads.length) > 0 
                  ? ((vipLeads.length / (vipLeads.length + regularLeads.length)) * 100).toFixed(0) 
                  : "0",
        avgVipAmount: vipLeads.length > 0 ? Math.round(vipTotalAmount / vipLeads.length) : 0,
        vipAvgScore: Math.round(vipLeads.reduce((acc, curr) => acc + (Number((curr as any).leadscore) || 0), 0) / (vipLeads.length || 1))
      },
      breakdown: {
        scoreOnly: scoreOver90.length - both.length,
        amountOnly: amountOver500k.length - both.length,
        both: both.length
      }
    };
  }, [rawLeads]);

  if (isLoading) return <div className="flex h-screen items-center justify-center font-black italic">Loading Matrix...</div>;

  return (
    <div dir="rtl" className="w-full max-w-[1400px] mx-auto p-8 space-y-8 font-sans">
      {/* Header */}
      <div className="bg-[#121931] rounded-[3.5rem] p-12 shadow-2xl border-b-8 border-yellow-600">
        <h1 className="text-5xl font-black text-white italic uppercase">ניתוח סגמנט VIP</h1>
        <p className="text-slate-400 font-bold italic mt-2">קריטריונים: הלוואות סגורות בלבד | ציון 90+ או סכום 500k+</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white rounded-[3rem] p-10 shadow-xl">
           <ReactECharts option={{
                tooltip: { trigger: 'item', backgroundColor: '#121931', textStyle: { color: '#fff' }, borderRadius: 12 },
                // הוספת הנתון למרכז הגרף
                graphic: [{
                    type: 'text',
                    left: 'center',
                    top: 'center',
                    style: {
                        text: `${vipStats.vipShare}%\nVIP`,
                        textAlign: 'center',
                        fill: '#121931',
                        font: 'bold 40px sans-serif'
                    }
                }],
                series: [{ 
                    type: 'pie', 
                    radius: ['60%', '80%'], 
                    data: chartData.map(d => ({ value: d.value, name: d.name, itemStyle: { color: d.color } })) 
                }]
             }} style={{ height: '400px' }} />
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6 h-full">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-[2rem] shadow-lg text-center border border-slate-100">
                <div className="text-[10px] text-slate-400 font-black uppercase">VIP</div>
                <div className="text-2xl font-black text-yellow-500">{vipStats.vipCount}</div>
            </div>
            <div className="bg-white p-6 rounded-[2rem] shadow-lg text-center border border-slate-100">
                <div className="text-[10px] text-slate-400 font-black uppercase">רגילים</div>
                <div className="text-2xl font-black text-slate-600">{vipStats.regCount}</div>
            </div>
          </div>
          <motion.div whileHover={{ scale: 1.02 }} className="bg-white p-8 rounded-[2rem] shadow-lg border border-slate-100">
             <div className="text-[10px] text-slate-400 font-black uppercase mb-4">פילוח קריטריונים</div>
             <div className="space-y-3 text-sm">
               <div className="flex justify-between font-bold text-slate-600"><span>ציון 90+ בלבד:</span><span>{breakdown.scoreOnly}</span></div>
               <div className="flex justify-between font-bold text-slate-600"><span>סכום 500k+ בלבד:</span><span>{breakdown.amountOnly}</span></div>
               <div className="flex justify-between font-black text-yellow-600 pt-3 border-t border-slate-100"><span>משולב (גם וגם):</span><span>{breakdown.both}</span></div>
             </div>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} className="bg-[#121931] text-white p-8 rounded-[2rem] shadow-lg mt-auto">
             <div className="text-[10px] text-slate-400 font-black uppercase mb-1">שווי תיק VIP ממוצע</div>
             <div className="text-3xl font-black italic">₪{vipStats.avgVipAmount.toLocaleString()}</div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default VipTierAnalysis;