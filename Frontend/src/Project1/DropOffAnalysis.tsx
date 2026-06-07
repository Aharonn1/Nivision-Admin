import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from "framer-motion";
import ReactECharts from "echarts-for-react";
import dataService from '../Service/DataService';

const DropOffAnalysis = () => {
  const { data: rawLeads, isLoading } = useQuery({
    queryKey: ["rawLeads"],
    queryFn: () => dataService.getRawLeadsData(),
    staleTime: 1000 * 60 * 5,
  });

  const processedData = useMemo(() => {
    if (!rawLeads || !Array.isArray(rawLeads)) {
      return { chartData: [], totalLostAmount: 0, totalDroppedLeads: 0, summaryList: [], topReason: "אין מידע", topPurposeByCount: "אין מידע", topPurposeByAmount: "אין מידע" };
    }

    const now = new Date();
    const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;

    const droppedLeads = rawLeads.filter((l: any) => {
      const status = String((l as any).hs_lead_status || "").toLowerCase();
      const amount = parseFloat(String((l as any).amount).replace(/[^0-9.-]+/g, "")) || 0;
      const createdAt = new Date((l as any).createdat);
      return status !== 'closed' && amount > 0 && (now.getTime() - createdAt.getTime()) > TWO_WEEKS_MS;
    });

    const reasonsMap: { [key: string]: { count: number, amount: number } } = {};
    const purposesMap: { [key: string]: { count: number, amount: number } } = {};

    droppedLeads.forEach((l: any) => {
      const outcome = (l as any).postcall_outcome || "לא צוינה סיבה";
      const purpose = (l as any).loan_purpose || "לא הוגדר";
      const amount = parseFloat(String((l as any).amount).replace(/[^0-9.-]+/g, "")) || 0;
      
      if (!reasonsMap[outcome]) reasonsMap[outcome] = { count: 0, amount: 0 };
      reasonsMap[outcome].count += 1;
      reasonsMap[outcome].amount += amount;

      if (!purposesMap[purpose]) purposesMap[purpose] = { count: 0, amount: 0 };
      purposesMap[purpose].count += 1;
      purposesMap[purpose].amount += amount;
    });

    const summaryList = Object.keys(reasonsMap).map(key => ({ name: key, ...reasonsMap[key] }));
    const topReason = summaryList.length > 0 ? summaryList.reduce((prev, curr) => (prev.amount > curr.amount) ? prev : curr).name : "אין מידע";
    
    // זיהוי תחום עם הכי הרבה אי-סגירות (לפי כמות)
    const topPurposeByCount = Object.keys(purposesMap).length > 0 
      ? Object.keys(purposesMap).reduce((a, b) => purposesMap[a].count > purposesMap[b].count ? a : b) 
      : "אין מידע";

    // זיהוי תחום עם הכי הרבה הפסד כספי (לפי סכום)
    const topPurposeByAmount = Object.keys(purposesMap).length > 0 
      ? Object.keys(purposesMap).reduce((a, b) => purposesMap[a].amount > purposesMap[b].amount ? a : b) 
      : "אין מידע";

    return { 
      chartData: Object.keys(reasonsMap).map(key => ({ name: key, value: reasonsMap[key].amount })),
      summaryList,
      totalLostAmount: droppedLeads.reduce((acc, curr) => acc + (parseFloat(String((curr as any).amount).replace(/[^0-9.-]+/g, "")) || 0), 0),
      totalDroppedLeads: droppedLeads.length,
      topReason,
      topPurposeByCount,
      topPurposeByAmount
    };
  }, [rawLeads]);

  if (isLoading) return <div className="flex h-screen items-center justify-center font-black">Loading Audit...</div>;

  return (
    <div className="w-full max-w-[1400px] mx-auto p-8 font-sans" dir="rtl">
      <div className="bg-[#121931] p-10 rounded-[2.5rem] mb-8 shadow-2xl border-b-8 border-red-500">
        <h1 className="text-4xl font-black text-white italic tracking-tighter">ניתוח נטישה - לידים "תקועים" (14+ יום)</h1>
        <div className="grid grid-cols-2 gap-4 mt-4 text-red-400 font-bold italic">
            <span>סך הון בסיכון: ₪{processedData.totalLostAmount.toLocaleString()}</span>
            <span>מוקד בעייתי: {processedData.topReason}</span>
            <span>שיא אי-סגירות (כמות): {processedData.topPurposeByCount}</span>
            <span>שיא הפסד כספי (סכום): {processedData.topPurposeByAmount}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 flex items-center justify-center">
            <ReactECharts option={{
                tooltip: { trigger: 'item', backgroundColor: '#121931', textStyle: { color: '#fff' }, formatter: "{b}<br/>סכום: ₪{c}<br/>אחוז מכלל האובדן: {d}%" },
                graphic: [
                    { type: 'text', left: 'center', top: '40%', style: { text: 'לידים תקועים', fill: '#64748b', font: '12px sans-serif' } },
                    { type: 'text', left: 'center', top: '55%', style: { text: processedData.totalDroppedLeads.toString(), fill: '#121931', font: '900 60px sans-serif' } }
                ],
                series: [{
                    type: 'pie',
                    radius: ['60%', '80%'],
                    color: ['#1e293b', '#334155', '#475569', '#64748b', '#94a3b8'],
                    label: { show: false },
                    data: processedData.chartData
                }]
            }} style={{ height: '400px', width: '100%' }} />
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100">
            <h2 className="font-black mb-6 text-xl text-[#121931]">פירוט נטישות לפי סיבה</h2>
            <div className="space-y-3">
                {processedData.summaryList.map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border-r-4 border-[#121931]">
                        <span className="text-sm font-bold truncate ml-4">{item.name}</span>
                        <div className="flex gap-6 text-right shrink-0">
                            <div><span className="text-[9px] text-gray-400 block uppercase">לקוחות</span><span className="font-black">{item.count}</span></div>
                            <div className="w-24"><span className="text-[9px] text-gray-400 block uppercase">סכום</span><span className="font-black text-red-600">₪{(item.amount/1000).toFixed(0)}k</span></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default DropOffAnalysis;