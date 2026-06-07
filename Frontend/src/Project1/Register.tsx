import React, { useState, useEffect } from 'react';
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Loader2, UserPlus, Shield, Trash2, RefreshCcw, ShieldAlert, Key, Mail, ShieldCheck, Eye, EyeOff } from "lucide-react";
import appConfig from "../Utils/AppConfig";
import axios from "axios";
import dataService from "../Service/DataService";
import { toast, Toaster } from "sonner";
import { useNavigate } from "@tanstack/react-router";

export const Register = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [usersLoading, setUsersLoading] = useState(false);
    const [userList, setUserList] = useState<any[]>([]);
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const token = localStorage.getItem("token");
        const userRole = localStorage.getItem("userRole");
        
        if (token !== "true" || userRole !== "SUPER_ADMIN") {
            setIsAuthorized(false);
            setTimeout(() => navigate({ to: '/' }), 1500);
        } else {
            setIsAuthorized(true);
            fetchUsers();
        }
    }, [navigate]);

    const togglePasswordVisibility = (email: string) => {
        setVisiblePasswords(prev => ({ ...prev, [email]: !prev[email] }));
    };

    const fetchUsers = async () => {
        setUsersLoading(true);
        try {
            const users = await dataService.getAllUsers();
            setUserList(Array.isArray(users) ? users : []);
        } catch (err) {
            toast.error("שגיאת סנכרון", { description: "לא ניתן היה למשוך את רשימת המורשים." });
        } finally {
            setUsersLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData);

        if (data.password !== data.confirmPassword) {
            toast.error("אימות נכשל", { description: "הסיסמאות אינן תואמות." });
            setLoading(false);
            return;
        }

        try {
            await axios.post(`${appConfig.baseUrl}/webhook/register-new-user`, {
                ...data,
                role: "REGISTERED_USER",
                requesterId: localStorage.getItem("userId")
            });
            toast.success("מורשה חדש נוצר", { description: "הגישה הונפקה בסנכרון מלא." });
            (e.target as HTMLFormElement).reset();
            fetchUsers(); 
        } catch (err: any) {
            toast.error("שגיאת רישום", { description: "חלה תקלה בתקשורת עם שרת האבטחה." });
        } finally {
            setLoading(false);
        }
    };

    if (isAuthorized === null) return null;
    if (isAuthorized === false) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center bg-[#f8fafc] text-center p-6 select-none">
                <ShieldAlert size={80} className="text-rose-500 mb-6 animate-pulse" />
                <h1 className="text-4xl font-black italic mb-2 tracking-tighter text-slate-900 uppercase">Access Restricted</h1>
                <p className="text-slate-400 font-mono text-xs uppercase tracking-[0.3em]">Super Admin privileges required.</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-[1600px] mx-auto h-auto p-4 md:p-10 space-y-10 font-sans select-none overflow-hidden" dir="rtl">
            <div dir="ltr" className="absolute top-4 left-1/2 -translate-x-1/2 z-[10005] pointer-events-none flex justify-center w-full">
                <Toaster position="top-center" expand={false} richColors />
            </div>
            
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-200/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full flex flex-col md:flex-row justify-between items-center gap-6 bg-white/80 backdrop-blur-xl p-10 rounded-[3rem] border border-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.03)] relative z-10">
                <div className="flex items-center gap-8">
                    <div className="p-6 bg-slate-900 text-white rounded-[2.2rem] shadow-2xl rotate-2">
                        <Shield size={32} className="text-blue-400" />
                    </div>
                    <div className="text-right">
                        <h1 className="text-5xl font-black text-slate-900 italic tracking-tighter leading-none uppercase">ניהול הרשאות</h1>
                        <div className="text-slate-400 font-bold text-[11px] uppercase tracking-[0.4em] italic mt-3 flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse block" />
                            NIVISION AUTH ENGINE // Identity Registry v2.0
                        </div>
                    </div>
                </div>
                <div className="bg-slate-50 px-8 py-4 rounded-2xl border border-slate-100 shadow-inner text-center">
                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Active Nodes</span>
                    <span className="text-xl font-black text-slate-900 font-mono">{userList.length} Accounts</span>
                </div>
            </div>

            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
                <Card className="lg:col-span-4 bg-white/90 backdrop-blur-2xl border-2 border-white rounded-[4rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.03)] p-10 h-fit text-right">
                    <div className="flex items-center justify-between mb-12">
                        <div className="p-4 bg-blue-50 rounded-2xl text-blue-600 shadow-inner"><UserPlus size={24} /></div>
                        <span className="text-slate-900 font-black italic text-2xl tracking-tighter uppercase">הוספת מורשה</span>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mr-2 block italic text-right">מייל לזיהוי רשת</label>
                            <input name="email" type="email" required placeholder="User@nivision.io" className="w-full bg-slate-50/50 border-2 border-slate-100 px-6 py-4 rounded-[1.5rem] text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-right font-bold italic shadow-inner" />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mr-2 block italic text-right">מפתח גישה</label>
                            <input name="password" type="password" required placeholder="••••••••" className="w-full bg-slate-50/50 border-2 border-slate-100 px-6 py-4 rounded-[1.5rem] text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 text-right shadow-inner" />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mr-2 block italic text-right">אימות מפתח</label>
                            <input name="confirmPassword" type="password" required placeholder="Verify" className="w-full bg-slate-50/50 border-2 border-slate-100 px-6 py-4 rounded-[1.5rem] text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 text-right shadow-inner" />
                        </div>
                        <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-6 rounded-[2.2rem] font-black uppercase italic tracking-widest">
                            {loading ? <Loader2 className="animate-spin mx-auto" /> : <span>הנפקת מפתח גישה</span>}
                        </button>
                    </form>
                </Card>

                <Card className="lg:col-span-8 bg-white/95 backdrop-blur-2xl border-2 border-white rounded-[4rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.03)] p-10">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right border-separate border-spacing-y-4">
                            <thead>
                                <tr className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] italic">
                                    <th className="px-6 py-4">סטטוס</th>
                                    <th className="px-6 py-4">סיסמה</th>
                                    <th className="px-6 py-4">דרג הרשאה</th>
                                    <th className="px-6 py-4">מזהה משתמש</th>
                                </tr>
                            </thead>
                            <tbody>
                                {userList.map((user, idx) => (
                                    <tr key={idx} className="group/row transition-all">
                                        <td className="px-6 py-6 bg-slate-50/30 rounded-r-[2rem]">
                                            {user.role !== 'SUPER_ADMIN' ? <Trash2 className="w-4 h-4 text-rose-500 cursor-pointer" /> : <ShieldCheck className="w-5 h-5 text-blue-500" />}
                                        </td>
                                        <td className="px-6 py-6 bg-slate-50/30 font-mono">
                                            <div className="flex items-center gap-2">
                                                <span>{visiblePasswords[user.email] ? (user.password || 'N/A') : '••••••••'}</span>
                                                <button onClick={() => togglePasswordVisibility(user.email)}>
                                                    {visiblePasswords[user.email] ? <EyeOff size={14} /> : <Eye size={14} />}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 bg-slate-50/30">
                                            <Badge>{user.role}</Badge>
                                        </td>
                                        <td className="px-6 py-6 bg-slate-50/30 rounded-l-[2rem] font-black text-lg">{user.email}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
};