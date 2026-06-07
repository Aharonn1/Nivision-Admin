import { useMemo } from "react";
import dataService from "../Service/DataService";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "../ui/badge";
import { Flame, TrendingUp, ArrowDownRight, Target, PieChart as PieIcon } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar } from "recharts";
import { motion } from "framer-motion";

export default function RevenueProjectionInsights() {
    const { data: rawLeads, isLoading } = useQuery({
        queryKey: ["rawLeads"],
        queryFn: () => dataService.getRawLeadsData(),
        staleTime: 1000 * 60 * 5,
    });

    const insights = useMemo(() => {
        if (!rawLeads || !Array.isArray(rawLeads)) return null;

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const last3MonthsIdx = [(currentMonth - 1 + 12) % 12, (currentMonth - 2 + 12) % 12, (currentMonth - 3 + 12) % 12];

        const monthlyTotals: Record<number, number> = {};
        const purposeStats: Record<string, { val: number, sources: Set<string> }> = {};
        const sourceDistribution: Record<string, number> = {};
        const agentPerf: Record<string, { curr: { inc: number, cls: number }, prev: { inc: number, cls: number } }> = {};

        const filteredLeads = rawLeads.filter((item: any) => {
            const val = parseFloat(item.amount);
            return item.amount !== null && item.amount !== undefined && !isNaN(val) && val > 0;
        });

        filteredLeads.forEach((item: any) => {
            const amount = parseFloat(item.amount);
            const purpose = item.loan_purpose || "לא הוגדר";
            const source = item.lead_source || "אחר";
            const agent = item.assigned_agent_name || "ללא שיוך";
            
            const status = (item.hs_lead_status || "").toUpperCase();
            const isClosed = status.includes("WON") || status.includes("CLOSED") || status.includes("סגור");
            
            const date = new Date(item.createdate || item.addedAt);
            const m = date.getMonth();
            const y = date.getFullYear();

            if (isClosed) monthlyTotals[m] = (monthlyTotals[m] || 0) + amount;
            if (isClosed && m === currentMonth && y === currentYear) {
                if (!purposeStats[purpose]) purposeStats[purpose] = { val: 0, sources: new Set() };
                purposeStats[purpose].val += amount;
                purposeStats[purpose].sources.add(source);
            }
            if (m === currentMonth && y === currentYear) sourceDistribution[source] = (sourceDistribution[source] || 0) + 1;

            if (agent !== "ללא שיוך" && y === currentYear) {
                const prevMonth = (currentMonth - 1 + 12) % 12;
                if (!agentPerf[agent]) agentPerf[agent] = { curr: { inc: 0, cls: 0 }, prev: { inc: 0, cls: 0 } };
                if (m === currentMonth) { agentPerf[agent].curr.inc++; if (isClosed) agentPerf[agent].curr.cls++; } 
                else if (m === prevMonth) { agentPerf[agent].prev.inc++; if (isClosed) agentPerf[agent].prev.cls++; }
            }
        });

        const sum3Months = last3MonthsIdx.reduce((acc, m) => acc + (monthlyTotals[m] || 0), 0);
        const unifiedAverage = sum3Months / 3;
        const hotPurpose = Object.entries(purposeStats).sort((a, b) => b[1].val - a[1].val)[0] || ["כללי", { val: 0, sources: new Set() }];
        const pieData = Object.entries(sourceDistribution).map(([name, value]) => ({ name, value }));
        const barData = last3MonthsIdx.slice().reverse().map(m => ({ name: (m + 1).toString(), val: monthlyTotals[m] || 0 }));
        const agentComparison = Object.entries(agentPerf).map(([name, stats]) => {
            const curr = stats.curr.inc > 0 ? (stats.curr.cls / stats.curr.inc) * 100 : 0;
            const prev = stats.prev.inc > 0 ? (stats.prev.cls / stats.prev.inc) * 100 : 0;
            return { name, diff: curr - prev };
        }).sort((a, b) => b.diff - a.diff);

        return { unifiedAverage, hotPurpose, pieData, barData, improvers: agentComparison.filter(a => a.diff > 0).slice(-2).reverse(), underperformers: agentComparison.filter(a => a.diff < 0).slice(0, 2) };
    }, [rawLeads]);

    const COLORS = ['#4f46e5', '#818cf8', '#c7d2fe', '#e0e7ff'];
    if (isLoading) return <div className="p-20 text-center font-black italic text-indigo-500 animate-pulse">UNIFYING AUDIT DATA...</div>;
    if (!insights) return null;

    return (
        <div dir="rtl" className="w-full max-w-[1400px] mx-auto h-auto p-4 md:p-8 space-y-8 font-sans">
            
            <div className="flex justify-between items-end border-b-2 border-slate-200 pb-6">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 uppercase">Unified Projection</h1>
                    <p className="text-slate-400 font-bold text-xs tracking-[0.2em] mt-2 uppercase italic">Single Source of Truth // Closing Average</p>
                </div>
                <Badge className="bg-slate-900 text-white px-6 py-2 rounded-full font-black italic">VERIFIED DATA</Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* המספר המאוחד */}
                <motion.div whileHover={{ y: -10 }} className="lg:col-span-5 bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
                    <Target className="text-indigo-400 mb-6 h-10 w-10" />
                    <span className="text-indigo-400 text-[10px] font-black tracking-[0.4em] uppercase block mb-2 opacity-60 italic">Avg Revenue (Last 3 Months)</span>
                    <div className="text-6xl font-black italic font-mono tracking-tighter mb-8">₪{Math.round(insights.unifiedAverage).toLocaleString()}</div>
                    <div className="h-24 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={insights.barData}><Bar dataKey="val" fill="#4f46e5" radius={[4, 4, 0, 0]} /></BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* תחום חם */}
                <motion.div whileHover={{ y: -10 }} className="lg:col-span-3 bg-white rounded-[2.5rem] p-10 text-center flex flex-col items-center justify-between shadow-xl">
                    <div className="flex flex-col items-center">
                        <div className="bg-indigo-50 p-4 rounded-full mb-4"><Flame className="text-indigo-600 h-8 w-8" /></div>
                        <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1 italic">התחום החם (החודש)</span>
                        <div className="text-2xl font-black text-slate-900 italic tracking-tight">{insights.hotPurpose[0]}</div>
                        <div className="mt-2 font-mono font-black text-indigo-600 text-lg">₪{Math.round((insights.hotPurpose[1] as any).val).toLocaleString()} סגור</div>
                    </div>
                    <div className="w-full mt-6 pt-4 border-t border-slate-100">
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 italic">מקורות מובילים לתחום זה:</p>
                         <div className="flex flex-wrap justify-center gap-2">
                            {Array.from((insights.hotPurpose[1] as any).sources).map((s: any, i: number) => (
                                <div key={i} className="flex flex-col items-center gap-1">
                                    <Badge className="bg-indigo-50 text-indigo-700 border-none font-bold text-[9px] px-3 py-1">{s}</Badge>
                                </div>
                            ))}
                         </div>
                    </div>
                </motion.div>

                {/* פילוג מקורות */}
                <motion.div whileHover={{ y: -10 }} className="lg:col-span-4 bg-white rounded-[2.5rem] p-8 flex flex-col items-center shadow-xl">
                    <h3 className="text-xs font-black italic uppercase flex items-center gap-2 mb-4">
                        <PieIcon className="h-4 w-4 text-indigo-500" /> מקורות הגעה (החודש)
                    </h3>
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={insights.pieData} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                                    {insights.pieData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    {/* הצגת השמות מתחת לגרף */}
                    <div className="flex justify-center gap-4 mt-4 w-full">
                        {insights.pieData.map((d, i) => (
                            <div key={i} className="flex flex-col items-center gap-1">
                                <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                                <span className="text-[9px] font-black italic uppercase text-slate-600">{d.name}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Talent Pulse */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div whileHover={{ y: -5 }} className="bg-white rounded-[2.5rem] p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <TrendingUp className="text-indigo-600 h-6 w-6" />
                        <h3 className="text-lg font-black italic uppercase">Monthly Improvers</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {insights.improvers.map((a, i) => (
                            <div key={i} className="bg-slate-50 p-6 rounded-2xl">
                                <div className="text-sm font-black text-slate-900 italic mb-1">{a.name}</div>
                                <div className="text-emerald-600 font-mono font-black text-md">+{a.diff.toFixed(1)}%</div>
                            </div>
                        ))}
                    </div>
                </motion.div>
                <motion.div whileHover={{ y: -5 }} className="bg-white rounded-[2.5rem] p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <ArrowDownRight className="text-slate-400 h-6 w-6" />
                        <h3 className="text-lg font-black italic uppercase text-slate-400">Monthly Dips</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {insights.underperformers.map((a, i) => (
                            <div key={i} className="bg-slate-50 p-6 rounded-2xl">
                                <div className="text-sm font-black text-slate-400 italic mb-1">{a.name}</div>
                                <div className="text-rose-500 font-mono font-black text-md">{a.diff.toFixed(1)}%</div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
            
            <p className="text-center text-[9px] font-black text-slate-300 uppercase tracking-[0.5em] italic py-6">Nivision Intelligence // End of Audit</p>
        </div>
    );
}