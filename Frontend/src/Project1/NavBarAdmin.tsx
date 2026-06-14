import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  BarChart3, 
  Wallet, 
  Target, 
  Rocket, 
  ShieldCheck, 
  ChevronDown,
  UserCog 
} from "lucide-react";
import appConfig from "../Utils/AppConfig";
import axios from "axios";
import dataService from "../Service/DataService";

const SectionTitle = ({ title }: { title: string }) => (
  <div style={{ 
    fontSize: '10px', textTransform: 'uppercase', color: '#64748b', 
    padding: '12px 16px 4px 16px', fontWeight: '800', letterSpacing: '0.05em',
    marginTop: '4px' 
  }}>
    {title}
  </div>
);

// רכיב עזר לקו מפריד
const Divider = () => <div style={{ height: '1px', background: '#e2e8f0', margin: '6px 16px' }} />;

const NavGroup = ({ title, icon: Icon, children, isSidebar = false }: { title: string, icon: any, children: React.ReactNode, isSidebar?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isSidebar) {
      const mainContent = document.querySelector('main') || document.body;
      if (isOpen) {
        mainContent.style.transition = "padding-left 0.35s cubic-bezier(0.4, 0, 0.2, 1)";
        mainContent.style.paddingLeft = "210px";
      } else {
        mainContent.style.paddingLeft = "0px";
      }
    }
  }, [isOpen, isSidebar]);

  return (
    <div 
      className="nav-group" 
      onMouseEnter={() => setIsOpen(true)} 
      onMouseLeave={() => setIsOpen(false)}
      style={{ 
        height: isSidebar ? '100%' : 'auto', 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: isSidebar ? 'relative' : 'static',
        background: isSidebar && isOpen ? "#f1f5f9" : "transparent",
        transition: "background-color 0.2s ease"
      }}
    >
      <div 
        className={`category-trigger ${isOpen ? 'active' : ''} ${isSidebar && isOpen ? 'sidebar-header-active' : ''}`} 
        style={{ 
          position: 'relative', zIndex: 4501, height: '64px', boxSizing: 'border-box',
          display: 'flex', alignItems: 'center', gap: '6px',
          width: isSidebar ? (isOpen ? '210px' : 'max-content') : 'auto',
          paddingRight: isSidebar ? (isOpen ? '24px' : '0px') : '12px',
          paddingLeft: isSidebar ? (isOpen ? '16px' : '0px') : '12px',
          justifyContent: 'flex-start',
          borderBottom: "none",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
        }}
      >
        <Icon className={`category-icon ${isOpen ? 'icon-active' : ''}`} />
        <span>{title}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDown className="chevron-icon" />
        </motion.div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={isSidebar ? { opacity: 0, x: -10 } : { opacity: 0, height: 0 }}
            animate={isSidebar ? { opacity: 1, x: 0 } : { opacity: 1, height: "auto" }}
            exit={isSidebar ? { opacity: 0, x: -10 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            style={{ 
              position: isSidebar ? 'absolute' : 'relative', 
              top: isSidebar ? '100%' : '0px',
              left: 0, right: 'auto', width: isSidebar ? '210px' : '100%',
              zIndex: 2100, whiteSpace: "nowrap", overflow: "hidden", background: "transparent"
            }}
          >
            <div style={{ 
              display: 'flex', flexDirection: 'column', alignItems: isSidebar ? 'flex-start' : 'center',
              width: '100%', margin: '0 auto', background: isSidebar ? "#f1f5f9" : "#ffffff",
              boxShadow: isSidebar ? "none" : "0 10px 25px -5px rgba(15, 23, 42, 0.05)",
              borderRadius: isSidebar ? "0" : "14px", border: "none",
              padding: isSidebar ? "12px 0" : "6px 0",
              marginTop: "0px", marginBottom: isSidebar ? "0" : "16px",
              boxSizing: 'border-box'
            }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const NavBarAdmin = () => {
  const [userRole] = useState(localStorage.getItem("userRole") || "REGISTERED_USER");
  const [allowedPermissions, setAllowedPermissions] = useState<string[]>([]);
  const [isNavLoading, setIsNavLoading] = useState<boolean>(true);

  const isSuperAdmin = userRole === "SUPER_ADMIN";

  useEffect(() => {
    const initPermissions = () => {
      try {
        // 1. נסיון שליפה מהאובייקט המלא שכבר קיים ב-Login
        const rawData = localStorage.getItem("userFullData");
        if (rawData) {
          const userFullData = JSON.parse(rawData);
          setAllowedPermissions(userFullData.permissions || []);
        }
      } catch (e) {
        console.error("Failed to load from storage", e);
      } finally {
        setIsNavLoading(false);
      }
    };
    initPermissions();
  }, []);

  const canSee = (groupId: string) => {
    if (isSuperAdmin) return true;
    if (isNavLoading) return false;
    return Array.isArray(allowedPermissions) && allowedPermissions.includes(groupId);
  };


  
  return (
    <nav className="no-print" style={{ backgroundColor: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(15px)", borderBottom: "1px solid rgba(226, 232, 240, 0.5)", position: "sticky", top: 0, zIndex: 4000, width: "100%", minHeight: "64px" }}>
      <style>{`
        .nav-full-layout { display: flex; justify-content: space-between; align-items: flex-start; width: 100%; direction: rtl; }
        .nav-right-side { display: flex; gap: 12px; align-items: flex-start; padding-right: 24px; height: 100%; }
        .nav-left-side { display: flex; align-items: center; height: 64px; padding-left: 0px; margin-left: 0px; }
        .category-trigger { color: #64748b; font-weight: 700; font-size: 13px; cursor: pointer; transition: all 0.2s; border-radius: 8px; }
        .category-trigger:hover { color: #1e293b; background-color: rgba(248, 250, 252, 0.8); }
        .category-trigger.active { color: #4f46e5; }
        .dropdown-link { text-decoration: none; color: #1e293b; font-weight: 700; font-size: 12px; padding: 10px 16px; display: flex; align-items: center; gap: 10px; transition: all 0.2s; width: 100%; box-sizing: border-box; border-radius: 8px; }
        .dropdown-link:hover { background-color: rgba(203, 213, 225, 0.3); color: #4f46e5; }
        .category-icon { width: 15px; height: 15px; }
        .chevron-icon { width: 13px; height: 13px; }
      `}</style>

      <div className="nav-full-layout">
        <div className="nav-right-side">
          {canSee("current_management") && (
            <NavGroup title="ניהול שוטף" icon={LayoutDashboard}>
              <Link className="dropdown-link" to={"/admin/AdminLoanDashboard" as any}>דאשבורד סגירות</Link>
              <Link className="dropdown-link" to={"/admin/AdminAIActivityLog" as any}>לוג פעילות AI</Link>
              <Link className="dropdown-link" to={"/admin/AdminTeamPerformanceReport" as any}>דוח ביצועי צוות</Link>
            </NavGroup>
          )}
          {canSee("reports_analysis") && (
            <NavGroup title="דוחות וניתוח" icon={BarChart3}>
              <Link className="dropdown-link" to={"/admin/LeadsEfficiencyTable" as any}>יעילות טיפול</Link>
              <Link className="dropdown-link" to={"/admin/AdminLoanPerformanceReport" as any}>ביצועי הלוואות</Link>
              <Link className="dropdown-link" to={"/admin/LeadSourceROI" as any}>ניתוח ROI מקורות</Link>
              <Link className="dropdown-link" to={"/admin/AdminWeeklyInsightsReport" as any}>לידים מפוספסים</Link>
              <Link className="dropdown-link" to={"/admin/CallAnalysis" as any}>תיעוד וניתוח שיחות</Link>
            </NavGroup>
          )}
          {canSee("financial") && (
            <NavGroup title="פיננסי" icon={Wallet}>
              <Link className="dropdown-link" to={"/admin/AgentSalaries" as any}>משכורות ובונוסים</Link>
              <Link className="dropdown-link" to={"/admin/NetProfitMonthly" as any}>דוח רווח נטו</Link>
              <Link className="dropdown-link" to={"/admin/FinancialDashboard" as any}>תזרים מזומנים</Link>
              <Link className="dropdown-link" to={"/admin/RevenueProjectionInsights" as any}>צפי הכנסות עתידי</Link>
            </NavGroup>
          )}
          {canSee("leads_operation") && (
            <NavGroup title="תפעול לידים" icon={Target}>
              <Link className="dropdown-link" to={"/admin/AdminLoanRiskReport" as any}>בקשות להלוואה</Link>
              <Link className="dropdown-link" to={"/admin/AdminLossAnalysisReport" as any}>ניהול תיקי VIP</Link>
              <Link className="dropdown-link" to={"/admin/AdminReturnedOrders" as any}>דוח לידים שבועי</Link>
              <Link className="dropdown-link" to={"/admin/Rates" as any}>מודיעין עסקאות</Link>
            </NavGroup>
          )}
          {canSee("strategy") && (
            <NavGroup title="אסטרטגיה" icon={Rocket}>
              <Link className="dropdown-link" to={"/admin/ConversionFunnel" as any}>משפך המרה</Link>
              <Link className="dropdown-link" to={"/admin/DropOffAnalysis" as any}>ניתוח סיבות נטישה</Link>
              <Link className="dropdown-link" to={"/admin/GeographicInsights" as any}>פריסה גיאוגרפית (ערים)</Link>
            </NavGroup>
          )}
          {canSee("risk_control") && (
            <NavGroup title="בקרת סיכונים" icon={ShieldCheck}>
              <Link className="dropdown-link" to={"/admin/LeadScoring" as any}>ניתוח איכות</Link>
              <Link className="dropdown-link" to={"/admin/RepaymentRatios" as any}>יחס החזר חודשי</Link>
              <Link className="dropdown-link" to={"/admin/VipTierAnalysis" as any}>פילוח שכבת VIP</Link>
            </NavGroup>
          )}
        </div>
        <div className="nav-left-side">
                {isSuperAdmin && (
            <NavGroup title="הגדרות" icon={UserCog} isSidebar={true}>
              <SectionTitle title="ניהול גישה" />
              <Link className="dropdown-link" to={"/admin/AdminProfileSettings" as any}>עדכון פרטי גישה</Link>
              <Link className="dropdown-link" to={"/admin/Register" as any}>ניהול מורשי גישה</Link>
              <Link className="dropdown-link" to={"/admin/RolePermissions" as any}>בקרת הרשאות דינמית</Link>
              <Link className="dropdown-link" to={"/admin/UserAccessDashboard" as any}>דוח כניסות משתמשים</Link>
              <Divider />
              
              <SectionTitle title="תשתיות AWS" />
              <Link className="dropdown-link" to={"/admin/SystemReliabilityCenter" as any}>ניהול תשתיות AWS</Link>
              <Link className="dropdown-link" to={"/admin/InfrastructureControlCenter" as any}>ניהול וניטור Node-Core</Link>
              <Link className="dropdown-link" to={"/admin/BillingTrendChart" as any}>דוח עלויות ענן</Link>
              <Divider />
              
              <SectionTitle title="ניטור וביצועים" />
              <Link className="dropdown-link" to={"/admin/SystemHealth" as any}>מרכז בקרה ותשתיות</Link>
              <Link className="dropdown-link" to={"/admin/SystemPerformanceTask" as any}>ניהול ביצועי מערכת</Link>
              <Link className="dropdown-link" to={"/admin/SystemIntelligenceDash" as any}>ניטור בינה תפעולית</Link>
              <Link className="dropdown-link" to={"/admin/InfrastructureHealthDash" as any}>ניטור משאבי ענן</Link>
              <Link className="dropdown-link" to={"/admin/infrastructureIntelligence" as any}>ביצועי ענן בזמן אמת</Link>
              <Link className="dropdown-link" to={"/admin/CrmOperationalDash" as any}>ניטור תפעול CRM</Link>
              <Link className="dropdown-link" to={"/admin/SecurityFortressDash" as any}>אבטחה תפעולית (SOC)</Link>
            </NavGroup>
          )}
        </div>
      </div>
    </nav>
  );
};