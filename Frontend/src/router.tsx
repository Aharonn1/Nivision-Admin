import {
    createRouter,
    createRoute,
    Outlet,
    createRootRoute,
    createBrowserHistory,
    redirect
} from "@tanstack/react-router";
import { NavBarAdmin } from "./Project1/NavBarAdmin";
import { DashboardAiChat } from "./Project1/DashboardAiChat";
import Rates from "./Project1/Rates";
import AdminLossAnalysisReport from "./Project1/AdminLossAnalysisReport";
import LeadSourceROI from "./Project1/LeadSourceROI";
import AgentSalaries from "./Project1/AgentSalaries";
import AdminLoanPerformanceReport from "./Project1/AdminLoanPerformanceReport";
import AdminLoanDashboard from "./Project1/AdminLoanDashboard";
import AdminWeeklyInsightsReport from "./Project1/AdminWeeklyInsightsReport";
import { Login } from "./Project1/Login";
import AdminReturnedOrders from "./Project1/RepeatOrders";
import FinancialDashboard from "./Project1/FinancialDashboard";
import CallAnalysis from "./Project1/CallAnalysis";
import AdminLoanRiskReport from "./Project1/AdminLoanRiskReport";
import RevenueProjectionInsights from "./Project1/RevenueProjectionInsights";
import AdminAIActivityLog from "./Project1/AdminAIActivityLog";
import AdminTeamPerformanceReport from "./Project1/AdminTeamPerformanceReport";
import AboutPage from "./Project1/AboutPage";
import LeadsEfficiencyTable from "./Project1/LeadsEfficiencyTable";
import ConversionFunnel from "./Project1/ConversionFunnel";
import DropOffAnalysis from "./Project1/DropOffAnalysis";
import RepaymentInsights from "./Project1/RepaymentRatios";
import VipTierAnalysis from "./Project1/VipTierAnalysis";
import LeadScoring from "./Project1/LeadScoring";
import GeographicInsights from "./Project1/GeographicInsights";
import NetProfitMonthly from "./Project1/NetProfitMonthly";
import { AdminProfileSettings } from "./Project1/AdminProfileSettings";
import { Register } from "./Project1/Register";
import { SystemHealth } from "./Project1/SystemHealth";
import SystemPerformanceTask from "./Project1/SystemPerformanceTask";
import { AWSUsageDashboard } from "./Project1/AWSUsageDashboard";
import { UserAccessDashboard } from "./Project1/UserAccessDashboard";
import { SystemIntelligenceDash } from "./Project1/SystemIntelligenceDash";
import { SecurityFortressDash } from "./Project1/SecurityFortressDash";
import { InfrastructureHealthDash } from "./Project1/InfrastructureHealthDash";
import { CrmOperationalDash } from "./Project1/CrmOperationalDash";
import { ServiceNodesDash } from "./Project1/ServiceNodesDash";
import InfrastructureControlCenter from "./Project1/InfrastructureControlCenter";
import { Link } from "@tanstack/react-router";
import { RolePermissions } from "./Project1/RolePermissions";
import { SecurityThreats } from "./Project1/SecurityThreats";
import UseAwsMetrics from "./Project1/UseAwsMetrics";
import { SystemReliabilityCenter } from "./Project1/SystemReliabilityCenter";
import { InfrastructureIntelligence } from "./Project1/InfrastructureIntelligence";
import BillingTrendChart from "./Project1/BillingTrendChart";

// 1. הגדרת היסטוריה מבוססת Browser (ללא #)
const browserHistory = createBrowserHistory();

// 2. Root Route
const rootRoute = createRootRoute({
    component: () => <Outlet />,
});

// 3. Login Route - דף הכניסה (נתיב השורש)
const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: Login,
});

// 4. Admin Layout Component
// 4. Admin Layout Component - גרסת ה-Dark Core הסופית
const AdminLayout = () => {
   return (
        /* 👑 המעטפת הכללית מיושרת כעת לגוון האפור-כחלחל המלוטש של ה-Login */
        <div className="relative min-h-screen w-full bg-[#E2E8F0] flex flex-col select-none font-sans">
            <DashboardAiChat />
            <NavBarAdmin />
            
            {/* 🚀 התיקון הארכיטקטוני הראשי: ה-main הוגדר בדיוק לצבע ה-Login הבהיר (#E2E8F0).
                זה מבטל מיידית את חיתוכי הצבע והמסגרות הכפולות, ומאפשר לכרטיסים הלבנים לצוף בטבעיות */}
            <main className="flex-1 w-full p-4 md:p-8 bg-[#E2E8F0] overflow-y-auto text-slate-900 z-10 relative">
                <Outlet />
            </main>
            
            {/* Footer Component - נשאר כהה ומיושר לתחתית האתר ליצירת סגירה VIP מלוטשת */}
            <footer className="w-full mt-auto bg-slate-900 text-white py-12 relative overflow-hidden flex-shrink-0 border-t border-slate-800">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
                <div className="max-w-7xl mx-auto px-10 flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                    <div className="text-right">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Nivision Neural Engine</span>
                        </div>
                        <p className="text-slate-400 text-[11px] font-bold italic">
                            Authorized Personnel Only • Audit Logging Active • 2026
                        </p>
                    </div>

                    <Link 
                        to="/admin/AboutPage" 
                        className="group relative px-10 py-4 bg-white/5 border border-white/10 rounded-[2rem] hover:bg-white/10 hover:border-indigo-500/50 transition-all duration-300 shadow-2xl flex items-center gap-4 cursor-pointer"
                    >
                        <span className="text-2xl group-hover:scale-125 transition-transform duration-500">🛡️</span>
                        <div className="text-right">
                            <span className="block text-white font-black text-lg italic tracking-tighter leading-none">Nivision אודות</span>
                            <span className="text-indigo-400 text-[9px] font-black uppercase tracking-widest opacity-70">Platform Intelligence</span>
                        </div>
                    </Link>

                    <div className="bg-white/5 px-6 py-2 rounded-full border border-white/5">
                        <span className="text-slate-500 font-mono text-[10px] font-bold uppercase italic">System V2.6.4</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

// 5. Admin Layout Route עם הגנת "טיפול שורש"
const adminLayoutRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "admin",
    beforeLoad: () => {
        const isAuthenticated = localStorage.getItem('token');
        // אם אין טוקן - חסימה מיידית והפניה ללוגין
        if (isAuthenticated !== "true") {
            throw redirect({
                to: '/',
            });
        }
    },
    component: AdminLayout,
});

