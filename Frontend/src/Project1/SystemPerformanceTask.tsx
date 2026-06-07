import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, Zap, Server, Database, DollarSign, RefreshCw } from 'lucide-react';
import dataService from '../Service/DataService';

const SystemPerformanceTask: React.FC = () => {
    const [frequency, setFrequency] = useState<number>(5);
    const [lastSync, setLastSync] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [refreshing, setRefreshing] = useState<boolean>(false);

    // פונקציית משיכת הנתונים
    const fetchSyncData = async () => {
        setRefreshing(true);
        try {
            const data = await dataService.getLatestSyncLogs();
                        
            if (data) {
                setLastSync(data);
            } else {
                console.warn("API returned empty data.");
            }
        } catch (error) {
            console.error("Error fetching sync data:", error);
        } finally {
            setRefreshing(false);
        }
    };

    // טעינה ראשונית ברגע שהקומפוננטה עולה
    useEffect(() => {
        fetchSyncData();
    }, []);

    const handleFrequencyChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = parseInt(e.target.value);
        setFrequency(newVal);
        setLoading(true);
        try {
            await dataService.updateSyncFrequency(newVal);
        } catch (error) {
            console.error("Error updating frequency:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-6 space-y-6 text-right" dir="rtl">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">ביצועי מערכת <span className="text-blue-500">NiVision</span></h2>
                    <p className="text-gray-400 mt-1">ניטור בזמן אמת של תשתית ה-Neural Engine</p>
                </div>
                <button 
                    onClick={fetchSyncData}
                    className={`p-3 rounded-full bg-gray-800 border border-gray-700 text-blue-400 hover:bg-gray-700 transition-all ${refreshing ? 'animate-spin' : ''}`}
                >
                    <RefreshCw size={20} />
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Control Panel */}
                <div className="lg:col-span-1 bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 border border-gray-700 shadow-2xl flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-blue-500/10 rounded-2xl">
                                <Zap className="text-blue-500" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-white">בקרת סנכרון</h3>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <span className="text-3xl font-black text-white">{frequency} <span className="text-sm font-medium text-gray-500">דק'</span></span>
                        </div>
                        <input 
                            type="range" min="1" max="60" value={frequency}
                            onChange={handleFrequencyChange}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                    </div>
                </div>

                {/* Status Cards */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* S3 Card */}
                    <div className="bg-gray-800/40 rounded-3xl p-6 border border-gray-700/50">
                        <div className="p-4 bg-orange-500/10 rounded-2xl w-fit mb-4">
                            <Database className="text-orange-500" size={24} />
                        </div>
                        <span className="text-4xl font-black text-white">{lastSync?.s3?.files || 0}</span>
                        <span className="text-gray-500 mr-2">קבצים שנסרקו</span>
                    </div>

                    {/* EC2 Card */}
                    <div className="bg-gray-800/40 rounded-3xl p-6 border border-gray-700/50">
                        <div className="p-4 bg-purple-500/10 rounded-2xl w-fit mb-4">
                            <Server className="text-purple-500" size={24} />
                        </div>
                        <span className="text-2xl font-black text-white">{lastSync?.ec2?.stats?.split('|')[0].replace('CPU: ', '') || '0%'}</span>
                        <span className="text-gray-500 mr-2">CPU USAGE</span>
                    </div>

                    {/* Costs Card */}
                    <div className="bg-gray-800/40 rounded-3xl p-6 border border-gray-700/50">
                        <div className="p-4 bg-green-500/10 rounded-2xl w-fit mb-4">
                            <DollarSign className="text-green-500" size={24} />
                        </div>
                        <span className="text-4xl font-black text-white">${lastSync?.costs?.monthlyEstimate || '0.00'}</span>
                        <span className="text-gray-500 mr-2">תחזית חודשית</span>
                    </div>

                    {/* Last Sync Card */}
                    <div className="bg-blue-600 rounded-3xl p-6 shadow-lg flex flex-col justify-between text-white">
                        <Clock size={28} />
                        <div className="mt-4">
                            <div className="text-xs opacity-70">עדכון אחרון:</div>
                            <div className="text-2xl font-black">{lastSync?.lastUpdate || 'לא זמין'}</div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default SystemPerformanceTask;