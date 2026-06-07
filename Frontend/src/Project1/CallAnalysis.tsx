import React, { useMemo, useState } from 'react';
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Search, RefreshCw, User, MessageSquare, Activity, X, Maximize2, CheckCircle2, XCircle } from 'lucide-react';
import dataService from '../Service/DataService';

const queryClient = new QueryClient();

interface MonologueEntry {
  speaker: string;
  text: string;
}

interface AnalysisItem {
  id: string;
  agent_name: string;
  final_verdict: string;
  frustration_level: number;
  professionalism_score: number;
  checklist: {
    name_stated: boolean;
    manager_requested: boolean;
    recording_mentioned: boolean;
    loan_amount_confirmed: boolean;
  };
  monologue: MonologueEntry[];
}

const CHECKLIST_LABELS: Record<string, string> = {
  name_stated: "הזדהות בשם",
  manager_requested: "בקשת מנהל",
  recording_mentioned: "אזכור הקלטה",
  loan_amount_confirmed: "אימות סכום הלוואה"
};

const CallAnalysisDashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCall, setSelectedCall] = useState<AnalysisItem | null>(null);

  const { data: rawAnalyses, isLoading, refetch } = useQuery({
    queryKey: ["rawAnalyses"],
    queryFn: () => dataService.getAllAnalyses(),
    staleTime: 1000 * 60 * 5,
  });

  const formattedData: AnalysisItem[] = useMemo(() => {
    if (!rawAnalyses || !Array.isArray(rawAnalyses)) return [];

    return rawAnalyses
      .map((item: any) => {
        const props = item?.properties || {};
        const extract = (key: string) => {
          const field = props[key];
          return (field && typeof field === 'object' && field.value !== undefined) ? field.value : (field || '');
        };

        const parseJsonSafely = (rawStr: string) => {
          if (!rawStr) return [];
          try {
            const cleanStr = typeof rawStr === 'string' 
              ? rawStr.replace(/```json|```/g, '').trim() 
              : rawStr;
            const parsed = JSON.parse(cleanStr);
            return Array.isArray(parsed) ? parsed : [];
          } catch (e) { return []; }
        };

        const analysisObjRaw = extract('marital_status');
        const analysisObj = typeof analysisObjRaw === 'string' ? (tryParse(analysisObjRaw) || {}) : (analysisObjRaw || {});
        const parsedMonologue = parseJsonSafely(extract('message'));
        const agentName = String(extract('firstname') || 'נציג Nivision');

        let frustration = parseInt(analysisObj?.urgency_score || analysisObj?.customer_frustration_level) || 5;
        if (frustration > 10) frustration = Math.floor(frustration / 10);

        const resolveStatus = (val: any) => val === 1 || val === "1" || val === true || String(val).toLowerCase() === 'true';

        return {
          id: item?.id || Math.random().toString(),
          agent_name: agentName,
          final_verdict: String(extract('jobtitle') || analysisObj?.summary || 'ניתוח שיחה הושלם'),
          frustration_level: frustration,
          professionalism_score: parseInt(analysisObj?.agent_professionalism_score) || 8,
          checklist: {
            name_stated: resolveStatus(analysisObj.name_stated),
            manager_requested: resolveStatus(analysisObj.manager_requested),
            recording_mentioned: resolveStatus(analysisObj.regulation_check),
            loan_amount_confirmed: resolveStatus(analysisObj.loan_amount_confirmed),
          },
          monologue: parsedMonologue
        };
      })
      .filter(call => call.monologue && call.monologue.length > 0);
  }, [rawAnalyses]);

  function tryParse(str: string) {
    try { return JSON.parse(str.replace(/```json|```/g, '').trim()); } 
    catch(e) { return null; }
  }

  const filteredData = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    return formattedData.filter(item => 
      item.agent_name.toLowerCase().includes(lowerSearch) ||
      item.monologue.some(m => m.text.toLowerCase().includes(lowerSearch))
    );
  }, [formattedData, searchTerm]);

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-transparent">
      <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="w-full max-w-[1600px] mx-auto p-8 bg-transparent h-auto font-sans relative" dir="rtl">
      
      {/* מודאל */}
      {selectedCall && (
        <div className="fixed inset-0 z-[999] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
          
          <div className="bg-white w-full max-w-6xl h-[85vh] rounded-[30px] shadow-2xl overflow-hidden flex flex-col md:flex-row relative animate-in zoom-in-95 duration-300">
            
            <button 
              onClick={() => setSelectedCall(null)}
              className="absolute top-6 left-6 text-slate-400 hover:text-red-500 bg-slate-100 hover:bg-red-50 p-2 rounded-xl transition-all z-[1010] shadow-sm cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            {/* פאנל נתונים (צד ימין) */}
            <div className="w-full md:w-[320px] bg-slate-900 p-8 text-white flex flex-col shrink-0">
              <div className="flex items-center gap-3 mb-10">
                  <div className="bg-blue-600 p-3 rounded-2xl"><User className="w-6 h-6 text-white" /></div>
                  <div>
                    <h2 className="text-2xl font-black italic leading-none">{selectedCall.agent_name}</h2>
                    <p className="text-blue-400 text-[10px] font-black tracking-widest uppercase mt-1">Analysis View</p>
                  </div>
              </div>
              
              <div className="space-y-4 mb-8">
                 <div className="bg-slate-800/50 p-5 rounded-3xl border border-white/5 flex items-center justify-between">
                    <span className="text-slate-400 text-[10px] font-black uppercase">מקצועיות</span>
                    <div className="text-2xl font-black text-blue-400">{selectedCall.professionalism_score}/10</div>
                 </div>
                 <div className="bg-slate-800/50 p-5 rounded-3xl border border-white/5 flex items-center justify-between">
                    <span className="text-slate-400 text-[10px] font-black uppercase">תסכול לקוח</span>
                    <div className={`text-2xl font-black ${selectedCall.frustration_level > 7 ? 'text-red-500' : 'text-emerald-400'}`}>
                      {selectedCall.frustration_level}/10
                    </div>
                 </div>
              </div>

              <div className="mt-auto bg-slate-800/30 p-6 rounded-[30px] border border-white/5">
                <h4 className="font-black mb-6 text-xs text-blue-400 uppercase tracking-widest border-b border-white/10 pb-4">בדיקת איכות</h4>
                <div className="space-y-4">
                  {Object.entries(selectedCall.checklist).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between gap-3">
                      <span className="text-xs font-bold text-slate-300">{CHECKLIST_LABELS[key] || key}</span>
                      {val ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* תוכן תמלול (מרכז) */}
            <div className="flex-1 p-10 flex flex-col bg-white overflow-hidden">
                <div className="flex items-center gap-4 mb-8 border-b-2 border-slate-50 pb-6 shrink-0">
                    <MessageSquare className="w-7 h-7 text-blue-600" />
                    <div>
                        <h3 className="text-xl font-black text-slate-900 italic">תמלול השיחה</h3>
                        <p className="text-slate-400 font-bold text-[10px] uppercase">Sematic Analysis Flow</p>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar">
                    {selectedCall.monologue.map((msg, idx) => (
                        <div key={idx} className={`flex flex-col ${msg.speaker === 'Agent' ? 'items-start' : 'items-end'}`}>
                            <span className="text-[10px] font-black text-slate-400 mb-1 px-4 uppercase">
                                {msg.speaker === 'Agent' ? selectedCall.agent_name : 'לקוח קצה'}
                            </span>
                            <div className={`p-5 rounded-[25px] max-w-[85%] text-base leading-relaxed border ${
                                msg.speaker === 'Agent' 
                                    ? 'bg-slate-50 border-slate-100 text-slate-800 rounded-tr-none' 
                                    : 'bg-blue-600 text-white border-blue-500 rounded-tl-none font-bold shadow-md shadow-blue-100'
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 p-5 bg-slate-50 rounded-[25px] border-2 border-slate-100 italic font-bold text-slate-600 text-center text-sm shrink-0">
                    "{selectedCall.final_verdict}"
                </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      {/* 🚀 התיקון הסופי: הוסר ה-border-b-2 border-slate-200 שייצר את קו המתאר האופקי המפריד מעל הכרטיסיות */}
      <header className="mb-12 flex flex-col xl:flex-row justify-between items-center gap-8 pb-4">
        <div className="flex items-center gap-6">
          <div className="bg-blue-600 text-white p-5 rounded-[2rem] shadow-xl">
            <span className="text-4xl font-black italic">NI</span>
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Nivision Intelligence</h1>
            <p className="text-slate-400 font-black mt-1 uppercase text-[10px] tracking-widest opacity-70">Real-Time Call Analytics</p>
          </div>
        </div>

        <div className="flex flex-1 max-w-2xl items-center gap-4 w-full">
          <div className="relative flex-1 group">
            <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-all" />
            <input 
              type="text" 
              placeholder="חפש נציג או לקוח" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border-2 border-slate-200 rounded-[25px] py-4 pr-16 pl-8 focus:border-blue-600 outline-none font-bold shadow-lg"
            />
          </div>
          <button onClick={() => refetch()} className="bg-white border-2 border-slate-200 p-4 rounded-[25px] hover:bg-slate-50 active:scale-90 shadow-lg transition-all cursor-pointer">
            <RefreshCw className="w-8 h-8 text-slate-600" />
          </button>
        </div>
      </header>

      {/* גריד כרטיסיות */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredData.map((call) => (
          <div 
            key={call.id} 
            onClick={() => setSelectedCall(call)}
            className="bg-white rounded-[50px] overflow-hidden flex flex-col h-[700px] cursor-pointer transition-all transform hover:scale-[1.02] group relative border-none shadow-none"
          >
            <div className="absolute top-8 left-8 z-20 opacity-0 group-hover:opacity-100 transition-all">
                <div className="bg-blue-600 text-white p-3 rounded-2xl shadow-xl flex items-center gap-2 font-black text-xs uppercase">
                    <Maximize2 className="w-4 h-4" />
                    <span>פתח ניתוח</span>
                </div>
            </div>

            <div className="p-8 bg-slate-900 text-white rounded-t-[50px]">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-blue-600/20 p-3 rounded-xl border border-white/5"><User className="w-6 h-6 text-blue-400" /></div>
                <h2 className="text-2xl font-black italic">{call.agent_name}</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/40 p-4 rounded-[25px] text-center border border-white/5">
                  <span className="text-[9px] text-slate-500 block mb-1 font-black uppercase">תסכול</span>
                  <span className={`text-xl font-black ${call.frustration_level > 7 ? 'text-red-500' : 'text-emerald-400'}`}>{call.frustration_level}/10</span>
                </div>
                <div className="bg-slate-800/40 p-4 rounded-[25px] text-center border border-white/5">
                  <span className="text-[9px] text-slate-500 block mb-1 font-black uppercase">מקצועיות</span>
                  <span className="text-xl font-black text-blue-400">{call.professionalism_score}/10</span>
                </div>
              </div>
            </div>

            <div className="flex-1 p-8 overflow-hidden bg-white">
               <div className="flex items-center gap-3 mb-6">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <span className="font-black text-[10px] uppercase text-slate-400 italic">תקציר תמלול</span>
               </div>
               <div className="space-y-5">
                  {call.monologue.slice(0, 3).map((msg, i) => (
                    <div key={i} className="text-sm border-r-4 border-slate-50 pr-4">
                        <span className="font-black text-[9px] block text-blue-600 uppercase mb-1">{msg.speaker}</span>
                        <p className="line-clamp-2 text-slate-700 font-bold">{msg.text}</p>
                    </div>
                  ))}
               </div>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 mt-auto rounded-b-[50px]">
               <p className="text-xs font-black text-slate-400 italic line-clamp-2 opacity-80">"{call.final_verdict}"</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <CallAnalysisDashboard />
    </QueryClientProvider>
  );
};

export default App;