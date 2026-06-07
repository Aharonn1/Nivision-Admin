import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import dataService from '../Service/DataService';

const formatCurrency = (value: number) => {
    return value.toLocaleString() + ' ₪';
};

export default function InvestorsManagement() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSource, setSelectedSource] = useState<string | null>(null);

    const { data, isLoading, error } = useQuery({
        queryKey: ['financialStats'],
        queryFn: () => dataService.getFinancialStats(),
    });

    const openModal = (source: string) => {
        setSelectedSource(source);
        setIsModalOpen(true);
    };

    if (isLoading) return <div className="p-10 text-center text-gray-400 italic font-black">NIVISION: LOADING FINANCIAL ECU...</div>;
    if (error) return <div className="p-10 text-center text-red-500 font-black tracking-tighter">CONNECTION ERROR: CHECK n8n STATUS</div>;

    const investors = data?.funding_breakdown || [];

    return (
        /* 🚀 התיקון הארכיטקטוני הראשי: הוסרו צבע הרקע והגובה הקשיח החיצוני כדי למחוק לחלוטין את התיבה בעלת הפינות המעוגלות */
        <div className="w-full max-w-[1400px] mx-auto h-auto p-4 md:p-10 space-y-10 font-sans select-none overflow-hidden text-right pb-20" dir="rtl">
            
            {/* 1. כותרת נפרדת בתוך "קפסולה" כהה - סגנון VIP Portfolios */}
            <div className="w-full relative z-10">
                <div className="bg-[#0B1221] rounded-[2.5rem] py-12 px-10 shadow-2xl text-center relative overflow-hidden">
                    {/* אפקט הילה פנימי */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-blue-500/5 blur-[100px] pointer-events-none"></div>
                    
                    <div className="relative z-10">
                        <p className="text-blue-400 text-xs font-black uppercase tracking-[0.4em] mb-4">Total Liquidity Capacity</p>
                        <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter italic">
                            {formatCurrency(data?.liquidity || 0)}
                        </h1>
                        <div className="mt-6 flex justify-center gap-8">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80]"></span>
                                <span className="text-gray-400 text-xs font-bold">מנוצל: {formatCurrency(data?.total_loaned || 0)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-blue-300">
                                <span className="text-xs font-bold uppercase tracking-widest opacity-60 italic">Nivision Intelligence Financial HUB</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. גוף הדף - כרטיסיות מופרדות וצפות עם אפקט קפיצה מהודק */}
            <main className="w-full relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {investors.map((investor: any, index: number) => {
                        const usagePercent = investor.usage_percent || 0;
                        const remaining = (investor.value || 0) - (investor.loaned || 0);

                        return (
                            <div key={index} className="bg-white rounded-[3rem] p-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.03)] border border-transparent hover:border-blue-400/20 hover:shadow-2xl transition-all duration-300 ease-out hover:-translate-y-1.5 flex flex-col justify-between h-[520px] cursor-pointer">
                                <div>
                                    <div className="flex justify-between items-start mb-8 border-b border-gray-50 pb-6">
                                        <h2 className="text-2xl font-black text-[#0B1221] tracking-tight">{investor.name}</h2>
                                        <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-blue-100">
                                            Live Fund
                                        </span>
                                    </div>

                                    <div className="mb-10 text-center">
                                        <p className="text-gray-400 text-[10px] font-black uppercase mb-1 tracking-widest">הון שהוקצה</p>
                                        <p className="text-5xl font-black text-[#0B1221] tracking-tighter italic">
                                            {formatCurrency(investor.value || 0)}
                                        </p>
                                    </div>

                                    <div className="space-y-6 bg-gray-50/80 p-6 rounded-3xl border border-gray-100 shadow-inner">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-[10px] text-gray-400 font-black uppercase mb-1">מנוצל</p>
                                                <p className="text-xl font-black text-gray-700 italic">{formatCurrency(investor.loaned || 0)}</p>
                                            </div>
                                            <div className="text-left">
                                                <p className="text-[14px] text-gray-400 font-black uppercase mb-1 tracking-tighter">{usagePercent}% ניצול</p>
                                                <div className="w-24 bg-gray-200 h-1.5 rounded-full mt-1">
                                                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${usagePercent}%` }}></div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                                            <span className="text-[14px] text-gray-400 font-black uppercase">פנוי להזרמה</span>
                                            <span className="text-2xl font-black text-blue-600 italic">
                                                {formatCurrency(remaining)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}