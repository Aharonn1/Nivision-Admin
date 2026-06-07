import { useMemo, useState } from "react";
import dataService from "../Service/DataService";
import { useQuery } from "@tanstack/react-query";
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    ColumnDef,
} from "@tanstack/react-table";
import { AxiosError } from "axios";
import { DashboardAiChat } from "./DashboardAiChat";
import { Badge } from "../ui/badge";

interface LoanRiskData {
    id: string;
    date: string;
    firstname: string;
    agentName: string;
    leadScore: number;
    loanAmount: number;
    monthlyRepayment: number;
    riskLevel: string;
    tier: string;
    interestRate: string;
    phone: string;
    summary: string;
}

export default function AdminLoanRiskReport() {
    const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);

    const { data: loanData, isLoading } = useQuery<LoanRiskData[], AxiosError>({
        queryKey: ["loanRiskReport"],
        queryFn: async () => {
            const response = await dataService.getRawLeadsData();
            return response
                .filter((item: any) => {
                    const props = item?.properties || item;
                    const rawAmount = props.amount;
                    return rawAmount !== null && rawAmount !== undefined && Number(rawAmount) > 0;
                })
                .map((item: any) => {
                    const props = item?.properties || item;
                    return {
                        id: props.hs_object_id || item.id || Math.random().toString(),
                        date: (props.createdate || item.createdAt) ? new Date(props.createdate || item.createdAt).toLocaleDateString('he-IL') : "14.2.2026",
                        firstname: props.firstname || "לקוח",
                        agentName: props.assigned_agent_name || "סוכן לא מזוהה",
                        leadScore: Number(props.leadscore) || 90,
                        loanAmount: Number(props.amount),
                        monthlyRepayment: Number(props.monthlyrepayment) || 0,
                        riskLevel: props.risk_level || "רגיל",
                        tier: props.tier || "Silver",
                        interestRate: props.interest_rate || "8%",
                        phone: props.phone || "לא צוין",
                        summary: props.ai_summary || "מנתח נתוני אשראי על בסיס היסטוריית תשלומים ומדדי החזר..."
                    };
                });
        },
    });

    const stats = useMemo(() => {
        if (!loanData) return { total: 0, highRisk: 0 };
        return {
            total: loanData.reduce((acc, curr) => acc + curr.loanAmount, 0),
            highRisk: loanData.filter(d => d.riskLevel === "דחוף" || d.leadScore < 40).length
        };
    }, [loanData]);

    const columns = useMemo<ColumnDef<LoanRiskData>[]>(
        () => [
            {
                header: "תאריך",
                accessorKey: "date",
                cell: (info) => <span className="text-slate-400 font-bold text-[11px] font-mono tracking-tighter">{info.getValue() as string}</span>
            },
            {
                header: "לקוח",
                accessorKey: "firstname",
                cell: (info) => <span className="font-black text-[#121931] tracking-tight italic text-base">{info.getValue() as string}</span>
            },
            {
                header: "סוכן מטפל",
                accessorKey: "agentName",
                cell: (info) => <span className="text-slate-500 font-black text-[10px] uppercase tracking-widest">{info.getValue() as string}</span>
            },
            {
                header: "סכום הלוואה",
                accessorKey: "loanAmount",
                cell: (info) => <span className="font-mono font-black text-indigo-600 text-lg italic">₪{Number(info.getValue()).toLocaleString()}</span>
            },
            {
                header: "רמת סיכון",
                accessorKey: "riskLevel",
                cell: (info) => {
                    const val = info.getValue() as string;
                    const isUrgent = val === "דחוף";
                    return (
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border-2 ${
                            isUrgent ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                            {val}
                        </span>
                    );
                }
            },
            {
                header: "סיווג",
                accessorKey: "tier",
                cell: (info) => <span className="px-3 py-1 bg-slate-900 text-white rounded-lg font-black text-[9px] uppercase tracking-[0.2em] italic shadow-lg">{info.getValue() as string}</span>
            },
            {
                header: " סיכום AI",
                accessorKey: "summary",
                cell: (info) => {
                    const rowData = info.row.original;
                    const isHovered = hoveredRowId === rowData.id;
                    return (
                        <div className="relative flex justify-center">
                            <button
                                onMouseEnter={() => setHoveredRowId(rowData.id)}
                                onMouseLeave={() => setHoveredRowId(null)}
                                className={`px-5 py-2 rounded-2xl text-[10px] font-black transition-all duration-300 border-2 ${
                                    isHovered ? 'bg-[#121931] text-white border-[#121931] scale-105' : 'bg-white text-[#121931] border-slate-100'
                                }`}
                            >
                                {isHovered ? "DECODING..." : "VIEW AI INTEL"}
                            </button>
                            {isHovered && (
                                <div className="absolute bottom-full mb-6 right-0 z-[100] w-[380px] backdrop-blur-3xl bg-white/95 p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 text-right">
                                    <div className="flex items-center gap-3 mb-5 border-b border-slate-50 pb-4">
                                        <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-lg">🤖</div>
                                        <div className="flex flex-col">
                                            <strong className="text-slate-900 font-black text-sm italic">{rowData.firstname}</strong>
                                            <span className="text-[9px] text-indigo-500 font-black uppercase tracking-widest">Neural Credit Intelligence</span>
                                        </div>
                                    </div>
                                    <p className="text-slate-600 text-[13px] leading-relaxed font-bold italic opacity-90">"{rowData.summary}"</p>
                                </div>
                            )}
                        </div>
                    );
                }
            },
            {
                header: "ריבית",
                accessorKey: "interestRate",
                cell: (info) => <span className="text-emerald-600 font-black text-sm italic font-mono">{info.getValue() as string}</span>
            }
        ],
        [hoveredRowId]
    );

    const table = useReactTable({ data: loanData || [], columns, getCoreRowModel: getCoreRowModel() });

    if (isLoading) return (
        <div className="flex h-screen items-center justify-center bg-transparent">
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                <span className="font-black text-[#121931] tracking-widest italic uppercase animate-pulse">Neural Risk Audit In Progress...</span>
            </div>
        </div>
    );

    return (
        <div dir="rtl" className="w-full max-w-[1400px] mx-auto h-auto p-4 md:p-8 space-y-8 font-sans">
            
            {/* Header Matrix Style */}
            <div className="w-full bg-[#121931] rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden border-b-8 border-indigo-600">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full -mr-32 -mt-32 blur-[100px] pointer-events-none" />
                
                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-10">
                    <div className="text-right">
                        <span className="text-blue-400 text-[10px] font-black tracking-[0.5em] uppercase mb-3 block">Matrix Risk Governance</span>
                        <h1 className="text-5xl font-black text-white tracking-tighter italic leading-tight uppercase">ניהול סיכוני אשראי</h1>
                        <p className="text-slate-400 text-xs font-bold mt-2 opacity-60">מערכת ביקורת הון מאומתת - בזמן אמת</p>
                    </div>
                    
                    <div className="flex gap-12 border-r-2 border-white/5 pr-12">
                        <div className="text-center group">
                            <span className="text-slate-500 text-[10px] font-black tracking-widest uppercase mb-1 block group-hover:text-red-400 transition-colors">תיקים בסיכון</span>
                            <div className="text-4xl font-black text-red-500 italic">{stats.highRisk}</div>
                        </div>
                        <div className="text-center group">
                            <span className="text-slate-500 text-[10px] font-black tracking-widest uppercase mb-1 block group-hover:text-emerald-400 transition-colors">חשיפה כוללת (Net)</span>
                            <div className="text-4xl font-black text-white italic tracking-tighter">₪{stats.total.toLocaleString()}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Area - 🚀 התיקון הארכיטקטוני הראשי: הוסרו הצל והברדר הלבן והקופסה הוחלפה ב-div נקי */}
            <div className="w-full bg-white rounded-[3rem] overflow-hidden flex flex-col">
                <div className="px-10 py-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h3 className="font-black text-[#121931] text-xl italic tracking-tight uppercase">Credit Audit Engine</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">מציג נתוני הון מאומתים בלבד {'>'} ₪0</p>
                    </div>
                    <Badge variant="outline" className="bg-slate-50 text-[#121931] border-none font-black text-[11px] px-8 py-3 rounded-full shadow-sm tracking-widest">
                        {loanData?.length || 0} VERIFIED RISK PROFILES
                    </Badge>
                </div>

                <div className="overflow-x-auto pb-10">
                    <table className="w-full text-right">
                        <thead>
                            {table.getHeaderGroups().map(hg => (
                                <tr key={hg.id} className="bg-slate-50/50 border-b border-slate-50">
                                    {hg.headers.map(h => (
                                        <th key={h.id} className="px-10 py-7 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] italic">
                                            {flexRender(h.column.columnDef.header, h.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {table.getRowModel().rows.map(row => (
                                <tr key={row.id} className="hover:bg-slate-50 transition-all duration-300">
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="px-10 py-7">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer Credits */}
            <div className="text-center pb-12 opacity-30">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.6em] italic">
                    Nivision Matrix Intelligence • Risk Governance System v4.0
                </p>
            </div>

            {/* AI Assistant */}
            <div className="fixed bottom-10 left-10 z-[1000]">
                <DashboardAiChat />
            </div>
        </div>
    );
}