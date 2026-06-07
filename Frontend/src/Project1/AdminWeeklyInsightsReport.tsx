import { useMemo } from "react";
import dataService from "../Service/DataService";
import { useQuery } from "@tanstack/react-query";

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
import { User, MessageSquareText } from "lucide-react";

interface WeeklyLeadInsight {
    id: string;
    date: string;
    firstname: string;
    loanAmount: number;
    assignedAgent: string; // שם הנציג
    postCallOutcome: string; // תוצאת השיחה
    callStatus: string;
}

export default function AdminWeeklyInsightsReport() {
    const { data: rawLeads, isLoading: isLoadingLeads } = useQuery({
        queryKey: ["rawLeadsData"],
        queryFn: () => dataService.getRawLeadsData(),
        staleTime: 1000 * 60 * 5, 
    });

    const filteredLeads = useMemo<WeeklyLeadInsight[]>(() => {
        if (!rawLeads) return [];
        const fourDaysAgo = Date.now() - (4 * 24 * 60 * 60 * 1000);

        return rawLeads
            .filter((item: any) => {
                const props = item?.properties || item;
                const dateVal = props.createdate || item.addedAt;
                const addedTime = dateVal ? new Date(dateVal).getTime() : 0;
                const status = String(props.hs_lead_status || "").toLowerCase();
                
                // בדיקה: סטטוס לא סגור
                const isNotClosed = !status.includes("closed") && !status.includes("נסגר");
                // בדיקה: זמן המתנה חריג (4 ימים)
                const isOldEnough = addedTime <= fourDaysAgo;
                // בדיקה: סכום הלוואה גדול מ-0
                const hasAmount = Number(props.amount) > 0;

                return isOldEnough && isNotClosed && hasAmount;
            })
            .map((item: any) => {
                const props = item?.properties || item;

                const translateStatus = (status: any) => {
                    if (!status) return "לא צוין";
                    const s = String(status).toUpperCase();
                    if (s.includes('NEW')) return 'ליד חדש';
                    if (s.includes('IN_PROGRESS')) return 'בטיפול פעיל';
                    if (s.includes('OPEN_DEAL')) return 'עסקה פתוחה';
                    if (s.includes('ATTEMPTED')) return 'ניסיון קשר';
                    return status;
                };

                return {
                    id: props.hs_object_id || item.id || Math.random().toString(),
                    date: props.createdate ? new Date(props.createdate).toLocaleDateString('he-IL') : "---",
                    firstname: props.firstname || "לא צוין",
                    loanAmount: Number(props.amount) || 0,
                    assignedAgent: props.assigned_agent_name || "טרם שובץ",
                    postCallOutcome: props.postcall_outcome || "אין תיעוד שיחה",
                    callStatus: translateStatus(props.hs_lead_status)
                };
            });
    }, [rawLeads]);

    if (isLoadingLeads) return <div className="flex h-screen items-center justify-center bg-transparent font-black text-red-600 animate-pulse text-xl uppercase tracking-[0.3em] italic">SCANNING EXPIRED LEADS... 🚨</div>;

    return (
        /* 🚀 שורה 72 מתוקנת: הוסרו ה-bg וה-min-h-screen, והגדרנו רוחב מקסימלי אחיד וסימטרי לכל האלמנטים בדף */
        <div dir="rtl" className="w-full max-w-[1400px] mx-auto h-auto p-4 md:p-8 space-y-8 font-sans selection:bg-red-100 relative overflow-hidden">
            
            {/* Urgent Header Card */}
            {/* 🚀 שורה 75 מתוקנת: שונה ל-w-full ו-rounded-[3rem] כדי ליישר את רוחב הכותרת בצורה מושלמת אל מול רוחב הטבלה */}
            <Card className="w-full bg-red-950 border-none shadow-[0_40px_80px_-15px_rgba(153,27,27,0.4)] overflow-hidden rounded-[3rem] border-b-4 border-red-600">
                <CardContent className="p-10 relative flex flex-col items-center text-center">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-red-500/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
                    <div className="flex items-center gap-3 mb-4 z-10">
                        <span className="animate-ping w-2 h-2 rounded-full bg-red-500"></span>
                        <span className="text-red-400 text-[10px] font-black tracking-[0.4em] uppercase italic">Priority Action Required</span>
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter mb-2 z-10 italic">דו"ח לידים בהמתנה חריגה</h1>
                    <p className="text-red-200/60 font-bold text-sm max-w-lg z-10 italic">
                        המערכת זיהתה {filteredLeads.length} תיקים שלא טופלו מעל 4 ימים. יש לוודא מול הנציגים את סטטוס ההתקדמות.
                    </p>
                </CardContent>
            </Card>

            {/* Table Section */}
            <div className="w-full">
                {/* 🚀 שורה 91 מתוקנת: הוסרו ה-border-slate-200/60 וה-shadow-xl של ה-Card כדי להעלים את קופסת המסגרת החיצונית המפרידה */}
                <Card className="rounded-[3rem] border-none shadow-none bg-white overflow-hidden flex flex-col">
                    <CardHeader className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <CardTitle className="text-xl font-black italic tracking-tighter text-slate-900">מעקב נציגים ותוצאות</CardTitle>
                            <CardDescription className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mt-1">Operational Performance Oversight</CardDescription>
                        </div>
                        <Badge variant="destructive" className="font-black px-4 py-1 rounded-full text-[10px] shadow-lg animate-pulse">
                            {filteredLeads.length} EXPIRED
                        </Badge>
                    </CardHeader>

                    <div className="overflow-x-auto">
                        <table className="w-full text-right border-collapse table-fixed">
                            <thead>
                                <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-wider border-b border-slate-100 italic">
                                    <th className="w-[12%] py-6 pr-8">תאריך</th>
                                    <th className="w-[18%] py-6 px-4">לקוח</th>
                                    <th className="w-[15%] py-6 px-4">נציג אחראי</th>
                                    <th className="w-[30%] py-6 px-4">תוצאת שיחה אחרונה</th>
                                    <th className="w-[15%] py-6 px-4 text-center">סכום</th>
                                    <th className="w-[10%] py-6 pl-8 text-center">סטטוס</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredLeads.length > 0 ? (
                                    filteredLeads.map((row) => (
                                        <tr key={row.id} className="hover:bg-red-50/30 transition-all duration-300 h-20 bg-transparent">
                                            <td className="py-4 pr-8 text-slate-400 font-medium text-xs tracking-wider font-mono italic">
                                                {row.date}
                                            </td>
                                            
                                            <td className="py-4 px-4 font-black text-slate-900 text-md tracking-tight truncate">
                                                {row.firstname}
                                            </td>

                                            <td className="py-4 px-4">
                                                <div className="inline-flex items-center gap-2 bg-indigo-50/50 p-2 rounded-xl border border-indigo-100/50">
                                                    <User className="w-3 h-3 text-indigo-600" />
                                                    <span className="text-xs font-black text-indigo-900 italic">{row.assignedAgent}</span>
                                                </div>
                                            </td>

                                            <td className="py-4 px-4">
                                                <div className="flex items-start gap-2 max-w-[280px]">
                                                    <MessageSquareText className="w-4 h-4 text-slate-300 mt-1 shrink-0" />
                                                    <p className="text-[11px] font-bold text-slate-600 leading-tight italic whitespace-pre-wrap">
                                                        {row.postCallOutcome}
                                                    </p>
                                                </div>
                                            </td>

                                            <td className="py-4 px-4 font-mono font-black text-slate-700 italic text-center text-lg">
                                                ₪{row.loanAmount.toLocaleString()}
                                            </td>

                                            <td className="py-4 pl-8 text-center">
                                                <div className="flex justify-center">
                                                    <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest bg-red-50 text-red-600 border-red-100 px-3">
                                                        {row.callStatus}
                                                    </Badge>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-24 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-3xl">✅</div>
                                                <p className="text-emerald-600 font-black text-xl italic tracking-tight">הצנרת נקייה לגמרי!</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            <div className="mt-8 text-center pb-12 opacity-30">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] italic">
                    Nivision 2026 • Real-time Lead Monitoring
                </p>
            </div>
        </div>
    );
}