import { useMemo } from "react";
import dataService from "../Service/DataService";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Badge } from "../ui/badge";

interface AIActivityLead {
    id: string;
    date: string;
    firstname: string;
    status: string;
    content: string;
    purpose: string;
    amount: number;
}

const translateValue = (value: string): string => {
    if (!value) return "כללי";
    const val = value.toUpperCase().trim();
    const translations: Record<string, string> = {
        "NEW": "חדש",
        "OPEN": "פתוח",
        "IN_PROGRESS": "בטיפול",
        "CLOSED": "סגור",
    };
    return translations[val] || value;
};

export default function AdminAIActivityLog() {
    const { data: activities, isLoading } = useQuery<AIActivityLead[], AxiosError>({
        queryKey: ["aiActivityLog"],
        queryFn: async () => {
            const response: any = await dataService.getRawLeadsData();
            const rawData = Array.isArray(response) ? response : (response?.data || []);
            const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000);

            return rawData
                .filter((item: any) => {
                    const props = item?.properties || item;
                    const dateVal = props.createdate || item.createdAt;
                    return dateVal && new Date(dateVal).getTime() >= threeDaysAgo && Number(props.amount) > 0;
                })
                .map((item: any) => {
                    const props = item?.properties || item;
                    return {
                        id: props.hs_object_id || item.id || Math.random().toString(),
                        date: new Date(props.createdate || item.createdAt).toLocaleDateString('he-IL'),
                        firstname: props.firstname || "לקוח",
                        status: translateValue(props.hs_lead_status || "NEW"),
                        content: props.ai_summary || "בוצע ניתוח נתונים אסטרטגי להתאמת מסלול אופטימלי.",
                        purpose: translateValue(props.loan_purpose || "BUSINESS"),
                        amount: Number(props.amount)
                    };
                });
        },
    });

    if (isLoading) return <div className="flex h-screen items-center justify-center font-black text-indigo-600">LOADING...</div>;

    return (
        <div dir="rtl" className="p-8 ">
            
         {/* Header */}
            <div className="max-w-[1400px] mx-auto mb-10 bg-[#121931] rounded-[2.5rem] p-10 shadow-2xl text-white">
                <span className="text-indigo-400 text-[10px] font-black tracking-[0.4em] uppercase mb-2 block italic">VERIFIED FINANCIAL FEED</span>
                <h1 className="text-4xl font-black italic">יומן פעילות שלושה ימים אחרונים</h1>
            </div>

            {/* הטבלה - פינות מעוגלות למעלה ולמטה */}
            <div className="max-w-[1400px] mx-auto overflow-hidden rounded-[2rem] shadow-sm border border-slate-100 bg-white">
                <table className="w-full border-collapse">
                    <thead className="bg-white">
                        <tr className="text-right text-[10px] uppercase text-slate-400 font-black tracking-widest border-b border-slate-100">
                            <th className="py-6 pr-8">תאריך</th>
                            <th className="py-6">לקוח</th>
                            <th className="py-6">סכום הלוואה</th>
                            <th className="py-6">סטטוס</th>
                            <th className="py-6 pl-8">סיכום AI</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {activities?.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="pr-8 py-6 text-slate-500 font-bold text-xs whitespace-nowrap font-mono">{item.date}</td>
                                <td className="py-6 font-black text-slate-900 text-sm whitespace-nowrap">{item.firstname}</td>
                                <td className="py-6 font-black text-indigo-600 italic whitespace-nowrap">₪{item.amount.toLocaleString()}</td>
                                <td className="py-6">
                                    <Badge className="bg-slate-100 text-slate-700 border-none font-bold text-[10px] px-3 py-1">
                                        {item.status}
                                    </Badge>
                                </td>
                                <td className="py-6 pl-8 text-slate-600 text-xs font-medium leading-tight max-w-[500px] whitespace-normal">
                                    {item.content}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}