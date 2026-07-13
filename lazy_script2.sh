sed -i '/import { PricingPage } from ".\/PricingPage";/d' src/App.tsx
sed -i '/import { OrderSummary } from ".\/OrderSummary";/d' src/App.tsx
sed -i '/import { DataDeletionStatus } from ".\/DataDeletionStatus";/d' src/App.tsx
sed -i '/import { PublicBriefView } from ".\/PublicBriefView";/d' src/App.tsx
sed -i '/import { TermsOfService, PrivacyPolicy, FAQ, Guides, AboutUs, RefundPolicy } from ".\/TermsAndPrivacy";/d' src/App.tsx

sed -i '/const LandingPage =/a \
const PricingPage = lazy(() => import("./PricingPage").then(m => ({ default: m.PricingPage })));\
const OrderSummary = lazy(() => import("./OrderSummary").then(m => ({ default: m.OrderSummary })));\
const DataDeletionStatus = lazy(() => import("./DataDeletionStatus").then(m => ({ default: m.DataDeletionStatus })));\
const PublicBriefView = lazy(() => import("./PublicBriefView").then(m => ({ default: m.PublicBriefView })));\
const TermsOfService = lazy(() => import("./TermsAndPrivacy").then(m => ({ default: m.TermsOfService })));\
const PrivacyPolicy = lazy(() => import("./TermsAndPrivacy").then(m => ({ default: m.PrivacyPolicy })));\
const FAQ = lazy(() => import("./TermsAndPrivacy").then(m => ({ default: m.FAQ })));\
const Guides = lazy(() => import("./TermsAndPrivacy").then(m => ({ default: m.Guides })));\
const AboutUs = lazy(() => import("./TermsAndPrivacy").then(m => ({ default: m.AboutUs })));\
const RefundPolicy = lazy(() => import("./TermsAndPrivacy").then(m => ({ default: m.RefundPolicy })));' src/App.tsx
