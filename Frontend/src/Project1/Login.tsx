import React, { useState, useEffect } from 'react';
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import axios, { AxiosError } from "axios";
import appConfig from "../Utils/AppConfig";
import CredentialsModel from "../models/CredentialsModel";

// ייבוא רכיבי ה-UI והתראות
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { toast, Toaster } from "sonner";

export const Login = () => {
    const navigate = useNavigate();
    const [isSubmittingManual, setIsSubmittingManual] = useState(false);
    const [shouldRender, setShouldRender] = useState(true);
    const [showTransition, setShowTransition] = useState(false);
    const [adminName, setAdminName] = useState<string>("מנהל NiVision");

    const loginMutation = useMutation<any, AxiosError, CredentialsModel>({
        mutationFn: async (credentials: CredentialsModel) => {
            const response = await axios.post(appConfig.loginUrl, credentials);
            return response.data;
        },
        onSuccess: (data: any, variables: CredentialsModel) => {
            if (data.authenticated !== true) {
                toast.error("גישה נדחתה", {
                    description: "פרטי ההתחברות שהזנת אינם תואמים את רישומי המערכת.",
                    style: { background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b' }
                });
                setIsSubmittingManual(false);
                return; 
            }
            
            // ארכיטקטורת חילוץ שם חכמה: אם n8n לא מחזיר שם, נחלץ את הכל לפני ה-@ מהאימייל שהוקלד והופך אותו לאות גדולה
            let detectedName = "מנהל NiVision";
            if (data.name || data.username) {
                detectedName = data.name || data.username;
            } else if (variables.email) {
                const emailPrefix = variables.email.split('@')[0];
                detectedName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
            }
            setAdminName(detectedName);
            console.log(data)
            localStorage.setItem("token", "true");
            localStorage.setItem("userId", data.userId); 
            localStorage.setItem("userRole", data.role); 
            localStorage.setItem("userFullData", JSON.stringify(data));
            const permissions = data.permissions ? data.permissions.join(",") : "";
            localStorage.setItem("userPermissions", permissions);
            
            toast.success("אימות הצליח", {
                description: `ברוך הבא, ${detectedName}`,
            });

            setShowTransition(true);
            
            setTimeout(() => {
                window.location.href = "/admin";
            }, 1500);
        },
        onError: (error: AxiosError) => {
            console.error("שגיאת התחברות:", error);
            toast.error("שגיאת תקשורת", {
                description: "לא ניתן ליצור קשר עם שרת האבטחה (n8n).",
            });
            setIsSubmittingManual(false);
        },
    });

    const form = useForm({
        defaultValues: { email: "", password: "" },
        onSubmit: async ({ value }) => {
            setIsSubmittingManual(true);
            loginMutation.mutate(value as CredentialsModel);
        },
    });

    if (!shouldRender) return null;

    return (
        <div dir="rtl" className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#e2e8f0] font-sans overflow-hidden text-right select-none">
            
            {/* תיקון ה-Toaster: כפיית איפוס מיקומים ב-CSS ו-dir לביטול באג ה-RTL של הדפדפן */}
            <div dir="ltr" className="absolute top-4 left-1/2 -translate-x-1/2 z-[10005] pointer-events-none flex justify-center w-full">
                <Toaster 
                    position="top-center" 
                    expand={false} 
                    richColors 
                    toastOptions={{
                        style: {
                            display: 'flex',
                            justifyContent: 'center',
                            textAlign: 'center',
                            direction: 'rtl',
                            fontFamily: 'sans-serif'
                        }
                    }}
                />
            </div>

            {/* מסך מעבר */}
            {showTransition && (
                <div className="absolute inset-0 z-[10000] flex flex-col items-center justify-center bg-white/95 backdrop-blur-2xl animate-in fade-in duration-500 text-center">
                    <div className="relative mb-8">
                        <div className="w-24 h-24 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin" />
                        <span className="absolute inset-0 flex items-center justify-center text-slate-900 text-xl font-black italic tracking-tighter">NV</span>
                    </div>
                    <p className="text-2xl font-black text-slate-900 tracking-tighter animate-pulse italic">
                        מנתח הרשאות... ברוך הבא, {adminName} 🚀
                    </p>
                </div>
            )}

            <Card className="w-full max-w-[460px] rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] bg-white border-2 border-slate-200/50 overflow-hidden relative z-10 p-2">
                <div className="bg-white rounded-[3rem] p-2">
                    <div className="p-10 pb-4 text-center">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic leading-none uppercase">
                            NiVision <span className="text-blue-600 italic block mt-2 text-2xl font-black">בקרת גישה ומערכת ניהול</span>
                        </h1>
                    </div>

                    <CardContent className="p-8 pt-4 text-right">
                        <form 
                            onSubmit={(e) => { 
                                e.preventDefault(); 
                                void form.handleSubmit(); 
                            }} 
                            className="space-y-8 text-right"
                        >
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-2 italic block text-right">פרטי זיהוי מנהל מערכת</label>
                                <form.Field
                                    name="email"
                                    validators={{
                                        onChange: ({ value }) => 
                                            !value ? "חובה להזין כתובת אימייל" : 
                                            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "פורמט אימייל אינו תקין" : undefined,
                                    }}
                                >
                                    {(field) => (
                                        <input
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            placeholder="כתובת אימייל"
                                            className="w-full bg-slate-50 border-2 border-slate-200 px-8 py-5 rounded-[2.2rem] text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400 italic text-right shadow-inner font-sans"
                                        />
                                    )}
                                </form.Field>
                            </div>

                            <div className="space-y-3 text-right">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2 italic block text-right">מפתח אבטחה מסווג</label>
                                <form.Field
                                    name="password"
                                    validators={{
                                        onChange: ({ value }) => !value ? "חובה להזין סיסמת גישה" : undefined,
                                    }}
                                >
                                    {(field) => (
                                        <input
                                            type="password"
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            placeholder="••••••••••••"
                                            className="w-full bg-slate-50 border-2 border-slate-200 px-8 py-5 rounded-[2.2rem] text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400 text-right shadow-inner"
                                        />
                                    )}
                                </form.Field>
                            </div>

                            <form.Subscribe selector={(state) => [state.canSubmit]}>
                                {([canSubmit]) => (
                                    <button
                                        type="submit"
                                        disabled={!canSubmit || loginMutation.isPending || isSubmittingManual}
                                        className="w-full bg-slate-900 hover:bg-slate-800 text-white py-6 rounded-[2.2rem] text-sm font-black tracking-wider uppercase transition-all duration-300 shadow-2xl relative overflow-hidden active:scale-[0.96] active:shadow-inner disabled:opacity-50 cursor-pointer"
                                    >
                                        <span className="relative z-10 italic tracking-tight font-sans text-md">
                                            {loginMutation.isPending || isSubmittingManual ? "מבצע אימות נתונים..." : "התחבר למערכת"}
                                        </span>
                                    </button>
                                )}
                            </form.Subscribe>
                        </form>
                    </CardContent>
                </div>
            </Card>
        </div>
    );
};