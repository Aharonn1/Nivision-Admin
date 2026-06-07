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

// --- ממשק הנתונים ---
interface LoanPerformanceLead {
    id: string;
    date: string;
    firstname: string;
    amount: string;
    agent: string;
    status: string;
    purpose: string;
}

export default function AdminLoanPerformanceReport() {
    const [searchQuery, setSearchQuery] = useState<string>("");

    // --- משיכת נתונים ועיבודם ---
    const {
        data: allLeads,
        isLoading,
    } = useQuery<LoanPerformanceLead[], AxiosError>({
        queryKey: ["loanPerformanceReport"],
        queryFn: async () => {
            const response = await dataService.getRawLeadsData();
            
            // סינון מקדים: רק הלוואות שהסכום שלהן גדול מ-0
            return response
                .filter((item: any) => {
                    const amount = parseFloat(item.amount);
                    return !isNaN(amount) && amount > 0;
                })
                .map((item: any) => {
                    const translateStatus = (status: any) => {
                        const s = String(status || '').toLowerCase();
                        if (s.includes('closed') || s.includes('סגור') || s.includes('נסגר')) return 'סגור';
                        if (s.includes('new') || s.includes('חדש')) return 'חדש';
                        if (s.includes('progress') || s.includes('טיפול')) return 'בטיפול פעיל';
                        if (s.includes('OPEN') || s.includes('פתוח')) return 'פתוח';
                        if (s.includes('deal') || s.includes('עסקה')) return 'עסקה פתוחה';
                        return status || 'לא צוין';
                    };

                    const dateVal = item.createdate || item.addedAt;
                    const dateObj = dateVal ? new Date(dateVal) : new Date();

                    return {
                        id: item.hs_object_id || Math.random().toString(),
                        date: dateObj.toLocaleDateString('he-IL'),
                        firstname: item.firstname || "לא צוין",
                        amount: item.amount || "0",
                        agent: item.assigned_agent_name || "סוכן לא מזוהה",
                        status: translateStatus(item.hs_lead_status),
                        purpose: item.loan_purpose || "עסק"
                    };
                });
        },
    });

    // --- סינון משולב (חיפוש) ---
    const filteredLeads = useMemo(() => {
        if (!allLeads) return [];
        if (!searchQuery) return allLeads;
        const q = searchQuery.toLowerCase();
        return allLeads.filter(lead =>
            lead.firstname.toLowerCase().includes(q) ||
            lead.agent.toLowerCase().includes(q)
        );
    }, [allLeads, searchQuery]);

    if (isLoading) return <div className="flex h-screen items-center justify-center bg-transparent font-black text-indigo-600 animate-pulse text-xl uppercase tracking-[0.3em] italic">PERFORMANCE AUDIT IN PROGRESS... 📊</div>;

    return (
        /* 🚀 שורה 72 מתוקנת: הוסרו bg-slate-50/50 ו-min-h-screen, והגדרנו רוחב מקסימלי אחיד וסימטרי לכל האלמנטים בדף */
        <div dir="rtl" className="w-full max-w-[1400px] mx-auto h-auto p-4 md:p-8 space-y-8 font-sans selection:bg-indigo-100 relative overflow-hidden">

            {/* Header Section with Search Bar */}
            {/* 🚀 שורה 75 מתוקנת: שונה ל-w-full ו-rounded-[3rem] כדי ליישר את רוחב הכותרת בצורה מושלמת אל מול רוחב הטבלה */}
            <Card className="w-full bg-slate-900 border-none shadow-2xl rounded-[3rem] overflow-hidden">
                <CardContent className="p-10 relative flex flex-col items-center text-center">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
                    <span className="text-indigo-400 text-[10px] font-black tracking-[0.4em] uppercase mb-4 italic z-10">Operational Excellence</span>
                    <h1 className="text-4xl font-black text-white tracking-tighter mb-6 z-10 italic">דו"ח ביצועים Nivision</h1>

                    {/* Search Bar */}
                    <div className="relative w-full max-w-md z-10">
                        <input
                            type="text"
                            placeholder="חפש לקוח או סוכן..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 backdrop-blur-md text-white px-8 py-3.5 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-500 text-center italic"
                        />
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30">🔍</div>
                    </div>
                </CardContent>
            </Card>

            {/* Table Section */}
            <div className="w-full">
                {/* 🚀 שורה 93 מתוקנת: הוסרו ה-border-slate-200/60 וה-shadow-xl של ה-Card כדי להעלים את קופסת המסגרת החיצונית */}
                <Card className="rounded-[3rem] border-none shadow-none bg-white overflow-hidden">
                    <CardHeader className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <CardTitle className="text-xl font-black italic tracking-tighter text-slate-900">Loan Pipeline Audit</CardTitle>
                            <CardDescription className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mt-1">ריכוז נתוני הלוואות וסטטוס נציגים</CardDescription>
                        </div>
                        <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-100 font-black text-[10px] px-4 py-1 rounded-full">
                            {filteredLeads.length} תיקים נמצאו
                        </Badge>
                    </CardHeader>

                    <div className="overflow-x-auto">
                        <table className="w-full text-right border-collapse table-fixed">
                            <thead>
                                <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-wider border-b border-slate-100 italic">
                                    <th className="w-[15%] py-6 pr-8">תאריך</th>
                                    <th className="w-[20%] py-6 px-4">לקוח</th>
                                    <th className="w-[15%] py-6 px-4">סכום</th>
                                    <th className="w-[15%] py-6 px-4">סוכן</th>
                                    <th className="w-[20%] py-6 px-4">מטרה</th>
                                    <th className="w-[15%] py-6 px-4 text-center">סטטוס</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredLeads.length > 0 ? (
                                    filteredLeads.map((row) => (
                                        <tr key={row.id} className="hover:bg-indigo-50/20 transition-all duration-300 h-20">
                                            <td className="py-4 pr-8浏览 text-slate-400 font-medium text-xs font-mono">{row.date}</td>
                                            <td className="py-4 px-4 font-black text-slate-900 text-md tracking-tight truncate italic">{row.firstname}</td>
                                            <td className="py-4 px-4 font-mono font-black text-indigo-600 italic text-lg">₪{Number(row.amount).toLocaleString()}</td>
                                            <td className="py-4 px-4 text-slate-500 font-bold text-xs uppercase">{row.agent}</td>
                                            <td className="py-4 px-4 text-slate-400 font-bold text-xs italic truncate">{row.purpose}</td>
                                            <td className="py-4 px-4 text-center">
                                                <div className="flex justify-center">
                                                    <Badge 
                                                        variant="secondary" 
                                                        className={`text-[11px] font-black uppercase px-4 py-1.5 rounded-lg shadow-sm border ${
                                                            row.status === 'סגור' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                                        }`}
                                                    >
                                                        {row.status}
                                                    </Badge>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-24 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <span className="text-3xl opacity-50">🔍</span>
                                                <p className="text-slate-400 font-bold text-sm italic">לא נמצאו תוצאות התואמות לחיפוש שלך...</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                <div className="mt-8 text-center pb-12 opacity-30">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] italic">Nivision Internal Intelligence • 2026 Audit</p>
                </div>
            </div>
        </div>
    );
}