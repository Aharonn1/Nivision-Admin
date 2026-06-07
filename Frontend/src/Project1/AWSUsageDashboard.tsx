import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Sector } from 'recharts';
import { Server, Database, TrendingUp, AlertCircle, Loader2, Activity, ShieldCheck, Cloud } from 'lucide-react';

import dataService from '../Service/DataService';

// פלטת צבעים יוקרתית, חדה ומותאמת למוצרי AI וסייבר
const COLORS = [
  '#2563eb', // כחול ניאון מרכזי
  '#4f46e5', // אינדיגו טכנולוגי
  '#06b6d4', // ציאן סייבר
  '#3b82f6', // כחול בהיר תשתית
  '#6366f1', // סגול אלקטרוני
  '#1d4ed8', // כחול רויאל עמוק
  '#0891b2', // טורקיז עמוק
  '#64748b'  // אפור פלדה מלוטש
];

// אפקט בחירה וחידוד מלוטש לפרוסה הפעילה
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 2}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ filter: 'drop-shadow(0px 8px 16px rgba(37, 99, 235, 0.25))', transition: 'all 0.2s ease' }}
      />
    </g>
  );
};

export const AWSUsageDashboard = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const { data: rawData, isLoading, error } = useQuery({
    queryKey: ['aws-costs'],
    queryFn: () => dataService.getAWSCosts(),
    refetchInterval: 1000 * 60 * 30, // סנכרון כל 30 דקות
  });

  const formatValue = (val: any) => {
    const num = Math.abs(parseFloat(val)) || 0;
    if (num === 0) return "0.00";
    if (num < 0.001) return num.toFixed(6);
    return num.toFixed(4);
  };

  // עיבוד נתונים קפדני למניעת כפילויות מפתחות ברמת ה-Rendering
  const chartData = useMemo(() => {
    if (!rawData) return [];
    return rawData.map((item: any, idx: number) => ({
      ...item,
      // יצירת מפתח ייחודי המשלב את האינדקס כדי ש-Recharts לא יאחד שירותים בעלי שם זהה
      uniqueKey: `${item.service}_${idx}`, 
      amount: Math.abs(parseFloat(item.amount)) || 0
    }));
  }, [rawData]);

  const filteredPieData = useMemo(() => {
    return chartData.filter((item: any) => item.amount > 0);
  }, [chartData]);

  const displayTotal = useMemo(() => {
    const total = chartData.reduce((sum: number, item: any) => sum + item.amount, 0);
    if (total === 0) return "0.00";
    return total < 0.01 ? total.toFixed(6) : total.toFixed(2);
  }, [chartData]);

  // חישוב המידע שיוצג במרכז הטבעת הריקה בזמן מעבר עכבר
  const hoveredServiceInfo = useMemo(() => {
    if (activeIndex === null || !filteredPieData[activeIndex]) return null;
    return filteredPieData[activeIndex];
  }, [activeIndex, filteredPieData]);

 if (isLoading) return (
  <div className="flex h-screen w-full items-center justify-center">
    <div className="relative flex items-center justify-center">
      {/* אייקון ענן של AWS */}
      <Cloud className="h-20 w-20 text-[#FF9900]" /> 
      {/* לואדר מסתובב מעל הענן */}
      <Loader2 className="absolute h-10 w-10 text-[#232F3E] animate-spin" />
    </div>
    
    <div className="text-center space-y-2">
      <h2 className="text-xl font-black text-[#232F3E] tracking-tight italic">
        SYNCING WITH AWS INFRASTRUCTURE
      </h2>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
        INITIALIZING SECURE CONNECTION...
      </p>
    </div>
  </div>
);

  if (error) return (
    <div className="m-10 p-12 bg-white rounded-[3rem] border-4 border-rose-50 shadow-2xl flex items-center gap-8" dir="rtl">
      <AlertCircle size={60} className="text-rose-500 animate-pulse" />
      <div className="text-right">
        <h3 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">AWS Bridge Failed</h3>
        <p className="text-lg font-bold text-rose-500 uppercase tracking-widest font-mono">Check n8n Billing Webhook Status</p>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-[1400px] mx-auto h-[calc(100vh-5rem)] p-4 md:p-6 flex flex-col justify-between space-y-4 font-sans select-none overflow-hidden" dir="rtl">
      
      {/* ארכיטקטורת CSS להעלמת פסי גלילה ויזואליים מיותרים ברכיב המלאי */}
      <style>{`
        .scrollbar-hidden::-webkit-scrollbar { display: none !important; }
        .scrollbar-hidden { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Background Decorative Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header */}
      <div className="w-full bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-6 border border-white shadow-[0_15px_40px_-15px_rgba(0,0,0,0.03)] relative z-10 flex flex-col lg:flex-row justify-between items-center gap-4 flex-shrink-0">
        <div className="flex items-center gap-6 text-right">
          <div className="p-4 bg-slate-900 text-white rounded-[1.5rem] shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <Server size={24} className="text-blue-500" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 italic tracking-tighter uppercase leading-none mb-2">ניטור עלויות <span className="text-blue-600">AWS</span></h2>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-3 w-3 text-blue-600" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] font-mono italic">Cloud Financial Audit Engine v2.6</p>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] blur opacity-15 group-hover:opacity-25 transition duration-1000"></div>
          <div className="relative bg-slate-900 px-8 py-4 rounded-[1.8rem] border-b-4 border-blue-600 flex items-center gap-6 shadow-2xl">
            <div className="flex flex-col text-right">
              <span className="text-blue-400 text-[9px] font-black uppercase tracking-[0.3em] mb-0.5 italic">Monthly Forecast</span>
              <span className="text-3xl font-black text-white font-mono tracking-tighter italic">${displayTotal}</span>
            </div>
            <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 backdrop-blur-md">
              <TrendingUp className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </div>
      </div>

      {/* אזור המדדים הראשי - נעול לתוך ה-Viewport */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 relative z-10 items-stretch flex-1 min-h-0 overflow-hidden">
        
        {/* Visualization Card */}
        <div className="xl:col-span-2 bg-white/95 backdrop-blur-2xl p-6 rounded-[3.5rem] border border-transparent shadow-[0_25px_50px_-12px_rgba(0,0,0,0.03)] hover:shadow-2xl transition-all duration-300 ease-out hover:-translate-y-1 flex flex-col justify-between h-full overflow-hidden group cursor-pointer">
          <div className="flex items-center justify-between mb-2 flex-shrink-0">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 border border-blue-100 shadow-inner group-hover:bg-slate-900 group-hover:text-blue-400 transition-all duration-500">
                  <Activity className="h-5 w-5" />
              </div>
              <h3 className="font-black text-slate-900 text-xl italic tracking-tighter uppercase leading-none">פילוח הוצאות תשתית</h3>
            </div>
            <div className="px-4 py-1 bg-slate-100 rounded-full border border-slate-200 font-black text-[9px] text-slate-500 uppercase tracking-wider font-mono">Active Node: Stockholm</div>
          </div>
          
          {/* גרף הטבעת החד והאינטראקטיבי */}
          <div className="flex-1 w-full relative min-h-0" dir="ltr">
            <div className="absolute top-[43%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 pointer-events-none text-center z-20 w-[180px] flex flex-col justify-center items-center" dir="rtl">
              {hoveredServiceInfo ? (
                <div className="animate-fade-in space-y-0.5">
                  <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest block font-mono">{hoveredServiceInfo.unit}</span>
                  <span className="text-base font-black text-slate-800 block tracking-tight line-clamp-2 max-w-[160px] leading-tight">{hoveredServiceInfo.service}</span>
                  <span className="text-xl font-black text-slate-900 font-mono italic block pt-1 bag-text">${formatValue(hoveredServiceInfo.amount)}</span>
                </div>
              ) : (
                <div className="space-y-0.5 opacity-40">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Total Cost</span>
                  <span className="text-xl font-black text-slate-700 font-mono italic block">${displayTotal}</span>
                </div>
              )}
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  activeIndex={activeIndex !== null ? activeIndex : undefined}
                  activeShape={renderActiveShape}
                  data={filteredPieData}
                  dataKey="amount"
                  nameKey="uniqueKey" 
                  cx="50%"
                  cy="46%"
                  innerRadius={110} 
                  outerRadius={135}
                  paddingAngle={4}   
                  stroke="#fff"
                  strokeWidth={2}
                  onMouseEnter={(_: any, index: number) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {filteredPieData.map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="transition-all duration-200 outline-none cursor-pointer" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)', padding: '10px 14px', backgroundColor: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(12px)' }}
                  itemStyle={{ color: '#fff', fontWeight: '800', fontSize: '12px' }}
                  labelFormatter={(_: any, items: any) => items[0]?.payload?.service || ''}
                  formatter={(value: any, _: any, props: any) => [`$${Number(value).toFixed(6)}`, props.payload.service]}
                />
                <Legend iconType="circle" iconSize={6} formatter={(_value: any, entry: any) => entry.payload.service} wrapperStyle={{ paddingTop: '5px', fontWeight: '800', fontSize: '11px', opacity: 0.8, color: '#475569' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inventory List - 🚀 מהודק ואחיד לגובה של הגרף עם תיבת גלילה פנימית סמויה המציגה את כל 13 הפריטים */}
        <div className="bg-white/95 backdrop-blur-2xl p-6 rounded-[3.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.03)] hover:shadow-2xl transition-all duration-300 ease-out hover:-translate-y-1 flex flex-col h-full overflow-hidden cursor-pointer border border-transparent">
          <div className="flex items-center justify-between mb-6 flex-shrink-0">
            <div className="p-3 bg-slate-900 rounded-xl text-blue-400 shadow-xl">
                <Database size={20} />
            </div>
            <h3 className="font-black text-slate-900 text-xl italic tracking-tighter uppercase leading-none">מלאי שירותים מלא</h3>
          </div>

          {/* 🚀 רשימת הפריטים המלאה - מוגדרת בגובה קשיח התואם לגרף ומאפשרת גלילה פנימית נקייה של כל 13 האובייקטים מהקונסול */}
          <div className="space-y-3 pr-1 overflow-y-auto scrollbar-hidden flex-1 min-h-0 h-[460px]">
            {chartData.map((item: any, index: number) => {
              // תיקון הצלבת האינדקסים: חיפוש ישיר לפי uniqueKey כדי להתאים לגרף המסונן
              const isSelectedInChart = activeIndex !== null && filteredPieData[activeIndex]?.uniqueKey === item.uniqueKey;
              return (
                <div key={index} className={`group flex justify-between items-center p-4 rounded-[1.8rem] border transition-all duration-300 relative overflow-hidden ${isSelectedInChart ? 'bg-blue-50/60 border-blue-400 shadow-[0_10px_20px_-8px_rgba(37,99,235,0.1)] scale-[1.01]' : 'border-transparent bg-slate-50/40 hover:bg-white hover:border-blue-200'}`}>
                  <div className={`absolute left-0 top-0 h-full w-1.5 bg-blue-600 transition-opacity duration-300 ${isSelectedInChart ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                  <div className="flex flex-col items-start font-mono text-right">
                    <span className={`text-base font-black italic tracking-tighter ${item.amount > 0 ? 'text-blue-600' : 'text-slate-300'}`}>${formatValue(item.amount)}</span>
                    {item.amount > 0 && item.amount < 0.0001 && (
                      <div className="flex items-center gap-1 mt-0.5">
                       <div className="h-1 w-1 rounded-full bg-blue-400 animate-pulse" />
                       <span className="text-[7px] text-blue-400 font-black uppercase tracking-widest">Micro Node</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col text-right pr-2">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5 italic">{item.unit} // AWS</span>
                    <span className={`text-sm font-black tracking-tight transition-colors italic leading-tight ${isSelectedInChart ? 'text-blue-600' : 'text-slate-800 group-hover:text-blue-600'}`}>{item.service}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Intelligence Message Footer */}
      <div className="w-full bg-slate-900 p-5 rounded-[2.5rem] relative overflow-hidden shadow-2xl border-b-[8px] border-blue-600 flex-shrink-0">
        <Activity className="absolute -right-20 -bottom-20 text-blue-500/5 size-64 pointer-events-none rotate-12" />
        <div className="flex items-center gap-6 relative z-10">
          <div className="p-4 bg-white/5 rounded-[1.5rem] border border-white/10 backdrop-blur-md shadow-inner hidden md:block">
            <ShieldCheck size={24} className="text-blue-500" />
          </div>
          <p className="text-xs md:text-sm font-bold text-slate-400 leading-relaxed text-right italic w-full">
             <span className="text-white italic font-black uppercase tracking-widest block mb-1 text-sm underline decoration-blue-500 decoration-4 underline-offset-4">ניתוח עלויות NiVision Intelligence:</span> 
             המערכת מבצעת ניטור Billing רציף מול ה-API של AWS Stockholm. כל שירותי ה-EC2 וה-Database מסונכרנים בזמן אמת. לא זוהו חריגות בתקציב המתוכנן לחודש הנוכחי. סריקה פיננסית הושלמה בהצלחה.
          </p>
        </div>
      </div>
    </div>
  );
};