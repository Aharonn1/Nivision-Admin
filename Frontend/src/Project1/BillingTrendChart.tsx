import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

interface ChartData {
    date: string;
    cost: number;
}

const BillingTrendChart = () => {
    const [data, setData] = useState<ChartData[]>([]);
    const [breakdown, setBreakdown] = useState<any[]>([]);
    const [totalPeriodCost, setTotalPeriodCost] = useState<string>('0.00');
    const [dateRange, setDateRange] = useState(() => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const end = now.toISOString().split('T')[0];
        return { start, end };
    });

    const fetchData = async () => {
        try {
            // הוספת מנגנון זיהוי סביבה:
            // אם אנחנו ב-Production (דומיין חי), נשתמש בנתיב יחסי.
            // אם אנחנו ב-Localhost, נשתמש בכתובת ה-IP המלאה.
            const isLocal = window.location.hostname === 'localhost';
            const baseUrl = isLocal ? 'http://51.20.95.207:3001' : '';
            
            const response = await axios.get(`${baseUrl}/api/billing/trend?start=${dateRange.start}&end=${dateRange.end}`);
            
            const rawData = Array.isArray(response.data) ? response.data : [];

            const formattedData: ChartData[] = rawData.map((item: any) => ({
                date: item.TimePeriod?.Start || 'N/A',
                cost: parseFloat(item.Groups?.reduce((acc: number, g: any) => acc + parseFloat(g.Metrics?.UnblendedCost?.Amount || 0), 0) || 0)
            }));

            let total = 0;
            const serviceMap: any = {};
            rawData.forEach((item: any) => {
                item.Groups?.forEach((g: any) => {
                    const svc = g.Keys?.[0] || 'Unknown';
                    const val = parseFloat(g.Metrics?.UnblendedCost?.Amount || 0);
                    serviceMap[svc] = (serviceMap[svc] || 0) + val;
                    total += val;
                });
            });

            const sorted = Object.entries(serviceMap)
                .map(([name, cost]: any) => ({ name, cost: parseFloat(cost) }))
                .sort((a, b) => b.cost - a.cost);

            setTotalPeriodCost(total.toFixed(2));
            setBreakdown(sorted.map(s => ({ ...s, cost: s.cost.toFixed(2) })));
            setData(formattedData);
        } catch (error) { 
            console.error("Fetch error:", error); 
        }
    };

    useEffect(() => { fetchData(); }, [dateRange]);

    return (
        <div style={{ padding: '20px', height: '90vh', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h2 style={{ margin: 0, fontSize: '18px' }}>ניתוח עלויות ענן - סה"כ: ${totalPeriodCost}</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input type="date" value={dateRange.start} onChange={(e) => setDateRange({...dateRange, start: e.target.value})} />
                    <input type="date" value={dateRange.end} onChange={(e) => setDateRange({...dateRange, end: e.target.value})} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', flex: 1, minHeight: 0 }}>
                <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[...data].reverse()}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="date" fontSize={10} />
                            <YAxis fontSize={10} />
                            <Tooltip />
                            <Area type="monotone" dataKey="cost" stroke="#3b82f6" fill="#bfdbfe" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <tbody>
                            {breakdown.map((row: any, i: number) => (
                                <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '8px', fontSize: '12px' }}>{row.name}</td>
                                    <td style={{ padding: '8px', fontSize: '12px', fontWeight: 'bold' }}>${row.cost}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BillingTrendChart;