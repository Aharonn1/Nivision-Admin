import { useMemo } from "react";
import dataService from "../Service/DataService";
import { useQuery } from "@tanstack/react-query";
import ReactECharts from "echarts-for-react";
import { motion } from "framer-motion";

// ייבוא רכיבי Shadcn
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";

export default function LeadSourceROI() {
    const { data: rawLeads, isLoading } = useQuery({
        queryKey: ["rawLeads"],
        queryFn: () => dataService.getRawLeadsData(),
        staleTime: 1000 * 60 * 5,
    });

    const processedData = useMemo(() => {
        if (!rawLeads || !Array.isArray(rawLeads)) return null;

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const last3MonthsIdx = [
            (currentMonth - 1 + 12) % 12,
            (currentMonth - 2 + 12) % 12,
            (currentMonth - 3 + 12) % 12
        ];

        const stats: Record<string, { incoming: number, closed: number, totalVal: number }> = {};
        const expertiseMap: Record<string, Record<string, { incoming: number, closed: number }>> = {};
        const actualIncomeByMonth: Record<number, number> = {};
        const potentialIncomeByMonth: Record<number, number> = {};
        const monthNames = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];

        const validLeads = rawLeads.filter((item: any) => {
            const val = parseFloat(item.amount);
            return item.amount !== null && item.amount !== undefined && !isNaN(val) && val > 0;
        });

        validLeads.forEach((item: any) => {
            const amount = parseFloat(item.amount);
            const source = item.lead_source || "אחר";
            const agent = item.assigned_agent_name || "ללא שיוך";
            const status = (item.hs_lead_status || "").toUpperCase();
            const isClosed = status.includes("WON") || status.includes("CLOSED") || status.includes("סגור");

            const date = new Date(item.createdate || item.addedAt);
            const m = date.getMonth();
            const y = date.getFullYear();

            if (y === currentYear) potentialIncomeByMonth[m] = (potentialIncomeByMonth[m] || 0) + amount;
            if (isClosed) actualIncomeByMonth[m] = (actualIncomeByMonth[m] || 0) + amount;

            if (!stats[source]) stats[source] = { incoming: 0, closed: 0, totalVal: 0 };
            stats[source].incoming += 1;
            if (isClosed) {
                stats[source].closed += 1;
                stats[source].totalVal += amount;
            }

            if (!expertiseMap[source]) expertiseMap[source] = {};
            if (!expertiseMap[source][agent]) expertiseMap[source][agent] = { incoming: 0, closed: 0 };
            expertiseMap[source][agent].incoming += 1;
            if (isClosed) expertiseMap[source][agent].closed += 1;
        });

        const sum3Months = last3MonthsIdx.reduce((acc, m) => acc + (actualIncomeByMonth[m] || 0), 0);
        const unifiedAverage = sum3Months / 3;

        const formattedROI = Object.entries(stats)
            .map(([name, data]) => ({ name, incoming: data.incoming, closed: data.closed }))
            .sort((a, b) => b.incoming - a.incoming)
            .filter(i => i.name !== "אחר");

        const champions = Object.entries(expertiseMap).map(([sourceName, agents]) => {
            const champion = Object.entries(agents)
                .map(([agentName, d]) => {
                    const conv = (d.closed / d.incoming) * 100;
                    const powerScore = (d.closed * d.closed) * conv;
                    return { agentName, closed: d.closed, incoming: d.incoming, conv, powerScore };
                })
                .sort((a, b) => b.powerScore - a.powerScore)[0];

            return {
                sourceName,
                championName: champion?.closed > 0 ? champion.agentName : "אין סגירות",
                closedCount: champion?.closed || 0,
                incomingCount: champion?.incoming || 0,
                conv: champion?.conv.toFixed(1) || "0"
            };
        }).filter(c => c.sourceName !== "אחר").sort((a, b) => b.closedCount - a.closedCount).slice(0, 4);

        const agentTable = [];
        for (const source in expertiseMap) {
            for (const agent in expertiseMap[source]) {
                const d = expertiseMap[source][agent];
                agentTable.push({ source, agent, incoming: d.incoming, closed: d.closed, conv: ((d.closed / d.incoming) * 100).toFixed(1) });
            }
        }

        return {
            roiData: formattedROI,
            sourceChampions: champions,
            monthlyHistory: monthNames.map((name, index) => ({
                name,
                actual: actualIncomeByMonth[index] || 0,
                potential: potentialIncomeByMonth[index] || 0
            })).filter((_, i) => i <= currentMonth),
            fullAgentTable: agentTable.sort((a, b) => b.closed - a.closed),
            projectionTotal: unifiedAverage
        };
    }, [rawLeads]);

    const getBarOption = () => ({
        tooltip: { trigger: 'axis', backgroundColor: '#121931', textStyle: { color: '#fff' }, borderRadius: 12 },
        grid: { top: '15%', bottom: '10%', left: '5%', right: '5%', containLabel: true },
        xAxis: { 
            type: 'category', 
            data: processedData?.roiData.map(d => d.name),
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { color: '#64748b', fontWeight: '900', fontSize: 10 }
        },
        yAxis: { type: 'value', splitLine: { lineStyle: { color: '#f1f5f9' } }, axisLabel: { show: false } },
        series: [
            { name: 'לידים', type: 'bar', data: processedData?.roiData.map(d => d.incoming), itemStyle: { color: '#e2e8f0', borderRadius: [4, 4, 0, 0] }, barWidth: 15 },
            { name: 'סגירות', type: 'bar', data: processedData?.roiData.map(d => d.closed), itemStyle: { color: '#6366f1', borderRadius: [4, 4, 0, 0] }, barWidth: 15 }
        ]
    });

    const getAreaOption = () => ({
        tooltip: { trigger: 'axis', backgroundColor: '#121931', textStyle: { color: '#fff' } },
        grid: { top: '15%', bottom: '10%', left: '5%', right: '5%', containLabel: true },
        xAxis: { 
            type: 'category', 
            data: processedData?.monthlyHistory.map(d => d.name),
            axisLine: { show: false },
            axisLabel: { color: '#64748b', fontWeight: '900', fontSize: 10 }
        },
        yAxis: { type: 'value', splitLine: { lineStyle: { color: '#f1f5f9' } }, axisLabel: { show: false } },
        series: [
            { name: 'פוטנציאל', type: 'line', smooth: true, data: processedData?.monthlyHistory.map(d => d.potential), symbol: 'none', lineStyle: { type: 'dashed', color: '#cbd5e1' } },
            { name: 'הכנסה בפועל', type: 'line', smooth: true, data: processedData?.monthlyHistory.map(d => d.actual), lineStyle: { width: 3, color: '#6366f1' }, areaStyle: { color: 'rgba(99, 102, 241, 0.1)' } }
        ]
    });

    if (isLoading) return <div className="flex h-screen items-center justify-center bg-transparent font-black text-[#121931] animate-pulse text-xl uppercase tracking-widest italic">Syncing ROI Analytics... 🤖</div>;
    if (!processedData) return null;

    return (
        /* 🚀 המעטפת הראשית תוקנה לרוחב מקסימלי אחיד וסימטרי */
        <div dir="rtl" className="w-full max-w-[1400px] mx-auto h-auto p-4 md:p-8 space-y-8 font-sans relative overflow-hidden">

            {/* Top Stats - Champions With Progress Bars */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
                <Card className="lg:col-span-8 rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden">
                    <CardHeader className="px-8 py-6 border-b border-slate-100">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-xl font-black italic tracking-tighter text-slate-900 uppercase">מובילי קטגוריות</CardTitle>
                            <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-slate-200">PERFORMANCE CHAMPIONS</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {processedData.sourceChampions.map((c, i) => (
                                <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col group hover:bg-white hover:shadow-lg transition-all duration-300">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{c.sourceName}</div>
                                            <div className="text-md font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{c.championName}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[14px] font-black text-indigo-600 italic leading-none">{c.closedCount}</div>
                                            <div className="text-[8px] font-bold text-slate-400 uppercase">סגירות</div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black text-slate-900 italic">{c.conv}% המרה</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-200/60 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(parseFloat(c.conv), 100)}%` }}
                                                transition={{ duration: 1, delay: 0.2 }}
                                                className="h-full bg-indigo-600 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.3)]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-4 bg-slate-900 border-none shadow-2xl rounded-[2.5rem] overflow-hidden flex flex-col justify-center">
                    <CardContent className="p-10 relative text-center">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
                        <span className="text-indigo-400 text-[10px] font-black tracking-[0.4em] uppercase mb-4 block italic">Next Month Projection</span>
                        <div className="text-5xl font-black text-white tracking-tighter mb-2 italic font-mono leading-none">
                            ₪{Math.round(processedData.projectionTotal).toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Grid */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-8 h-[400px]">
                    <h3 className="text-sm font-black italic text-[#121931] mb-6 uppercase tracking-wider">יחס המרה: לידים מול סגירות</h3>
                    <ReactECharts option={getBarOption()} style={{ height: '300px' }} />
                </Card>
                <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-8 h-[400px]">
                    <h3 className="text-sm font-black italic text-[#121931] mb-6 uppercase tracking-wider">נפח בקשות מול הכנסה בפועל</h3>
                    <ReactECharts option={getAreaOption()} style={{ height: '300px' }} />
                </Card>
            </div>

            {/* Performance Table */}
            <div className="w-full">
                {/* 🚀 התיקון הארכיטקטוני הראשי: ה-Card הפך לשקוף (bg-transparent) וללא שוליים (border-none shadow-none) למחיקת המסגרת הלבנה הכללית */}
                <Card className="rounded-[3rem] border-none shadow-none bg-transparent overflow-hidden">
                    <div className="px-10 py-6 bg-[#121931] flex justify-between items-center rounded-t-[3rem]">
                        <h3 className="text-lg font-black italic text-white tracking-tight uppercase">Audit Trail</h3>
                        <Badge className="bg-white/10 text-white border-none font-black text-[9px] px-4 py-1.5 rounded-xl italic">SYSTEM SYNC</Badge>
                    </div>
                    <div className="overflow-x-auto bg-white rounded-b-[3rem]">
                        <Table className="w-full border-collapse text-right">
                            <TableHeader className="bg-slate-50/80">
                                <TableRow className="border-b border-slate-100">
                                    <th className="py-5 pr-10 text-right font-black text-[11px] uppercase text-slate-400 italic w-[20%]">מקור</th>
                                    <th className="py-5 px-4 text-right font-black text-[11px] uppercase text-slate-400 italic w-[25%]">סוכן</th>
                                    <th className="py-5 px-4 text-center font-black text-[11px] uppercase text-slate-400 italic w-[15%]">נכנסו</th>
                                    <th className="py-5 px-4 text-center font-black text-[11px] uppercase text-slate-400 italic w-[15%]">סגירות</th>
                                    <th className="py-5 pl-10 text-left font-black text-[11px] uppercase text-slate-400 italic w-[25%]">המרה</th>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-slate-100">
                                {processedData.fullAgentTable.map((row, i) => (
                                    <TableRow key={i} className="hover:bg-indigo-50/20 transition-all h-20 group bg-transparent">
                                        {/* 🚀 תיקון קריטי: שונה מ-text-slate-300 ל-text-slate-700 ונוסף גודל טקסט ברור בשביל קריאות מושלמת של הנתונים במקור! */}
                                        <td className="py-4 pr-10 font-bold text-slate-700 text-sm uppercase italic tracking-normal group-hover:text-indigo-600 transition-colors">{row.source}</td>
                                        <td className="py-4 px-4 font-black text-[#121931] text-base tracking-tighter italic">{row.agent}</td>
                                        <td className="py-4 px-4 text-center font-bold text-slate-500 text-xs font-mono">{row.incoming}</td>
                                        <td className="py-4 px-4 text-center font-black text-indigo-600 text-lg italic font-mono">{row.closed}</td>
                                        <td className="py-4 pl-10">
                                            <div className="flex items-center gap-3 w-full max-w-[120px]">
                                                <span className="text-[10px] font-black text-[#121931] italic w-8">{row.conv}%</span>
                                                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${Math.min(parseFloat(row.conv), 100)}%` }} />
                                                </div>
                                            </div>
                                        </td>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </Card>
            </div>

            <div className="text-center py-10 opacity-20 italic">
                <p className="text-[9px] font-black text-[#121931] uppercase tracking-[1em]">Nivision Intelligence Audit • 2026</p>
            </div>
        </div>
    );
}