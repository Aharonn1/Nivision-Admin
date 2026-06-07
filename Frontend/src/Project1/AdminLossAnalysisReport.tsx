import { useMemo, useRef } from "react";
import dataService from "../Service/DataService";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import html2canvas from "html2canvas";

// Shadcn UI Components
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { motion } from "framer-motion";

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="backdrop-blur-md bg-white/95 p-4 rounded-xl shadow-2xl border border-slate-100 text-right dir-rtl min-w-[180px]">
                <p className="font-black text-slate-900 mb-2 border-b border-slate-50 pb-1 text-md italic">{data.name}</p>
                <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between gap-4">
                        <span className="text-slate-500 italic font-bold">צנרת VIP כוללת:</span>
                        <span className="font-black text-indigo-600 italic text-sm">₪{data.value.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between gap-4 border-t border-slate-50 pt-1">
                        <span className="text-slate-500 italic font-bold">ממוצע לעסקה:</span>
                        <span className="font-black text-emerald-600 italic">₪{Math.round(data.avg).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between gap-4 text-slate-400">
                        <span>עסקאות VIP:</span>
                        <span className="font-black underline">{data.count}</span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

export default function AdminLossAnalysisReport() {
    const chartRef = useRef<HTMLDivElement>(null);

    const { data: rawLeads, isLoading } = useQuery({
        queryKey: ["rawLeads"],
        queryFn: () => dataService.getRawLeadsData(),
        staleTime: 1000 * 60 * 5,
    });

    const { riskData, agentPipelineStats, totalVipAmount } = useMemo(() => {
        if (!rawLeads || !Array.isArray(rawLeads)) return { riskData: [], agentPipelineStats: [], totalVipAmount: 0 };
        
        const statsMap: Record<string, { value: number, count: number }> = {};
        let totalSum = 0;

        const filteredLeads = rawLeads.filter((item: any) => {
            const status = String(item.hs_lead_status || "").toUpperCase();
            const amountVal = parseFloat(item.amount) || 0;
            const scoreVal = parseInt(item.leadscore) || 0;
            
            const isNotClosed = !status.includes('CLOSED');
            const isVip = scoreVal >= 90 || amountVal >= 500000;
            
            return isNotClosed && isVip;
        });

        filteredLeads.forEach((item: any) => {
            const amountVal = parseFloat(item.amount) || 0;
            const agentName = item.assigned_agent_name || "ללא שיוך";
            
            if (!statsMap[agentName]) statsMap[agentName] = { value: 0, count: 0 };
            statsMap[agentName].value += amountVal;
            statsMap[agentName].count += 1;
            totalSum += amountVal;
        });

        const riskData = filteredLeads.map((item: any, index: number) => ({
            id: index,
            agentName: item.assigned_agent_name || "ללא שיוך",
            clientName: `${item.firstname || ""} ${item.lastname || ""}`.trim() || "לקוח",
            amountInPipeline: parseFloat(item.amount) || 0,
            score: item.leadscore || 0,
        })).sort((a: any, b: any) => b.amountInPipeline - a.amountInPipeline);

        const stats = Object.entries(statsMap).map(([name, data]) => ({ 
            name, value: data.value, count: data.count, avg: data.value / data.count 
        })).sort((a, b) => b.value - a.value);

        return { riskData, agentPipelineStats: stats, totalVipAmount: totalSum };
    }, [rawLeads]);

    if (isLoading) return <div className="h-screen flex items-center justify-center font-black animate-pulse text-indigo-600 text-xl italic">SYNCING VIP DATA...</div>;

    return (
        <div dir="rtl" className="w-full max-w-[1400px] mx-auto h-auto p-4 md:p-8 space-y-8 font-sans">
            
            <div className="w-full bg-slate-900 rounded-[2.5rem] p-10 shadow-2xl flex flex-col items-center">
                <span className="text-indigo-400 text-[10px] font-black tracking-widest uppercase mb-2 italic opacity-80">VIP Pipeline Value</span>
                <div className="text-5xl font-black text-white tracking-tighter italic font-mono">₪{totalVipAmount.toLocaleString()}</div>
            </div>

            <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <motion.div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-xl overflow-hidden flex flex-col border border-slate-100">
                    <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center">
                        <h2 className="text-lg font-black italic tracking-tighter text-slate-900">VIP Portfolios</h2>
                        <Badge className="bg-indigo-50 text-indigo-700 border-none font-black text-[10px]">{riskData.length} עסקאות</Badge>
                    </div>
                    
                    <Table>
                        <TableHeader>
                            <TableRow className="border-none hover:bg-transparent">
                                <TableHead className="text-right font-black text-[10px] uppercase text-slate-400 py-3 pr-8">לקוח</TableHead>
                                <TableHead className="text-right font-black text-[10px] uppercase text-slate-400 py-3">סוכן</TableHead>
                                <TableHead className="text-right font-black text-[10px] uppercase text-slate-400 py-3">ציון איכות</TableHead>
                                <TableHead className="text-right font-black text-[10px] uppercase text-slate-400 py-3">סכום</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-slate-50">
                            {riskData.map((row) => (
                                <TableRow key={row.id} className="hover:bg-slate-50/50 transition-colors border-none h-14">
                                    <TableCell className="pr-8 font-black text-slate-900 text-sm">{row.clientName}</TableCell>
                                    <TableCell className="text-slate-600 font-bold text-xs">{row.agentName}</TableCell>
                                    <TableCell className="text-indigo-600 font-black text-sm">{row.score}</TableCell>
                                    <TableCell className="font-mono font-black text-indigo-600 italic">₪{row.amountInPipeline.toLocaleString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </motion.div>
                
                <motion.div className="bg-white rounded-[2.5rem] shadow-xl p-8 flex flex-col border border-slate-100">
                    <div className="mb-6 border-b border-slate-50 pb-4">
                        <h2 className="text-lg font-black italic tracking-tighter text-slate-900">Agent Performance</h2>
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={agentPipelineStats} margin={{ top: 20, right: 0, left: 0, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="0" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} dy={10} />
                                <YAxis hide />
                                <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc', radius: 10}} />
                                <Bar dataKey="value" barSize={30} radius={[8, 8, 8, 8]}>
                                    {agentPipelineStats.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#4f46e5' : '#e2e8f0'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}