// 6. Admin Child Routes
const adminIndexRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: "/", component: AdminLoanDashboard });
const adminAIActivityLogRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: "AdminAIActivityLog", component: AdminAIActivityLog });
const adminReturnedOrdersRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: "AdminReturnedOrders", component: AdminReturnedOrders });
const financialDashboardRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: "FinancialDashboard", component: FinancialDashboard });
const agentSalariesRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: "agentsalaries", component: AgentSalaries });
const revenueProjectionInsightsRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: "RevenueProjectionInsights", component: RevenueProjectionInsights });
const adminLoanPerformanceReportRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: "AdminLoanPerformanceReport", component: AdminLoanPerformanceReport });
const adminLossAnalysisReportRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: "AdminLossAnalysisReport", component: AdminLossAnalysisReport });
const adminLoanRiskReportRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: "AdminLoanRiskReport", component: AdminLoanRiskReport });
const adminWeeklyInsightsReportRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: "AdminWeeklyInsightsReport", component: AdminWeeklyInsightsReport });
const adminTeamPerformanceReportRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: "AdminTeamPerformanceReport", component: AdminTeamPerformanceReport });
const ratesRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: "rates", component: Rates });
const adminLoanDashboardRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: "AdminLoanDashboard", component: AdminLoanDashboard });
const leadSourceROIRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: "LeadSourceROI", component: LeadSourceROI });
const callAnalysisRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: "CallAnalysis", component: CallAnalysis });
const aboutPageRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: "AboutPage", component: AboutPage });
const leadsEfficiencyTableRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: "LeadsEfficiencyTable", component: LeadsEfficiencyTable });
const conversionFunnelRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: "ConversionFunnel", component: ConversionFunnel });
const dropOffAnalysisRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: "DropOffAnalysis", component: DropOffAnalysis });
const repaymentInsightsRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: "RepaymentRatios", component: RepaymentInsights });
const vipTierAnalysisRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: "VipTierAnalysis", component: VipTierAnalysis });
const leadScoringRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: "LeadScoring", component: LeadScoring });
const geographicInsightsRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: "GeographicInsights", component: GeographicInsights });
const netProfitMonthlyRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: "NetProfitMonthly", component: NetProfitMonthly });
const adminProfileSettingsRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: "AdminProfileSettings", component: AdminProfileSettings });
const registerRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: "Register", component: Register });
const systemHealthRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: "SystemHealth", component: SystemHealth });
const systemPerformanceTaskRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: "SystemPerformanceTask", component: SystemPerformanceTask });
const aWSUsageDashboardRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: "AWSUsageDashboard", component: AWSUsageDashboard });
const userAccessDashboardRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: "UserAccessDashboard", component: UserAccessDashboard });
const systemIntelligenceDashRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: "SystemIntelligenceDash", component: SystemIntelligenceDash });
const securityFortressDashRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: "SecurityFortressDash", component: SecurityFortressDash });
const infrastructureHealthDashRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: "InfrastructureHealthDash", component: InfrastructureHealthDash });
const crmOperationalDashRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: "CrmOperationalDash", component: CrmOperationalDash });
const serviceNodesDashRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: "ServiceNodesDash", component: ServiceNodesDash });
const infrastructureControlCenterRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: "InfrastructureControlCenter", component: InfrastructureControlCenter });
const rolePermissions = createRoute({ getParentRoute: () => adminLayoutRoute, path: "RolePermissions", component: RolePermissions });
const useAwsMetrics = createRoute({ getParentRoute: () => adminLayoutRoute, path: "UseAwsMetrics", component: UseAwsMetrics });
const securityThreats = createRoute({ getParentRoute: () => adminLayoutRoute, path: "SecurityThreats", component: SecurityThreats });
const systemReliabilityCenter = createRoute({ getParentRoute: () => adminLayoutRoute, path: "SystemReliabilityCenter", component: SystemReliabilityCenter });
const infrastructureIntelligence = createRoute({ getParentRoute: () => adminLayoutRoute, path: "InfrastructureIntelligence", component: InfrastructureIntelligence });
const billingTrendChart = createRoute({ getParentRoute: () => adminLayoutRoute, path: "BillingTrendChart", component: BillingTrendChart });


// 7. בניית עץ הניתוב המלא
const routeTree = rootRoute.addChildren([
    loginRoute,
    adminLayoutRoute.addChildren([
        adminIndexRoute,
        agentSalariesRoute,
        ratesRoute,
        adminLoanDashboardRoute,
        leadSourceROIRoute,
        adminLoanPerformanceReportRoute,
        adminLossAnalysisReportRoute,
        adminWeeklyInsightsReportRoute,
        adminAIActivityLogRoute,
        adminReturnedOrdersRoute,
        financialDashboardRoute,
        adminTeamPerformanceReportRoute,
        adminLoanRiskReportRoute,
        revenueProjectionInsightsRoute,
        callAnalysisRoute,
        aboutPageRoute,
        leadsEfficiencyTableRoute,
        conversionFunnelRoute,
        dropOffAnalysisRoute,
        repaymentInsightsRoute,
        vipTierAnalysisRoute,
        leadScoringRoute,
        geographicInsightsRoute,
        netProfitMonthlyRoute,
        adminProfileSettingsRoute,
        registerRoute,
        systemHealthRoute,
        systemPerformanceTaskRoute,
        aWSUsageDashboardRoute,
        userAccessDashboardRoute,
        systemIntelligenceDashRoute,
        securityFortressDashRoute,
        infrastructureHealthDashRoute,
        crmOperationalDashRoute,
        serviceNodesDashRoute,
        infrastructureControlCenterRoute,
        rolePermissions,
        securityThreats,
        useAwsMetrics,
        systemReliabilityCenter,
        infrastructureIntelligence,
        billingTrendChart,
    ]),
]);

// 8. יצירת הראוטר הסופי
export const myAppRouter = createRouter({ 
    routeTree,
    history: browserHistory,
});

declare module "@tanstack/react-router" {
    interface Register {
        router: typeof myAppRouter; 
    }
}

export default myAppRouter;