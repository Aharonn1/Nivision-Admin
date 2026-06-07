import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, Database, Cloud, Server } from "lucide-react";
import dataService from "../Service/DataService";

export const SystemHealth = () => {
    const [health, setHealth] = useState<any>(null);

    const fetchStatus = async () => {
        try {
            // שימוש בפונקציה שביקשת
            const data = await dataService.getLatestSyncLogs();
                    
            // עיבוד הנתונים (במידת הצורך)
            const finalData = data; 
            setHealth(finalData);
        } catch (e) {
            console.error("SystemHealth: Error fetching sync logs:", e);
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 10000); 
        return () => clearInterval(interval);
    }, []);

    const services = [
        { id: "ec2", name: "AWS EC2 Instance", icon: Server },
        { id: "n8n", name: "n8n Engine", icon: Activity },
        { id: "redis", name: "Redis Database", icon: Database },
        { id: "s3", name: "AWS S3 Storage", icon: Cloud },
    ];

    return (
        <div className="w-full max-w-[1400px] mx-auto p-10 font-sans" dir="rtl">
            <div className="flex justify-between items-center mb-12 border-b border-slate-800/60 pb-8">
                <div>
                    <h2 className="text-5xl font-black italic text-white tracking-tighter uppercase leading-none">
                        System <span className="text-indigo-500">Intelligence</span>
                    </h2>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.5em] mt-3 opacity-90">
                        Infrastructure Telemetry • Real-time Monitoring
                    </p>
                </div>

                <div className="bg-indigo-600/10 border-2 border-indigo-500/30 px-6 py-3 rounded-2xl text-center backdrop-blur-md">
                    <span className="text-[10px] text-indigo-400 font-black uppercase block mb-1 tracking-widest">Last Heartbeat</span>
                    <span className="text-white font-mono text-xl font-black tracking-tighter">
                        {health?.lastUpdate || "--:--:--"}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {services.map((service) => {
                    const data = health?.[service.id];
                    const isOnline = data?.status === "online" || data === "online";
                    
                    return (
                        <div key={service.id} className="relative overflow-hidden bg-slate-900/60 border-2 border-slate-800 p-8 rounded-[3rem] transition-all duration-300 hover:border-indigo-500/50">
                            <div className="flex justify-between items-start mb-10">
                                <div className={`p-4 rounded-[1.5rem] ${isOnline ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
                                    <service.icon className={`w-8 h-8 ${isOnline ? 'text-emerald-400' : 'text-rose-400'}`} />
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`text-xs font-black uppercase ${isOnline ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {isOnline ? 'Live' : 'Offline'}
                                    </span>
                                    <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                </div>
                            </div>

                            <div className="mt-auto">
                                <h4 className="text-white font-black italic text-xl tracking-tight mb-4 uppercase">
                                    {service.name}
                                </h4>
                                
                                <div className="space-y-3 border-t-2 border-slate-800/80 pt-6">
                                    {service.id === 'ec2' ? (
                                        <div className="font-mono text-xs text-indigo-300 font-bold bg-black/40 p-4 rounded-2xl border border-indigo-500/20">
                                            {data?.stats || "Scanning..."}
                                        </div>
                                    ) : (
                                        <MetricRow label="Status" value={isOnline ? 'OPERATIONAL' : 'SYSTEM DOWN'} color={isOnline ? 'text-emerald-400' : 'text-rose-400'} />
                                    )}
                                    {service.id === 's3' && <MetricRow label="Storage" value={`${data?.files || 0} Objects`} />}
                                    {service.id === 'redis' && <MetricRow label="Memory" value={data?.memory || '0MB'} />}
                                    {service.id === 'n8n' && <MetricRow label="Latency" value={data?.latency || '0ms'} />}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const MetricRow = ({ label, value, color = "text-slate-100" }: any) => (
    <div className="flex justify-between items-center">
        <span className="text-slate-400 font-black uppercase text-[10px] tracking-widest">{label}</span>
        <span className={`${color} font-black text-sm tracking-tight`}>{value}</span>
    </div>
);