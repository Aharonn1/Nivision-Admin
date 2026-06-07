import React, { useEffect, useState } from 'react';

export const SecurityThreats = () => {
    const [threats, setThreats] = useState<string[]>([]);

    useEffect(() => {
        fetch('http://localhost:3001/api/security/threats')
            .then(res => res.json())
            .then(data => {
                // 🔍 לוג שיראה לנו בדיוק מה המבנה של מה שקיבלנו מהשרת
                console.log("Backend response data:", data);
                
                // וודא שזה תואם למפתח ב-JSON (למשל blockedIps)
                setThreats(data.blockedIps || []);
            })
            .catch(err => console.error("Failed to fetch threats:", err));
    }, []);

    return (
        <div className="p-6 bg-white rounded-3xl shadow-lg">
            <h2 className="text-xl font-black italic uppercase">Live Threat Intelligence</h2>
            <ul className="mt-4">
                {threats.length > 0 ? (
                    threats.map((ip, index) => (
                        <li key={index} className="text-red-600 font-mono italic">{ip}</li>
                    ))
                ) : (
                    <li className="text-gray-400">No threats detected</li>
                )}
            </ul>
        </div>
    );
};