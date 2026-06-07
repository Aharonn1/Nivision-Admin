import React, { useState, useMemo } from "react";
import dataService from "../Service/DataService";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import ReactECharts from "echarts-for-react";
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    ColumnDef,
} from "@tanstack/react-table";
import { AxiosError } from "axios";

// Shadcn UI
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

// --- ממשקים ---
interface LoanData {
    id: string;
    firstname: string;
    amount: number;
    status: string;
    date: string;
    month: string;
    purpose: string;
}

interface DashboardProcessedData {
    monthlyData: { month_name: string; total_loans: number; total_requests: number }[];
    categoryData: { name: string; incoming: number; closed: number }[];
    allLoans: LoanData[];
    yearlyClosedTotal: number;
    yearlyRequestsTotal: number;
}

const monthNamesHe = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];

const AdminLoanDashboard = () => {
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
    const [selectedMonthLoans, setSelectedMonthLoans] = useState<LoanData[]>([]);

    const { data, isLoading } = useQuery<any[], AxiosError, DashboardProcessedData>({
        queryKey: ["loanDashboardStatsClosed"],
        queryFn: () => dataService.getRawLeadsData(),
        select: (rawLeads): DashboardProcessedData => {
            const monthlyClosed: Record<number, number> = {};
            const monthlyRequests: Record<number, number> = {};
            const categoryStats: Record<string, { incoming: number, closed: number }> = {};
            let yearlyClosedTotal = 0;
            let yearlyRequestsTotal = 0;

            const processedLoans = rawLeads.map((item: any) => {
                const props = item?.properties || item;
                if (!props.amount || !props.firstname) return null;

                const dateVal = props.createdate || props.addedAt;
                const dateObj = dateVal ? new Date(dateVal) : new Date();
                const monthIndex = dateObj.getMonth();
                const monthNameHe = monthNamesHe[monthIndex];
                const status = String(props.hs_lead_status || "").toUpperCase();
                const isClosed = status.includes('WON') || status.includes('CLOSED') || status.includes('סגור');
                const amount = Number(props.amount) || 0;
                const finalPurpose = props.loan_purpose || "כללי";

                if (!categoryStats[finalPurpose]) categoryStats[finalPurpose] = { incoming: 0, closed: 0 };
                categoryStats[finalPurpose].incoming += 1;
                monthlyRequests[monthIndex] = (monthlyRequests[monthIndex] || 0) + 1;
                yearlyRequestsTotal += 1;

                if (isClosed) {
                    monthlyClosed[monthIndex] = (monthlyClosed[monthIndex] || 0) + 1;
                    categoryStats[finalPurpose].closed += 1;
                    yearlyClosedTotal += 1;
                }

                return {
                    id: props.hs_object_id || Math.random().toString(),
                    firstname: props.firstname,
                    amount,
                    status: isClosed ? "סגור" : "בתהליך",
                    date: dateObj.toLocaleDateString('he-IL'),
                    month: monthNameHe,
                    purpose: finalPurpose
                };
            }).filter((l): l is LoanData => l !== null);

            const currentMonth = new Date().getMonth();
            const fullMonthlyData = monthNamesHe.slice(0, currentMonth + 1).map((name, index) => ({
                month_name: name,
                total_loans: monthlyClosed[index] || 0,
                total_requests: monthlyRequests[index] || 0
            }));

            const formattedCategoryData = Object.entries(categoryStats).map(([name, stats]) => ({
                name,
                incoming: stats.incoming,
                closed: stats.closed
            })).sort((a, b) => b.incoming - a.incoming);

            return { monthlyData: fullMonthlyData, categoryData: formattedCategoryData, allLoans: processedLoans.filter(l => l.status === "סגור"), yearlyClosedTotal, yearlyRequestsTotal };
        }
    });

    // --- הגדרות ECharts למגמה חודשית ---
    const getAreaOption = () => ({
        tooltip: { 
            trigger: 'axis', 
            backgroundColor: '#121931', 
            textStyle: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
            borderRadius: 12,
            padding: 10,
            borderWidth: 0,
            shadowColor: 'rgba(0, 0, 0, 0.2)',
            shadowBlur: 10
        },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: {
            type: 'category',
            data: data?.monthlyData.map(d => d.month_name),
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { color: '#94a3b8', fontWeight: 'bold', fontSize: 11 }
        },
        yAxis: { type: 'value', splitLine: { lineStyle: { color: '#f1f5f9' } }, axisLabel: { show: false } },
        series: [
            {
                name: 'בקשות',
                data: data?.monthlyData.map(d => d.total_requests),
                type: 'line',
                smooth: true,
                lineStyle: { width: 0 },
                showSymbol: false,
                areaStyle: { opacity: 0.1, color: '#94a3b8' },
            },
            {
                name: 'סגירות',
                data: data?.monthlyData.map(d => d.total_loans),
                type: 'line',
                smooth: true,
                lineStyle: { width: 4, color: '#6366f1' },
                symbolSize: 8,
                itemStyle: { color: '#6366f1' },
                areaStyle: {
                    color: {
                        type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [{ offset: 0, color: 'rgba(99, 102, 241, 0.4)' }, { offset: 1, color: 'rgba(99, 102, 241, 0)' }]
                    }
                },
                label: { show: true, position: 'top', fontWeight: 'black', color: '#6366f1', fontSize: 13, fontStyle: 'italic' }
            }
        ]
    });

    // --- הגדרות ECharts לפילוח קטגוריות ---
    const getBarOption = () => ({
        tooltip: { 
            trigger: 'axis', 
            axisPointer: { type: 'shadow' },
            backgroundColor: '#121931', 
            textStyle: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
            borderRadius: 10,
            padding: 8, 
            borderWidth: 0,
            shadowColor: 'rgba(0, 0, 0, 0.15)',
            shadowBlur: 10,
            formatter: (params: any) => {
                let html = `<div style="text-align:right; font-family: sans-serif;">`;
                html += `<div style="font-size:13px; font-weight:black; color:#fff; margin-bottom:5px; italic">${params[0].name}</div>`;
                params.forEach((item: any) => {
                    const color = item.seriesName === 'נכנסו' ? '#cbd5e1' : '#6366f1';
                    html += `<div style="display:flex; justify-content:space-between; align-items:center; gap:10px;">
                                <span style="font-weight:bold; color:${color}">${item.value}</span>
                                <span style="color:#94a3b8; font-size:11px;">${item.seriesName}</span>
                             </div>`;
                });
                html += `</div>`;
                return html;
            }
        },
        legend: { data: ['נכנסו', 'נסגרו'], bottom: 0, textStyle: { fontWeight: 'bold', color: '#94a3b8' } },
        grid: { top: '10%', bottom: '15%', left: '5%', right: '5%' },
        xAxis: { 
            type: 'category', 
            data: data?.categoryData.map(d => d.name), 
            axisTick: { show: false },
            axisLine: { show: false },
            axisLabel: { color: '#94a3b8', fontWeight: '900', fontSize: 13, interval: 0 }
        },
        yAxis: { type: 'value', axisLabel: { show: false }, splitLine: { show: false } },
        series: [
            { 
                name: 'נכנסו', 
                type: 'bar', 
                data: data?.categoryData.map(d => d.incoming), 
                itemStyle: { color: '#e2e8f0', borderRadius: [5, 5, 0, 0] },
                barMaxWidth: 35, 
                label: { show: true, position: 'top', fontWeight: 'bold', color: '#94a3b8', fontSize: 11 }
            },
            { 
                name: 'נסגרו', 
                type: 'bar', 
                data: data?.categoryData.map(d => d.closed), 
                itemStyle: { color: '#6366f1', borderRadius: [5, 5, 0, 0] },
                barMaxWidth: 35, 
                label: { show: true, position: 'top', fontWeight: 'black', color: '#4f46e5', fontSize: 13, fontStyle: 'italic' }
            }
        ]
    });

    const columns = useMemo<ColumnDef<LoanData>[]>(() => [
        { header: "שם לקוח", accessorKey: "firstname", cell: (info) => <span className="font-black text-[#121931] italic text-lg">{info.getValue() as string}</span> },
        { header: "סכום", accessorKey: "amount", cell: (info) => <span className="font-mono font-black text-indigo-600 text-xl italic">₪{Number(info.getValue()).toLocaleString()}</span> },
        { header: "מטרה", accessorKey: "purpose", cell: (info) => <Badge variant="outline" className="border-slate-200 text-slate-500 font-bold text-[10px] uppercase italic px-3 py-1 tracking-tighter">{info.getValue() as string}</Badge> },
        { header: "סטטוס", accessorKey: "status", cell: () => <Badge className="bg-indigo-600 text-white font-black text-[10px] uppercase px-3 py-1">סגור</Badge> }
    ], []);

    const table = useReactTable({ data: selectedMonthLoans, columns, getCoreRowModel: getCoreRowModel() });

    if (isLoading) return <div className="flex h-screen items-center justify-center bg-transparent font-black text-[#121931] animate-pulse italic uppercase tracking-widest text-2xl">סנכרון נתוני מערכת... 🤖</div>;

    return (
        /* 🚀 התיקון הארכיטקטוני הראשי: הוסר הרקע הלבן-אפור המאלץ (bg-[#f8fafc]) והוסר ה-min-h-screen כדי למנוע את קופסת המסגרת החותכת */
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-[1400px] mx-auto h-auto p-4 md:p-10 space-y-10 font-sans select-none overflow-hidden" dir="rtl">
            
            {/* Header Matrix Style */}
            <motion.div initial={{ y: -30 }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 100 }}>
                {/* 🚀 ניקוי ה-Card החיצוני למניעת כפל מסגרות */}
                <Card className="w-full mb-10 bg-[#121931] border-none shadow-2xl rounded-[3rem] overflow-hidden">
                    <CardContent className="p-10 relative flex flex-col lg:flex-row justify-between items-center gap-8">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none" />
                        <div className="relative z-10">
                            <span className="text-blue-400 text-[10px] font-black tracking-[0.5em] uppercase mb-2 block italic">Dashboard Audit Intelligence</span>
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter italic uppercase leading-none">מרכז סגירות Nivision</h1>
                        </div>

                        <div className="relative z-10 flex gap-6">
                            <div className="bg-white/5 border border-white/10 backdrop-blur-md p-6 rounded-[2rem] text-center min-w-[190px]">
                                <span className="text-slate-400 text-[9px] font-black tracking-widest uppercase block mb-1">בקשות (שנתי)</span>
                                <div className="text-4xl font-black text-white tracking-tighter">{data?.yearlyRequestsTotal}</div>
                            </div>
                            <div className="bg-white/5 border border-indigo-500/30 backdrop-blur-md p-6 rounded-[2rem] text-center min-w-[190px] shadow-[inset_0_0_20px_rgba(99,102,241,0.1)]">
                                <span className="text-indigo-400 text-[9px] font-black tracking-widest uppercase block mb-1">סגירות (שנתי)</span>
                                <div className="text-4xl font-black text-white tracking-tighter drop-shadow-[0_0_10px_rgba(99,102,241,0.4)]">{data?.yearlyClosedTotal}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* קוביות הגרפים המרכזיות - 🚀 חופשיות וחלקות ללא קופסאות ברדרים חיצוניות */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
                {/* גרף מגמה - ECharts */}
                <motion.div whileHover={{ y: -5 }} transition={{ type: "spring" }}>
                    <Card className="rounded-[3rem] border-none bg-white p-10 h-[500px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.03)] hover:shadow-2xl transition-all duration-300 cursor-pointer">
                        <h3 className="text-xl font-black italic text-[#121931] mb-8 uppercase tracking-tight">מגמת הצלחה חודשית</h3>
                        <ReactECharts option={getAreaOption()} style={{ height: '350px' }} 
                            onEvents={{ 'click': (params: any) => {
                                const filtered = data?.allLoans.filter(loan => loan.month === params.name) || [];
                                setSelectedMonth(params.name);
                                setSelectedMonthLoans(filtered);
                            }}} 
                        />
                    </Card>
                </motion.div>

                {/* גרף פילוח - ECharts */}
                <motion.div whileHover={{ y: -5 }} transition={{ type: "spring" }}>
                    <Card className="rounded-[3rem] border-none bg-white p-10 h-[500px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.03)] hover:shadow-2xl transition-all duration-300 cursor-pointer">
                        <h3 className="text-xl font-black italic text-[#121931] mb-8 uppercase tracking-tight">פילוח המרות לפי תחום</h3>
                        <ReactECharts option={getBarOption()} style={{ height: '350px' }} />
                    </Card>
                </motion.div>
            </div>

            {/* Table Section */}
            <AnimatePresence>
                {selectedMonth && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                        animate={{ opacity: 1, scale: 1, y: 0 }} 
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="w-full mb-20"
                    >
                        {/* 🚀 הטבלה נוקתה מברדרים אפורים קשיחים למראה נקי לחלוטין */}
                        <Card className="rounded-[3.5rem] border-none shadow-2xl bg-white overflow-hidden">
                            <div className="px-12 py-8 bg-[#121931] flex justify-between items-center">
                                <h3 className="text-2xl font-black italic text-white tracking-tighter uppercase">פירוט סגירות: {selectedMonth}</h3>
                                <button onClick={() => setSelectedMonth(null)} className="bg-white/10 hover:bg-white/20 text-white font-black text-[9px] px-6 py-2.5 rounded-xl transition-all tracking-widest cursor-pointer">סגור תצוגה</button>
                            </div>
                            <div className="p-6">
                                <Table className="w-full">
                                    <TableHeader className="bg-slate-50/50">
                                        <TableRow className="border-b border-slate-100">
                                            <TableHead className="pr-12 text-right font-black text-slate-400 uppercase text-[10px] tracking-widest italic">לקוח</TableHead>
                                            <TableHead className="text-right font-black text-slate-400 uppercase text-[10px] tracking-widest italic">סכום עסקה</TableHead>
                                            <TableHead className="text-right font-black text-slate-400 uppercase text-[10px] tracking-widest italic">תחום</TableHead>
                                            <TableHead className="text-center font-black text-slate-400 uppercase text-[10px] tracking-widest italic">סטטוס</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {table.getRowModel().rows.map(row => (
                                            <TableRow key={row.id} className="hover:bg-indigo-50/20 transition-all border-b border-slate-100 h-20">
                                                {row.getVisibleCells().map(cell => (
                                                    <TableCell key={cell.id} className="px-6">
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="text-center py-10 opacity-20">
                <p className="text-[10px] font-black text-[#121931] uppercase tracking-[1.5em] italic">Nivision Intelligence • 2026 Audit</p>
            </div>
        </motion.div>
    );
};

export default AdminLoanDashboard;