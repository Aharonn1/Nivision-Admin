import React, { useState, useRef } from "react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { 
    Cpu, Target, X, Code2, Bot, Database, ArrowLeftRight, Github,
    TrendingUp, UserCheck, Share2, HeartHandshake, Smile, Frown, Headphones,
    Server, Globe, ShieldCheck, Zap, LayoutDashboard, Key, Box, ChevronDown
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export default function AboutPage() {
    const navigate = useNavigate();
    const [showTechDetails, setShowTechDetails] = useState(false);
    const [showPrecisionDetails, setShowPrecisionDetails] = useState(false);
    const [showHumanDetails, setShowHumanDetails] = useState(false);

    // סטייט מיוחד לניהול נראות חץ הגלילה במודאל הטכנולוגיה
    const [showScrollArrow, setShowScrollArrow] = useState(true);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // פונקציה שמזהה גלילה ומעלימה את החץ ברגע שהמשתמש זז למטה
    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const scrollTop = scrollContainerRef.current.scrollTop;
            // אם המשתמש גלל יותר מ-20 פיקסלים, נעלים את החץ
            if (scrollTop > 20) {
                setShowScrollArrow(false);
            } else {
                setShowScrollArrow(true);
            }
        }
    };

    return (
        <div dir="rtl" className="max-w-6xl mx-auto p-10 space-y-16 font-sans relative selection:bg-indigo-100 select-none">
            
            {/* ארכיטקטורת CSS להעלמת פסי גלילה פנימיים במודאלים לשמירה על UI נקי */}
            <style>{`
                .scrollbar-clean::-webkit-scrollbar { display: none !important; }
                .scrollbar-clean { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            {/* כפתור סגירה ראשי של הדף */}
            <button 
                onClick={() => navigate({ to: "/admin" })}
                className="fixed top-8 left-8 z-[50] bg-white border-2 border-slate-200 p-3 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all shadow-xl active:scale-95 cursor-pointer"
            >
                <X className="w-6 h-6" />
            </button>

            {/* Hero Section */}
            <div className="text-center space-y-4">
                <Badge className="bg-indigo-600 text-white px-6 py-1 rounded-full text-xs font-black italic">
                    THE VISION
                </Badge>
                <h1 className="text-6xl font-black italic tracking-tighter text-slate-900 uppercase">
                    Nivision Intelligence
                </h1>
                <p className="text-slate-500 text-xl max-w-2xl mx-auto font-medium leading-relaxed italic">
                    מגדירים מחדש את עולם האשראי באמצעות בינה מלאכותית וניתוח נתונים בזמן אמת.
                </p>
            </div>

            {/* Matrix Logic - 3 כרטיסיות מרכזיות */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-center items-center">
                <Card onClick={() => setShowTechDetails(true)} className="rounded-[2.5rem] border-2 border-transparent shadow-xl bg-white hover:border-indigo-500 hover:scale-105 transition-all cursor-pointer group h-full">
                    <CardContent className="p-10 text-center flex flex-col items-center justify-center">
                        <div className="bg-indigo-600 p-5 rounded-3xl mb-8 shadow-lg shadow-indigo-200 group-hover:rotate-12 transition-transform">
                            <Cpu className="h-10 w-10 text-white" />
                        </div>
                        <h3 className="font-black text-2xl mb-3 text-slate-900 italic">טכנולוגיה</h3>
                        <p className="text-slate-500 text-sm font-bold leading-relaxed italic">ה-Stack והקוד המלא</p>
                    </CardContent>
                </Card>

                <Card onClick={() => setShowPrecisionDetails(true)} className="rounded-[2.5rem] border-2 border-transparent shadow-xl bg-white hover:border-indigo-500 hover:scale-105 transition-all cursor-pointer group h-full">
                    <CardContent className="p-10 text-center flex flex-col items-center justify-center">
                        <div className="bg-indigo-600 p-5 rounded-3xl mb-8 shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
                            <Target className="h-10 w-10 text-white" />
                        </div>
                        <h3 className="font-black text-2xl mb-3 text-slate-900 italic">דיוק ואסטרטגיה</h3>
                        <p className="text-slate-400 text-sm font-bold leading-relaxed italic">ניתוח שיווק וביצועים</p>
                    </CardContent>
                </Card>

                <Card onClick={() => setShowHumanDetails(true)} className="rounded-[2.5rem] border-2 border-transparent shadow-xl bg-white hover:border-indigo-500 hover:scale-105 transition-all cursor-pointer group h-full">
                    <CardContent className="p-10 text-center flex flex-col items-center justify-center">
                        <div className="bg-indigo-600 p-5 rounded-3xl mb-8 shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
                            <HeartHandshake className="h-10 w-10 text-white" />
                        </div>
                        <h3 className="font-black text-2xl mb-3 text-slate-900 italic">אנושיות</h3>
                        <p className="text-slate-400 text-sm font-bold leading-relaxed italic">ניתוח רגש וחוויית לקוח</p>
                    </CardContent>
                </Card>
            </div>

            {/* מודאל טכנולוגיה מעודכן ארכיטקטונית וויזואלית */}
            {showTechDetails && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300">
                    <Card className="w-full max-w-5xl h-[80vh] flex flex-col rounded-[3rem] border-none shadow-2xl bg-slate-50 relative overflow-hidden animate-in zoom-in-95 duration-300">
                        
                        {/* תיקון פינות עליונות: rounded-t-[3rem] מבטיח קימור מושלם שתואם את כרטיס האב */}
                        <div className="w-full bg-slate-50 border-b border-slate-200/60 p-8 md:px-12 flex justify-between items-center relative z-20 rounded-t-[3rem]">
                            <div className="text-right">
                                <h2 className="text-4xl font-black italic tracking-tighter text-slate-900">Nivision Core Tech Stack</h2>
                                <p className="text-indigo-600 font-black uppercase text-xs tracking-widest mt-1">Architecture & Backend Ecosystem</p>
                            </div>
                            <button 
                                onClick={() => {
                                    setShowTechDetails(false);
                                    setShowScrollArrow(true);
                                }} 
                                className="text-slate-400 hover:text-indigo-600 hover:bg-slate-200/50 p-2.5 rounded-2xl transition-all cursor-pointer"
                            >
                                <X className="w-7 h-7" />
                            </button>
                        </div>
                        
                        {/* גוף התוכן הנגלל - מחובר ל-Ref ולפונקציית handleScroll */}
                        <div 
                            ref={scrollContainerRef}
                            onScroll={handleScroll}
                            className="flex-1 overflow-y-auto scrollbar-clean p-8 md:p-12 pt-4 space-y-10 relative pb-16"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-black italic flex items-center gap-3 text-slate-900"><LayoutDashboard className="text-indigo-600" /> ניהול לידים ו-CRM</h3>
                                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                                            <div className="flex items-start gap-4 text-right">
                                                <div className="bg-indigo-50 p-2 rounded-xl mt-1"><Bot className="w-5 h-5 text-indigo-600" /></div>
                                                <p className="text-[13px] font-bold text-slate-700 italic leading-relaxed">סנכרון מלא של לידים נכנסים בזמן אמת בתוך הדשבורד לשליטה מקסימלית.</p>
                                            </div>
                                            <div className="flex items-start gap-4 text-right">
                                                <div className="bg-indigo-50 p-2 rounded-xl mt-1"><Zap className="w-5 h-5 text-indigo-600" /></div>
                                                <p className="text-[13px] font-bold text-slate-700 italic leading-relaxed">ניהול סטטוסים אוטומטי המבטיח מענה מהיר ומדויק לכל פנייה.</p>
                                            </div>
                                            <div className="flex items-start gap-4 border-t border-slate-50 pt-3 text-right">
                                                <div className="bg-indigo-50 p-2 rounded-xl mt-1"><ArrowLeftRight className="w-5 h-5 text-indigo-600" /></div>
                                                <p className="text-[13px] font-bold text-slate-700 italic leading-relaxed">Hubspot Webhook Gateway - קליטת לידים אסינכרונית ומאובטחת למניעת איבוד מידע.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-black italic flex items-center gap-3 text-slate-900"><Code2 className="text-indigo-600" /> פיתוח ואוטומציה</h3>
                                        <ul className="grid grid-cols-1 gap-2 text-right">
                                            {[
                                                { val: "React.js & TypeScript - ממשק משתמש (UI) מתקדם", icon: Zap },
                                                { val: "TanStack Query - ניהול Caching וסטייט אופטימי", icon: ArrowLeftRight },
                                                { val: "n8n - מנוע הבקאנד, האוטומציה וה-Routing המרכזי", icon: Bot },
                                                { val: "PostgreSQL 16 (Alpine Build) - בסיס נתונים רלציוני מבודד ומאובטח", icon: Database },
                                                { val: "Redis - בסיס נתונים מהיר בזיכרון לניהול Sessions והרשאות", icon: Key },
                                                { val: "Docker Compose - תזמור מכולות (Orchestration) ובידוד רשת פנימית", icon: Box },
                                                { val: "PM2 - שמירה על יציבות ורציפות תהליכי ה-Backend", icon: Server },
                                                { val: "AI Engine - שילוב מודלים של GPT-4 ו-Gemini", icon: Cpu },
                                            ].map((t, idx) => (
                                                <li key={idx} className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                                                    <div className="bg-indigo-50 p-1.5 rounded-lg"><t.icon className="w-4 h-4 text-indigo-600" /></div>
                                                    <p className="text-[12px] font-bold text-slate-700 italic">{t.val}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-black italic flex items-center gap-3 text-slate-900"><ShieldCheck className="text-indigo-600" /> תשתית ואבטחה</h3>
                                        <ul className="grid grid-cols-1 gap-2 text-right">
                                            {[
                                                { val: "AWS EC2 (Ubuntu 22.04 LTS) & AWS S3 Storage", icon: Globe },
                                                { val: "AWS Billing API Integration - ניטור עלויות וחיזוי תקציב בזמן אמת", icon: TrendingUp },
                                                { val: "Nginx Reverse Proxy & SSL - אבטחת תעבורה והצפנת TLS", icon: ShieldCheck },
                                                { val: "GoDaddy DNS Management & Domain Control", icon: Globe },
                                                { val: "Access Control - פרוטוקול הרשאות אבטחה קשוח וניהול גישה מבוסס תפקידים", icon: Key },
                                            ].map((t, idx) => (
                                                <li key={idx} className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                                                    <div className="bg-indigo-50 p-1.5 rounded-lg"><t.icon className="w-4 h-4 text-indigo-600" /></div>
                                                    <p className="text-[12px] font-bold text-slate-700 italic">{t.val}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="bg-slate-900 text-white p-6 rounded-[2.5rem] space-y-4 shadow-2xl relative overflow-hidden text-right">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
                                        <div className="flex items-center gap-4 relative z-10">
                                            <Github className="text-indigo-400 w-8 h-8" />
                                            <div>
                                                <h4 className="font-black text-md italic leading-none">GitHub Codebase</h4>
                                                <p className="text-slate-400 text-[10px] mt-1 font-medium italic">ניהול גרסאות ושקיפות מלאה</p>
                                            </div>
                                        </div>
                                        <a href="https://github.com/Aharonn1/Nivision-Admin" target="_blank" rel="noopener noreferrer" className="relative z-10 block w-full text-center bg-white text-slate-900 py-3 rounded-2xl font-black text-xs hover:bg-indigo-500 hover:text-white transition-all shadow-lg active:scale-95 cursor-pointer">
                                            צפה ב-Repository
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* רמז חוויית משתמש (UX): חץ גלילה דינמי בתחתית המודאל המהבהב בעדינות ונעלם ברגע שגוללים */}
                        {showScrollArrow && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none bg-slate-900/10 backdrop-blur-md px-4 py-2 rounded-full border border-slate-900/5 shadow-sm animate-bounce flex flex-col items-center justify-center transition-opacity duration-300">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-0.5">גלול למטה</span>
                                <ChevronDown className="w-4 h-4 text-indigo-600" />
                            </div>
                        )}
                    </Card>
                </div>
            )}

            {/* מודאל אנושיות - תוכן מלא עם גלילה נקייה */}
            {showHumanDetails && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300">
                    <Card className="w-full max-w-5xl h-[80vh] flex flex-col rounded-[3rem] border-none shadow-2xl bg-white relative overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="w-full bg-white border-b border-slate-100 p-8 md:px-12 flex justify-between items-center relative z-20 rounded-t-[3rem]">
                            <div className="text-right">
                                <h2 className="text-4xl font-black italic tracking-tighter text-slate-900 uppercase">Human Sentiment Analysis</h2>
                                <p className="text-indigo-600 font-black uppercase text-xs tracking-widest mt-1">הבנת הלקוח והנציג מעבר למילים</p>
                            </div>
                            <button onClick={() => setShowHumanDetails(false)} className="text-slate-400 hover:text-indigo-600 p-2 rounded-xl transition-all cursor-pointer"><X className="w-8 h-8" /></button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto scrollbar-clean p-8 md:p-12 pt-4 space-y-12 text-right">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-indigo-50 p-8 rounded-[2.5rem] border border-indigo-100 space-y-4">
                                    <Smile className="text-indigo-600 w-10 h-10" />
                                    <h4 className="font-black text-xl italic text-slate-900">זיהוי לחץ פיננסי מיידי</h4>
                                    <p className="text-slate-500 text-sm font-bold leading-relaxed italic">
                                        המערכת מזהה לחץ פיננסי מההקלטה הראשונה לפי טון הדיבור ומהירות התגובה, ומאפשרת לנציג להתאים את המענה לדחיפות הצורך של הלקוח.
                                    </p>
                                </div>
                                <div className="bg-indigo-50 p-8 rounded-[2.5rem] border border-indigo-100 space-y-4">
                                    <Frown className="text-indigo-600 w-10 h-10" />
                                    <h4 className="font-black text-xl italic text-slate-900">ניתוח רגשות ותסכול</h4>
                                    <p className="text-slate-500 text-sm font-bold leading-relaxed italic">
                                        מדידת שביעות רצון לעומת כעס בזמן אמת. המערכת מזהה בדיוק מתי הלקוח מאבד סבלנות ומאתרת "נקודות שבירה" בשיחת המכירה.
                                    </p>
                                </div>
                            </div>
                            <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white">
                                <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-6">
                                    <Headphones className="text-indigo-400 w-10 h-10" />
                                    <h3 className="text-2xl font-black italic">בקרת איכות לנציגים</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 italic">
                                    <div>
                                        <h5 className="font-black text-indigo-300 mb-2">רמת מקצועיות</h5>
                                        <p className="text-sm text-slate-300 leading-loose">
                                            ניתוח עומק של איכות התשובות והידע הפיננסי המוצג ללקוח. המערכת בודקת האם הנציג עמד בפרוטוקול המקצועי של החברה.
                                        </p>
                                    </div>
                                    <div>
                                        <h5 className="font-black text-indigo-300 mb-2">מדד הסבלנות</h5>
                                        <p className="text-sm text-slate-300 leading-loose">
                                            מעקב אחר התנהלות הנציג ברגעים מורכבים וזיהוי שחיקה. אנו מודדים את אורך הרוח של הנציג אל מול התנגדויות לקוח.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* מודאל דיוק - תוכן מלא עם הגבלת גובה וגלילה נקייה */}
            {showPrecisionDetails && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300">
                    <Card className="w-full max-w-5xl h-[80vh] flex flex-col rounded-[3rem] border-none shadow-2xl bg-white relative overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="w-full bg-white border-b border-slate-100 p-8 md:px-12 flex justify-between items-center relative z-20 rounded-t-[3rem]">
                            <div className="text-right">
                                <h2 className="text-4xl font-black italic tracking-tighter text-slate-900 uppercase">Precision & Strategy</h2>
                                <p className="text-indigo-600 font-black uppercase text-xs tracking-widest mt-1">Data-Driven Decision Making</p>
                            </div>
                            <button onClick={() => setShowPrecisionDetails(false)} className="text-slate-400 hover:text-indigo-600 p-2 rounded-xl transition-all cursor-pointer"><X className="w-8 h-8" /></button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto scrollbar-clean p-8 md:p-12 pt-4 text-right">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="bg-indigo-50 p-8 rounded-[2.5rem] border border-indigo-100 space-y-4 h-full">
                                    <Share2 className="text-indigo-600 w-10 h-10 mb-2" />
                                    <h4 className="font-black text-xl italic text-slate-900">אופטימיזציה שיווקית</h4>
                                    <p className="text-slate-500 text-xs font-bold leading-relaxed italic">
                                        זיהוי ערוץ הפרסום האפקטיבי ביותר (Google, Facebook, Telegram) על ידי ניתוח המרות ישיר מתוך דאטה של שיחות סגורות.
                                    </p>
                                </div>
                                <div className="bg-indigo-50 p-8 rounded-[2.5rem] border border-indigo-100 space-y-4 h-full">
                                    <TrendingUp className="text-indigo-600 w-10 h-10 mb-2" />
                                    <h4 className="font-black text-xl italic text-slate-900">ניתוח טרנדים</h4>
                                    <p className="text-slate-500 text-xs font-bold leading-relaxed italic">
                                        זיהוי התחומים החמים בשוק (רכב, עסק, משכנתה) בזמן אמת, המאפשר לחברה להגיב לשינויים בביקוש לפני המתחרים.
                                    </p>
                                </div>
                                <div className="bg-indigo-50 p-8 rounded-[2.5rem] border border-indigo-100 space-y-4 h-full">
                                    <UserCheck className="text-indigo-600 w-10 h-10 mb-2" />
                                    <h4 className="font-black text-xl italic text-slate-900">התאמת נציגים</h4>
                                    <p className="text-slate-500 text-xs font-bold leading-relaxed italic">
                                        אלגוריתם חכם המתאים כל הלוואה לנציג המומחה ביותר באותו תחום, מה שמבטיח אחוזי סגירה גבוהים משמעותית.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}