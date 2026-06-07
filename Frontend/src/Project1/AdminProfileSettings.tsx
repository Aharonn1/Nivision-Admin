import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Loader2, ShieldCheck, Save, Lock, Mail, Key, ShieldAlert } from "lucide-react";
import appConfig from "../Utils/AppConfig";
import { toast, Toaster } from "sonner";
import { useNavigate } from "@tanstack/react-router";

export const AdminProfileSettings = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    // --- אבטחת גישה ---
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token !== "true") {
            setIsAuthorized(false);
            setTimeout(() => navigate({ to: '/' }), 1000);
        } else {
            setIsAuthorized(true);
        }
    }, [navigate]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData);

        try {
            await axios.post(`${appConfig.baseUrl}/webhook/update-admin-profile2`, data);
            toast.success("פרופיל עודכן בהצלחה", {
                description: "נתוני האבטחה סונכרנו מול שרת ה-Identity."
            });
            (e.target as HTMLFormElement).reset();
        } catch (err) {
            toast.error("עדכון נכשל");
        } finally {
            setLoading(false);
        }
    };

    if (isAuthorized === null) return null;

    return (
        /* 🚀 התיקון הארכיטקטוני הראשי: הוסר צבע הרקע bg-[#f1f5f9] והגובה הקשיח כדי למחוק לחלוטין את התיבה החיצונית בעלת הפינות המעוגלות */
        <div className="w-full max-w-[1400px] mx-auto h-auto p-4 md:p-10 space-y-6 relative z-10 font-sans select-none overflow-hidden" dir="rtl">
            <Toaster position="top-center" richColors />

            {/* Background Glows */}
            <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-200/20 rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full max-w-[850px] mx-auto space-y-6 relative z-10">
                
                {/* Header - Compact & Bold */}
                <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white shadow-[0_15px_40px_-15px_rgba(0,0,0,0.03)] flex items-center justify-between px-10">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-slate-900 text-blue-400 rounded-2xl shadow-xl rotate-3">
                            <Lock size={24} />
                        </div>
                        <div className="text-right">
                            <h1 className="text-3xl font-black text-slate-900 italic tracking-tighter uppercase leading-none">הגדרות אבטחה</h1>
                            <p className="text-slate-400 font-bold text-[9px] uppercase tracking-[0.2em] mt-1 italic">NIVISION IDENTITY REGISTRY</p>
                        </div>
                    </div>
                    <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100 font-black text-[10px] px-4 py-1 uppercase tracking-widest italic">
                        Master Admin
                    </Badge>
                </div>

                {/* הקובייה המרכזית המובלטת */}
                <Card className="bg-white/90 backdrop-blur-2xl border-2 border-white rounded-[3.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.03)] hover:shadow-2xl transition-all duration-300 ease-out overflow-hidden group cursor-pointer">
                    <div className="absolute top-0 right-0 h-1.5 w-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.3)]" />
                    
                    <CardContent className="p-10">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            
                            {/* פריסה של שני טורים בתוך הקובייה */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                
                                {/* אימות זהות */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mr-2">
                                        <div className="p-1.5 bg-slate-100 rounded-lg text-slate-400"><Lock size={12} /></div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic font-mono">Step 01 // Verify</span>
                                    </div>
                                    <div className="p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 space-y-4 shadow-inner">
                                        <div className="space-y-1.5 text-right">
                                            <label className="text-[9px] font-black text-slate-500 mr-2 block uppercase italic">מייל זיהוי</label>
                                            <div className="relative">
                                                <input name="email" required placeholder="Email" className="w-full bg-white border-2 border-slate-100 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-right pr-10 shadow-sm" />
                                                <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-200" size={16} />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5 text-right">
                                            <label className="text-[9px] font-black text-slate-500 mr-2 block uppercase italic">סיסמה נוכחית</label>
                                            <div className="relative">
                                                <input name="password" type="password" required placeholder="••••" className="w-full bg-white border-2 border-slate-100 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-right pr-10 shadow-sm" />
                                                <Key className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-200" size={16} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* עדכון נתונים */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mr-2">
                                        <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-500"><ShieldCheck size={12} /></div>
                                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest italic font-mono">Step 02 // Update</span>
                                    </div>
                                    <div className="p-6 bg-emerald-50/20 rounded-[2rem] border border-emerald-100/50 space-y-4 shadow-inner">
                                        <div className="space-y-1.5 text-right">
                                            <label className="text-[9px] font-black text-emerald-600 mr-2 block uppercase italic">מייל חדש</label>
                                            <input name="newEmail" required placeholder="New Email" className="w-full bg-white border-2 border-emerald-100 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 transition-all italic text-right shadow-sm" />
                                        </div>
                                        <div className="space-y-1.5 text-right">
                                            <label className="text-[9px] font-black text-emerald-600 mr-2 block uppercase italic">מפתח חדש</label>
                                            <input name="newPassword" type="password" required placeholder="New Pass" className="w-full bg-white border-2 border-emerald-100 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-right shadow-sm" />
                                        </div>
                                    </div>
                                </div>

                            </div>

                            {/* כפתור החלה */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-5 rounded-[1.8rem] text-xs font-black tracking-[0.2em] uppercase transition-all shadow-xl flex items-center justify-center gap-3 italic border-b-6 border-slate-950 active:border-b-0 active:translate-y-1 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={18} className="text-blue-400" />}
                                <span>החלת שינויי אבטחה</span>
                            </button>
                        </form>
                    </CardContent>
                </Card>

                {/* Footer - Compact */}
                <div className="bg-slate-900 p-5 rounded-[2rem] shadow-2xl border-b-[8px] border-blue-600 flex items-center justify-between px-10">
                    <p className="text-[10px] font-bold text-slate-400 italic">
                        <span className="text-white italic font-black uppercase ml-2 tracking-widest">Master Protocol:</span> 
                        סנכרון מול צומת Redis פעיל. השינוי דורש הרשאת Super Admin.
                    </p>
                    <ShieldCheck size={18} className="text-blue-400 opacity-50" />
                </div>
            </div>
        </div>
    );
};