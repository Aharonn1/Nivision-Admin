import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from "framer-motion";
import ReactECharts from "echarts-for-react";
import dataService from '../Service/DataService';
import { Badge } from "../ui/badge";

const RepaymentInsights = () => {
  const { data: rawLeads, isLoading } = useQuery({
    queryKey: ["rawLeads"],
    queryFn: () => dataService.getRawLeadsData(),
    staleTime: 1000 * 60 * 5,
  });

  const { chartData, stats, tableData } = useMemo(() => {
    if (!rawLeads || !Array.isArray(rawLeads)) {
      return { chartData: [], stats: { avg: 0, count: 0, topBracket: 'N/A' }, tableData: [] };
    }

    const closedLeads = rawLeads.filter((l: any) => 
      (l.hs_lead_status === 'closed' || l.hs_lead_status === 'סגור')
    );
    const tableData = closedLeads.map((l: any) => {
      // ניקוי הריבית: הסרת סימן % והמרה למספר
      const rawInterest = (l.interestrate || "0").toString().replace('%', '');
      
      return {
        id: l.hs_object_id || l.id || Math.random(),
        name: `${l.firstname || ''} ${l.lastname || ''}`.trim() || "לקוח",
        amount: Number(l.amount) || 0,
        interest: Number(rawInterest) || 0, // עכשיו זה יציג 8 במקום 0
        repayment: Number((l as any).monthlyrepayment) || 0
      };
    });

    const totalRepayments = closedLeads.reduce((acc, curr) => acc + (Number((curr as any).monthlyrepayment) || 0), 0);
    const average = closedLeads.length > 0 ? totalRepayments / closedLeads.length : 0;

    const brackets = [{ name: 'עד 1.5K', count: 0 }, { name: '1.5-3K', count: 0 }, { name: '3-5K', count: 0 }, { name: '5-8K', count: 0 }, { name: 'מעל 8K', count: 0 }];
    closedLeads.forEach((l: any) => {
      const val = Number((l as any).monthlyrepayment) || 0;
      if (val <= 1500) brackets[0].count++;
      else if (val <= 3000) brackets[1].count++;
      else if (val <= 5000) brackets[2].count++;
      else if (val <= 8000) brackets[3].count++;
      else brackets[4].count++;
    });

    return { 
      chartData: brackets, 
      stats: { 
        avg: Math.round(average), 
        count: closedLeads.length, 
        topBracket: brackets.sort((a,b) => b.count - a.count)[0]?.name || 'N/A' 
      }, 
      tableData 
    };
  }, [rawLeads]);

  const getOption = () => ({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: chartData.map(d => d.name), axisLabel: { fontWeight: 'bold' } },
    yAxis: { type: 'value' },
    series: [{
      data: chartData.map(d => d.count),
      type: 'bar',
      itemStyle: { color: '#6366f1', borderRadius: [8, 8, 0, 0] }
    }]
  });

  if (isLoading) return <div className="p-20 text-center font-black text-indigo-600">טוען נתונים...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-[1400px] mx-auto p-8 space-y-8" dir="rtl">
      <div className="bg-[#121931] rounded-[2.5rem] p-10 text-white shadow-2xl">
        <h1 className="text-4xl font-black italic">ניתוח תשלומי החזר</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
          <ReactECharts option={getOption()} style={{ height: '400px' }} />
        </div>
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-[#121931] p-8 rounded-[2rem] text-white">
            <h4 className="text-indigo-400 font-black text-xs uppercase mb-2">תובנה אסטרטגית</h4>
            <p className="font-bold">ריכוז התיקים המרכזי: {stats.topBracket}</p>
          </div>
          <div className="bg-[#121931] p-8 rounded-[2rem] text-white">
            <h4 className="text-pink-500 font-black text-xs uppercase mb-2">בקרת סיכונים</h4>
            <p className="font-bold">ממוצע החזר: ₪{stats.avg.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
        <h3 className="text-xl font-black mb-6">פירוט עסקאות סגורות</h3>
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="text-slate-400 text-[10px] uppercase tracking-widest border-b border-slate-100">
              <th className="py-4">שם לקוח</th>
              <th className="py-4">סכום הלוואה</th>
              <th className="py-4">ריבית</th>
              <th className="py-4">החזר חודשי</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tableData.map((row: any) => (
              <tr key={row.id}>
                <td className="py-4 font-black">{row.name}</td>
                <td className="py-4 font-bold">₪{row.amount.toLocaleString()}</td>
                <td className="py-4 font-bold text-indigo-600">{row.interest}%</td>
                <td className="py-4 font-black">₪{row.repayment.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default RepaymentInsights;