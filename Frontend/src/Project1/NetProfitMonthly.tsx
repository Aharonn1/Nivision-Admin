import { useMemo, useState } from "react";
import dataService from "../Service/DataService";
import { useQuery } from "@tanstack/react-query";

const RENT_COST = 20000; 
const BONUS_PER_CLOSED_LOAN = 200;

const NetProfitMonthly = () => {
  const { data: rawLeads, isLoading: leadsLoading } = useQuery({
    queryKey: ["rawLeads"],
    queryFn: () => dataService.getRawLeadsData(),
    staleTime: 1000 * 60 * 5,
  });

  const { data: financialStats, isLoading: statsLoading } = useQuery({
    queryKey: ["financialStats"],
    queryFn: () => dataService.getFinancialStats(),
  });

  const { monthlyData, totalNetProfitAllTime, stats } = useMemo(() => {
    if (!rawLeads || !Array.isArray(rawLeads)) {
      return { monthlyData: [], totalNetProfitAllTime: 0, stats: { investorRate: 0.04, individualSalary: 7000, agentCount: 0 } };
    }

    const dynamicRate = financialStats?.interest_rate_fixed ? parseFloat(financialStats.interest_rate_fixed) / 100 : 0.04;
    const individualSalary = financialStats?.salary_expense_only || 7000;

    const uniqueAgents = new Set();
    rawLeads.forEach((l: any) => { if (l.assigned_agent_name?.trim()) uniqueAgents.add(l.assigned_agent_name.trim()); });

    const agentCount = uniqueAgents.size || 1;
    const totalBaseSalaries = agentCount * individualSalary;

    const monthsMap: Record<string, any> = {};
    rawLeads.forEach((l: any) => {
      if (l.hs_lead_status === 'closed') {
        const date = new Date(l.createdate || l.hs_lastmodifieddate);
        const monthKey = `${date.getMonth() + 1}/${date.getFullYear()}`;
        const amount = Number(l.amount) || 0;
        const adminRate = (Number(l.interestrate) || 8) / 100;

        if (!monthsMap[monthKey]) {
          monthsMap[monthKey] = { totalIncome: 0, investorCost: 0, netSpread: 0, closedCount: 0 };
        }

        const incomeFromClient = amount * adminRate;
        const costToInvestors = amount * dynamicRate;
        
        monthsMap[monthKey].totalIncome += incomeFromClient;
        monthsMap[monthKey].investorCost += costToInvestors;
        monthsMap[monthKey].netSpread += (incomeFromClient - costToInvestors);
        monthsMap[monthKey].closedCount += 1;
      }
    });

    let accumulatedProfit = 0;
    const formatted = Object.keys(monthsMap).map(month => {
      const m = monthsMap[month];
      const monthlyBonuses = m.closedCount * BONUS_PER_CLOSED_LOAN;
      const netProfit = m.netSpread - totalBaseSalaries - monthlyBonuses - RENT_COST;
      accumulatedProfit += netProfit;

      return {
        month,
        adminIncome: Math.round(m.totalIncome),
        investorPay: Math.round(m.investorCost),
        spreadProfit: Math.round(m.netSpread),
        totalSalaries: totalBaseSalaries,
        bonuses: monthlyBonuses,
        rent: RENT_COST,
        finalNet: Math.round(netProfit)
      };
    }).sort((a, b) => {
        const [m1, y1] = a.month.split('/');
        const [m2, y2] = b.month.split('/');
        return new Date(Number(y2), Number(m1)-1).getTime() - new Date(Number(y1), Number(m2)-1).getTime();
    });

    return { monthlyData: formatted, totalNetProfitAllTime: accumulatedProfit, stats: { investorRate: dynamicRate, individualSalary, agentCount } };
  }, [rawLeads, financialStats]);

  if (leadsLoading || statsLoading) return (
    <div className="flex h-screen items-center justify-center bg-transparent font-black text-indigo-600 animate-pulse uppercase tracking-[0.3em] text-xl italic">
        SYNCING FINANCIAL MATRIX...
    </div>
  );

  return (
    <div className="w-full max-w-[1400px] mx-auto h-auto p-4 md:p-8 space-y-8 font-sans relative" dir="rtl">
      
      {/* Header - Navy Matrix Unification */}
      <div className="w-full bg-[#121931] p-12 rounded-[3rem] relative overflow-hidden border-b-8 border-indigo-600 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-full bg-indigo-500/5 blur-[100px] pointer-events-none"></div>
        <div className="flex flex-col md:flex-row justify-between items-center relative z-10 text-white gap-6">
            <div className="space-y-3 text-right">
                <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.5em] mb-1 italic">Nivision Neural Analytics</p>
                <h2 className="text-5xl font-black italic tracking-tighter uppercase leading-none">ניתוח רווחיות נטו</h2>
                <p className="text-slate-500 text-xs font-bold opacity-60 italic">Audit coverage: {stats.agentCount} active agents</p>
            </div>
            
            <div className="bg-white/5 border border-white/10 backdrop-blur-md p-8 rounded-[2.5rem] text-center min-w-[250px] shadow-inner">
                <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mb-2">סך נזילות כולל</div>
                <div className="text-4xl font-mono font-black text-white italic drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                    ₪{Math.round(totalNetProfitAllTime).toLocaleString()}
                </div>
            </div>
        </div>
      </div>

      {/* Table Area */}
      {/* 🚀 שורה 115 מתוקנת: הוסרו הצללים והברדרים של ה-Card כדי להעלים את המסגרת המרובעת */}
      <div className="w-full bg-white rounded-[3rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse table-fixed">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] border-b border-slate-100 italic">
                <th className="py-8 pr-12 w-[15%]">תקופה</th>
                <th className="py-8 text-center w-[15%]">הכנסה</th>
                <th className="py-8 text-center text-slate-500 w-[15%]">עלויות מימון</th>
                <th className="py-8 text-center w-[15%]">שכר</th>
                <th className="py-8 text-center w-[15%]">שכירות</th>
                <th className="py-8 text-center w-[10%]">בונוסים</th>
                <th className="py-8 pl-12 text-[#121931] text-center italic w-[15%]">רווח נטו</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {monthlyData.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-all duration-300">
                  <td className="py-8 pr-12 font-black text-[#121931] italic text-lg group-hover:text-indigo-600 transition-colors">{row.month}</td>
                  <td className="py-8 font-mono text-slate-500 text-sm text-center">₪{row.adminIncome.toLocaleString()}</td>
                  <td className="py-8 font-mono text-slate-400 text-sm text-center">-(₪{row.investorPay.toLocaleString()})</td>
                  <td className="py-8 font-mono text-slate-400 text-xs text-center">₪{row.totalSalaries.toLocaleString()}</td>
                  <td className="py-8 font-mono text-slate-400 text-xs text-center">₪{row.rent.toLocaleString()}</td>
                  <td className="py-8 font-mono text-slate-400 text-xs text-center">₪{row.bonuses.toLocaleString()}</td>
                  <td className={`py-8 pl-12 font-mono font-black text-2xl text-center italic ${row.finalNet >= 0 ? 'text-[#121931]' : 'text-red-500'}`}>
                    ₪{row.finalNet.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 bg-white rounded-[2.5rem] flex flex-col items-center group shadow-sm">
            <div className="text-[10px] text-slate-400 uppercase font-black mb-3 tracking-widest leading-none italic">Base Salary API</div>
            <div className="text-3xl font-mono font-black text-[#121931] italic">₪{stats.individualSalary.toLocaleString()}</div>
        </div>
        
        <div className="p-8 bg-white rounded-[2.5rem] flex flex-col items-center group shadow-sm">
            <div className="text-[10px] text-slate-400 uppercase font-black mb-3 tracking-widest leading-none italic">Operational Rent</div>
            <div className="text-3xl font-mono font-black text-[#121931] italic">₪{RENT_COST.toLocaleString()}</div>
        </div>

        <div className="flex flex-col justify-center items-center opacity-20 group italic">
            <div className="text-[11px] font-black text-[#121931] uppercase tracking-[0.5em]">Audit Protocol Active</div>
            <div className="mt-3 h-1 w-24 bg-[#121931] rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default NetProfitMonthly;