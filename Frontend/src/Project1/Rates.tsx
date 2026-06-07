import { useMemo } from "react";
import dataService from "../Service/DataService";
import { useQuery } from "@tanstack/react-query";

// ייבוא רכיבי Shadcn UI
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export default function MonthlyAuditDashboard() {
    const { data: rawLeads, isLoading: isDataLoading } = useQuery({
        queryKey: ["rawLeads"],
        queryFn: () => dataService.getRawLeadsData(),
        staleTime: 1000 * 60 * 5,
    });

    const monthNames = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];

    const monthlyData = useMemo(() => {
        if (!rawLeads || !Array.isArray(rawLeads)) return null;

        const purposeMatrix: Record<string, Record<string, { requests: number; closed: number }>> = {};
        const sourceMatrix: Record<string, Record<string, { requests: number; closed: number }>> = {};
        
        const activeMonthIndices = new Set<number>(); 
        const purposes = new Set<string>();
        const sources = new Set<string>();

        rawLeads.forEach((item: any) => {
            const amount = parseFloat(item.amount) || 0;
            const status = item.hs_lead_status || "";
            const isClosedStatus = status === "closed";
            
            if (amount <= 0) return;

            const purpose = item.loan_purpose || "כללי";
            const source = item.lead_source || "אורגני";
            const date = new Date(item.createdate || item.addedAt);
            const mIndex = date.getMonth();
            const monthName = monthNames[mIndex];

            purposes.add(purpose);
            sources.add(source);
            activeMonthIndices.add(mIndex);

            if (!purposeMatrix[purpose]) purposeMatrix[purpose] = {};
            if (!purposeMatrix[purpose][monthName]) purposeMatrix[purpose][monthName] = { requests: 0, closed: 0 };
            
            purposeMatrix[purpose][monthName].requests++;
            if (isClosedStatus) purposeMatrix[purpose][monthName].closed++;

            if (!sourceMatrix[source]) sourceMatrix[source] = {};
            if (!sourceMatrix[source][monthName]) sourceMatrix[source][monthName] = { requests: 0, closed: 0 };
            
            sourceMatrix[source][monthName].requests++;
            if (isClosedStatus) sourceMatrix[source][monthName].closed++;
        });

        const activeMonths = Array.from(activeMonthIndices)
            .sort((a, b) => a - b)
            .map(index => monthNames[index]);

        return { 
            purposeMatrix, 
            sourceMatrix, 
            purposeList: Array.from(purposes), 
            sourceList: Array.from(sources),
            activeMonths
        };
    }, [rawLeads]);

    if (isDataLoading) return (
        <div className="flex h-screen items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-6">
                <div className="w-16 h-16 border-4 border-slate-100 border-t-[#121931] rounded-full animate-spin"></div>
                <div className="font-black text-[#121931] italic text-xl tracking-widest animate-pulse uppercase">Matrix Sync...</div>
            </div>
        </div>
    );

    const renderCell = (data: { requests: number; closed: number } | undefined, cellKey: string) => {
        /* 🚀 קווי הרשת (border-x) הודגשו ל-border-slate-200/80 כדי שהחלוקה בין התאים תהיה ברורה ומודגשת */
        if (!data || data.requests === 0) return <TableCell key={cellKey} className="text-center text-slate-300 border-x border-slate-200/80 bg-slate-50/20 opacity-40 font-mono">-</TableCell>;
        
        return (
            <TableCell key={cellKey} className="text-center p-6 border-x border-slate-200/80 bg-white group hover:bg-slate-50/80 transition-all duration-300">
                <div className="flex flex-col items-center justify-center gap-3">
                    <div className="flex flex-col items-center leading-none">
                        <span className="text-[9px] text-slate-400 font-black uppercase mb-1.5 tracking-tight">בקשות</span>
                        <span className="text-xl font-black text-[#121931] italic font-mono">{data.requests}</span>
                    </div>
                    
                    <div className="w-8 h-[1px] bg-slate-200 group-hover:w-12 transition-all"></div>
                    
                    <div className="flex flex-col items-center leading-none">
                        <span className="text-[9px] text-slate-400 font-black uppercase mb-1.5 tracking-tight">סגירות</span>
                        <span className={`text-xl font-black italic font-mono ${data.closed > 0 ? 'text-blue-600' : 'text-slate-300'}`}>
                            {data.closed}
                        </span>
                    </div>
                </div>
            </TableCell>
        );
    };

    return (
        <div dir="rtl" className="w-full max-w-[1400px] mx-auto h-auto p-4 md:p-10 space-y-10 font-sans select-none overflow-hidden">
            
            {/* Header */}
            <header className="w-full bg-[#121931] p-10 md:p-12 rounded-[3.5rem] relative overflow-hidden border-b-8 border-indigo-600 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] hover:shadow-2xl transition-all duration-300 ease-out hover:-translate-y-1.5 cursor-pointer">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="relative z-10">
                    <span className="text-blue-400 text-[10px] font-black tracking-[0.5em] uppercase mb-3 block italic opacity-80">Matrix Business Intelligence</span>
                    <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase leading-none">MONTHLY AUDIT</h1>
                    <p className="text-slate-400 font-bold text-sm md:text-lg mt-4 opacity-60 border-r-2 border-white/10 pr-6">ניתוח אפקטיביות חוצה חודשים - בקשות מול סגירות</p>
                </div>
            </header>

            {/* טבלה 1: פילוח לפי תחום */}
            <Card className="rounded-[3.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.03)] hover:shadow-2xl transition-all duration-300 ease-out hover:-translate-y-1.5 bg-white border border-slate-200 overflow-hidden cursor-pointer">
                <CardHeader className="px-12 py-8 bg-[#121931] border-b border-white/5 relative">
                    <CardTitle className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-6 relative z-10">
                        <div className="w-2.5 h-10 bg-indigo-500 rounded-full"></div>
                        פילוח סגירות לפי תחום
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto scrollbar-hidden">
                    <Table>
                        <TableHeader className="bg-slate-50/80">
                            {/* 🚀 קו תחתון מודגש ל-Header */}
                            <TableRow className="hover:bg-transparent border-b-2 border-slate-200">
                                <TableHead className="text-right pr-12 font-black text-slate-500 w-80 text-[11px] uppercase tracking-widest italic">תחום פעילות</TableHead>
                                {monthlyData?.activeMonths.map(m => (
                                    <TableHead key={m} className="text-center font-black text-[#121931] text-base italic">{m}</TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {monthlyData?.purposeList.map((purpose) => (
                                /* 🚀 קווי הפרדה מודגשים בין השורות border-b-2 border-slate-100 */
                                <TableRow key={purpose} className="hover:bg-slate-50/20 border-b-2 border-slate-100 group">
                                    <TableCell className="pr-12 font-black text-[#121931] italic text-2xl border-l border-slate-200/80 group-hover:text-indigo-600 transition-colors duration-500">{purpose}</TableCell>
                                    {monthlyData.activeMonths.map(month => renderCell(monthlyData.purposeMatrix[purpose][month], `${purpose}-${month}`))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* טבלה 2: מקורות הגעה */}
            <Card className="rounded-[3.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.03)] hover:shadow-2xl transition-all duration-300 ease-out hover:-translate-y-1.5 bg-white border border-slate-200 overflow-hidden cursor-pointer">
                <CardHeader className="px-12 py-8 bg-[#121931] border-b border-white/5">
                    <CardTitle className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-6 relative z-10">
                        <div className="w-2.5 h-10 bg-blue-500 rounded-full"></div>
                        פילוח סגירות לפי מקור הגעה
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto scrollbar-hidden">
                    <Table>
                        <TableHeader className="bg-slate-50/80">
                            {/* 🚀 קו תחתון מודגש ל-Header */}
                            <TableRow className="hover:bg-transparent border-b-2 border-slate-200">
                                <TableHead className="text-right pr-12 font-black text-slate-500 w-80 text-[11px] uppercase tracking-widest italic">מקור הגעה</TableHead>
                                {monthlyData?.activeMonths.map(m => (
                                    <TableHead key={m} className="text-center font-black text-[#121931] text-base italic">{m}</TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {monthlyData?.sourceList.map((source) => (
                                /* 🚀 קווי הפרדה מודגשים בין השורות border-b-2 border-slate-100 */
                                <TableRow key={source} className="hover:bg-slate-50/20 border-b-2 border-slate-100 group">
                                    {/* 👑 תיקון הגופן והסטייל: העמודה הראשונה קיבלה בדיוק את אותו גופן מובלט ויוקרתי (italic text-2xl font-black) כמו הטבלה הראשונה לאחידות מלאה */}
                                    <TableCell className="pr-12 font-black text-[#121931] italic text-2xl border-l border-slate-200/80 group-hover:text-blue-500 transition-colors duration-500">{source}</TableCell>
                                    {monthlyData.activeMonths.map(month => renderCell(monthlyData.sourceMatrix[source][month], `${source}-${month}`))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Footer Audit Message */}
            <div className="w-full text-center py-10 opacity-30">
                <p className="text-[11px] font-black text-[#121931] uppercase tracking-[1.5em] italic">
                    Nivision Matrix • Data Validation Audit 2026
                </p>
            </div>
        </div>
    );
}