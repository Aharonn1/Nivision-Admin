import React, { useState, useEffect } from 'react';
import { Activity, Cpu, Database, RefreshCw, Zap, Server, Binary, Globe, ShieldCheck } from 'lucide-react';
import dataService from '../Service/DataService';
import { Badge } from '../ui/badge';

interface ContainerStats {
    container: string;
    cpu: string;
    memory_usage: string;
    mem_perc: string;
    net_io: string;
    pids: number | string | null;
}

const InfrastructureControlCenter: React.FC = () => {
    const [containers, setContainers] = useState<ContainerStats[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await dataService.getsyStemStats();
            let statsArray: ContainerStats[] = [];
            const rawData = response.data || response;

            if (Array.isArray(rawData) && rawData[0]?.stats) {
                statsArray = rawData[0].stats;
            } else if (rawData?.stats) {
                statsArray = rawData.stats;
            } else if (Array.isArray(rawData)) {
                statsArray = rawData;
            }

            // סינון וניקוי נתונים
            setContainers(statsArray.filter(item => item && item.container));
            setLastUpdated(new Date());
        } catch (err) {
            console.error("Infrastructure Sync Failed:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full max-w-[1400px] mx-auto h-auto p-4 md:p-8 space-y-8 font-sans select-none overflow-hidden" dir="rtl">
            
            {/* Background decorative elements */}
            <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-blue-200/10 rounded-full blur-[100px] pointer-events-none" />
            
            {/* Top Status Bar */}
            <div className="max-w-full bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 mb-10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.03)] border border-white flex flex-col md:flex-row justify-between items-center relative z-10">
                <div className="flex items-center gap-6">
                    <div className="bg-slate-900 p-5 rounded-[1.8rem] text-white shadow-2xl">
                        <Server size={28} />
                    </div>
                    <div className="text-right">
                        <h2 className="text-4xl font-black italic tracking-tighter text-slate-900 leading-none uppercase">
                            Infrastructure <span className="text-blue-600">Nodes</span>
                        </h2>
                        <div className="flex items-center gap-2 mt-2">
                             <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">
                                Total Active Containers: {containers.length}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-5 mt-6 md:mt-0">
                    <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-inner text-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase italic mb-1">System Pulse</p>
                        <p className="text-xs font-bold text-slate-700 font-mono tracking-widest uppercase">
                            {lastUpdated.toLocaleTimeString('he-IL')}
                        </p>
                    </div>
                    <button 
                        onClick={fetchData}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-5 rounded-2xl transition-all shadow-lg active:scale-95 group"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Containers Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 relative z-10">
                {containers.map((container, idx) => (
                    <div key={idx} className="bg-white/80 backdrop-blur-md rounded-[3.5rem] p-10 border border-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.03)] hover:shadow-2xl transition-all duration-300 ease-out hover:-translate-y-1.5 cursor-pointer group">
                        
                        {/* Header Row */}
                        <div className="flex justify-between items-start mb-10">
                            <div className="flex items-center gap-5">
                                <div className="p-4 bg-white rounded-3xl border border-slate-100 shadow-xl group-hover:scale-110 transition-transform duration-500">
                                    <Zap size={28} className="text-blue-600 fill-blue-50" />
                                </div>
                                <div className="text-right">
                                    <h3 className="text-3xl font-black italic tracking-tighter text-slate-900 uppercase leading-none">
                                        NODE-{idx + 1}
                                    </h3>
                                    <p className="text-[10px] font-mono font-bold text-blue-500/60 uppercase tracking-widest mt-2">
                                        ID: {container.container}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-4 py-1 rounded-full font-black text-[10px] italic tracking-widest uppercase">
                                    Status: Running
                                </Badge>
                            </div>
                        </div>

                        {/* Metrics Highlight Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {/* CPU Card */}
                            <div className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-slate-50">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-right">עומס מעבד</span>
                                    <Cpu size={14} className="text-blue-500" />
                                </div>
                                <div className="flex items-end justify-between gap-4">
                                    <p className="text-5xl font-black text-slate-900 italic tracking-tighter font-mono">{container.cpu}</p>
                                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                                        <div className="h-full bg-slate-900" style={{ width: container.cpu }}></div>
                                    </div>
                                </div>
                            </div>

                            {/* MEMORY Card */}
                            <div className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-slate-50">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-right">ניצול זיכרון</span>
                                    <Database size={14} className="text-indigo-500" />
                                </div>
                                <div className="flex items-end justify-between gap-4">
                                    <div className="text-right">
                                        <p className="text-5xl font-black text-slate-900 italic tracking-tighter font-mono">{container.mem_perc}</p>
                                        <p className="text-[9px] font-mono font-bold text-slate-400 mt-2 italic">{container.memory_usage}</p>
                                    </div>
                                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                                        <div className="h-full bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.4)]" style={{ width: container.mem_perc }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Technical Specs Footer */}
                        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-slate-100 gap-6">
                            <div className="flex items-center gap-10">
                                <div className="flex items-center gap-3">
                                    <Globe size={16} className="text-slate-400" />
                                    <div className="flex flex-col text-right">
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Network I/O</span>
                                        <span className="text-xs font-black text-slate-700 font-mono italic tracking-tighter">{container.net_io}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Binary size={16} className="text-slate-400" />
                                    <div className="flex flex-col text-right">
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Active Tasks</span>
                                        <span className="text-xs font-black text-slate-700 font-mono tracking-tighter">{container.pids} PIDs</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl flex items-center gap-3 shadow-xl">
                                <ShieldCheck size={18} className="text-blue-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest italic font-mono">NODE-SECURE</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InfrastructureControlCenter;