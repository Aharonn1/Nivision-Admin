import React, { useState, useEffect, useCallback } from 'react';

const UseAwsMetrics: React.FC = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch("http://51.20.95.207:3001/api/system/intelligence");
            const result = await res.json();
            setData(result);
        } catch (err) {
            console.error("Dashboard error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 15000);
        return () => clearInterval(interval);
    }, [fetchData]);

    if (loading) return <div className="text-center p-10 text-gray-400">Loading Cloud Infrastructure...</div>;

    const metrics = [
        { label: "CPU Utilization", val: data.resources.cpu, icon: "⚙️" },
        { label: "Memory Usage", val: data.resources.memory, icon: "⚡" },
        { label: "Disk Allocation", val: data.resources.disk, icon: "💾" },
        { label: "Error Log Count", val: data.resources.errors, icon: "⚠️" },
        { label: "Network Inbound", val: data.resources.netIn, icon: "📥" },
        { label: "Network Outbound", val: data.resources.netOut, icon: "📤" },
        { label: "Swap Memory", val: data.resources.swap, icon: "🔄" },
        { label: "AWS Health Status", val: data.status === 'running' ? "Healthy" : "Down", icon: "☁️" }
    ];

    return (
        <div className="w-full max-w-7xl mx-auto p-8 bg-white rounded-[2rem] border border-gray-100 shadow-[0_20px_50px_rgba(8,112,184,0.07)]">
            {/* Header Section */}
            <div className="flex justify-between items-end mb-10 border-b border-gray-50 pb-8">
                <div>
                    <h1 className="text-4xl font-black text-gray-950 tracking-tighter">
                        AWS Infrastructure Intelligence
                    </h1>
                    <p className="text-blue-600 font-semibold text-sm mt-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                        STOCKHOLM NODE CLUSTER // LIVE TELEMETRY
                    </p>
                </div>
                <div className="bg-gray-50 px-5 py-2 rounded-2xl border border-gray-100">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest block">System Time</span>
                    <span className="text-gray-900 font-mono font-bold">{new Date().toLocaleTimeString()}</span>
                </div>
            </div>

            {/* Metrics Grid */}
          {/* Grid עם אפקט הבלטה */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
    {metrics.map((m, idx) => (
        <div 
            key={idx} 
            className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_40px_-5px_rgba(0,0,0,0.15)] transition-all duration-300 transform hover:-translate-y-1"
        >
            <p className="text-gray-400 text-[10px] font-extrabold uppercase tracking-widest mb-4 flex items-center gap-2">
                {m.icon} {m.label}
            </p>
            <p className="text-4xl font-black text-gray-900 tracking-tight">{m.val}</p>
            
            {/* Progress Bar עם הצללה עדינה בפנים */}
            {!isNaN(parseFloat(m.val)) && (
                <div className="w-full bg-gray-100 h-2 rounded-full mt-6 overflow-hidden">
                    <div 
                        className="bg-blue-600 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(37,99,235,0.5)]" 
                        style={{ width: m.val }}
                    ></div>
                </div>
            )}
        </div>
    ))}
</div>
        </div>
    );
};

export default UseAwsMetrics;