import { useMemo, useState } from "react";
import dataService from "../Service/DataService";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

// ייבוא רכיבי Shadcn מהתיקייה שלך
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";

const AgentSalaries = () => {
    const { data: rawLeads, isLoading } = useQuery({
        queryKey: ["rawLeads"],
        queryFn: () => dataService.getRawLeadsData(),
    });

    const [selectedMonth, setSelectedMonth] = useState<string>("");

    const monthlySalaries = useMemo(() => {
        if (!rawLeads || !Array.isArray(rawLeads)) return {};
        const baseSalary = 7000;
        const bonusPerDeal = 200;
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth(); 
        const monthNames = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
        
        const report: Record<string, Record<string, any>> = {};
        const allUniqueAgents = new Set<string>();
        
        rawLeads.forEach((item: any) => {
            const name = (item.assigned_agent_name || "").toString().replace(/['"]+/g, '').trim();
            if (name) allUniqueAgents.add(name);
        });

        rawLeads.forEach((item: any) => {
            const agentName = (item.assigned_agent_name || "").toString().replace(/['"]+/g, '').trim();
            if (!agentName) return;
            const date = new Date(item.closedate || item.createdate);
            const itemMonth = date.getMonth();
            const monthName = monthNames[itemMonth];

            if (date.getFullYear() !== currentYear || itemMonth >= currentMonth) return;

            if (!report[monthName]) {
                report[monthName] = {};
                allUniqueAgents.forEach(name => {
                    report[monthName][name] = { agentName: name, deals: [], base: baseSalary, bonusTotal: 0 };
                });
            }

            const status = (item.hs_lead_status || "").toString().trim().toLowerCase();
            if (status === "closed" || status.includes("won") || status.includes("סגור")) {
                const clientName = `${item.firstname || ""} ${item.lastname || ""}`.replace(/['"]+/g, '').trim() || "לקוח ללא שם";
                const amount = parseFloat(item.amount) || 0;

                report[monthName][agentName].deals.push({ clientName, amount });
                report[monthName][agentName].bonusTotal += bonusPerDeal;
            }
        });

        const months = Object.keys(report);
        if (months.length > 0 && !selectedMonth) {
            setSelectedMonth(months[months.length - 1]);
        }

        return report;
    }, [rawLeads, selectedMonth]);

    const totals = useMemo(() => {
        if (!selectedMonth || !monthlySalaries[selectedMonth]) return { bonuses: 0, totalPay: 0, totalDeals: 0 };
        const agents = Object.values(monthlySalaries[selectedMonth]);
        return agents.reduce((acc, curr: any) => ({
            bonuses: acc.bonuses + curr.bonusTotal,
            totalPay: acc.totalPay + (curr.base + curr.bonusTotal),
            totalDeals: acc.totalDeals + curr.deals.length
        }), { bonuses: 0, totalPay: 0, totalDeals: 0 });
    }, [monthlySalaries, selectedMonth]);

    if (isLoading) return <div className="flex h-screen items-center justify-center bg-transparent font-black text-indigo-600 animate-pulse uppercase tracking-[0.3em] text-xl italic">SYNCING PAYROLL SYSTEM...</div>;

    const availableMonths = Object.keys(monthlySalaries).reverse();
    const currentDisplayData = selectedMonth ? Object.values(monthlySalaries[selectedMonth] || {}) : [];

    return (
        <div dir="rtl" className="w-full max-w-[1400px] mx-auto h-auto p-4 md:p-8 space-y-8 font-sans selection:bg-indigo-100 relative overflow-hidden">
            
            {/* Header Section */}
            <div className="w-full flex flex-col md:flex-row justify-between items-end mb-10 gap-6 no-print">
                <div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-2 italic">Salary Reports</h1>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Team Monthly Payout Intelligence</p>
                </div>
                
                <div className="flex gap-4">
                    <select 
                        className="bg-white border border-slate-200 px-6 py-3 rounded-2xl font-black text-slate-700 shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none cursor-pointer text-sm"
                        value={selectedMonth} 
                        onChange={(e) => setSelectedMonth(e.target.value)}
                    >
                        {availableMonths.map(m => <option key={m} value={m}>חודש {m}</option>)}
                    </select>
                    
                    <button 
                        onClick={() => window.print()} 
                        className="bg-slate-900 hover:bg-black text-white px-8 py-3 rounded-2xl font-black text-xs tracking-[0.2em] transition-all shadow-xl active:scale-95 flex items-center gap-3 cursor-pointer"
                    >
                        <span>DOWNLOAD PDF</span>
                        <span className="text-lg">📕</span>
                    </button>
                </div>
            </div>

            {selectedMonth && (
                <div className="w-full space-y-8">
                    
                    {/* Compact Summary KPI Card */}
                    <Card className="w-full bg-slate-900 border-none shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden rounded-[2.5rem]">
                        <CardContent className="p-10 relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center text-center md:text-right gap-8">
                                <div>
                                    <span className="text-indigo-400 text-[10px] font-black tracking-[0.4em] uppercase italic">Total Monthly Payout</span>
                                    <div className="text-6xl font-black text-white tracking-tighter mt-1 font-mono italic">
                                        ₪{totals.totalPay.toLocaleString()}
                                    </div>
                                </div>
                                <div className="flex gap-12 border-r border-slate-800 pr-12">
                                    <div>
                                        <span className="text-slate-500 text-[10px] font-black tracking-widest uppercase">סך בונוסים</span>
                                        <div className="text-2xl font-black text-emerald-400 mt-1 italic">₪{totals.bonuses.toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 text-[10px] font-black tracking-widest uppercase">סגירות</span>
                                        <div className="text-2xl font-black text-indigo-400 mt-1 font-mono">{totals.totalDeals}</div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Main Salary Table */}
                    {/* 🚀 התיקון הארכיטקטוני הראשי: החלפת ה-Card החיצוני ב-div נקי עם bg-white ו-rounded-[3rem] ללא ברדרים וצללים מובנים של Shadcn */}
                    <div className="w-full bg-white rounded-[3rem] overflow-hidden flex flex-col">
                        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/30">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-black italic tracking-tight text-slate-900">סיכום תשלומים</h3>
                                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mt-1">חודש {selectedMonth} • Nivision Internal</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-right border-collapse table-fixed">
                                <thead>
                                    <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-wider border-b border-slate-100 italic">
                                        <th className="w-[18%] py-6 pr-8">שם עובד</th>
                                        <th className="w-[12%] py-6 px-4">בסיס</th>
                                        <th className="w-[10%] py-6 px-4 text-center">סגירות</th>
                                        <th className="w-[12%] py-6 px-4">בונוס</th>
                                        <th className="w-[18%] py-6 px-4">סה"כ לתשלום</th>
                                        <th className="w-[30%] py-6 pl-8">פירוט עסקאות</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {currentDisplayData.map((data: any) => (
                                        <tr key={data.agentName} className="hover:bg-indigo-50/20 transition-all duration-300 h-20 bg-transparent">
                                            <td className="pr-8 py-4 font-black text-slate-900 text-md tracking-tight italic">
                                                {data.agentName}
                                            </td>
                                            <td className="py-4 px-4 text-slate-400 font-bold text-xs uppercase">₪{data.base.toLocaleString()}</td>
                                            <td className="py-4 px-4 text-center">
                                                <div className="flex justify-center">
                                                    <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-none font-black text-[11px] px-3 rounded-full">
                                                        {data.deals.length}
                                                    </Badge>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 font-bold text-emerald-600 italic text-sm">₪{data.bonusTotal.toLocaleString()}+</td>
                                            <td className="py-4 px-4">
                                                <span className="font-black text-slate-900 text-lg font-mono italic">
                                                    ₪{(data.base + data.bonusTotal).toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="pl-8 py-4">
                                                <div className="flex flex-wrap gap-1.5 max-w-md">
                                                    {data.deals.map((deal: any, idx: number) => (
                                                        <div key={idx} className="bg-slate-50 border border-slate-100 px-2 py-1 rounded-md flex items-center gap-2 group/deal hover:border-indigo-200 transition-colors">
                                                            <span className="text-[9px] font-black text-indigo-600 italic">₪{deal.amount.toLocaleString()}</span>
                                                            <span className="text-[10px] font-bold text-slate-500 border-r pr-2 border-slate-200 truncate max-w-[80px] text-right">{deal.clientName}</span>
                                                        </div>
                                                    ))}
                                                    {data.deals.length === 0 && <span className="text-slate-300 text-[10px] italic">אין עסקאות החודש</span>}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    {/* Confidential Footer */}
                    <div className="text-center py-6 opacity-30">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] italic">Confidential Internal Document • 2026</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgentSalaries;