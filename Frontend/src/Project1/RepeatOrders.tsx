import { useMemo, useState, useEffect } from "react";
import dataService from "../Service/DataService";
import { useQuery } from "@tanstack/react-query";
import { flexRender, getCoreRowModel, useReactTable, ColumnDef } from "@tanstack/react-table";
import { Badge } from "../ui/badge";

interface HubSpotLead {
    id: string;
    firstname: string;
    amount: number;
    ai_summary: string;
    status: string;
    date: string;
    rawDate: Date;
    monthKey: string;
    weekRange: string;
}

const getWeekRange = (date: Date) => {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return `${start.getDate()}.${start.getMonth() + 1} - ${end.getDate()}.${end.getMonth() + 1}`;
};

const statusMap: Record<string, string> = {
    'new': 'חדש',
    'closed': 'נסגר',
    'open_deal': 'עסקה פתוחה',
    'in_progress': 'בתהליך'
};

export default function AdminReturnedOrders() {
    const { data: allLeads, isLoading } = useQuery<HubSpotLead[]>({
        queryKey: ["hubspotLeads"],
        queryFn: async () => {
            const response = await dataService.getRawLeadsData();
            return response.filter((item: any) => {
                const props = item?.properties || item;
                return props.amount !== null && Number(props.amount) > 0;
            }).map((item: any) => {
                const props = item?.properties || item;
                const dateObj = props.createdate ? new Date(props.createdate) : new Date();
                return {
                    id: props.hs_object_id || item.id,
                    rawDate: dateObj,
                    date: dateObj.toLocaleDateString('he-IL'),
                    firstname: props.firstname || "לקוח",
                    amount: Number(props.amount),
                    ai_summary: props.ai_summary || "מנתח נתוני ליד...",
                    status: props.hs_lead_status ? (statusMap[String(props.hs_lead_status).toLowerCase()] || props.hs_lead_status) : 'לא ידוע',
                    monthKey: dateObj.toLocaleString('he-IL', { month: 'long', year: 'numeric' }),
                    weekRange: getWeekRange(dateObj)
                };
            });
        },
    });

    const [selectedMonth, setSelectedMonth] = useState<string>("");
    const [selectedWeek, setSelectedWeek] = useState<string>("");

    const months = useMemo(() => allLeads ? Array.from(new Set(allLeads.map(l => l.monthKey))).reverse() : [], [allLeads]);
    
    // הגדרת ברירת מחדל אוטומטית לשבוע האחרון שבו יש פעילות
    useEffect(() => {
        if (allLeads && allLeads.length > 0 && !selectedMonth) {
            const latestLead = [...allLeads].sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime())[0];
            setSelectedMonth(latestLead.monthKey);
            setSelectedWeek(latestLead.weekRange);
        }
    }, [allLeads, selectedMonth]);

    const weeksInMonth = useMemo(() => {
        if (!allLeads || !selectedMonth) return [];
        const weeks = allLeads
            .filter(l => l.monthKey === selectedMonth)
            .map(l => ({
                range: l.weekRange,
                sortDate: new Date(l.rawDate.getFullYear(), l.rawDate.getMonth(), l.rawDate.getDate() - l.rawDate.getDay())
            }));
        return Array.from(new Map(weeks.map(w => [w.range, w])).values())
            .sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime())
            .map(w => w.range);
    }, [allLeads, selectedMonth]);

    const filteredLeads = useMemo(() => allLeads?.filter(l => l.weekRange === selectedWeek) || [], [allLeads, selectedWeek]);

    const columns = useMemo<ColumnDef<HubSpotLead>[]>(() => [
        { header: "תאריך", accessorKey: "date", size: 100, cell: (info) => <span className="text-slate-400 font-bold text-xs">{info.getValue() as string}</span> },
        { header: "לקוח", accessorKey: "firstname", size: 150, cell: (info) => <span className="font-black text-[#121931] italic">{info.getValue() as string}</span> },
        { header: "סכום", accessorKey: "amount", size: 120, cell: (info) => <span className="font-black text-indigo-600">₪{Number(info.getValue()).toLocaleString()}</span> },
        { header: "סיכום AI", accessorKey: "ai_summary", size: 500, cell: (info) => <p className="text-slate-500 text-xs leading-relaxed truncate hover:whitespace-normal">{info.getValue() as string}</p> },
        { header: "סטטוס", accessorKey: "status", size: 100, cell: (info) => <Badge className="bg-slate-100 text-slate-600 border-none px-4 py-1">{info.getValue() as string}</Badge> },
    ], []);

    const table = useReactTable({ data: filteredLeads, columns, getCoreRowModel: getCoreRowModel() });

    if (isLoading) return <div className="flex h-screen items-center justify-center font-black text-indigo-600 italic">SYNCING...</div>;

    return (
        <div dir="rtl">
            <div className="max-w-[1400px] mx-auto mb-10 bg-[#121931] rounded-[2.5rem] p-10 text-white shadow-2xl">
                <h1 className="text-4xl font-black italic">ריכוז לידים (סכומים מאומתים)</h1>
            </div>

            <div className="max-w-[1400px] mx-auto mb-8 space-y-4">
                <div className="flex gap-3">
                    {months.map(m => (
                        <button key={m} onClick={() => { setSelectedMonth(m); setSelectedWeek(""); }} 
                            className={`px-6 py-2 rounded-full font-black text-xs transition ${selectedMonth === m ? 'bg-indigo-600 text-white' : 'bg-white border'}`}>
                            {m}
                        </button>
                    ))}
                </div>
                {selectedMonth && (
                    <div className="flex gap-2 p-1 bg-white rounded-full border border-slate-200 shadow-sm w-fit">
                        {weeksInMonth.map(w => (
                            <button key={w} onClick={() => setSelectedWeek(w)} 
                                className={`px-5 py-2 rounded-full text-[10px] font-black transition-all ${selectedWeek === w ? "bg-[#121931] text-white shadow-md scale-105" : "bg-transparent text-slate-500 hover:bg-slate-100"}`}>
                                {w}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="max-w-[1400px] mx-auto bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
                <table className="w-full border-collapse table-fixed">
                    <thead className="border-b border-slate-100">
                        {table.getHeaderGroups().map(hg => (
                            <tr key={hg.id}>{hg.headers.map(h => (
                                <th key={h.id} style={{ width: h.column.columnDef.size }} className="p-8 text-[10px] uppercase text-slate-400 font-black text-right">
                                    {flexRender(h.column.columnDef.header, h.getContext())}
                                </th>
                            ))}</tr>
                        ))}
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {table.getRowModel().rows.map(row => (
                            <tr key={row.id} className="hover:bg-slate-50">
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id} className="px-10 py-6 truncate align-middle">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}