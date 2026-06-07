import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import dataService from '../Service/DataService';
import { Card, CardContent } from "../ui/card";

const LeadsEfficiencyTable = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // 1. סנכרון מלא מול ה-Cache המרכזי
  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["rawLeads"],
    queryFn: () => dataService.getRawLeadsData(),
    staleTime: 1000 * 60 * 5,
  });

  // מילון תרגום סטטוסים
  const translateStatus = (status: string) => {
    if (!status) return "לא צוין";
    const statusMap: { [key: string]: string } = {
      'IN_PROGRESS': 'בטיפול',
      'closed': 'סגור',
      'OPEN': 'פתוח',
      'OPEN_DEAL': 'עסקה פתוחה',
      'NEW': 'חדש',
      'QUALIFIED': 'מאושר'
    };
    return statusMap[status] || status;
  };

  const filteredLeads = leads.filter((lead: any) => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = (lead.firstname || '').toLowerCase();
    const agentName = (lead.assigned_agent_name || '').toLowerCase();
    const amount = Number(lead.amount) || 0;
    
    return amount > 0 && (fullName.includes(searchLower) || agentName.includes(searchLower));
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return "בתהליך...";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "תאריך לא תקין";
    return date.toLocaleDateString('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '.');
  };

  if (isLoading) return (
    <div className="flex h-[400px] items-center justify-center bg-white rounded-[3rem] border border-slate-100 shadow-sm">
      <div className="animate-pulse text-[#121931] font-black italic uppercase tracking-widest">Auditing Efficiency Matrix...</div>
    </div>
  );

  return (
    /* 🚀 המעטפת הראשית מיושרת עם מרווח סימטרי מדויק של p-4 md:p-8 ללא מסגרות בהירות חתוכות */
    <div className="w-full max-w-[1400px] mx-auto h-auto p-4 md:p-8 space-y-8 font-sans relative overflow-hidden" dir="rtl">
      
      {/* 🚀 ה-Header תוקן ארכיטקטונית: הוסר ה-margin השלילי המעוות והוא הוכנס לתוך קפסולת Card סימטרית וממורכזת לחלוטין */}
      <Card className="w-full bg-[#121931] border-none shadow-2xl rounded-[3rem] overflow-hidden">
        <CardContent className="p-10 relative flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="absolute top-0 right-0 w-80 h-full bg-indigo-500/5 blur-[100px] pointer-events-none" />
          
          <div className="space-y-2 text-right relative z-10 w-full md:w-auto whitespace-nowrap">
              <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.5em] mb-1 italic">Neural Operations Center</p>
              <h2 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter uppercase leading-none">ניטור יעילות טיפול</h2>
              <p className="text-slate-400 text-xs font-bold opacity-60 italic">מעקב תפוקת סוכנים וזמני תגובה - Real Time Audit</p>
          </div>
          
          <div className="relative w-full md:w-80 z-10">
              <input
                  type="text"
                  placeholder="חפש לקוח או נציג..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-indigo-400 transition-all text-white text-right placeholder:text-slate-500 font-bold"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="absolute left-5 top-4.5 opacity-40">🔍</span>
          </div>
        </CardContent>
      </Card>

      {/* Table Area */}
      <div className="bg-white rounded-[3rem] border-none shadow-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] border-b border-slate-100 italic">
                <th className="py-8 pr-12">לקוח</th>
                <th className="py-8 px-4">סכום הלוואה</th>
                <th className="py-8 px-4 text-center">סטטוס תפעולי</th>
                <th className="py-8 px-4">סוכן מטפל</th>
                <th className="py-8 px-4">זמן כניסה</th>
                <th className="py-8 pl-12">עדכון אחרון</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredLeads.map((lead: any, index: number) => (
                <tr key={index} className="group hover:bg-slate-50/50 transition-all duration-300">
                  <td className="py-8 pr-12 font-black text-[#121931] italic text-lg group-hover:text-indigo-600 transition-colors">
                    {lead.firstname}
                  </td>
                  <td className="py-8 px-4 font-mono font-black text-indigo-600 italic text-base">
                    ₪{Number(lead.amount).toLocaleString()}
                  </td>
                  <td className="py-8 px-4 text-center">
                    {lead.hs_lead_status ? (
                      <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 border-slate-100 bg-white text-[#121931] shadow-sm">
                        {translateStatus(lead.hs_lead_status)}
                      </span>
                    ) : (
                      <span className="text-slate-300 text-[10px] font-black italic uppercase tracking-tighter"> ממתין לעדכון</span>
                    )}
                  </td>
                  <td className="py-8 px-4 font-bold text-slate-500 text-sm italic">
                    {lead.assigned_agent_name || 'טרם שובץ'}
                  </td>
                  <td className="py-8 px-4 font-mono text-slate-400 text-xs font-bold">
                    {formatDate(lead.createdate)}
                  </td>
                  <td className="py-8 pl-12 font-mono text-slate-400 text-xs font-bold">
                    {formatDate(lead.lastmodifieddate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-12 flex justify-between items-center px-10">
          <div className="flex items-center gap-4 text-[11px] font-black text-[#121931] uppercase tracking-[0.5em] opacity-30 italic">
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
              Neural Efficiency Live Feed
          </div>
          <div className="h-1 w-32 bg-[#121931] rounded-full opacity-10"></div>
      </div>
    </div>
  );
};

export default LeadsEfficiencyTable;