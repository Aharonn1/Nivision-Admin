import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    ColumnDef,
} from "@tanstack/react-table";
import ReactECharts from "echarts-for-react";
import { motion, AnimatePresence } from "framer-motion";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import dataService from "../Service/DataService";

interface MonthlyStats {
    month: string;
    leads: number;
    deals: number;
    rawDate: Date;
}

interface TeamPerformance {
    id: string;
    rank: number;
    agentName: string;
    closedDeals: number;
    inProgress: number;
    totalLeads: number;
    conversion: string;
    niche: string;
    improvementTip: string;
    avatar?: string;
    totalRevenue: number;
    avgResponseTime: string;
    tierDistribution: {
        gold: { total: number, closed: number },
        silver: { total: number, closed: number },
        bronze: { total: number, closed: number }
    };
    monthlyHistory: MonthlyStats[];
}

export default function AdminTeamPerformanceReport() {
    const [selectedAgent, setSelectedAgent] = useState<TeamPerformance | null>(null);

    const { data: rawLeads, isLoading: isLoadingLeads } = useQuery({
        queryKey: ["rawLeads"],
        queryFn: () => dataService.getRawLeadsData(),
        staleTime: 1000 * 60 * 5,
    });

    const { data: aiInsights } = useQuery({
        queryKey: ["agentInsights"],
        queryFn: () => (dataService as any).getAgentInsights(),
    });

    const teamData = useMemo<TeamPerformance[]>(() => {
        if (!rawLeads) return [];

        const stats: Record<string, any> = {};
        const monthNames = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];

        rawLeads.forEach((item: any) => {
            const agentName = item.assigned_agent_name || "ללא שיוך";
            const status = String(item.hs_lead_status || "").toLowerCase();
            const isClosed = status.includes('closed') || status.includes('נסגר') || status.includes('סגור');
            const amount = parseFloat(item.amount) || 0;
            const tier = String(item.tier || "").toLowerCase();

            const created = new Date(item.createdate || item.hs_createdate);
            const modified = new Date(item.lastmodifieddate || item.hs_lastmodifieddate);
            const responseHours = Math.abs(modified.getTime() - created.getTime()) / (1000 * 60 * 60);

            const year = created.getFullYear();
            const monthIdx = created.getMonth();
            const monthKey = `${year}-${monthIdx}`;

            if (!stats[agentName]) {
                stats[agentName] = {
                    closed: 0, progress: 0, total: 0, revenue: 0, totalResponseHours: 0,
                    tiers: { 
                        gold: { total: 0, closed: 0 }, 
                        silver: { total: 0, closed: 0 }, 
                        bronze: { total: 0, closed: 0 } 
                    },
                    historyMap: {}
                };
            }

            stats[agentName].total += 1;
            stats[agentName].totalResponseHours += responseHours;

            if (!stats[agentName].historyMap[monthKey]) {
                stats[agentName].historyMap[monthKey] = { leads: 0, deals: 0, rawDate: new Date(year, monthIdx, 1) };
            }
            stats[agentName].historyMap[monthKey].leads += 1;

            if (tier.includes("gold")) {
                stats[agentName].tiers.gold.total++;
                if (isClosed) stats[agentName].tiers.gold.closed++;
            } else if (tier.includes("silver")) {
                stats[agentName].tiers.silver.total++;
                if (isClosed) stats[agentName].tiers.silver.closed++;
            } else {
                stats[agentName].tiers.bronze.total++;
                if (isClosed) stats[agentName].tiers.bronze.closed++;
            }

            if (isClosed) {
                stats[agentName].closed += 1;
                stats[agentName].revenue += amount;
                stats[agentName].historyMap[monthKey].deals += 1;
            } else {
                stats[agentName].progress += 1;
            }
        });

        return Object.entries(stats).map(([name, data]: [string, any], index) => {
            const conversionRate = data.total > 0 ? (data.closed / data.total) * 100 : 0;
            const avgHours = data.total > 0 ? (data.totalResponseHours / data.total).toFixed(1) : "0";
            const agentAI = aiInsights?.find((ai: any) => ai.agentName === name);

            const historyArray = Object.values(data.historyMap) as any[];
            const monthlyHistory = historyArray
                .sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime())
                .map(h => ({
                    month: monthNames[h.rawDate.getMonth()],
                    leads: h.leads,
                    deals: h.deals,
                    rawDate: h.rawDate
                }));

            return {
                id: `agent-${index}`,
                agentName: name,
                closedDeals: data.closed,
                inProgress: data.progress,
                totalLeads: data.total,
                conversion: `${conversionRate.toFixed(1)}%`,
                niche: agentAI?.niche || "יועץ אסטרטגי",
                improvementTip: agentAI?.improvementTip || "מנתח מדדי ביצועים חוצי-מערכת...",
                avatar: `https://ui-avatars.com/api/?name=${name}&background=121931&color=fff&bold=true`,
                totalRevenue: data.revenue,
                avgResponseTime: avgHours,
                tierDistribution: data.tiers,
                monthlyHistory
            } as TeamPerformance;
        })
        .sort((a, b) => b.closedDeals - a.closedDeals)
        .map((agent, index) => ({ ...agent, rank: index + 1 }));
    }, [rawLeads, aiInsights]);

    const getChartOption = (history: MonthlyStats[]) => ({
        tooltip: {
            trigger: 'axis',
            backgroundColor: '#121931',
            borderRadius: 12,
            padding: 10,
            textStyle: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
            borderWidth: 0
        },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true, top: '15%' },
        xAxis: {
            type: 'category',
            data: history.map(h => h.month),
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { color: '#64748b', fontWeight: '900', fontSize: 10 }
        },
        yAxis: { type: 'value', splitLine: { lineStyle: { color: '#f1f5f9' } }, axisLabel: { show: false } },
        series: [
            {
                name: 'לידים',
                type: 'line',
                smooth: true,
                data: history.map(h => h.leads),
                symbol: 'none',
                lineStyle: { width: 0 },
                areaStyle: { opacity: 0.1, color: '#94a3b8' }
            },
            {
                name: 'סגירות',
                type: 'bar',
                barWidth: 12,
                data: history.map(h => h.deals),
                itemStyle: { color: '#6366f1', borderRadius: [4, 4, 0, 0] },
                label: { show: true, position: 'top', color: '#6366f1', fontWeight: 'bold', fontSize: 10 }
            }
        ]
    });

    const columns = useMemo<ColumnDef<TeamPerformance>[]>(() => [
        {
            header: "דירוג",
            accessorKey: "rank",
            cell: (info) => {
                const rank = info.getValue() as number;
                return (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                        rank === 1 ? 'bg-[#121931] text-white shadow-lg' :
                        rank === 2 ? 'bg-indigo-100 text-indigo-700' :
                        rank === 3 ? 'bg-slate-100 text-slate-600' : 'bg-slate-50 text-slate-300'
                    }`}>
                        {rank}
                    </div>
                );
            }
        },
        {
            header: "שם עובד",
            accessorKey: "agentName",
            cell: (info) => <span className="font-black text-[#121931] italic">{info.getValue() as string}</span>
        },
        {
            header: "נישה",
            accessorKey: "niche",
            cell: (info) => <Badge variant="secondary" className="bg-slate-100 text-[#121931] border-none font-black text-[12px] uppercase italic px-3">{info.getValue() as string}</Badge>
        },
        {
            header: "סגירות",
            accessorKey: "closedDeals",
            cell: info => <span className="font-black text-indigo-600 text-xl italic">{info.getValue() as number}</span>
        },
        {
            header: "המרה",
            accessorKey: "conversion",
            cell: info => <span className="font-black text-slate-400 font-mono text-xs">{info.getValue() as string}</span>
        },
        {
            header: "תובנת AI",
            accessorKey: "improvementTip",
            cell: (info) => (
                <div className="text-[11px] text-slate-400 font-bold leading-relaxed max-w-[200px] italic truncate">
                    "{info.getValue() as string}"
                </div>
            )
        },
    ], []);

    const table = useReactTable({ data: teamData, columns, getCoreRowModel: getCoreRowModel() });

    if (isLoadingLeads) return (
        <div className="flex h-screen items-center justify-center bg-transparent">
            <div className="animate-pulse text-[#121931] font-black italic text-xl uppercase tracking-widest">
                Syncing Team Intelligence... 📊
            </div>
        </div>
    );

    return (
        <div dir="rtl" className="p-10 font-sans">

            {/* Header Matrix Style */}
            <div className="max-w-7xl mx-auto mb-14">
                <div className="bg-[#121931] rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden border-b-8 border-indigo-600">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center">
                        <div>
                            <span className="text-indigo-400 text-[10px] font-black tracking-[0.5em] uppercase mb-3 block italic">Team Performance Audit</span>
                            <h1 className="text-5xl font-black text-white tracking-tighter italic uppercase leading-none">ניהול ביצועי צוות</h1>
                        </div>
                        <Badge className="bg-white/5 border border-white/10 backdrop-blur-md text-indigo-300 font-black text-[10px] tracking-widest px-8 py-3 rounded-2xl">
                                לחץ על עובד לקבל יותר מידע
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="max-w-7xl mx-auto">
                {/* 🚀 התיקון הארכיטקטוני הראשי: ה-Card קיבל בחזרה את ה-bg-white וה-rounded-[2.5rem] המקוריים שלו כדי לייצר קופסה ממסגרת אחידה ומדויקת, ללא ברדרים חיצוניים */}
                <Card className="w-full border-none bg-white shadow-none rounded-[2.5rem] overflow-hidden flex flex-col">
                    <CardHeader className="px-10 py-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <h3 className="font-black text-slate-500 text-sm tracking-widest uppercase leading-none">ACTIVE ROSTER</h3>
                    </CardHeader>
                    <Table className="w-full">
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="border-b border-slate-100 hover:bg-transparent">
                                <TableHead className="w-[10%] pr-10 text-right font-black text-[11px] uppercase text-slate-400 italic">דירוג</TableHead>
                                <TableHead className="w-[20%] text-right font-black text-[11px] uppercase text-slate-400 italic">שם עובד</TableHead>
                                <TableHead className="w-[15%] text-right font-black text-[11px] uppercase text-slate-400 italic">נישה</TableHead>
                                <TableHead className="w-[15%] text-right font-black text-[11px] uppercase text-slate-400 italic">סגירות</TableHead>
                                <TableHead className="w-[15%] text-right font-black text-[11px] uppercase text-slate-400 italic">המרה</TableHead>
                                <TableHead className="w-[25%] pl-10 text-right font-black text-[11px] uppercase text-slate-400 italic">תובנת AI</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows.map(row => (
                                <TableRow key={row.id}
                                    onClick={() => setSelectedAgent(row.original)}
                                    className="group hover:bg-slate-50/60 transition-all cursor-pointer h-20 border-b border-slate-100 bg-transparent"
                                >
                                    {row.getVisibleCells().map(cell => (
                                        <TableCell key={cell.id} className="px-4">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            </div>

            {/* Modal Agent Card */}
            <AnimatePresence>
                {selectedAgent && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-[#121931]/80 backdrop-blur-xl" 
                        onClick={() => setSelectedAgent(null)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-2xl rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden" 
                            onClick={e => e.stopPropagation()}
                        >
                            <button onClick={() => setSelectedAgent(null)} className="absolute top-10 right-10 w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all">✕</button>

                            <div className="flex items-center gap-8 mb-12">
                                <img src={selectedAgent.avatar} className="w-24 h-24 rounded-[2rem] shadow-xl border-4 border-white" alt="" />
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <h2 className="text-4xl font-black text-[#121931] tracking-tighter italic leading-none">{selectedAgent.agentName}</h2>
                                        <span className="bg-[#121931] text-white font-black text-xs px-4 py-1.5 rounded-xl uppercase leading-none">Rank #{selectedAgent.rank}</span>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-indigo-600 font-black text-xl italic font-mono">₪{selectedAgent.totalRevenue.toLocaleString()}</p>
                                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">זמן תגובה: {selectedAgent.avgResponseTime}H</p>
                                    </div>
                                </div>
                            </div>

                            <div className="h-48 mb-12 bg-slate-50 rounded-[2.5rem] p-4 border border-slate-100 overflow-hidden">
                                <ReactECharts 
                                    option={getChartOption(selectedAgent.monthlyHistory)} 
                                    style={{ height: '100%', width: '100%' }} 
                                />
                                <p className="text-center text-[9px] font-black text-slate-400 mt-2 uppercase tracking-[0.2em]">ציר זמן פעילות (מיום ההצטרפות)</p>
                            </div>

                            <div className="grid grid-cols-3 gap-6 mb-10">
                                {['gold', 'silver', 'bronze'].map(t => (
                                    <div key={t} className="p-6 rounded-[2rem] border border-slate-50 bg-white text-center shadow-sm">
                                        <span className="text-[10px] font-black uppercase text-slate-400 block mb-2 leading-none">{t}</span>
                                        <div className="text-2xl font-black text-[#121931] italic">{(selectedAgent.tierDistribution as any)[t]?.total || 0}</div>
                                        <div className="text-[10px] font-black text-indigo-500">{(selectedAgent.tierDistribution as any)[t]?.closed || 0} WON</div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-[#121931] rounded-[2.5rem] p-8 text-right relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500"></div>
                                <div className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.4em] mb-3 leading-none">🎯 AI STRATEGIC AUDIT</div>
                                <p className="text-white text-sm font-bold leading-relaxed italic opacity-90">"{selectedAgent.improvementTip}"</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mt-16 text-center pb-12 opacity-20 italic">
                <p className="text-[11px] font-black text-[#121931] uppercase tracking-[1.5em]">Nivision Neural Engine • Access Restricted</p>
            </div>
        </div>
    );
}