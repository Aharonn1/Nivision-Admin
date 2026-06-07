import React, { useState, useEffect } from 'react';
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { 
  Loader2, 
  Shield, 
  Save, 
  RefreshCcw, 
  ShieldAlert, 
  LayoutDashboard, 
  BarChart3, 
  Wallet, 
  Target, 
  Rocket, 
  ShieldCheck,
  User 
} from "lucide-react";
import appConfig from "../Utils/AppConfig";
import axios from "axios";
import dataService from "../Service/DataService"; 
import { toast, Toaster } from "sonner";
import { useNavigate } from "@tanstack/react-router";

export const navConfig = [
  { id: "current_management", title: "ניהול שוטף", icon: LayoutDashboard },
  { id: "reports_analysis", title: "דוחות וניתוח", icon: BarChart3 },
  { id: "financial", title: "פיננסי", icon: Wallet },
  { id: "leads_operation", title: "תפעול לידים", icon: Target },
  { id: "strategy", title: "אסטרטגיה", icon: Rocket },
  { id: "risk_control", title: "בקרת סיכונים", icon: ShieldCheck }
];

const AVAILABLE_ROLES = ["SUPER_ADMIN", "AGENT", "REGISTERED_USER"];

interface SystemUser {
  id?: string;
  userId?: string;
  _id?: string;
  email: string;
  role: string;
  password?: string;
}

