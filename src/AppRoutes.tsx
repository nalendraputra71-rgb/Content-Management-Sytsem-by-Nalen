import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { useAuth } from "./contexts/AuthContext";

const MonthView = lazy(() => import("./Views").then(m => ({ default: m.MonthView })));
const BoardView = lazy(() => import("./Views").then(m => ({ default: m.BoardView })));
const TimelineView = lazy(() => import("./Views").then(m => ({ default: m.TimelineView })));
const TableView = lazy(() => import("./Views").then(m => ({ default: m.TableView })));
const AnalyticsView = lazy(() => import("./AnalyticsView").then(m => ({ default: m.AnalyticsView })));
const SocialStudioView = lazy(() => import("./SocialStudioView").then(m => ({ default: m.SocialStudioView })));
const SocHubView = lazy(() => import("./SocHubView").then(m => ({ default: m.SocHubView })));
const AdminPanel = lazy(() => import("./AdminPanel").then(m => ({ default: m.AdminPanel })));
const AuthScreen = lazy(() => import("./AuthScreen").then(m => ({ default: m.AuthScreen })));
const AuthActionScreen = lazy(() => import("./AuthActionScreen"));
const UserProfile = lazy(() => import("./UserProfile").then(m => ({ default: m.UserProfile })));
const BillingView = lazy(() => import("./BillingView").then(m => ({ default: m.BillingView })));
const DashboardView = lazy(() => import("./DashboardView").then(m => ({ default: m.DashboardView })));
const LandingPage = lazy(() => import("./LandingPage").then(m => ({ default: m.LandingPage })));
const PricingPage = lazy(() => import("./PricingPage").then(m => ({ default: m.PricingPage })));
const OrderSummary = lazy(() => import("./OrderSummary").then(m => ({ default: m.OrderSummary })));
const DataDeletionStatus = lazy(() => import("./DataDeletionStatus").then(m => ({ default: m.DataDeletionStatus })));
const PublicBriefView = lazy(() => import("./PublicBriefView").then(m => ({ default: m.PublicBriefView })));
const TermsOfService = lazy(() => import("./TermsAndPrivacy").then(m => ({ default: m.TermsOfService })));
const PrivacyPolicy = lazy(() => import("./TermsAndPrivacy").then(m => ({ default: m.PrivacyPolicy })));
const FAQ = lazy(() => import("./TermsAndPrivacy").then(m => ({ default: m.FAQ })));
const Guides = lazy(() => import("./TermsAndPrivacy").then(m => ({ default: m.Guides })));
const AboutUs = lazy(() => import("./TermsAndPrivacy").then(m => ({ default: m.AboutUs })));
const RefundPolicy = lazy(() => import("./TermsAndPrivacy").then(m => ({ default: m.RefundPolicy })));
const PublicView = lazy(() => import("./PublicView"));
const Dashboard = lazy(() => import("./layouts/MainLayout").then(m => ({ default: m.Dashboard })));

import { CMSLayout } from "./App";

export function AppRoutes({ planDetails, updateProfileSettings, currentTheme }: any) {
  const { user, profile, systemConfig, setUser, setProfile } = useAuth();

  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <Routes>
        <Route path="/auth/action" element={<AuthActionScreen />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/guides" element={<Guides />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/checkout-preview" element={<OrderSummary user={user} profile={profile} />} />
        <Route path="/data-deletion-status" element={<DataDeletionStatus />} />
        <Route path="/shared-brief/:workspaceId/:contentId" element={<PublicBriefView />} />
        <Route path="/public/:wsId" element={<PublicView />} />
        
        <Route path="/login" element={(user && profile) ? <Navigate to={localStorage.getItem('pending_checkout') ? `/checkout-preview?plan=${localStorage.getItem('pending_checkout')}&cycle=${localStorage.getItem('pending_checkout_cycle') || 'monthly'}` : "/"} /> : <AuthScreen currentUser={user && !profile ? user : null} onUserCreated={(u)=>setUser(u)} />} />
        <Route path="/profile" element={(user && profile) ? <Navigate to="/?tab=settings" replace /> : <Navigate to="/login" />} />
        <Route path="/billing" element={(user && profile) ? <CMSLayout><BillingView userProfile={profile} activeWorkspace={null} onUpdate={setProfile} /></CMSLayout> : <Navigate to="/login" />} />
        <Route path="/*" element={(user && profile) ? <CMSLayout><Dashboard user={user} profile={profile} planDetails={planDetails} onUpdateProfile={updateProfileSettings} currentTheme={currentTheme} systemConfig={systemConfig} /></CMSLayout> : <LandingPage />} />
      </Routes>
    </Suspense>
  );
}
