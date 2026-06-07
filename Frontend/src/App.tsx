import React from "react";
import { Link, Outlet } from "@tanstack/react-router";
import { DashboardAiChat } from "./Project1/DashboardAiChat";
import './index.css';

const App: React.FC = () => {
    return (
        /* 🚀 המעטפת הראשית נעולה על שחור עמוק bg-[#090d16] וצבע טקסט בהיר text-white */
        <div className="w-full min-h-screen bg-[#090d16] text-white font-sans antialiased selection:bg-white-500/30 flex flex-col">
            <DashboardAiChat />
            
            {/* מיקום לינק האודות בתוך קפסולה נקייה התואמת לעיצוב הכהה */}
            <div className="w-full max-w-[1400px] mx-auto pt-4 px-4 flex justify-end relative z-50" dir="rtl">
                <Link 
                    className="nav-link text-slate-300 hover:text-white font-black text-xs bg-white/5 border border-white/10 px-5 py-2 rounded-full hover:bg-white/10 hover:border-blue-500/30 transition-all duration-300 shadow-xl cursor-pointer" 
                    to="/admin/AboutPage"
                >
                    🧠 אודות Nivision
                </Link>
            </div>
            
            {/* אזור התוכן הראשי - flex-1 מבטיח פריסה על כל גובה המסך הפנוי */}
            <main className="flex-1 w-full p-4 md:p-8 z-10 relative">
                <Outlet /> 
            </main>        
        </div>
    );
}

export default App;