export const RolePermissions = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>([]); 
  const [selectedRole, setSelectedRole] = useState<string>("REGISTERED_USER");
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null);
  const [activePermissions, setActivePermissions] = useState<string[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");
    
    if (token !== "true" || userRole !== "SUPER_ADMIN") {
      setIsAuthorized(false);
      setTimeout(() => navigate({ to: '/' }), 1500);
    } else {
      setIsAuthorized(true);
      loadSystemUsers();
    }
  }, [navigate]);

  const loadSystemUsers = async () => {
    try {
      let rawUsers = await dataService.getAllUsers();
      
      if (!rawUsers || !Array.isArray(rawUsers) || rawUsers.length === 0) {
        const storedId = localStorage.getItem("userId");
        if (storedId) {
          const url = `${appConfig.baseUrl}/webhook/get-all-users`;
          const response = await axios.get(url, {
            params: { requesterId: storedId }
          });
          rawUsers = response.data.users || response.data || [];
        }
      }

      const normalizedUsers: SystemUser[] = [];
      
      if (Array.isArray(rawUsers)) {
        rawUsers.forEach((user: any) => {
          if (!user) return;
          
          if (typeof user === "string") {
            normalizedUsers.push({
              email: user,
              role: "REGISTERED_USER"
            });
          } else {
            normalizedUsers.push({
              id: user.id,
              userId: user.userId || user._id || user.id,
              _id: user._id,
              email: user.email || "unknown@domain.com",
              role: user.role || "REGISTERED_USER",
              password: user.password
            });
          }
        });
      }

      setSystemUsers(normalizedUsers);

      const defaultUsers = normalizedUsers.filter(u => u.role === "REGISTERED_USER");
      if (defaultUsers.length > 0 && !selectedUserEmail) {
        setSelectedUserEmail(defaultUsers[0].email);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
      setSystemUsers([]);
    }
  };

  const handleUserSelect = (email: string) => {
    setSelectedUserEmail(email);
    fetchPermissionsForUser(email);
  };

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    const roleUsers = systemUsers.filter(u => u.role === role);
    if (roleUsers.length > 0) {
      setSelectedUserEmail(roleUsers[0].email);
      setActivePermissions([]);
    } else {
      setSelectedUserEmail(null);
      setActivePermissions([]);
    }
  };

  const handleTogglePermission = (permissionId: string) => {
    if (!selectedUserEmail) {
      toast.error("פעולה נחסמה");
      return;
    }
    
    setActivePermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const fetchPermissionsForUser = async (email: string) => {
    try {
      const response = await axios.post(`${appConfig.baseUrl}/webhook/get-permissions`, {
        action: "get",
        email: email
      });

      const userData = response.data; 
      const savedPermissions = Array.isArray(userData.permissions) ? userData.permissions : [];
      setActivePermissions(savedPermissions);
      
      if (userData.password) {
        setSystemUsers(prev => prev.map(u => 
          u.email === email ? { ...u, password: userData.password } : u
        ));
      }
    } catch (err) {
      console.error("Failed to fetch user data:", err);
      setActivePermissions([]);
    }
  };

  const handleSaveChanges = async () => {
    if (!selectedUserEmail) {
      toast.error("שגיאה", { description: "לא נבחר משתמש לשמירה." });
      return;
    }

    const targetUserObj = systemUsers.find(u => u.email === selectedUserEmail);
    const targetKeyIdentifier = targetUserObj?.userId || targetUserObj?.id || targetUserObj?._id || selectedUserEmail;

    setLoading(true);
    try {
      await axios.post(`${appConfig.baseUrl}/webhook/get-permissions`, {
        action: "save",
        email: targetKeyIdentifier,
        permissions: activePermissions,
        password: targetUserObj?.password
      });
      
      toast.success("פרוטוקול גישה אישי עודכן");
      setLoading(false);
    } catch (err) {
      toast.error("שגיאת שמירה");
      setLoading(false);
    }
  };
  
  if (isAuthorized === null) return null;
  if (isAuthorized === false) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#f8fafc] text-center p-6">
        <ShieldAlert size={80} className="text-rose-500 mb-6 animate-pulse" />
        <h1 className="text-4xl font-black italic mb-2 tracking-tighter text-slate-900 uppercase">Access Restricted</h1>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto h-auto p-4 md:p-10 space-y-10 font-sans select-none overflow-hidden" dir="rtl">
      <div className="w-full flex flex-col md:flex-row justify-between items-center gap-6 bg-white/80 backdrop-blur-xl p-10 rounded-[3rem] border border-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.03)] relative z-10">
        <div className="flex items-center gap-8">
          <div className="p-6 bg-slate-900 text-white rounded-[2.2rem] shadow-2xl rotate-2">
            <Shield size={32} className="text-indigo-400" />
          </div>
          <div className="text-right">
            <h1 className="text-5xl font-black text-slate-900 italic tracking-tighter leading-none uppercase">בקרת הרשאות דינמית</h1>
            <div className="text-slate-400 font-bold text-[11px] uppercase tracking-[0.4em] italic mt-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse block" />
              NIVISION ACL ENGINE // User Specific Matrix v2.0
            </div>
          </div>
        </div>
        <button 
          onClick={loadSystemUsers} 
          className="p-4 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-2xl transition-all border border-slate-100 shadow-sm"
        >
          <RefreshCcw className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
        <Card className="lg:col-span-4 bg-white/90 backdrop-blur-2xl border-2 border-white rounded-[4rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.03)] p-10 h-fit text-right">
          <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest block mb-2 italic">Step 1 // Select User</span>
          <h3 className="text-slate-900 font-black italic text-2xl tracking-tighter uppercase mb-8">בחירת משתמש ממוקד</h3>
          
          <div className="space-y-4">
            {AVAILABLE_ROLES.map((role) => {
              const currentRoleUsers = systemUsers.filter(u => u.role === role);
              const count = currentRoleUsers.length;
              const isRoleOpen = selectedRole === role;
              
              return (
                <div key={role} className="flex flex-col gap-2">
                  <div onClick={() => handleRoleChange(role)} className={`p-5 rounded-2xl border cursor-pointer ${isRoleOpen ? "bg-slate-100" : "bg-slate-50"}`}>
                    <span className="font-mono text-xs">{role}</span>
                  </div>
                  {isRoleOpen && count > 0 && (
                    <div className="bg-slate-950/5 rounded-[1.5rem] p-3 space-y-2 max-h-[220px] overflow-y-auto">
                      {currentRoleUsers.map((user, uIdx) => (
                        <div key={uIdx} onClick={() => handleUserSelect(user.email)} className={`px-4 py-3 rounded-xl cursor-pointer ${selectedUserEmail === user.email ? "bg-slate-900 text-white" : "bg-white"}`}>
                          <span className="font-bold text-xs">{user.email}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="lg:col-span-8 bg-white/95 backdrop-blur-2xl border-2 border-white rounded-[4rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.03)] p-10 flex flex-col min-h-[500px]">
          <div>
            <h3 className="text-slate-900 font-black italic text-2xl tracking-tighter uppercase mb-10">מטריצת חשיפת קומפוננטות</h3>
            {selectedUserEmail && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {navConfig.map((item) => {
                  const IconComponent = item.icon;
                  const isChecked = activePermissions.includes(item.id);
                  return (
                    <div key={item.id} onClick={() => handleTogglePermission(item.id)} className={`p-6 rounded-[2rem] border-2 cursor-pointer flex items-center justify-between ${isChecked ? "bg-white border-indigo-500" : "bg-slate-50/30 border-slate-100"}`}>
                      <div className="flex items-center gap-4">
                        <IconComponent size={20} />
                        <h4 className="font-black text-slate-900">{item.title}</h4>
                      </div>
                      <div className={`w-6 h-6 rounded-lg border-2 ${isChecked ? "bg-indigo-600 border-indigo-600" : "border-slate-200"}`} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-auto pt-6 border-t flex justify-end">
            <button onClick={handleSaveChanges} disabled={loading} className="bg-slate-900 text-white px-10 py-5 rounded-[1.8rem] font-black shadow-xl flex items-center gap-3 uppercase italic tracking-widest active:scale-95">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={18} />}
              <span>עדכון פרוטוקול אישי</span>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};