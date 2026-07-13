sed -i 's/import { useState, useEffect, useMemo, useRef } from "react";/import { useState, useEffect, useMemo, useRef, lazy, Suspense } from "react";/g' src/App.tsx

# Delete original imports
sed -i '/import { MonthView, WeekView, BoardView, TimelineView, TableView } from ".\/Views";/d' src/App.tsx
sed -i '/import { AnalyticsView } from ".\/AnalyticsView";/d' src/App.tsx
sed -i '/import { SocialStudioView } from ".\/SocialStudioView";/d' src/App.tsx
sed -i '/import { SocHubView } from ".\/SocHubView";/d' src/App.tsx
sed -i '/import { AdminPanel } from ".\/AdminPanel";/d' src/App.tsx
sed -i '/import { AuthScreen } from ".\/AuthScreen";/d' src/App.tsx
sed -i '/import AuthActionScreen from ".\/AuthActionScreen";/d' src/App.tsx
sed -i '/import { UserProfile } from ".\/UserProfile";/d' src/App.tsx
sed -i '/import { BillingView } from ".\/BillingView";/d' src/App.tsx
sed -i '/import { DashboardView } from ".\/DashboardView";/d' src/App.tsx
sed -i '/import { LandingPage } from ".\/LandingPage";/d' src/App.tsx

# Add lazy imports below Sidebar
sed -i '/import { Header, NavBar, FilterBar, Sidebar } from ".\/Nav";/a \
const MonthView = lazy(() => import("./Views").then(m => ({ default: m.MonthView })));\
const BoardView = lazy(() => import("./Views").then(m => ({ default: m.BoardView })));\
const TimelineView = lazy(() => import("./Views").then(m => ({ default: m.TimelineView })));\
const TableView = lazy(() => import("./Views").then(m => ({ default: m.TableView })));\
const AnalyticsView = lazy(() => import("./AnalyticsView").then(m => ({ default: m.AnalyticsView })));\
const SocialStudioView = lazy(() => import("./SocialStudioView").then(m => ({ default: m.SocialStudioView })));\
const SocHubView = lazy(() => import("./SocHubView").then(m => ({ default: m.SocHubView })));\
const AdminPanel = lazy(() => import("./AdminPanel").then(m => ({ default: m.AdminPanel })));\
const AuthScreen = lazy(() => import("./AuthScreen").then(m => ({ default: m.AuthScreen })));\
const AuthActionScreen = lazy(() => import("./AuthActionScreen"));\
const UserProfile = lazy(() => import("./UserProfile").then(m => ({ default: m.UserProfile })));\
const BillingView = lazy(() => import("./BillingView").then(m => ({ default: m.BillingView })));\
const DashboardView = lazy(() => import("./DashboardView").then(m => ({ default: m.DashboardView })));\
const LandingPage = lazy(() => import("./LandingPage").then(m => ({ default: m.LandingPage })));' src/App.tsx

