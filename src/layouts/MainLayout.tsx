import { LoadingScreen } from "../LoadingScreen";
import { useI18n } from "../i18n";
import { useState, useEffect, useMemo, useRef, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { 
  MONTHS, YEARS, DP, DPL, DPIC, DST, DCT, DH, 
  gid, eng, fmtD, fmtT, emptyItem, makeSeed, 
  I, B, CARD, THEMES, htmlToPlainText
} from "../data";

import { 
  auth, db, onAuthStateChanged, signOut,
  doc, setDoc, getDoc, collection, collectionGroup, query, onSnapshot, deleteDoc, writeBatch, updateDoc,
  handleFirestoreError, testFirestoreConnection, where, getDocs, documentId, increment, orderBy, limit, serverTimestamp
} from "../firebase";

import { AppRoutes } from "../AppRoutes";
import { useAuth } from "../contexts/AuthContext";
import { Header, NavBar, FilterBar, Sidebar, BottomBar } from "../Nav";
import { HubyTutorial } from "../components/HubyTutorial";
import { usePlanLimits } from "../hooks/usePlanLimits";

const QuickAddEventModal = lazy(() => import("../QuickAddEventModal").then(m => ({ default: m.QuickAddEventModal }))) as React.ComponentType<any>;
const ContentModal = lazy(() => import("../ContentModal").then(m => ({ default: m.ContentModal }))) as React.ComponentType<any>;
const CsvModal = lazy(() => import("../CsvModal").then(m => ({ default: m.CsvModal }))) as React.ComponentType<any>;
const ShareWorkspaceModal = lazy(() => import("../ShareWorkspaceModal").then(m => ({ default: m.ShareWorkspaceModal }))) as React.ComponentType<any>;
const CreateWorkspaceModal = lazy(() => import("../CreateWorkspaceModal").then(m => ({ default: m.CreateWorkspaceModal }))) as React.ComponentType<any>;
const MonthView = lazy(() => import("../Views").then(m => ({ default: m.MonthView }))) as React.ComponentType<any>;
const BoardView = lazy(() => import("../Views").then(m => ({ default: m.BoardView }))) as React.ComponentType<any>;
const TimelineView = lazy(() => import("../Views").then(m => ({ default: m.TimelineView }))) as React.ComponentType<any>;
const TableView = lazy(() => import("../Views").then(m => ({ default: m.TableView }))) as React.ComponentType<any>;
const AnalyticsView = lazy(() => import("../AnalyticsView").then(m => ({ default: m.AnalyticsView }))) as React.ComponentType<any>;
const SocialStudioView = lazy(() => import("../SocialStudioView").then(m => ({ default: m.SocialStudioView }))) as React.ComponentType<any>;
const SocHubView = lazy(() => import("../SocHubView").then(m => ({ default: m.SocHubView }))) as React.ComponentType<any>;
const AdminPanel = lazy(() => import("../AdminPanel").then(m => ({ default: m.AdminPanel }))) as React.ComponentType<any>;
const AuthScreen = lazy(() => import("../AuthScreen").then(m => ({ default: m.AuthScreen }))) as React.ComponentType<any>;
const AuthActionScreen = lazy(() => import("../AuthActionScreen"));
const UserProfile = lazy(() => import("../UserProfile").then(m => ({ default: m.UserProfile }))) as React.ComponentType<any>;
const BillingView = lazy(() => import("../BillingView").then(m => ({ default: m.BillingView }))) as React.ComponentType<any>;
const DashboardView = lazy(() => import("../DashboardView").then(m => ({ default: m.DashboardView }))) as React.ComponentType<any>;
const LandingPage = lazy(() => import("../LandingPage").then(m => ({ default: m.LandingPage }))) as React.ComponentType<any>;
const PricingPage = lazy(() => import("../PricingPage").then(m => ({ default: m.PricingPage }))) as React.ComponentType<any>;
const OrderSummary = lazy(() => import("../OrderSummary").then(m => ({ default: m.OrderSummary }))) as React.ComponentType<any>;
const DataDeletionStatus = lazy(() => import("../DataDeletionStatus").then(m => ({ default: m.DataDeletionStatus }))) as React.ComponentType<any>;
const PublicBriefView = lazy(() => import("../PublicBriefView").then(m => ({ default: m.PublicBriefView }))) as React.ComponentType<any>;
const TermsOfService = lazy(() => import("../TermsAndPrivacy").then(m => ({ default: m.TermsOfService }))) as React.ComponentType<any>;
const PrivacyPolicy = lazy(() => import("../TermsAndPrivacy").then(m => ({ default: m.PrivacyPolicy }))) as React.ComponentType<any>;
const FAQ = lazy(() => import("../TermsAndPrivacy").then(m => ({ default: m.FAQ }))) as React.ComponentType<any>;
const Guides = lazy(() => import("../TermsAndPrivacy").then(m => ({ default: m.Guides }))) as React.ComponentType<any>;
const AboutUs = lazy(() => import("../TermsAndPrivacy").then(m => ({ default: m.AboutUs }))) as React.ComponentType<any>;
const RefundPolicy = lazy(() => import("../TermsAndPrivacy").then(m => ({ default: m.RefundPolicy }))) as React.ComponentType<any>;
import { SettingsPanel, HOLIDAY_API_OPTIONS } from "../SettingsPanel";
import { ColorPickerSelect } from "../components/ColorPickerSelect";


import { motion, AnimatePresence } from "motion/react";

import { Calendar, Download, X, CheckCircle2, AlertTriangle, Trash2, Loader2, Megaphone } from "lucide-react";

export function cleanAndFormatHolidayText(text: string): string {
  if (!text) return "";
  
  // 1. Remove all emojis/icons.
  let cleaned = text.replace(/[\u2704-\u27C0]|[\u2794-\u27C5]|[\u2A00-\u2AFF]|[\u2600-\u26FF]|[\u2700-\u27BF]|[\uD83C-\uD83E][\uDC00-\uDFFF]|[\u2000-\u32FF]|[\uE000-\uF8FF]|[\uFE00-\uFE0F]/gu, "");
  
  // Clean additional common holiday emojis explicitly
  cleaned = cleaned.replace(/[❇🕌🏮🕉✝☸🇮🇩🎄🛠⚓📚🍎🕯🎗📰👩‍🔬📻⚖🗣🦊♀🎵🛍😊🌲💧☁🧬🎬🧩🩺🎖🩸👩‍💼🌍📖🦟🗝🎓❌✊🌱🚫👮🏦👥🤝👶🚀🧑‍🎤📜🕊💖📝🏅🗳☀️🚒☮🚜✈🚆👵☕👕🐾🪖✉🧠🏛🍕🇺🇳💵🏙🔬👨‍🏫🌳♿🛑🛡]/gu, "");

  // 2. Adjust Capitalization - Ensure no ALL CAPS words or phrases (jangan di capital semuanya)
  const lettersOnly = cleaned.replace(/[^a-zA-Z]/g, "");
  if (lettersOnly.length > 0 && lettersOnly === lettersOnly.toUpperCase()) {
    cleaned = cleaned.toLowerCase();
  }

  // Segment into words to fix casing nicely
  const words = cleaned.split(/\s+/);
  const formattedWords = words.map((word) => {
    // Keep known uppercase acronyms
    const cleanWord = word.replace(/[^a-zA-Z]/g, "");
    const upperClean = cleanWord.toUpperCase();
    
    const acronyms = ["RI", "TNI", "POLRI", "KOPASSUS", "PGRI", "HPN", "HBN", "HAM", "PBB", "RRI", "SKB", "HARKITNAS", "HARDIKNAS", "US", "UK", "SG", "JP", "MY", "GB", "ID"];
    if (acronyms.includes(upperClean)) {
      return word.toUpperCase();
    }
    
    if (word.length > 0) {
      const lower = word.toLowerCase();
      // Handle words starting with bracket, e.g., "(kartini" -> "(Kartini"
      if (lower.startsWith("(")) {
        if (lower.length > 1) {
          return "(" + lower.charAt(1).toUpperCase() + lower.slice(2);
        }
      }
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    }
    return word;
  });

  cleaned = formattedWords.join(" ");

  // 3. Remove any decorative or invalid leading symbols (such as leftovers of emojis or hyphens)
  cleaned = cleaned.trim();
  cleaned = cleaned.replace(/^[^a-zA-Z0-9\(\'\"]+/g, "");
  cleaned = cleaned.replace(/\s+/g, " ");

  return cleaned.trim();
}

const INDONESIA_STATIC_SKB_HOLIDAYS: Record<string, string> = {
  // ─── 2024 ──────────────────────────────────────────────
  "2024-1-1": "Tahun Baru Masehi",
  "2024-2-8": "Isra Mikraj Nabi Muhammad SAW",
  "2024-2-9": "Cuti Bersama Tahun Baru Imlek",
  "2024-2-10": "Tahun Baru Imlek",
  "2024-3-11": "Hari Suci Nyepi (Tahun Baru Saka 1946)",
  "2024-3-12": "Cuti Bersama Hari Suci Nyepi",
  "2024-3-29": "Wafat Yesus Kristus",
  "2024-3-31": "Hari Paskah",
  "2024-4-8": "Cuti Bersama Idul Fitri 1445 H",
  "2024-4-9": "Cuti Bersama Idul Fitri 1445 H",
  "2024-4-10": "Hari Raya Idul Fitri 1445 H",
  "2024-4-11": "Hari Raya Idul Fitri 1445 H",
  "2024-4-12": "Cuti Bersama Idul Fitri 1445 H",
  "2024-4-15": "Cuti Bersama Idul Fitri 1445 H",
  "2024-5-1": "Hari Buruh Internasional",
  "2024-5-9": "Kenaikan Yesus Kristus",
  "2024-5-10": "Cuti Bersama Kenaikan Yesus Kristus",
  "2024-5-23": "Hari Raya Waisak 2568 BE",
  "2024-5-24": "Cuti Bersama Hari Raya Waisak",
  "2024-6-1": "Hari Lahir Pancasila",
  "2024-6-17": "Hari Raya Idul Adha 1445 H",
  "2024-6-18": "Cuti Bersama Idul Adha 1445 H",
  "2024-7-7": "Tahun Baru Islam 1446 H",
  "2024-8-17": "Hari Kemerdekaan RI",
  "2024-9-16": "Maulid Nabi Muhammad SAW",
  "2024-12-25": "Hari Raya Natal",
  "2024-12-26": "Cuti Bersama Hari Raya Natal",

  // ─── 2025 ──────────────────────────────────────────────
  "2025-1-1": "Tahun Baru 2025 Masehi",
  "2025-1-27": "Isra Mikraj Nabi Muhammad SAW",
  "2025-1-28": "Cuti Bersama Tahun Baru Imlek",
  "2025-1-29": "Tahun Baru Imlek 2576 Kongzili",
  "2025-3-28": "Cuti Bersama Hari Suci Nyepi",
  "2025-3-29": "Hari Suci Nyepi (Tahun Baru Saka 1947)",
  "2025-3-31": "Hari Raya Idul Fitri 1446 H",
  "2025-4-1": "Hari Raya Idul Fitri 1446 H",
  "2025-4-2": "Cuti Bersama Idul Fitri 1446 H",
  "2025-4-3": "Cuti Bersama Idul Fitri 1446 H",
  "2025-4-4": "Cuti Bersama Idul Fitri 1446 H",
  "2025-4-7": "Cuti Bersama Idul Fitri 1446 H",
  "2025-4-18": "Wafat Yesus Kristus",
  "2025-4-20": "Kebangkitan Yesus Kristus (Paskah)",
  "2025-5-1": "Hari Buruh Internasional",
  "2025-5-12": "Hari Raya Waisak 2569 BE",
  "2025-5-13": "Cuti Bersama Hari Raya Waisak",
  "2025-5-29": "Kenaikan Yesus Kristus",
  "2025-5-30": "Cuti Bersama Kenaikan Yesus Kristus",
  "2025-6-1": "Hari Lahir Pancasila",
  "2025-6-6": "Hari Raya Idul Adha 1446 H",
  "2025-6-9": "Cuti Bersama Idul Adha 1446 H",
  "2025-6-27": "Tahun Baru Islam 1447 H",
  "2025-8-17": "Hari Kemerdekaan RI",
  "2025-9-5": "Maulid Nabi Muhammad SAW",
  "2025-12-25": "Hari Raya Natal",
  "2025-12-26": "Cuti Bersama Hari Raya Natal",

  // ─── 2026 ──────────────────────────────────────────────
  "2026-1-1": "Tahun Baru 2026 Masehi",
  "2026-1-15": "Isra Mikraj Nabi Muhammad SAW",
  "2026-2-17": "Tahun Baru Imlek 2577 Kongzili",
  "2026-2-18": "Cuti Bersama Tahun Baru Imlek",
  "2026-3-18": "Cuti Bersama Hari Suci Nyepi",
  "2026-3-19": "Hari Suci Nyepi (Tahun Baru Saka 1948)",
  "2026-3-20": "Hari Raya Idul Fitri 1447 H",
  "2026-3-21": "Hari Raya Idul Fitri 1447 H",
  "2026-3-23": "Cuti Bersama Idul Fitri 1447 H",
  "2026-3-24": "Cuti Bersama Idul Fitri 1447 H",
  "2026-3-25": "Cuti Bersama Idul Fitri 1447 H",
  "2026-3-26": "Cuti Bersama Idul Fitri 1447 H",
  "2026-4-3": "Wafat Yesus Kristus",
  "2026-4-5": "Kebangkitan Yesus Kristus (Paskah)",
  "2026-5-1": "Hari Buruh Internasional",
  "2026-5-14": "Kenaikan Yesus Kristus",
  "2026-5-15": "Cuti Bersama Kenaikan Yesus Kristus",
  "2026-5-27": "Hari Raya Idul Adha 1447 H",
  "2026-5-28": "Cuti Bersama Idul Adha 1447 H",
  "2026-5-31": "Hari Raya Waisak 2570 BE",
  "2026-6-1": "Hari Lahir Pancasila",
  "2026-6-2": "Cuti Bersama Hari Raya Waisak",
  "2026-6-16": "Tahun Baru Islam 1448 H",
  "2026-8-17": "Hari Kemerdekaan RI",
  "2026-8-25": "Maulid Nabi Muhammad SAW",
  "2026-12-25": "Hari Raya Natal",
  "2026-12-26": "Cuti Bersama Hari Raya Natal",

  // ─── 2027 ──────────────────────────────────────────────
  "2027-1-1": "Tahun Baru 2027 Masehi",
  "2027-1-5": "Isra Mikraj Nabi Muhammad SAW",
  "2027-2-6": "Tahun Baru Imlek 2578 Kongzili",
  "2027-2-8": "Cuti Bersama Tahun Baru Imlek",
  "2027-3-8": "Hari Suci Nyepi (Tahun Baru Saka 1949)",
  "2027-3-9": "Cuti Bersama Hari Suci Nyepi",
  "2027-3-10": "Hari Raya Idul Fitri 1448 H",
  "2027-3-11": "Hari Raya Idul Fitri 1448 H",
  "2027-3-12": "Cuti Bersama Idul Fitri 1448 H",
  "2027-3-15": "Cuti Bersama Idul Fitri 1448 H",
  "2027-3-16": "Cuti Bersama Idul Fitri 1448 H",
  "2027-3-26": "Wafat Yesus Kristus",
  "2027-3-28": "Kebangkitan Yesus Kristus (Paskah)",
  "2027-5-1": "Hari Buruh Internasional",
  "2027-5-6": "Kenaikan Yesus Kristus",
  "2027-5-7": "Cuti Bersama Kenaikan Yesus Kristus",
  "2027-5-16": "Hari Raya Idul Adha 1448 H",
  "2027-5-17": "Cuti Bersama Idul Adha 1448 H",
  "2027-5-20": "Hari Raya Waisak 2571 BE",
  "2027-5-21": "Cuti Bersama Hari Raya Waisak",
  "2027-6-1": "Hari Lahir Pancasila",
  "2027-6-6": "Tahun Baru Islam 1449 H",
  "2027-8-17": "Hari Kemerdekaan RI",
  "2027-8-25": "Maulid Nabi Muhammad SAW",
  "2027-12-25": "Hari Raya Natal",
  "2027-12-24": "Cuti Bersama Hari Raya Natal"
};

const INDONESIA_OBSERVANCES = [
  { month: 1, day: 15, name: "Hari Peristiwa Laut dan Samudera (Nasional)" },
  { month: 1, day: 25, name: "Hari Gizi Nasional" },
  { month: 2, day: 9, name: "Hari Pers Nasional (HPN)" },
  { month: 2, day: 22, name: "Hari Istiqlal (Nasional)" },
  { month: 3, day: 1, name: "Hari Penegakan Kedaulatan Negara" },
  { month: 3, day: 9, name: "Hari Musik Nasional" },
  { month: 3, day: 30, name: "Hari Film Nasional" },
  { month: 4, day: 6, name: "Hari Nelayan Nasional" },
  { month: 4, day: 16, name: "Hari KOPASSUS" },
  { month: 4, day: 21, name: "Hari Kartini" },
  { month: 4, day: 27, name: "Hari Pemasyarakatan Indonesia" },
  { month: 5, day: 2, name: "Hari Pendidikan Nasional (Hardiknas)" },
  { month: 5, day: 17, name: "Hari Buku Nasional" },
  { month: 5, day: 20, name: "Hari Kebangkitan Nasional (Harkitnas)" },
  { month: 5, day: 21, name: "Hari Peringatan Reformasi (Nasional)" },
  { month: 6, day: 24, name: "Hari Bidan Nasional" },
  { month: 6, day: 29, name: "Hari Keluarga Nasional (Harganas)" },
  { month: 7, day: 1, name: "Hari Bhayangkara (POLRI)" },
  { month: 7, day: 5, name: "Hari Bank Indonesia" },
  { month: 7, day: 12, name: "Hari Koperasi Indonesia" },
  { month: 7, day: 22, name: "Hari Kejaksaan Nasional / Hari Bhakti Adhyaksa" },
  { month: 7, day: 23, name: "Hari Anak Nasional" },
  { month: 8, day: 10, name: "Hari Veteran Nasional & Kebangkitan Teknologi Nasional" },
  { month: 8, day: 18, name: "Hari Konstitusi Republik Indonesia" },
  { month: 9, day: 4, name: "Hari Pelanggan Nasional" },
  { month: 9, day: 9, name: "Hari Olahraga Nasional (Haornas)" },
  { month: 9, day: 11, name: "Hari Radio Republik Indonesia (RRI)" },
  { month: 9, day: 17, name: "Hari Perhubungan Nasional & Hari Palang Merah Indonesia" },
  { month: 9, day: 24, name: "Hari Tani Nasional" },
  { month: 9, day: 28, name: "Hari Kereta Api Nasional" },
  { month: 10, day: 2, name: "Hari Batik Nasional" },
  { month: 10, day: 5, name: "Hari TNI" },
  { month: 10, day: 12, name: "Hari Museum Nasional" },
  { month: 10, day: 22, name: "Hari Santri Nasional" },
  { month: 10, day: 24, name: "Hari Dokter Nasional" },
  { month: 10, day: 28, name: "Hari Sumpah Pemuda" },
  { month: 10, day: 30, name: "Hari Oeang Republik Indonesia" },
  { month: 11, day: 10, name: "Hari Pahlawan" },
  { month: 11, day: 12, name: "Hari Kesehatan Nasional & Hari Ayah Nasional" },
  { month: 11, day: 14, name: "Hari Korps Marinir & Brimob" },
  { month: 11, day: 25, name: "Hari Guru Nasional (PGRI)" },
  { month: 11, day: 28, name: "Hari Menanam Pohon Indonesia" },
  { month: 12, day: 13, name: "Hari Nusantara" },
  { month: 12, day: 19, name: "Hari Bela Negara (HBN)" },
  { month: 12, day: 22, name: "Hari Ibu" }
];

const INTERNATIONAL_OBSERVANCES = [
  { month: 1, day: 24, name: "International Day of Education (PBB)" },
  { month: 1, day: 27, name: "International Holocaust Remembrance Day" },
  { month: 2, day: 4, name: "World Cancer Day" },
  { month: 2, day: 11, name: "International Day of Women and Girls in Science" },
  { month: 2, day: 13, name: "World Radio Day" },
  { month: 2, day: 20, name: "World Day of Social Justice" },
  { month: 2, day: 21, name: "International Mother Language Day" },
  { month: 3, day: 3, name: "World Wildlife Day" },
  { month: 3, day: 8, name: "International Women's Day" },
  { month: 3, day: 15, name: "World Consumer Rights Day" },
  { month: 3, day: 20, name: "International Day of Happiness" },
  { month: 3, day: 21, name: "International Day of Forests / World Poetry Day" },
  { month: 3, day: 22, name: "World Water Day" },
  { month: 3, day: 23, name: "World Meteorological Day" },
  { month: 3, day: 24, name: "World Tuberculosis (TB) Day" },
  { month: 4, day: 2, name: "World Autism Awareness Day" },
  { month: 4, day: 7, name: "World Health Day / Hari Kesehatan Sedunia" },
  { month: 4, day: 17, name: "World Hemophilia Day" },
  { month: 4, day: 22, name: "Earth Day / Hari Bumi Internasional" },
  { month: 4, day: 23, name: "World Book and Copyright Day" },
  { month: 4, day: 25, name: "World Malaria Day" },
  { month: 5, day: 1, name: "Hari Buruh / May Day" },
  { month: 5, day: 3, name: "World Press Freedom Day" },
  { month: 5, day: 8, name: "World Red Cross and Red Crescent Day" },
  { month: 5, day: 15, name: "International Day of Families" },
  { month: 5, day: 22, name: "International Day for Biological Diversity / Hari Keanekaragaman Hayati" },
  { month: 5, day: 31, name: "World No Tobacco Day" },
  { month: 6, day: 1, name: "Global Day of Parents" },
  { month: 6, day: 3, name: "World Bicycle Day" },
  { month: 6, day: 5, name: "World Environment Day" },
  { month: 6, day: 8, name: "World Oceans Day" },
  { month: 6, day: 12, name: "World Day Against Child Labour" },
  { month: 6, day: 14, name: "World Blood Donor Day" },
  { month: 6, day: 21, name: "International Day of Yoga / World Music Day" },
  { month: 7, day: 11, name: "World Population Day" },
  { month: 7, day: 30, name: "International Day of Friendship" },
  { month: 8, day: 12, name: "International Youth Day" },
  { month: 8, day: 19, name: "World Humanitarian Day" },
  { month: 9, day: 5, name: "International Day of Charity" },
  { month: 9, day: 8, name: "International Literacy Day" },
  { month: 9, day: 15, name: "International Day of Democracy" },
  { month: 9, day: 16, name: "International Day for the Preservation of the Ozone Layer" },
  { month: 9, day: 21, name: "International Day of Peace" },
  { month: 9, day: 27, name: "World Tourism Day" },
  { month: 10, day: 1, name: "Older Persons Day / International Coffee Day" },
  { month: 10, day: 2, name: "Hari Batik Nasional" },
  { month: 10, day: 4, name: "World Animal Day" },
  { month: 10, day: 5, name: "World Teachers' Day" },
  { month: 10, day: 9, name: "World Post Day" },
  { month: 10, day: 10, name: "World Mental Health Day" },
  { month: 10, day: 11, name: "International Day of the Girl Child" },
  { month: 10, day: 16, name: "World Food Day" },
  { month: 10, day: 24, name: "United Nations Day" },
  { month: 10, day: 31, name: "World Cities Day" },
  { month: 11, day: 10, name: "World Science Day" },
  { month: 11, day: 14, name: "World Diabetes Day" },
  { month: 11, day: 16, name: "International Day for Tolerance" },
  { month: 11, day: 19, name: "International Men's Day / World Toilet Day" },
  { month: 11, day: 20, name: "World Children's Day" },
  { month: 11, day: 21, name: "World Television Day" },
  { month: 12, day: 1, name: "World AIDS Day" },
  { month: 12, day: 3, name: "International Day of Persons with Disabilities" },
  { month: 12, day: 5, name: "World Soil Day / International Volunteer Day" },
  { month: 12, day: 9, name: "International Anti-Corruption Day" },
  { month: 12, day: 10, name: "Human Rights Day / Hari HAM Sedunia" },
  { month: 12, day: 11, name: "International Mountain Day" }
];


export function Dashboard({ user, profile, planDetails, onUpdateProfile, currentTheme, systemConfig }: any) {
  const { lang } = useI18n();
  const [tab, setTab]           = useState("dashboard");
  const [contentTab, setContentTab] = useState("month");
  const [workspace, setWorkspace] = useState<any>(null);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [createWsModal, setCreateWsModal] = useState(false);
  const [content, setContent]   = useState<any[]>([]);
  const [cachedContent, setCachedContent] = useState<Record<string, any[]>>({});
  const [wsLoading, setWsLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const [year, setYear]         = useState(new Date().getFullYear());
  const [month, setMonth]       = useState(new Date().getMonth() + 1);
  const [modal, setModal]       = useState<any>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent]     = useState<any>(null);
  const [saveMsg, setSaveMsg]   = useState("");
  const [search, setSearch]     = useState("");
  const [confirmAction, setConfirmAction] = useState<{title:string, msg:string, onConfirm:()=>void}|null>(null);
  const [shareModal, setShareModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tutorialActive, setTutorialActive] = useState(false);
  const [isSettingsDirty, setIsSettingsDirty] = useState(false);
  const [pendingTab, setPendingTab] = useState<string | null>(null);
  const workspaceRef = useRef(workspace);

  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    if (systemConfig?.bannerMessage) {
      const dismissed = localStorage.getItem("dismissed_banner_message");
      if (dismissed === systemConfig.bannerMessage) {
        setBannerDismissed(true);
      } else {
        setBannerDismissed(false);
      }
    }
  }, [systemConfig?.bannerMessage]);

  const handleDismissBanner = () => {
    if (systemConfig?.bannerMessage) {
      localStorage.setItem("dismissed_banner_message", systemConfig.bannerMessage);
    }
    setBannerDismissed(true);
  };

  const [broadcastBanner, setBroadcastBanner] = useState<any | null>(null);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [activeBroadcast, setActiveBroadcast] = useState<any | null>(null);

  useEffect(() => {
    if (!profile) return;
    const isTrial = profile?.plan === "trial";
    const activeUntil = profile?.activeUntil ? new Date(profile.activeUntil) : new Date(0);
    const isExpired = new Date() > activeUntil;

    const notifRef = collection(db, "global_notifications");
    const unsub = onSnapshot(notifRef, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() as any }));
      docs.sort((a, b) => {
        const timeA = typeof a.createdAt === 'number' ? a.createdAt : new Date(a.createdAt || 0).getTime();
        const timeB = typeof b.createdAt === 'number' ? b.createdAt : new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });
      const dismissedIds = JSON.parse(localStorage.getItem(`dismissedBroadcasts_${profile?.uid}`) || "[]");

      // Find the latest applicable notification that has not been dismissed
      const latestNotDismissed = docs.find((n: any) => {
        if (n.active === false) return false;
        
        const dismissKey = n.id + (n.updatedAt ? `_${n.updatedAt}` : "");
        if (dismissedIds.includes(dismissKey)) return false;
        
        let isMatch = false;
        if (Array.isArray(n.target)) {
          if (n.target.includes("all")) isMatch = true;
          if (n.target.includes("pro") && !isExpired && !isTrial) isMatch = true;
          if (n.target.includes("expired") && isExpired) isMatch = true;
          if (n.target.some((t: string) => t.startsWith("plan:") && profile?.plan === t.replace("plan:", ""))) isMatch = true;
        } else {
          if (n.target === "all") isMatch = true;
          if (n.target === "pro" && !isExpired && !isTrial) isMatch = true;
          if (n.target === "expired" && isExpired) isMatch = true;
          if (n.target?.startsWith("plan:")) {
            const targetPlan = n.target.replace("plan:", "");
            if (profile?.plan === targetPlan) isMatch = true;
          }
        }
        if (!isMatch) return false;
        return true;
      });

      setBroadcastBanner(latestNotDismissed || null);
    }, (err) => {
      console.warn("Error listening to global_notifications for banner:", err);
    });

    return () => unsub();
  }, [profile]);

  const handleDismissBroadcast = (banner: any) => {
    if (!profile || !banner) return;
    const dismissKey = banner.id + (banner.updatedAt ? `_${banner.updatedAt}` : "");
    const dismissedIds = JSON.parse(localStorage.getItem(`dismissedBroadcasts_${profile?.uid}`) || "[]");
    if (!dismissedIds.includes(dismissKey)) {
      localStorage.setItem(`dismissedBroadcasts_${profile?.uid}`, JSON.stringify([...dismissedIds, dismissKey]));
    }
    setBroadcastBanner(null);
  };

  const getBroadcastStyles = (banner: any) => {
    if (!banner) return {
      bg: "linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)",
      color: "#FFFFFF",
      linkColor: "rgba(255,255,255,0.85)",
      badgeBg: "rgba(255,255,255,0.2)",
      badgeText: "#FFFFFF",
      iconBg: "rgba(59, 130, 246, 0.1)",
      iconColor: "#3B82F6",
      btnBg: "var(--theme-primary)",
      badgeLabel: lang === "id" ? "Info Penting" : "Announcement"
    };

    let bg = "linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)";
    let color = "#FFFFFF";
    let linkColor = "rgba(255,255,255,0.85)";
    let badgeBg = "rgba(255,255,255,0.2)";
    let badgeText = "#FFFFFF";
    let iconBg = "rgba(59, 130, 246, 0.1)";
    let iconColor = "#3B82F6";
    let btnBg = "var(--theme-primary)";
    let badgeLabel = lang === "id" ? "Info Penting" : "Announcement";

    const type = banner.colorType || "info";

    if (type === "urgent") {
      bg = "linear-gradient(135deg, #9C2B4E 0%, #D32F2F 100%)";
      badgeLabel = lang === "id" ? "Sangat Urgent" : "Urgent";
      iconColor = "#D32F2F";
      iconBg = "rgba(211, 47, 47, 0.1)";
      btnBg = "#D32F2F";
    } else if (type === "alert") {
      bg = "linear-gradient(135deg, #D97706 0%, #F59E0B 100%)";
      badgeLabel = lang === "id" ? "Peringatan" : "Alert";
      iconColor = "#D97706";
      iconBg = "rgba(217, 119, 6, 0.1)";
      btnBg = "#D97706";
    } else if (type === "success") {
      bg = "linear-gradient(135deg, #065F46 0%, #10B981 100%)";
      badgeLabel = lang === "id" ? "Promo/Sukses" : "Promo/Success";
      iconColor = "#10B981";
      iconBg = "rgba(16, 185, 129, 0.1)";
      btnBg = "#10B981";
    } else if (type === "custom") {
      const start = banner.colorBgStart || "#3B82F6";
      const end = banner.colorBgEnd || "#1E3A8A";
      bg = `linear-gradient(135deg, ${start} 0%, ${end} 100%)`;
      color = banner.colorTextColor || "#FFFFFF";
      linkColor = banner.colorTextColor ? `${banner.colorTextColor}D0` : "rgba(255,255,255,0.85)";
      badgeBg = banner.colorTextColor ? `${banner.colorTextColor}20` : "rgba(255,255,255,0.2)";
      badgeText = banner.colorTextColor || "#FFFFFF";
      iconColor = banner.colorBgStart || "#3B82F6";
      iconBg = `${banner.colorBgStart || "#3B82F6"}15`;
      btnBg = banner.colorBgStart || "var(--theme-primary)";
      badgeLabel = lang === "id" ? "Pengumuman" : "Announcement";
    }

    return { bg, color, linkColor, badgeBg, badgeText, iconBg, iconColor, btnBg, badgeLabel };
  };

  useEffect(() => {
    workspaceRef.current = workspace;
  }, [workspace]);

  const [showHolidays, setShowHolidays] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [filters, setFilters]   = useState({pillar:["All"],platform:["All"],contentType:["All"],pic:["All"],status:"All"});
  const [title, setTitle]       = useState(workspace?.name || "Workspace");
  const [tagline, setTagline]   = useState(workspace?.name ? `${workspace.name} Workspace` : "");
  const [headerImage, setHeaderImage] = useState<string|null>(null);
  const [headerStyle, setHeaderStyle] = useState({
    titleColor: "#3B82F6", taglineColor: "#FAF7F2", subtitleColor: "rgba(250,247,242,0.8)",
    bgColor: "#2C2016", titleFont: "inherit", taglineFont: "inherit", subtitleFont: "inherit"
  });
  const [qYear, setQYear]       = useState(new Date().getFullYear());
  const [qNumber, setQNumber]   = useState(Math.ceil((new Date().getMonth() + 1) / 3));
  const [showCsv, setShowCsv]   = useState(false);

  const [pillars, setPillars]   = useState(DP);
  const [platforms, setPlatforms] = useState(DPL);
  const [contentTypes, setContentTypes] = useState(DCT);
  const [pics, setPics]         = useState(DPIC);
  const [statuses, setStatuses] = useState(DST);
  const [holidays, setHolidays] = useState(DH);
  const [holidayApis, setHolidayApis] = useState<string[]>([]);
  const [apiHolidays, setApiHolidays] = useState<Record<string, string>>({});
  const [loadingHolidayApis, setLoadingHolidayApis] = useState(false);

  const isSuperAdmin =
    profile?.role === "admin" ||
    profile?.email?.toLowerCase() === "nalendraputra71@gmail.com" ||
    user?.email?.toLowerCase() === "nalendraputra71@gmail.com";

  useEffect(() => {
    if (isSuperAdmin) return;
    if (tab === "content_planner" && systemConfig?.features?.contentPlanner === false) setTab("dashboard");
    if (tab === "social-hub-ai" && systemConfig?.features?.hubai === false) setTab("dashboard");
    if (tab === "soc_hub" && systemConfig?.features?.sochub === false) setTab("dashboard");
    if (tab.startsWith("social-") && tab !== "social-hub-ai" && systemConfig?.features?.socialStudio === false) setTab("dashboard");
  }, [tab, systemConfig?.features, isSuperAdmin]);

  useEffect(() => {
    const handler = () => openAdd(new Date().getDate());
    const closeHandler = () => setModal(null);
    window.addEventListener("openContentModal", handler);
    window.addEventListener("closeContentModal", closeHandler);
    return () => {
      window.removeEventListener("openContentModal", handler);
      window.removeEventListener("closeContentModal", closeHandler);
    };
  }, [workspace, user, pillars, platforms, pics, statuses]);

  useEffect(() => {
    if (!workspace || !holidayApis || holidayApis.length === 0) {
      setApiHolidays({});
      return;
    }

    let isMounted = true;
    const fetchAll = async () => {
      setLoadingHolidayApis(true);
      const tempHolidays: Record<string, string> = {};

      try {
        const fetchPromises = holidayApis.map(async (apiId) => {
          const opt = HOLIDAY_API_OPTIONS.find(o => o.id === apiId);
          if (!opt) return;

          try {
            if (opt.id === "id-id-observances") {
              INDONESIA_OBSERVANCES.forEach((obs) => {
                const formattedKey = `${year}-${obs.month}-${obs.day}`;
                if (tempHolidays[formattedKey]) {
                  if (!tempHolidays[formattedKey].includes(obs.name)) {
                    tempHolidays[formattedKey] += ` & ${obs.name}`;
                  }
                } else {
                  tempHolidays[formattedKey] = obs.name;
                }
              });
            } else if (opt.id === "id-int-observances") {
              INTERNATIONAL_OBSERVANCES.forEach((obs) => {
                const formattedKey = `${year}-${obs.month}-${obs.day}`;
                if (tempHolidays[formattedKey]) {
                  if (!tempHolidays[formattedKey].includes(obs.name)) {
                    tempHolidays[formattedKey] += ` & ${obs.name}`;
                  }
                } else {
                  tempHolidays[formattedKey] = obs.name;
                }
              });
            } else if (opt.id === "id-skb") {
              // Load bulletproof static list under the selected year
              Object.entries(INDONESIA_STATIC_SKB_HOLIDAYS).forEach(([key, nameStr]) => {
                if (key.startsWith(`${year}-`)) {
                  tempHolidays[key] = nameStr;
                }
              });

              let fetched = false;
              // 1. Try fe-hari-libur-api.vercel.app/api
              try {
                const response = await fetch(`https://fe-hari-libur-api.vercel.app/api?year=${year}`);
                if (response.ok) {
                  const data = await response.json();
                  if (Array.isArray(data)) {
                    data.forEach((item: any) => {
                      const dateStr = item.holiday_date || item.date;
                      const nameStr = item.holiday_name || item.name;
                      if (dateStr && nameStr) {
                        const parts = dateStr.split("-");
                        if (parts.length === 3) {
                          const y = parts[0];
                          const m = parseInt(parts[1], 10);
                          const d = parseInt(parts[2], 10);
                          const formattedKey = `${y}-${m}-${d}`;
                          
                          if (tempHolidays[formattedKey]) {
                            if (!tempHolidays[formattedKey].includes(nameStr)) {
                              tempHolidays[formattedKey] += `, ${nameStr}`;
                            }
                          } else {
                            tempHolidays[formattedKey] = nameStr;
                          }
                        }
                      }
                    });
                    fetched = true;
                  }
                }
              } catch (err) {
                console.log("Catatan: fe-hari-libur-api dialihkan otomatis ke database lokal SKB.");
              }

              // 2. Try dayoffapi.vercel.app fallback if first failed
              if (!fetched) {
                try {
                  const response = await fetch(`https://dayoffapi.vercel.app/api/v1/holidays?year=${year}`);
                  if (response.ok) {
                     const resData = await response.json();
                     const data = resData.data || resData;
                     if (Array.isArray(data)) {
                       data.forEach((item: any) => {
                         const dateStr = item.date || item.holiday_date;
                         const nameStr = item.name || item.holiday_name;
                         if (dateStr && nameStr) {
                           const parts = dateStr.split("-");
                           if (parts.length === 3) {
                             const y = parts[0];
                             const m = parseInt(parts[1], 10);
                             const d = parseInt(parts[2], 10);
                             const formattedKey = `${y}-${m}-${d}`;
                             
                             if (tempHolidays[formattedKey]) {
                               if (!tempHolidays[formattedKey].includes(nameStr)) {
                                 tempHolidays[formattedKey] += `, ${nameStr}`;
                               }
                             } else {
                               tempHolidays[formattedKey] = nameStr;
                             }
                           }
                         }
                       });
                     }
                  }
                } catch (err) {
                  console.log("Catatan: dayoffapi dialihkan otomatis ke database lokal SKB.");
                }
              }
            } else {
              // Standard Nager.Date API
              try {
                const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${opt.country}`);
                if (response.ok) {
                  const data = await response.json();
                  if (Array.isArray(data)) {
                    data.forEach((item: any) => {
                      if (item.date) {
                        const parts = item.date.split("-");
                        if (parts.length === 3) {
                          const y = parts[0];
                          const m = parseInt(parts[1], 10);
                          const d = parseInt(parts[2], 10);
                          const formattedKey = `${y}-${m}-${d}`;
                          
                          const name = item.localName || item.name;
                          if (tempHolidays[formattedKey]) {
                            if (!tempHolidays[formattedKey].includes(name)) {
                              tempHolidays[formattedKey] += `, ${name}`;
                            }
                          } else {
                            tempHolidays[formattedKey] = name;
                          }
                        }
                      }
                    });
                  }
                }
              } catch (err) {
                console.log(`Catatan: ${opt.name} tidak dapat dijangkau online.`);
              }
            }
          } catch (e) {
            console.log(`Holidays backup load used for ${opt.name}.`);
          }
        });

        await Promise.all(fetchPromises);
        
        if (isMounted) {
          setApiHolidays(tempHolidays);
        }
      } catch (err) {
        console.error("Kesalahan mengambil data API Hari Besar:", err);
      } finally {
        if (isMounted) {
          setLoadingHolidayApis(false);
        }
      }
    };

    fetchAll();

    return () => {
      isMounted = false;
    };
  }, [holidayApis, year, workspace?.id]);

  const combinedHolidays = useMemo(() => {
    const merged = { ...apiHolidays, ...holidays };
    const cleaned: Record<string, string> = {};
    Object.entries(merged).forEach(([dateKey, val]) => {
      if (val) {
        cleaned[dateKey] = cleanAndFormatHolidayText(String(val));
      }
    });
    return cleaned;
  }, [apiHolidays, holidays]);

  const [bulkIds, setBulkIds] = useState<string[]>([]);
  const [exportModal, setExportModal] = useState(false);
  const [exStart, setExStart] = useState("");
  const [exEnd, setExEnd] = useState("");
  const [exPlatform, setExPlatform] = useState("All");
  const [exOption, setExOption] = useState("all"); // "all", "range"
  const [isExportLoading, setIsExportLoading] = useState(false);

  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState({ state: "", message: "" });


  const isRestricted = useMemo(() => {
    if (!profile?.activeUntil) return false;
    return new Date() > new Date(profile.activeUntil);
  }, [profile]);

  const isUnverified = useMemo(() => {
    return profile && profile.emailVerified === false;
  }, [profile]);

  const { checkCanAddWorkspace, maxWorkspaces, hasCapability } = usePlanLimits(planDetails);
  
  const handleCreateWorkspace = async (name: string, copyFromId: string | null = null) => {
    if (!user) return;

    const ownedWorkspaces = workspaces.filter((w: any) => w.ownerId === user.uid || w.createdBy === user.uid);
    if (!checkCanAddWorkspace(ownedWorkspaces.length)) {
       alert(`Batas maksimal pembuatan Workspace untuk paket Anda adalah ${maxWorkspaces}. Silakan upgrade paket untuk membuat lebih banyak Workspace.`);
       return;
    }

    try {
      let settingsToCopy = {
        title: name,
        // No tagline, no theme, just name by default as user requested.
      };

      if (copyFromId) {
        const sourceWs = workspaces.find((w: any) => w.id === copyFromId);
        if (sourceWs && sourceWs.settings) {
          // Exclude title/tagline/theme if we just want pillars/platforms etc.
          // The user specifically wants to copy settings.
          settingsToCopy = {
            ...sourceWs.settings,
            title: name,
            tagline: "", // ensure it's empty
            theme: "" // ensure no theme copied if not wanted, or keep it. Let's just remove theme/tagline
          };
          delete (settingsToCopy as any).theme;
        } else {
           // Also try fetching from DB if not fully loaded
           const wsDoc = await getDoc(doc(db, "workspaces", copyFromId));
           if (wsDoc.exists() && wsDoc.data().settings) {
              settingsToCopy = {
                 ...wsDoc.data().settings,
                 title: name,
                 tagline: ""
              };
              delete (settingsToCopy as any).theme;
           }
        }
      }

      const wsRef = doc(collection(db, "workspaces"));
      await setDoc(wsRef, {
        name: name,
        ownerId: user.uid,
        settings: settingsToCopy
      });
      await setDoc(doc(db, "workspaces", wsRef.id, "members", user.uid), {
        userId: user.uid,
        workspaceId: wsRef.id,
        role: "owner"
      });
      setWorkspace({ id: wsRef.id, name, ownerId: user.uid });
      setSaveMsg("Workspace baru berhasil dibuat.");
      setTimeout(() => setSaveMsg(""), 3000);
      setCreateWsModal(false);
    } catch (e: any) {
      handleFirestoreError(e, 'write');
    }
  };

  const handleLeaveWorkspace = async (ws: any) => {
    if (!user || !ws) return;
    const isOwner = workspaces.find(w => w.id === ws.id)?.ownerId === user.uid || workspaces.find(w => w.id === ws.id)?.createdBy === user.uid;
    if (isOwner) {
      alert("Anda adalah pemilik workspace ini. Anda tidak bisa keluar, silakan hapus workspace atau pindahkan kepemilikan.");
      return;
    }

    try {
      const memberRef = doc(db, "workspaces", ws.id, "members", user.uid);
      await deleteDoc(memberRef);
      setSaveMsg("Berhasil keluar dari workspace.");
      setTimeout(() => setSaveMsg(""), 3000);
    } catch (e: any) {
      handleFirestoreError(e, 'delete');
    }
  };

  const handleDeleteWorkspace = async (ws: any) => {
    if (!user || !ws) return;
    const isOwner = workspaces.find(w => w.id === ws.id)?.ownerId === user.uid || workspaces.find(w => w.id === ws.id)?.createdBy === user.uid;
    if (!isOwner) {
      alert("Hanya pemilik yang dapat menghapus workspace.");
      return;
    }

    try {
      // Delete workspace doc
      await deleteDoc(doc(db, "workspaces", ws.id));
      setSaveMsg("Workspace berhasil dihapus.");
      setTimeout(() => setSaveMsg(""), 3000);
      if (workspace?.id === ws.id) setWorkspace(workspaces[0] || null);
    } catch (e: any) {
      handleFirestoreError(e, 'delete');
    }
  };

  const handleTabChange = (newTab: string) => {
    if (tab === "settings" && isSettingsDirty) {
      setPendingTab(newTab);
      return;
    }
    setTab(newTab);
    if (newTab === "social-hub-ai") {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  };

  useEffect(() => {
    if (!user) return;
    const fetchWorkspaces = async () => {
      setWsLoading(true);
      try {
        const q = query(collectionGroup(db, "members"), where("userId", "==", user.uid));
        const snap = await getDocs(q);
        const wsIds = snap.docs.filter(d => (d.data() as any).status !== "pending").map(d => (d.data() as any).workspaceId).filter(id => !!id);
        const userRoles: Record<string, string> = {};
        snap.docs.forEach(d => {
          const mData = d.data() as any;
          if (mData.workspaceId) {
            userRoles[mData.workspaceId] = mData.role || "viewer";
          }
        });

        if (wsIds.length === 0) {
          setWorkspaces([]);
          setWsLoading(false);
          return;
        }

        // Fetch each workspace individually to guarantee 'get' rules are evaluated instead of 'list' rules
        const wsPromises = wsIds.map(id => getDoc(doc(db, "workspaces", id)));
        const wsSnaps = await Promise.all(wsPromises);
        
        const list = wsSnaps
          .filter(snap => snap.exists())
          .map(docSnap => ({
            ...docSnap.data(),
            id: docSnap.id,
            userRole: userRoles[docSnap.id] || "viewer"
          }));

        setWorkspaces(list);
        
        const currentWs = workspaceRef.current;
        if (list.length > 0) {
          const updatedCurrentWs = list.find(w => w.id === currentWs?.id);
          if (!currentWs || !updatedCurrentWs) {
            setWorkspace(list[0]);
          } else {
            setWorkspace(updatedCurrentWs);
          }
        }
        setWsLoading(false);
      } catch (error: any) {
        console.error("Workspace fetch error:", error);
        setErrorMsg(error.message);
        setWsLoading(false);
      }
    };
    
    fetchWorkspaces();
  }, [user]);

  // Reset cache and content state when switching workspaces to prevent stale data leaks
  useEffect(() => {
    setCachedContent({});
    setContent([]);
  }, [workspace?.id]);

  useEffect(() => {
    if (!workspace?.id || !user?.uid) return;
    setContentLoading(true);
    setContent([]); // Fix stale cross-workspace content migration
    const fetchWorkspaceDetails = async () => {
      try {
        const wsRef = doc(db, "workspaces", workspace.id);
        const snap = await getDoc(wsRef);
        const data = snap.data();
        if (data) {
           setWorkspace((prev: any) => {
              if (JSON.stringify(prev?.settings) === JSON.stringify(data.settings) && prev?.name === data.name) return prev;
              return { ...prev, ...data, id: snap.id };
           });
           
           if (data.settings) {
             setTitle(data.settings.title !== undefined ? data.settings.title : (data.name || "Workspace"));
             setTagline(data.settings.tagline !== undefined ? data.settings.tagline : "");
             
             if (data.settings.pillars) setPillars(data.settings.pillars);
             setPlatforms(DPL);
             if (data.settings.contentTypes) setContentTypes(data.settings.contentTypes);
             if (data.settings.pics) setPics(data.settings.pics);
             if (data.settings.statuses) setStatuses(data.settings.statuses);
             if (data.settings.holidays) setHolidays(data.settings.holidays);
             if (data.settings.showHolidays !== undefined) setShowHolidays(data.settings.showHolidays);
             if (data.settings.holidayApis !== undefined) {
               setHolidayApis(data.settings.holidayApis);
             } else {
               setHolidayApis([]);
             }
             if (data.settings.headerImage !== undefined) setHeaderImage(data.settings.headerImage);
             if (data.settings.headerStyle) setHeaderStyle(data.settings.headerStyle);
           }
        }
      } catch (error: any) {
        if (error.code === "permission-denied") {
           console.warn("Workspace details fetch warn: permission-denied");
        } else {
           console.error("Workspace details fetch error:", error);
        }
      }
    };
    
    fetchWorkspaceDetails();

    const cacheKey = `${year}-${month}`;

    // Check if we have cached content for this key to prevent flickering
    setCachedContent((prev) => {
      const hasCache = prev[cacheKey] !== undefined;
      if (!hasCache) {
        setContentLoading(true);
      } else {
        const flattened = Object.values(prev).flat();
        const uniqueContent = Array.from(new Map(flattened.map((item: any) => [item.id, item])).values());
        setContent(uniqueContent);
      }
      return prev;
    });

    const contentRef = collection(db, "workspaces", workspace.id, "content");
    const q = query(
      contentRef,
      where("year", "==", year),
      where("month", "==", month)
    );

    const unsubContent = onSnapshot(q, (snap) => {
      const items = snap.docs.map(d => ({ ...d.data(), id: d.id }));
      
      setCachedContent((prev) => {
        const nextCache = {
          ...prev,
          [cacheKey]: items
        };
        const flattened = Object.values(nextCache).flat();
        const uniqueContent = Array.from(new Map(flattened.map((item: any) => [item.id, item])).values());
        setContent(uniqueContent);
        return nextCache;
      });
      setContentLoading(false);
    }, (e) => {
      handleFirestoreError(e, 'list', contentRef.path);
      setContentLoading(false);
    });

    return () => { unsubContent(); };
  }, [workspace?.id, user?.uid, year, month]);

  // Run dynamic data migration for workspace "Fadkhy" / "Fadkhera"
  useEffect(() => {
    if (!workspace?.id) return;
    const wsName = (workspace.name || workspace.settings?.title || "").toLowerCase();
    const userEmail = (user?.email || "").toLowerCase();
    
    // Check if it fits the fadkhy / fadkhera workspace or the user's email
    if (
      wsName.includes("fadkh") || 
      wsName.includes("fadkhe") || 
      wsName.includes("fadkhera") || 
      wsName.includes("fadkhy") ||
      userEmail === "marcom@fadkhera.com"
    ) {
      const targetPlatforms = ["feed", "reels", "stories", "kol", "motion graphic"];
      
      const needsContentMigration = content.some((item: any) => 
        item.platform && targetPlatforms.includes(item.platform.trim().toLowerCase())
      );

      const hasInstagramPlatform = workspace.settings?.platforms?.some((p: any) => {
        const pName = typeof p === 'string' ? p : p?.name;
        return pName?.trim().toLowerCase() === "instagram";
      });

      const hasOldPlatforms = workspace.settings?.platforms?.some((p: any) => {
        const pName = typeof p === 'string' ? p : p?.name;
        return targetPlatforms.includes(pName?.trim().toLowerCase());
      });

      if (needsContentMigration || !hasInstagramPlatform || hasOldPlatforms) {
        console.log("Fadkhy workspace needs migration! Starting...");

        const runMigration = async () => {
          try {
            // Check if user has write permissions (owner or editor)
            const memRef = doc(db, "workspaces", workspace.id, "members", user?.uid || "");
            const memSnap = await getDoc(memRef);
            if (!memSnap.exists()) {
              console.log("User is not a member, skipping migration.");
              return;
            }
            const role = memSnap.data()?.role;
            if (role !== "owner" && role !== "editor" && role !== "admin") {
              console.log("User does not have permission to run migration (role: " + role + "). Skipping.");
              return;
            }

            let currentPlatforms = workspace.settings?.platforms || [];
            let currentContentTypes = workspace.settings?.contentTypes || [];

            const ensureObject = (item: any, defaultColor = "#3B82F6") => {
              if (typeof item === 'string') {
                return { name: item, color: defaultColor };
              }
              return item;
            };

            let updatedPlatforms = currentPlatforms
              .map((p: any) => ensureObject(p))
              .filter((p: any) => !targetPlatforms.includes(p.name?.trim().toLowerCase()));

            if (!updatedPlatforms.some((p: any) => p.name?.trim().toLowerCase() === "instagram")) {
              updatedPlatforms.push({ name: "Instagram", color: "#E1306C" });
            }
            if (!updatedPlatforms.some((p: any) => p.name?.trim().toLowerCase() === "tiktok")) {
              updatedPlatforms.push({ name: "TikTok", color: "#111111" });
            }

            let updatedContentTypes = [...currentContentTypes.map((ct: any) => ensureObject(ct))];
            
            const newContentTypesToAdd = [
              { name: "Feed", color: "#2C2016" },
              { name: "Reels", color: "#3B82F6" },
              { name: "Stories", color: "#A67C1C" },
              { name: "KOL", color: "#E52D27" },
              { name: "Motion Graphic", color: "#723680" }
            ];

            newContentTypesToAdd.forEach((nct) => {
              if (!updatedContentTypes.some((ct: any) => ct.name?.trim().toLowerCase() === nct.name.toLowerCase())) {
                updatedContentTypes.push(nct);
              }
            });

            const wsRef = doc(db, "workspaces", workspace.id);
            await updateDoc(wsRef, {
              settings: {
                ...(workspace.settings || {}),
                platforms: updatedPlatforms,
                contentTypes: updatedContentTypes
              }
            });
            console.log("Fadkhy settings updated!");

            const batch = writeBatch(db);
            let updateCount = 0;

            content.forEach((item: any) => {
              if (item.platform && item.id && String(item.id).length > 5) { // Ensure it's a real document ID
                const platLower = item.platform.trim().toLowerCase();
                if (targetPlatforms.includes(platLower)) {
                  const oldPlatform = item.platform;
                  const ref = doc(db, "workspaces", workspace.id, "content", String(item.id));
                  batch.set(ref, {
                    platform: "Instagram",
                    contentType: oldPlatform,
                    updatedAt: new Date().toISOString(),
                    workspaceId: workspace.id,
                    userId: user?.uid || ""
                  }, { merge: true });
                  updateCount++;
                }
              }
            });

            if (updateCount > 0) {
              await batch.commit();
              console.log(`Successfully migrated ${updateCount} content items!`);
              setSaveMsg(`Migrasi Fadkhy Selesai: Berhasil mengubah ${updateCount} konten ke platform Instagram.`);
              setTimeout(() => setSaveMsg(""), 5000);
            } else {
              console.log("No content items needed migration.");
            }

          } catch (err) {
            console.error("Fadkhy migration error:", err);
          }
        };

        runMigration();
      }
    }
  }, [workspace?.id, workspace?.name, workspace?.settings?.title, content, user?.email]);

  const handleSave = async (data: any, closeModal = true) => {
    console.log("handleSave called with data:", data);
    if (!workspace) {
        console.error("Workspace is null");
        return;
    }
    if (isRestricted) {
      if(closeModal) alert("Akses Terbatas: Fitur ini dikunci.");
      return;
    }
    if (isUnverified) {
      if(closeModal) alert("Akses Terbatas: Silakan verifikasi email Anda terlebih dahulu di menu Pengaturan.");
      return;
    }
    const isNew = modal.mode === "add";
    const itemId = data.id || (isNew ? gid() : "");
    if (!itemId) return;
    
    // Clean up undefined values before saving to Firestore to prevent silent or synchronous failures
    const cleanData = JSON.parse(JSON.stringify(data));

    const prevDataForSize = !isNew && content ? content.find(c => c.id === itemId) : null;
    let storageDiffMB = 0;
    try {
        const oldSize = prevDataForSize && prevDataForSize.referenceImage ? (prevDataForSize.referenceImage.length * 0.75) / (1024 * 1024) : 0;
        const newSize = cleanData.referenceImage ? (cleanData.referenceImage.length * 0.75) / (1024 * 1024) : 0;
        storageDiffMB = newSize - oldSize;
    } catch(e) {}

    const isOwner = workspace.ownerId === user.uid || workspace.createdBy === user.uid;
    if (storageDiffMB > 0 && isOwner) {
       const currentStorage = profile?.storageUsed || 0;
       const maxStorage = planDetails?.maxStorageMB || 100;
       if (currentStorage + storageDiffMB > maxStorage) {
          if (closeModal) alert(`Gagal menyimpan: Kapasitas penyimpanan penuh (Maks: ${maxStorage} MB).`);
          return;
       }
    }

    let changedFields: any[] = [];
    let prevData = !isNew && content ? content.find(c => c.id === itemId) : null;
    
    if (!isNew && !prevData) {
      try {
        const targetWorkspaceId = cleanData.workspaceId || workspace.id;
        const docSnap = await getDoc(doc(db, "workspaces", targetWorkspaceId, "content", itemId));
        if (docSnap.exists()) {
          prevData = docSnap.data();
        }
      } catch (e) {
        console.error("Failed to fetch prevData for history", e);
      }
    }

    if (prevData) {
      const fieldsToTrack = ["date", "type", "pic", "status", "platform", "title", "details", "visualRef", "designNote", "copywriting", "callToAction", "notes", "caption", "objective", "hook", "briefCopywriting", "cta", "targetAudience", "keyAngle", "visualConcept", "audioBgm", "outro", "hashtags", "linkAsset", "linkSosmed", "assetLink", "referenceText"];
      const nameMap: any = { date: "Tanggal", type: "Tipe Konten", pic: "PIC", status: "Status", platform: "Platform", title: "Judul", details: "Detail Singkat", visualRef: "Referensi Visual", designNote: "Catatan Desain", copywriting: "Copywriting", callToAction: "Call to Action", notes: "Catatan Tambahan", caption: "Caption", objective: "Objective", hook: "Hook", briefCopywriting: "Brief Utama", cta: "Call to Action (CTA)", targetAudience: "Target Audien", keyAngle: "Key Angle", visualConcept: "Visual Concept", audioBgm: "Audio & BGM", outro: "Outro", hashtags: "Hashtags", linkAsset: "Link Aset Final", linkSosmed: "Link Postingan", assetLink: "Link Referensi", referenceText: "Catatan Referensi" };
      
      const stripHtml = (html: string) => {
        let text = html || "";
        text = text.replace(/<p[^>]*>/gi, '\n');
        text = text.replace(/<br\s*\/?>/gi, '\n');
        text = text.replace(/<\/p>/gi, '');
        text = text.replace(/<[^>]*>?/gm, '');
        return text.trim();
      };

      fieldsToTrack.forEach(field => {
        const val1 = prevData[field] || "";
        const val2 = cleanData[field] || "";
        if (JSON.stringify(val1) !== JSON.stringify(val2)) {
           changedFields.push({
             field: nameMap[field] || field,
             from: typeof val1 === 'string' ? stripHtml(val1) : val1,
             to: typeof val2 === 'string' ? stripHtml(val2) : val2
           });
        }
      });
      
      if (cleanData.referenceImage !== prevData.referenceImage) {
         changedFields.push({
           field: "Gambar Referensi",
           from: prevData.referenceImage ? "Ada Gambar" : "Kosong",
           to: cleanData.referenceImage ? "Diperbarui" : "Kosong"
         });
      }

      if (cleanData.customFields) {
        cleanData.customFields.forEach((cf: any) => {
          const prevCf = prevData.customFields?.find((pcf: any) => pcf.name === cf.name);
          const val1 = prevCf ? (prevCf.value || "") : "";
          const val2 = cf.value || "";
          if (JSON.stringify(val1) !== JSON.stringify(val2)) {
            changedFields.push({
              field: cf.name || "Custom Field",
              from: val1,
              to: val2
            });
          }
        });
      }

      if (cleanData.metrics) {
        Object.keys(cleanData.metrics).forEach(k => {
          const val1 = prevData.metrics?.[k] || 0;
          const val2 = cleanData.metrics[k] || 0;
          if (val1 !== val2) {
             changedFields.push({
               field: `Metrik (${k})`,
               from: val1,
               to: val2
             });
          }
        });
      }

      if (cleanData.adsMetrics) {
        Object.keys(cleanData.adsMetrics).forEach(k => {
          const val1 = prevData.adsMetrics?.[k] || 0;
          const val2 = cleanData.adsMetrics[k] || 0;
          if (val1 !== val2) {
             changedFields.push({
               field: `Ads (${k})`,
               from: val1,
               to: val2
             });
          }
        });
      }

      const ref1 = prevData.referenceLinks || [];
      const ref2 = cleanData.referenceLinks || [];
      if (JSON.stringify(ref1) !== JSON.stringify(ref2)) {
         changedFields.push({
           field: "Link Referensi",
           from: `${ref1.length} link`,
           to: `${ref2.length} link`
         });
      }
      
      const time1 = `${prevData.uploadHour || 9}:${String(prevData.uploadMinute || 0).padStart(2, '0')}`;
      const time2 = `${cleanData.uploadHour || 9}:${String(cleanData.uploadMinute || 0).padStart(2, '0')}`;
      if (time1 !== time2) {
         changedFields.push({
           field: "Waktu Upload",
           from: time1,
           to: time2
         });
      }
    }

    let newHistoryEntry = null;
    if (changedFields.length > 0 || isNew) {
      const now = new Date();
      newHistoryEntry = {
        id: gid(),
        timestamp: now.toISOString(),
        editorId: user?.uid || "",
        editorName: profile?.fullName || profile?.nickname || user?.displayName || "User",
        editorAvatar: profile?.avatar || "",
        changes: changedFields,
        action: isNew ? "created" : "edited"
      };
      
      cleanData.lastEditedBy = newHistoryEntry.editorId;
      cleanData.lastEditedAt = now.getTime();
      cleanData.lastEditorName = newHistoryEntry.editorName;
      cleanData.lastEditorAvatar = newHistoryEntry.editorAvatar;
    }
    
    // Remove history array from main document to keep it small (migration to sub-collection)
    if (cleanData.history) {
      delete cleanData.history;
    }


    // Convert any empty inputs ("") back to numbers or defaults for Firestore saving
    if (cleanData.metrics) {
      cleanData.metrics = { ...cleanData.metrics };
      Object.keys(cleanData.metrics).forEach(k => {
        if (cleanData.metrics[k] === "") {
          cleanData.metrics[k] = 0;
        }
      });
    }
    if (cleanData.adsMetrics) {
      cleanData.adsMetrics = { ...cleanData.adsMetrics };
      Object.keys(cleanData.adsMetrics).forEach(k => {
        if (cleanData.adsMetrics[k] === "") {
          cleanData.adsMetrics[k] = 0;
        }
      });
    }
    if (cleanData.uploadHour === "") cleanData.uploadHour = 9;
    if (cleanData.uploadMinute === "") cleanData.uploadMinute = 0;

    const targetWorkspaceId = data.workspaceId || workspace.id;
    const targetUserId = data.userId || user?.uid || "";
    const itemData = { ...cleanData, id: itemId, workspaceId: targetWorkspaceId, userId: targetUserId };
    console.log("Cleaned itemData:", itemData);
    
    // Create or update notifications for all shared users so they appear in their dashboard
    const currSharedUids = cleanData.sharedUids || [];
    if (currSharedUids.length > 0) {
      currSharedUids.forEach((uid: string) => {
        const notifId = `shared_${targetWorkspaceId}_${itemId}_${uid}`;
        const notifRef = doc(db, "notifications", notifId);
        setDoc(notifRef, {
          userId: uid,
          type: "shared_brief",
          title: `Brief Dibagikan: ${cleanData.title || "Tanpa Judul"}`,
          body: `Anda telah diberikan akses ke brief ini oleh ${profile?.fullName || user?.email || "pengguna"}.`,
          workspaceId: targetWorkspaceId,
          contentId: itemId,
          updatedAt: serverTimestamp(),
          // Only set createdAt if it doesn't exist (handled by merge, but we can just use updatedAt for sorting if needed, 
          // or just rely on the dashboard which doesn't sort notifications for this specific fetch anyway)
        }, { merge: true }).catch(e => console.error("Failed to notify shared user:", e));
      });
    }
    
    try {
      await setDoc(doc(db, "workspaces", targetWorkspaceId, "content", itemId), itemData, { merge: true });
      if (newHistoryEntry) {
        await setDoc(doc(db, "workspaces", targetWorkspaceId, "content", itemId, "history", newHistoryEntry.id), newHistoryEntry);
      }
      console.log("Save successful!");
      if (storageDiffMB !== 0 && isOwner) {
         try {
             await updateDoc(doc(db, "users", user.uid), { storageUsed: increment(storageDiffMB) });
         } catch(e) { console.error("Failed to update storage", e); }
      }
      if (closeModal) {
        setModal(null);
      } else if (isNew) {
        setModal({mode: "edit", data: itemData});
      }
      return itemData;
    } catch (e: any) { 
      console.error("Save Error:", e);
      if(closeModal) alert("Gagal menyimpan data: " + e.message);
      if(closeModal) handleFirestoreError(e, isNew?'create':'update', null); 
    }
  };

  const moveItemDate = async (itemId: string, newDate: number) => {
    if (!workspace) return;
    if (workspace.userRole === "viewer" || workspace.userRole === "commenter") return alert("Akses ditolak: Anda tidak memiliki izin untuk mengubah data.");
    if (isRestricted) return alert("Akses Terbatas: Fitur ini dikunci pada masa uji coba yang telah habis.");
    if (isUnverified) return alert("Akses Terbatas: Silakan verifikasi email Anda terlebih dahulu di menu Pengaturan.");
    try {
      await setDoc(doc(db, "workspaces", workspace.id, "content", itemId), { day: newDate }, { merge: true });
    } catch (e: any) {
      console.error(e);
      alert("Gagal memindahkan konten: " + e.message);
    }
  };

  const moveItemStatus = async (itemId: string, newStatus: string) => {
    if (!workspace) return;
    if (workspace.userRole === "viewer" || workspace.userRole === "commenter") return alert("Akses ditolak: Anda tidak memiliki izin untuk mengubah data.");
    if (isRestricted) return alert("Akses Terbatas: Fitur ini dikunci pada masa uji coba yang telah habis.");
    if (isUnverified) return alert("Akses Terbatas: Silakan verifikasi email Anda terlebih dahulu di menu Pengaturan.");
    try {
      await setDoc(doc(db, "workspaces", workspace.id, "content", itemId), { status: newStatus }, { merge: true });
    } catch (e: any) {
      console.error(e);
      alert("Gagal memperbarui status: " + e.message);
    }
  };

  const openEdit = (item:any) => setModal({mode:"edit",data:{...item,metrics:{...item.metrics}}});
  const openAdd  = (day:any, prefilled?: any) => {
    if (workspace?.userRole === "viewer" || workspace?.userRole === "commenter") return alert("Akses ditolak: Anda tidak memiliki izin untuk menambah data.");
    if (isRestricted) return alert("Akses Terbatas: Fitur ini dikunci pada masa uji coba yang telah habis.");
    if (isUnverified) return alert("Akses Terbatas: Silakan verifikasi email Anda terlebih dahulu di menu Pengaturan.");
    setModal({mode:"add",data:{...emptyItem(year,month,day,pillars,platforms,pics,statuses,contentTypes), ...prefilled}});
  };
  const deleteItem = async (id:string, force:boolean = false) => { 
    if(!workspace || !id || isRestricted) return;
    if (workspace.userRole === "viewer" || workspace.userRole === "commenter") return alert("Akses ditolak: Anda tidak memiliki izin untuk menghapus data.");
    
    const doDelete = async () => {
        try {
          const docRef = doc(db, "workspaces", workspace.id, "content", id);
          await deleteDoc(docRef); 
          setModal(null); 
          setSaveMsg("Konten berhasil dihapus secara permanen.");
          setTimeout(()=>setSaveMsg(""), 3000);
        } catch (e: any) {
          handleFirestoreError(e, 'delete');
        }
    };

    if (force) {
        await doDelete();
        return;
    }

    setConfirmAction({
      title: lang === "id" ? "Hapus Konten?" : "Delete Content?",
      msg: "Yakin ingin menghapus permanen konten ini? Tindakan ini tidak dapat dikembalikan.",
      onConfirm: doDelete
    });
  };

  const archiveItem = async (id:string) => {
    if(!workspace || !id) return;
    if (workspace.userRole === "viewer" || workspace.userRole === "commenter") return alert("Akses ditolak: Anda tidak memiliki izin untuk mengubah data.");
    try {
      const docRef = doc(db, "workspaces", workspace.id, "content", id);
      await setDoc(docRef, { archived: true, updatedAt: new Date().toISOString() }, { merge: true });
      setModal(null);
      setSaveMsg("Konten berhasil diarsipkan.");
      setTimeout(()=>setSaveMsg(""), 3000);
    } catch (e: any) {
      handleFirestoreError(e, 'update');
    }
  };

  const unarchiveItem = async (id:string) => {
    if(!workspace || !id) return;
    if (workspace.userRole === "viewer" || workspace.userRole === "commenter") return alert("Akses ditolak: Anda tidak memiliki izin untuk mengubah data.");
    try {
      const docRef = doc(db, "workspaces", workspace.id, "content", id);
      await setDoc(docRef, { archived: false, updatedAt: new Date().toISOString() }, { merge: true });
      setModal(null);
      setSaveMsg("Konten berhasil dipulihkan ke kalender.");
      setTimeout(()=>setSaveMsg(""), 3000);
    } catch (e: any) {
      handleFirestoreError(e, 'update');
    }
  };

  const handleBulkActions = async (type: string) => {
    if (!workspace || bulkIds.length === 0 || isRestricted) return;
    if (workspace.userRole === "viewer" || workspace.userRole === "commenter") return alert("Akses ditolak: Anda tidak memiliki izin untuk menghapus data.");
    
    if (!hasCapability('csvImportExport')) {
        alert("Fitur Bulk Import/Export CSV tidak tersedia di paket Anda. Silakan upgrade paket.");
        return;
    }

    setConfirmAction({
      title: type === "delete" ? (lang === "id" ? "Hapus Massal?" : "Bulk Delete?") : type === "restore" ? (lang === "id" ? "Pulihkan Massal?" : "Bulk Restore?") : (lang === "id" ? "Arsipkan Massal?" : "Bulk Archive?"),
      msg: `Apakah Anda yakin ingin ${type === "delete" ? "menghapus permanen" : type === "restore" ? "memulihkan" : "mengarsipkan"} ${bulkIds.length} konten?`,
      onConfirm: async () => {
        try {
          const batch = writeBatch(db);
          bulkIds.forEach(id => {
            const ref = doc(db, "workspaces", workspace.id, "content", id);
            if (type === "delete") {
              batch.delete(ref);
            } else if (type === "restore") {
              batch.update(ref, { archived: false });
            } else {
              batch.update(ref, { archived: true });
            }
          });
          await batch.commit();
          setBulkIds([]);
          const actionName = type === "delete" ? "menghapus" : type === "restore" ? "memulihkan" : "mengarsipkan";
          setSaveMsg(`Berhasil ${actionName} ${bulkIds.length} konten.`);
          setTimeout(()=>setSaveMsg(""), 3000);
        } catch (e) {
          handleFirestoreError(e, 'write');
        }
      }
    });
  };

  const updateWsSettings = async (updates: any) => {
    if (!workspace) return;
    if (workspace?.userRole === "viewer" || workspace?.userRole === "commenter") return alert("Akses ditolak: Anda tidak memiliki izin untuk mengubah pengaturan.");
    try {
      const { renames, ...settingsUpdates } = updates;
      
      const wsRef = doc(db, "workspaces", workspace.id);
      const currentSettings = workspace.settings || {};
      const newSettings = { ...currentSettings };
      
      Object.keys(settingsUpdates).forEach(k => {
        newSettings[k] = settingsUpdates[k];
      });
      
      const fsUpdates: any = JSON.parse(JSON.stringify({ settings: newSettings }));
      if (settingsUpdates.title) {
        fsUpdates.name = settingsUpdates.title;
      }
      await updateDoc(wsRef, fsUpdates);
      
      setWorkspace((prev: any) => ({ ...prev, ...fsUpdates }));
      
      if (settingsUpdates.title !== undefined) setTitle(settingsUpdates.title);
      if (settingsUpdates.tagline !== undefined) setTagline(settingsUpdates.tagline);
      if (settingsUpdates.pillars) setPillars(settingsUpdates.pillars);
      if (settingsUpdates.contentTypes) setContentTypes(settingsUpdates.contentTypes);
      if (settingsUpdates.pics) setPics(settingsUpdates.pics);
      if (settingsUpdates.statuses) setStatuses(settingsUpdates.statuses);
      if (settingsUpdates.holidays !== undefined) setHolidays(settingsUpdates.holidays);
      if (settingsUpdates.showHolidays !== undefined) setShowHolidays(settingsUpdates.showHolidays);
      if (settingsUpdates.holidayApis !== undefined) setHolidayApis(settingsUpdates.holidayApis);

      if (settingsUpdates.title) {
        document.title = `${settingsUpdates.title} - Hubify Social`;
      }
      
      if (renames && (Object.keys(renames.pillars || {}).length > 0 || Object.keys(renames.platforms || {}).length > 0 || Object.keys(renames.contentTypes || {}).length > 0 || Object.keys(renames.pics || {}).length > 0 || Object.keys(renames.statuses || {}).length > 0)) {
        const applyRenameToField = (fieldValue: any, renamesMap: Record<string, string>) => {
          if (!fieldValue || !renamesMap || Object.keys(renamesMap).length === 0) {
            return { val: fieldValue, updated: false };
          }

          if (Array.isArray(fieldValue)) {
            let updated = false;
            const newVal = fieldValue.map((item) => {
              if (typeof item === "string") {
                if (renamesMap[item]) {
                  updated = true;
                  return renamesMap[item];
                }
                const lower = item.toLowerCase();
                for (const [oldName, newName] of Object.entries(renamesMap)) {
                  if (oldName.toLowerCase() === lower) {
                    updated = true;
                    return newName;
                  }
                }
              }
              return item;
            });
            return { val: newVal, updated };
          }

          if (typeof fieldValue === "string") {
            const parts = fieldValue.split(",").map((s) => s.trim());
            let updated = false;
            const newParts = parts.map((part) => {
              if (!part) return part;
              if (renamesMap[part]) {
                updated = true;
                return renamesMap[part];
              }
              const lower = part.toLowerCase();
              for (const [oldName, newName] of Object.entries(renamesMap)) {
                if (oldName.toLowerCase() === lower) {
                  updated = true;
                  return newName;
                }
              }
              return part;
            });
            return { val: newParts.join(", "), updated };
          }

          return { val: fieldValue, updated: false };
        };

        const allUpdates: any[] = [];
        const updatedContentMap = new Map<string, any>();

        content.forEach((item: any) => {
          const resPillar = applyRenameToField(item.pillar, renames.pillars || {});
          const resPlatform = applyRenameToField(item.platform, renames.platforms || {});
          const resContentType = applyRenameToField(item.contentType, renames.contentTypes || {});
          const resPic = applyRenameToField(item.pic, renames.pics || {});
          const resStatus = applyRenameToField(item.status, renames.statuses || {});

          if (resPillar.updated || resPlatform.updated || resContentType.updated || resPic.updated || resStatus.updated) {
            const updateObj = {
              pillar: resPillar.val,
              platform: resPlatform.val,
              contentType: resContentType.val,
              pic: resPic.val,
              status: resStatus.val
            };
            allUpdates.push({ id: item.id, data: updateObj });
            updatedContentMap.set(item.id, updateObj);
          }
        });

        if (allUpdates.length > 0) {
          const CHUNK_SIZE = 450;
          for (let i = 0; i < allUpdates.length; i += CHUNK_SIZE) {
            const chunk = allUpdates.slice(i, i + CHUNK_SIZE);
            const chunkBatch = writeBatch(db);
            chunk.forEach((u) => chunkBatch.update(doc(db, "workspaces", workspace.id, "content", u.id), u.data));
            await chunkBatch.commit();
          }

          // Optimistically update local content state
          setContent((prevContent: any[]) =>
            prevContent.map((item: any) => {
              if (updatedContentMap.has(item.id)) {
                return { ...item, ...updatedContentMap.get(item.id) };
              }
              return item;
            })
          );
        }
      }
    } catch (e: any) {
      console.error("Update settings error:", e);
      handleFirestoreError(e, 'update');
    }
  };

  useEffect(() => {
    const currentWorkspaceName = workspace?.name || title || "Workspace";
    if (tab === "dashboard") {
      document.title = `${currentWorkspaceName} - Hubify Social`;
    } else {
      const getTabLabel = (currentTab: string, currentContentTab: string, langCode: string) => {
        switch (currentTab) {
          case "dashboard":
            return "Dashboard";
          case "content_planner":
            if (currentContentTab === "board") return "Board";
            if (currentContentTab === "timeline") return "Timeline";
            if (currentContentTab === "table") return langCode === "id" ? "Tabel" : "Table";
            return langCode === "id" ? "Calendar" : "Calendar";
          case "analytics":
          case "analytics-overview":
            return "Overview";
          case "analytics-content":
            return "Content";
          case "analytics-trends":
            return "Trends";
          case "analytics-activity":
            return "Audience";
          case "social-hub-ai":
            return "Hub.ai";
          case "soc_hub":
            return "SocHub";
          case "social-dashboard":
            return langCode === "id" ? "Integrasi Sosmed" : "Social Dashboard";
          case "social-competitor":
            return langCode === "id" ? "Analisis Kompetitor" : "Competitor Analysis";
          case "social-inbox":
            return langCode === "id" ? "Inbox & Komen" : "Inbox & Comments";
          case "social-admin":
            return "Admin Panel";
          case "profile":
            return langCode === "id" ? "Profil" : "Profile";
          case "settings":
            return langCode === "id" ? "Pengaturan" : "Settings";
          default:
            if (currentTab.startsWith("social-")) {
              const sub = currentTab.replace("social-", "");
              return sub.charAt(0).toUpperCase() + sub.slice(1);
            }
            if (currentTab.startsWith("analytics-")) {
              const sub = currentTab.replace("analytics-", "");
              if (sub === "activity") return "Audience";
              return sub.charAt(0).toUpperCase() + sub.slice(1);
            }
            return currentTab.charAt(0).toUpperCase() + currentTab.slice(1);
        }
      };

      const pageLabel = getTabLabel(tab, contentTab, lang);
      document.title = `${currentWorkspaceName} - ${pageLabel}`;
    }
  }, [workspace?.name, title, tab, contentTab, lang]);

  const handleBulkImport = async (items: any[]) => {
    if (!workspace) return;
    setIsImporting(true);
    setImportStatus({ state: "loading", message: lang === "id" ? "Memproses impor data..." : "Processing import data..." });
    try {
      const newPillars = [...pillars];
      const newPics = [...pics];
      const newStatuses = [...statuses];
      const newContentTypes = [...contentTypes];

      let hasNewOptions = false;

      const addOptionIfNew = (list: any[], valStr: string, isMultiple: boolean = false) => {
        const names = isMultiple ? valStr.split(',').map((s: string) => s.trim()).filter(Boolean) : [valStr.trim()].filter(Boolean);
        for (const name of names) {
            const exists = list.some((opt: any) => (opt.name || opt).toLowerCase() === name.toLowerCase());
            if (!exists) {
                list.push({ name, id: name, color: "#3B82F6" }); // Default color
                hasNewOptions = true;
            }
        }
      };

      items.forEach(item => {
        if (item.pillar) addOptionIfNew(newPillars, item.pillar);
        if (item.pic) addOptionIfNew(newPics, item.pic, true);
        if (item.status) addOptionIfNew(newStatuses, item.status);
        if (item.contentType) addOptionIfNew(newContentTypes, item.contentType);
      });

      if (hasNewOptions) {
          await updateWsSettings({
              pillars: newPillars,
              pics: newPics,
              statuses: newStatuses,
              contentTypes: newContentTypes
          });
      }

      const CHUNK_SIZE = 450;
      for (let i = 0; i < items.length; i += CHUNK_SIZE) {
        setImportStatus({ state: "loading", message: lang === "id" ? `Menyimpan ${Math.min(i + CHUNK_SIZE, items.length)} dari ${items.length} konten...` : `Saving ${Math.min(i + CHUNK_SIZE, items.length)} of ${items.length} content...` });
        const chunk = items.slice(i, i + CHUNK_SIZE);
        const batch = writeBatch(db);
        chunk.forEach(item => {
          const id = item.id || gid();
          const ref = doc(db, "workspaces", workspace.id, "content", id);
          batch.set(ref, { 
            ...item, 
            id, 
            workspaceId: workspace.id, 
            userId: user.uid,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        });
        await batch.commit();
      }
      setImportStatus({ state: "success", message: lang === "id" ? `Berhasil mengimpor ${items.length} konten!` : `Successfully imported ${items.length} content!` });
      setTimeout(() => {
          setIsImporting(false);
          setImportStatus({ state: "", message: "" });
      }, 3000);
    } catch (e: any) {
      handleFirestoreError(e, 'write');
      setImportStatus({ state: "error", message: lang === "id" ? `Gagal impor: ${e.message}` : `Import failed: ${e.message}` });
      setTimeout(() => {
          setIsImporting(false);
          setImportStatus({ state: "", message: "" });
      }, 5000);
    }
  };

  const monthContent = content.filter(c=>c.year===year&&c.month===month);
  const filtered = useMemo(()=> {
    let items = search ? content.filter(c=>[c.title,c.caption].join(" ").toLowerCase().includes(search.toLowerCase())) : monthContent;
    return items.filter((c:any)=>(filters.pillar.includes("All")||filters.pillar.includes(c.pillar))&&(filters.platform.includes("All")||filters.platform.includes(c.platform))&&(!filters.contentType||filters.contentType.includes("All")||filters.contentType.includes(c.contentType))&&(filters.pic.includes("All")||filters.pic.includes(c.pic))&&(filters.status==="All"||c.status===filters.status));
  },[monthContent,content,search,filters]);

  const provLock = useRef(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (wsLoading) return <LoadingScreen title={title} />;

  if (workspaces.length === 0) {
    return (
      <div style={{height:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#FAFAFA", flexDirection:"column", gap:20, padding:40, textAlign:"center"}}>
        <div style={{width:40, height:40, border:"3px solid var(--theme-primary)", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 1s linear infinite"}}/>
        
        {errorMsg && (
          <div style={{maxWidth:500, fontSize:13, color:"#9C2B4E", background:"#F8EAF0", padding:16, borderRadius:12, fontWeight:500, wordBreak:"break-all"}}>
             {errorMsg.includes("index") ? (
                <>
                  <p>Firebase membutuhkan Index untuk query ini. Silakan klik link di bawah ini untuk membuat Index (tunggu 1-2 menit setelah dibuat sebelum refresh):</p>
                  <p style={{marginTop: 8}}>
                    {errorMsg.match(/https:\/\/[^\s]+/) ? (
                      <a href={errorMsg.match(/https:\/\/[^\s]+/)?.[0]} target="_blank" rel="noopener noreferrer" style={{color: "#9C2B4E", textDecoration: "underline"}}>
                        Buat Index di Firebase Console
                      </a>
                    ) : errorMsg}
                  </p>
                </>
             ) : (
                `Oops! Terjadi kendala: ${errorMsg}`
             )}
          </div>
        )}
        
        {errorMsg.includes("index") && (
          <button onClick={()=>window.location.reload()} className="hover-scale" style={{...B(true), padding:"10px 24px", borderRadius:24}}>{lang === "id" ? "Coba Refresh Sekarang" : "Try Refreshing Now"}</button>
        )}
        
        <button onClick={async ()=>{ try { await signOut(auth); } catch(e) {} finally { window.location.href = "/login"; window.location.reload(); } }} className="hover-scale" style={{...B(false), fontSize:13, borderRadius:24, marginTop:12}}>{lang === "id" ? "Batal & Logout" : "Cancel & Logout"}</button>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{display:"flex", height:"100vh", overflow:"hidden", background:"var(--theme-sidebar)"}}>
      <Sidebar 
        planDetails={planDetails}
        systemConfig={systemConfig}
        open={sidebarOpen} setOpen={setSidebarOpen} tab={tab} setTab={handleTabChange} 
        workspaces={workspaces} activeWorkspace={workspace} onWorkspaceSelect={setWorkspace} 
        user={user} profile={profile} onLogout={async ()=>{ 
          try { await signOut(auth); } catch(e) {} finally { window.location.href = "/login"; window.location.reload(); }
        }}
        title={title}
        onOpenSidebar={() => setSidebarOpen(true)}
        onLeaveWorkspace={handleLeaveWorkspace}
        onDeleteWorkspace={handleDeleteWorkspace}
        onCreateWorkspaceRequest={() => setCreateWsModal(true)}
        onRenameWorkspace={async (wsId: string, newName: string) => {
          try {
            await updateDoc(doc(db, "workspaces", wsId), { name: newName });
            setWorkspaces(prev => prev.map(w => w.id === wsId ? { ...w, name: newName } : w));
            if (workspace?.id === wsId) {
              setWorkspace(prev => prev ? { ...prev, name: newName } : null);
              setTitle(newName);
            }
          } catch(e: any) { handleFirestoreError(e, 'update'); }
        }}
        onUpdateWorkspace={async (wsId: string, updates: any) => {
          try {
            await updateDoc(doc(db, "workspaces", wsId), updates);
            setWorkspaces(prev => prev.map(w => w.id === wsId ? { ...w, ...updates } : w));
            if (workspace?.id === wsId) {
              setWorkspace(prev => prev ? { ...prev, ...updates } : null);
              if (updates.name) {
                setTitle(updates.name);
              }
            }
          } catch(e: any) { handleFirestoreError(e, 'update'); }
        }}
        onTitleChange={async (newTitle: string) => {
          setTitle(newTitle);
          await updateWsSettings({ title: newTitle });
        }}
        onQuickAddContent={() => openAdd(new Date().getDate())}
        tutorialActive={tutorialActive}
      />
      <BottomBar
        planDetails={planDetails}
        systemConfig={systemConfig}
        tab={tab}
        setTab={handleTabChange}
        user={user}
        profile={profile}
        onQuickAddContent={() => openAdd(new Date().getDate())}
      />
      {["dashboard", "content_planner", "analytics", "analytics-overview", "analytics-content", "analytics-trends", "analytics-activity"].includes(tab) && (
        <div 
          className="m-0 md:m-[8px_8px_8px_0] rounded-none md:rounded-[28px]"
          style={{ position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none", background: "radial-gradient(circle at 0% 0%, #E3F2FD 0.1%, transparent 50%), radial-gradient(circle at 100% 100%, #FFF3E0 0.1%, transparent 50%), radial-gradient(circle at 100% 0%, #F3E5F5 0.1%, transparent 50%), #FAFAFA" }} 
        />
      )}
      <div id="main-scroll-container" 
        className="m-0 md:m-[8px_8px_8px_0] rounded-none md:rounded-[28px] h-full md:h-[calc(100vh-16px)] pb-20 md:pb-0"
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          background: "#FFFFFF",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.03)",
          border: "1px solid rgba(0, 0, 0, 0.04)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div 
          className="rounded-t-none md:rounded-t-[28px]"
          style={{
            margin: "-1px -1px 0 -1px",
            width: "calc(100% + 2px)",
            position: "relative",
            zIndex: 99,
            flexShrink: 0,
            overflow: "hidden",
            background: (systemConfig?.bannerActive && systemConfig?.bannerMessage && !bannerDismissed) 
              ? (systemConfig.bannerType === "alert" ? "#9C2B4E" : systemConfig.bannerType === "warning" ? "#FBC02D" : "#1D4D7A")
              : broadcastBanner 
                ? getBroadcastStyles(broadcastBanner).bg 
                : "transparent"
          }}
        >
          <AnimatePresence>
          {systemConfig?.bannerActive && systemConfig?.bannerMessage && !bannerDismissed && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.35 }}
              style={{
                background: systemConfig.bannerType === "alert" ? "#9C2B4E" : systemConfig.bannerType === "warning" ? "#FBC02D" : "#1D4D7A",
                color: systemConfig.bannerType === "warning" ? "#2C2016" : "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 600,
                zIndex: 100,
                flexShrink: 0,
                position: "relative",
                overflow: "hidden"
              }}
            >
              <div style={{
                padding: "10px 48px 10px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                gap: 12
              }}>
                 <span style={{flex:1, textAlign:"center"}}>{systemConfig.bannerMessage}</span>
                 <button 
                   onClick={handleDismissBanner}
                   style={{
                     position: "absolute",
                     right: 16,
                     top: "50%",
                     transform: "translateY(-50%)",
                     background: "rgba(0,0,0,0.06)",
                     border: "none",
                     borderRadius: "50%",
                     width: 24,
                     height: 24,
                     display: "flex",
                     alignItems: "center",
                     justifyContent: "center",
                     cursor: "pointer",
                     color: "inherit",
                     transition: "all 0.15s",
                     opacity: 0.8
                   }}
                   className="hover:bg-black/10 hover:scale-105 active:scale-95 hover:opacity-100"
                   title="Tutup Banner"
                 >
                   <X size={14} />
                 </button>
              </div>
            </motion.div>
          )}

          {broadcastBanner && (() => {
            const bStyle = getBroadcastStyles(broadcastBanner);
            return (
              <motion.div 
                key="broadcastBanner"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.35 }}
                style={{
                  background: bStyle.bg,
                  color: bStyle.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 600,
                  zIndex: 99,
                  flexShrink: 0,
                  position: "relative",
                  overflow: "hidden",
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                  cursor: "pointer"
                }}
                onClick={() => {
                  setActiveBroadcast(broadcastBanner);
                  setShowBroadcastModal(true);
                }}
              >
                <div style={{
                  padding: "10px 48px 10px 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  gap: 12
                }}>
                  <Megaphone size={16} style={{ color: bStyle.iconColor }} className="shrink-0 animate-bounce" />
                  <span style={{
                    flex: 1, 
                    textAlign: "center", 
                    overflow: "hidden", 
                    textOverflow: "ellipsis", 
                    whiteSpace: "nowrap"
                  }}>
                    <span style={{ background: bStyle.badgeBg, color: bStyle.badgeText }} className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold mr-2 shrink-0">
                      {bStyle.badgeLabel}
                    </span>
                    {broadcastBanner.title} - <span style={{ color: bStyle.linkColor }} className="font-normal hover:underline">{lang === "id" ? "Klik untuk selengkapnya" : "Click to read more"}</span>
                  </span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDismissBroadcast(broadcastBanner);
                    }}
                    style={{
                      position: "absolute",
                      right: 16,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "rgba(255,255,255,0.15)",
                      border: "none",
                      borderRadius: "50%",
                      width: 24,
                      height: 24,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      color: bStyle.color
                    }}
                    className="hover:bg-white/25 transition-colors"
                    title={lang === "id" ? "Tutup" : "Close"}
                  >
                    <X size={14}/>
                  </button>
                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>
        </div>

        <div
          id="main-content-scrollable"
          className={`scrollbar-thin md:rounded-b-[28px] ${(!["dashboard", "settings", "admin", "soc_hub"].includes(tab) && !tab.startsWith("social")) ? "" : "md:rounded-t-[28px]"}`}
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: ["social-hub-ai", "soc_hub", "admin"].includes(tab) ? "hidden" : "auto",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            overflowX: "hidden"
          }}
        >
          {(!["dashboard", "settings", "admin", "soc_hub"].includes(tab) && !tab.startsWith("social")) && (
          <Header 
            profile={profile}
            tab={tab}
          />
        )}
      
      {isRestricted && (
        <div style={{background:"#F8EAF0", borderBottom:"1px solid rgba(156,43,78,0.1)", padding:"12px 24px", display:"flex", alignItems:"center", justifyContent:"center", gap:12, zIndex:50}}>
          <span style={{fontSize:13, fontWeight:700, color:"#9C2B4E"}}>{lang === "id" ? "🔒 Mode Terbatas:" : "🔒 Restricted Mode:"}</span>
          <span style={{fontSize:13, color:"rgba(44,32,22,0.6)"}}>{lang === "id" ? "Masa aktif Anda telah habis. Silakan berlangganan untuk membuka semua fitur." : "Your active period has expired. Please subscribe to unlock all features."}</span>
          <button onClick={() => window.location.href="/billing"} style={{background:"#9C2B4E", color:"white", border:"none", padding:"6px 14px", borderRadius:20, fontSize:12, fontWeight:800, cursor:"pointer"}}>{lang === "id" ? "Berlangganan Sekarang" : "Subscribe Now"}</button>
        </div>
      )}

      {isUnverified && (
        <div style={{background:"#FBF5E3", borderBottom:"1px solid rgba(166,124,28,0.1)", padding:"12px 24px", display:"flex", alignItems:"center", justifyContent:"center", gap:12, zIndex:50}}>
          <span style={{fontSize:13, fontWeight:700, color:"#A67C12"}}>{lang === "id" ? "⚠️ Verifikasi Email:" : "⚠️ Email Verification:"}</span>
          <span style={{fontSize:13, color:"rgba(44,32,22,0.6)"}}>{lang === "id" ? "Harap verifikasi email Anda untuk menggunakan seluruh fitur Hubify Social." : "Please verify your email address to unlock all Hubify Social features."}</span>
          <button onClick={() => setTab("settings")} style={{background:"#A67C12", color:"white", border:"none", padding:"6px 14px", borderRadius:20, fontSize:12, fontWeight:800, cursor:"pointer"}}>{lang === "id" ? "Verifikasi Sekarang" : "Verify Now"}</button>
        </div>
      )}

      {tab === "content_planner" && (
        <NavBar 
          planDetails={planDetails}
          userProfile={profile}
          tab={tab} setTab={setTab} year={year} setYear={setYear} month={month} setMonth={setMonth} 
          contentTab={contentTab} setContentTab={setContentTab}
          onOpenAdd={()=>openAdd(1)} onOpenAddEvent={() => { if (workspace?.userRole === "viewer" || workspace?.userRole === "commenter") { alert("Akses ditolak: Anda tidak memiliki izin untuk mengelola event."); return; } setEditingEvent(null); setShowEventModal(true); }} isRestricted={isRestricted}
          search={search} onSearch={setSearch} onShare={workspace?.userRole === "owner" ? () => setShareModal(true) : undefined} sidebarOpen={sidebarOpen}
        />
      )}
      
      {tab === "content_planner" && (
        <FilterBar 
          filters={filters} setFilters={setFilters} 
          pillars={pillars} platforms={platforms} contentTypes={contentTypes} pics={pics} statuses={statuses} 
          showHolidays={showHolidays} setShowHolidays={setShowHolidays} 
          showArchived={showArchived} setShowArchived={setShowArchived}
          onImportClick={()=>{ 
            if (!hasCapability('csvImportExport')) {
              alert("Fitur Bulk Import/Export CSV tidak tersedia di paket Anda. Silakan upgrade paket.");
              return;
            }
            if (workspace?.userRole === "viewer" || workspace?.userRole === "commenter") { alert("Akses ditolak: Anda tidak memiliki izin untuk import data."); return; } 
            setShowCsv(true); 
          }}
          onExportClick={()=>{ 
            if (!hasCapability('csvImportExport')) {
              alert("Fitur Bulk Import/Export CSV tidak tersedia di paket Anda. Silakan upgrade paket.");
              return;
            }
            const pad = (num: number) => String(num).padStart(2, "0");
            const lastDay = new Date(year, month, 0).getDate();
            setExStart(`${year}-${pad(month)}-01`);
            setExEnd(`${year}-${pad(month)}-${pad(lastDay)}`);
            setExportModal(true); 
          }}
          isRestricted={isRestricted}
          onSettingUpdate={updateWsSettings}
          month={month}
          setMonth={setMonth}
          year={year}
          setYear={setYear}
        />
      )}

      <div style={{padding: (tab.startsWith("social") || ["soc_hub", "admin"].includes(tab)) ? "0" : "20px 24px 56px", position: "relative", minHeight: 0, flex: (tab.startsWith("social") || ["soc_hub", "admin"].includes(tab)) ? 1 : "none", display: "flex", flexDirection: "column"}}>
        <AnimatePresence mode="wait">
          <motion.div key={tab + "-" + contentTab} initial={{ opacity: 0, y: 5, scale: 0.99 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -5, scale: 0.99 }} transition={{ duration: 0.15, ease: "easeOut" }} style={{ flex: (tab.startsWith("social") || ["soc_hub", "admin"].includes(tab)) ? 1 : "none", minHeight: 0, display: "flex", flexDirection: "column" }}>
            <Suspense fallback={
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 380,
                width: "100%",
                flex: 1,
                padding: "48px 24px",
                background: "#FFFFFF",
                borderRadius: 16,
                border: "1px solid rgba(0,0,0,0.05)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
              }}>
                <Loader2 size={32} className="animate-spin" style={{ color: "var(--theme-primary)" }} />
                <span style={{ marginTop: 16, fontSize: 14, fontWeight: 600, color: "#2C2016" }}>
                  {lang === "id" ? "Memuat halaman..." : "Loading page..."}
                </span>
                <span style={{ marginTop: 4, fontSize: 12, color: "rgba(44,32,22,0.5)" }}>
                  {lang === "id" ? "Mohon tunggu sebentar" : "Please wait a moment"}
                </span>
              </div>
            }>
              {tab==="dashboard"&&<DashboardView user={user} profile={profile} activeWorkspace={workspace} content={filtered} theme={currentTheme} setTab={setTab} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} year={year} month={month} openEdit={openEdit} openAdd={openAdd} />}
              {tab==="content_planner"&&contentTab==="month"&&<MonthView year={year} month={month} monthContent={monthContent} filtered={filtered} openEdit={openEdit} openAdd={openAdd} showHolidays={showHolidays} holidays={combinedHolidays} customEvents={workspace?.settings?.customEvents || []} onEditCustomEvent={(ev: any) => { if (workspace?.userRole === "viewer" || workspace?.userRole === "commenter") { alert("Akses ditolak: Anda tidak memiliki izin untuk mengelola event."); return; } setEditingEvent(ev); setShowEventModal(true); }} pillars={pillars} platforms={platforms} pics={pics} isRestricted={isRestricted} showArchived={showArchived} contentTypes={contentTypes} moveItemDate={moveItemDate} />}
              {tab==="content_planner"&&contentTab==="board"&&<BoardView year={year} month={month} content={content} filtered={filtered} openEdit={openEdit} openAdd={openAdd} statuses={statuses} pillars={pillars} platforms={platforms} search={search} isRestricted={isRestricted} showArchived={showArchived} moveItemStatus={moveItemStatus} />}
              {tab==="content_planner"&&contentTab==="timeline"&&<TimelineView year={year} month={month} content={content} filtered={filtered} openEdit={openEdit} openAdd={openAdd} pillars={pillars} platforms={platforms} showHolidays={showHolidays} holidays={combinedHolidays} customEvents={workspace?.settings?.customEvents || []} onEditCustomEvent={(ev: any) => { if (workspace?.userRole === "viewer" || workspace?.userRole === "commenter") { alert("Akses ditolak: Anda tidak memiliki izin untuk mengelola event."); return; } setEditingEvent(ev); setShowEventModal(true); }} isRestricted={isRestricted} showArchived={showArchived} />}
              {tab==="content_planner"&&contentTab==="table"&&<TableView userProfile={profile} planDetails={planDetails} filtered={filtered} openEdit={openEdit} archiveItem={archiveItem} unarchiveItem={unarchiveItem} deleteItem={deleteItem} pillars={pillars} platforms={platforms} showArchived={showArchived} search={search} bulkIds={bulkIds} setBulkIds={setBulkIds} onBulk={handleBulkActions} isRestricted={isRestricted}/>}
              {tab.startsWith("social")&&<SocialStudioView tab={tab} workspaceId={workspace?.id} content={content} workspace={workspace} user={user} profile={profile} planDetails={planDetails} setTab={setTab} onOpenModal={(data:any) => setModal({mode: "add", data: {...emptyItem(year,month,new Date().getDate(),pillars,platforms,pics,statuses,contentTypes), ...data}})}/> }
              {(tab === "analytics" || tab.startsWith("analytics-")) && (
                <AnalyticsView
                  content={content}
                  pillars={pillars}
                  platforms={platforms}
                  contentTypes={contentTypes}
                  pics={pics}
                  statuses={statuses}
                  openEdit={openEdit}
                  isRestricted={isRestricted}
                  isTutorialActive={tutorialActive}
                  userProfile={profile}
                  planDetails={planDetails}
                  workspaceId={workspace?.id}
                  workspaceSettings={workspace?.settings}
                  onUpdateSettings={updateWsSettings}
                  activeSubTab={tab.split("-")[1] || "overview"}
                  setActiveSubTab={(newSubTab: string) => {
                    setTab(`analytics-${newSubTab}`);
                  }}
                />
              )}
              {tab==="soc_hub"&&<SocHubView user={user} profile={profile} />}
              {tab==="settings"&&<SettingsPanel 
                initialSettings={{pillars, platforms, contentTypes, pics, statuses, holidays, holidayApis, customEvents: workspace?.settings?.customEvents || [], showHolidays: workspace?.settings?.showHolidays ?? true}} 
                onSave={async (d:any) => {
                  await updateWsSettings(d);
                  setIsSettingsDirty(false);
                }}
                onSeed={() => setContent(makeSeed())} 
                isRestricted={isRestricted}
                profile={profile}
                onUpdateProfile={onUpdateProfile}
                onDirty={setIsSettingsDirty}
                onLeave={() => handleLeaveWorkspace(workspace)}
                onDelete={() => handleDeleteWorkspace(workspace)}
                isOwner={workspace?.ownerId === user?.uid || workspace?.createdBy === user?.uid}
                planDetails={planDetails}
                activeWorkspace={workspace}
                onBack={() => setTab("dashboard")}
              />}
              {tab==="admin"&&<AdminPanel userProfile={profile} onLogout={async ()=>{ 
                try { await signOut(auth); } catch(e) {} finally { window.location.href = "/login"; window.location.reload(); }
              }} />}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </div>
      </div>

      <AnimatePresence>
        {shareModal && <Suspense fallback={null}><ShareWorkspaceModal key="share" workspace={workspace} userProfile={profile} planDetails={planDetails} onClose={()=>setShareModal(false)} /></Suspense>}
        </AnimatePresence>
      <AnimatePresence>
        {createWsModal && <Suspense fallback={null}><CreateWorkspaceModal key="createWs" workspaces={workspaces} onClose={()=>setCreateWsModal(false)} onCreate={handleCreateWorkspace} /></Suspense>}
        </AnimatePresence>
      <AnimatePresence>
        {modal && <Suspense fallback={null}><ContentModal key="content" modal={modal} workspace={workspace} userProfile={profile} planDetails={planDetails} onSave={handleSave} onClose={()=>setModal(null)} onArchive={archiveItem} onRestore={unarchiveItem} onDelete={deleteItem} onDuplicate={(data:any) => {
          const duplicatedData = {...data, id: gid(), title: data.title + " (Copy)", status: statuses[0]?.name || "Draft", metrics: {}, adsMetrics: {}};
          handleSave(duplicatedData, true);
          setTimeout(() => setSaveMsg("Konten berhasil diduplikasi."), 100);
          setTimeout(()=>setSaveMsg(""), 3100);
        }} pillars={pillars} platforms={platforms} contentTypes={contentTypes} pics={pics} statuses={statuses} isRestricted={isRestricted} onSettingUpdate={updateWsSettings} /></Suspense>}
        </AnimatePresence>
      <AnimatePresence>
        {showCsv && <Suspense fallback={null}><CsvModal key="csv" onClose={()=>setShowCsv(false)} onImport={handleBulkImport} workspaceId={workspace?.id} pillars={pillars} platforms={platforms} contentTypes={contentTypes} pics={pics} statuses={statuses} existingContent={content} /></Suspense>}
        </AnimatePresence>
      <AnimatePresence>
        {showEventModal && <QuickAddEventModal key="quckAddEvent" workspace={workspace} onClose={() => { setShowEventModal(false); setEditingEvent(null); }} onSaveSettings={updateWsSettings} initialEvent={editingEvent} />}
        </AnimatePresence>
      <AnimatePresence>
        {exportModal && <motion.div key="export" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{ duration: 0.15 }} style={{position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.8)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16}}>
          <motion.div initial={{scale:0.95, opacity:0, y:20}} animate={{scale:1, opacity:1, y:0}} exit={{scale:0.95, opacity:0, y:20}} transition={{ type: "spring", damping: 25, stiffness: 300 }} style={{...CARD({width:"100%", maxWidth:440, padding:32, borderRadius:24, boxShadow:"0 20px 40px rgba(0,0,0,0.2)", position:"relative"}), background: "#FFFFFF", backdropFilter: "none", WebkitBackdropFilter: "none"}}>
             <h3 style={{fontSize:20, fontWeight:700, marginBottom:24, color:"#2C2016"}}>{lang === "id" ? "Ekspor Data Konten" : "Export Content Data"}</h3>
             
             <div style={{display:"flex", flexDirection:"column", gap:16, marginBottom:24}}>
                  <div style={{display:"flex", gap:12}}>
                    <label style={{
                      display: "flex", alignItems: "center", gap: 10, flex: 1, padding: "14px 18px", borderRadius: 16, border: "1px solid rgba(44,32,22,0.08)", cursor: "pointer", background: exOption === "all" ? "rgba(var(--theme-primary-rgb), 0.04)" : "white",
                      fontWeight: exOption === "all" ? 700 : 500, color: "#2C2016", transition: "all 0.2s"
                    }}>
                      <input type="radio" name="exOpt" checked={exOption === "all"} onChange={()=>setExOption("all")} style={{display:"none"}} />
                      <div style={{width:18, height:18, borderRadius:"50%", border: exOption === "all" ? "5px solid var(--theme-primary)" : "2px solid rgba(44,32,22,0.2)"}}></div>
                      {lang === "id" ? "Semua Data" : "All Data"}
                    </label>

                    <label style={{
                      display: "flex", alignItems: "center", gap: 10, flex: 1, padding: "14px 18px", borderRadius: 16, border: "1px solid rgba(44,32,22,0.08)", cursor: "pointer", background: exOption === "filter" ? "rgba(var(--theme-primary-rgb), 0.04)" : "white",
                      fontWeight: exOption === "filter" ? 700 : 500, color: "#2C2016", transition: "all 0.2s"
                    }}>
                      <input type="radio" name="exOpt" checked={exOption === "filter"} onChange={()=>setExOption("filter")} style={{display:"none"}} />
                      <div style={{width:18, height:18, borderRadius:"50%", border: exOption === "filter" ? "5px solid var(--theme-primary)" : "2px solid rgba(44,32,22,0.2)"}}></div>
                      {lang === "id" ? "Filter Spesifik" : "Specific Filter"}
                    </label>
                  </div>

                  <AnimatePresence>
                    {exOption === "filter" && (
                       <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:"auto"}} exit={{opacity:0, height:0}} style={{overflow:"hidden"}}>
                         <div style={{display:"flex", flexDirection:"column", gap:16, marginTop: 4, padding: 16, background: "rgba(44,32,22,0.02)", border: "1px solid rgba(44,32,22,0.06)", borderRadius: 16}}>
                           <div style={{display:"flex", gap:12}}>
                             <div style={{flex:1}}>
                               <label style={{display:"block", fontSize:12, fontWeight:700, marginBottom:6, color:"rgba(44,32,22,0.7)"}}>{lang === "id" ? "Dari Tanggal" : "From Date"}</label>
                               <input type="date" value={exStart} onChange={(e)=>setExStart(e.target.value)} style={{width:"100%", padding:"10px 14px", borderRadius:10, border:"1px solid rgba(44,32,22,0.1)", fontSize:13, outline:"none", fontFamily:"inherit", color:"#2C2016"}} />
                             </div>
                             <div style={{flex:1}}>
                               <label style={{display:"block", fontSize:12, fontWeight:700, marginBottom:6, color:"rgba(44,32,22,0.7)"}}>{lang === "id" ? "Sampai Tanggal" : "To Date"}</label>
                               <input type="date" value={exEnd} onChange={(e)=>setExEnd(e.target.value)} style={{width:"100%", padding:"10px 14px", borderRadius:10, border:"1px solid rgba(44,32,22,0.1)", fontSize:13, outline:"none", fontFamily:"inherit", color:"#2C2016"}} />
                             </div>
                           </div>
                           <div>
                             <label style={{display:"block", fontSize:12, fontWeight:700, marginBottom:6, color:"rgba(44,32,22,0.7)"}}>{lang === "id" ? "Platform Tertentu" : "Specific Platform"}</label>
                             <select value={exPlatform} onChange={(e)=>setExPlatform(e.target.value)} style={{width:"100%", padding:"10px 14px", borderRadius:10, border:"1px solid rgba(44,32,22,0.1)", fontSize:13, outline:"none", fontFamily:"inherit", color:"#2C2016", backgroundColor:"white"}}>
                               <option value="All">{lang === "id" ? "Semua Platform" : "All Platforms"}</option>
                               {platforms.map((p: any, i) => { const val = typeof p === "string" ? p : (p.name || p.id || ""); return <option key={val || i} value={val}>{val}</option>; })}
                             </select>
                           </div>
                         </div>
                       </motion.div>
                    )}
                  </AnimatePresence>
             </div>

             <div style={{display:"flex",gap:12}}>
                  <button className="hover-scale" disabled={isExportLoading} onClick={()=>setExportModal(false)} style={{...B(false), flex:1, height:48, fontSize:14, borderRadius:24}}>{lang === "id" ? "Batal" : "Cancel"}</button>
                  <button className="btn-hover hover-scale" disabled={isExportLoading} onClick={async () => {
                 if (isExportLoading) return;
                 setIsExportLoading(true);
                 let toExport = [];
                 try {
                     const contentRef = collection(db, "workspaces", workspace.id, "content");
                     const snap = await getDocs(contentRef);
                     toExport = snap.docs.map(doc => ({ ...doc.data(), id: doc.id }));
                 } catch (e) {
                     console.error("Failed to fetch all content for export:", e);
                     toExport = [...content];
                 }

                 if (exOption === "filter") {
                    if (exStart && exEnd) {
                        const pad = (num) => String(num).padStart(2, "0");
                        toExport = toExport.filter((c) => {
                           const itemDateStr = `${c.year}-${pad(c.month)}-${pad(c.day)}`;
                           return itemDateStr >= exStart && itemDateStr <= exEnd;
                        });
                     }
                    if (exPlatform !== "All") {
                       toExport = toExport.filter((c) => String(c.platform).includes(exPlatform));
                    }
                 }

                 if (toExport.length === 0) {
                    alert(lang === "id" ? "Tidak ada data yang sesuai dengan filter tersebut." : "No data matching the filter.");
                    setIsExportLoading(false);
                    return;
                 }

                 // Urutkan data secara kronologis (dari tanggal paling lama ke paling baru)
                 toExport.sort((a, b) => {
                     const yA = Number(a.year) || 0;
                     const yB = Number(b.year) || 0;
                     if (yA !== yB) return yA - yB;

                     const mA = Number(a.month) || 0;
                     const mB = Number(b.month) || 0;
                     if (mA !== mB) return mA - mB;

                     const dA = Number(a.day) || 0;
                     const dB = Number(b.day) || 0;
                     if (dA !== dB) return dA - dB;

                     const hA = Number(a.uploadHour) || 0;
                     const hB = Number(b.uploadHour) || 0;
                     if (hA !== hB) return hA - hB;

                     const minA = Number(a.uploadMinute) || 0;
                     const minB = Number(b.uploadMinute) || 0;
                     return minA - minB;
                 });

                 const exportData = toExport.map((c: any) => {
                      const isId = lang === "id";
                      const row: any = {};
                      
                      // 1. Metadata & Jadwal
                      row[isId ? "ID System (Jangan Diubah)" : "System ID (Do Not Edit)"] = c.id || "";
                      row[isId ? "Platform" : "Platform"] = c.platform || "";
                      row[isId ? "Tanggal (1-31)" : "Date (1-31)"] = c.day || 1;
                      row[isId ? "Bulan (1-12)" : "Month (1-12)"] = c.month || 1;
                      row[isId ? "Tahun" : "Year"] = c.year || 2025;
                      row[isId ? "Jam (0-23)" : "Hour (0-23)"] = c.uploadHour || 9;
                      row[isId ? "Menit" : "Minute"] = c.uploadMinute || 0;
                      row[isId ? "Judul Konten" : "Content Title"] = c.title || "";
                      row[isId ? "PIC" : "PIC"] = c.pic || "";
                      row[isId ? "Pillar" : "Pillar"] = c.pillar || "";
                      row[isId ? "Tipe Konten" : "Content Type"] = c.contentType || "";
                      row[isId ? "Status Konten" : "Content Status"] = c.status || "";
                      row[isId ? "Status Ads" : "Ads Status"] = c.isAds ? "Y" : "N";
                      
                      // 2. Copywriting & Strategy
                      row[isId ? "Objective" : "Objective"] = htmlToPlainText(c.objective || "");
                      row[isId ? "Hook" : "Hook"] = htmlToPlainText(c.hook || "");
                      row[isId ? "CTA" : "CTA"] = htmlToPlainText(c.cta || "");
                      row[isId ? "Caption" : "Caption"] = htmlToPlainText(c.caption || "");
                      row[isId ? "Brief Konten" : "Content Brief"] = htmlToPlainText(c.briefCopywriting || "");
                      
                      // 3. Assets & Reference
                      row[isId ? "Link Aset" : "Asset Link"] = c.linkAsset || "";
                      row[isId ? "Link Sosmed" : "Social Media Link"] = c.linkSosmed || c.linkUpload || "";
                      row[isId ? "Teks Referensi" : "Reference Text"] = c.referenceText || "";
                      row[isId ? "Link Referensi" : "Reference Link"] = Array.isArray(c.referenceLinks) ? c.referenceLinks.join(", ") : "";
                      
                      // 4. Organic Metrics
                      row[isId ? "Views (Organik)" : "Views (Organic)"] = c.metrics?.views || 0;
                      row[isId ? "Reach (Organik)" : "Reach (Organic)"] = c.metrics?.reach || 0;
                      row[isId ? "Likes (Organik)" : "Likes (Organic)"] = c.metrics?.likes || 0;
                      row[isId ? "Comments (Organik)" : "Comments (Organic)"] = c.metrics?.comments || 0;
                      row[isId ? "Reposts (Organik)" : "Reposts (Organic)"] = c.metrics?.reposts || 0;
                      row[isId ? "Shares (Organik)" : "Shares (Organic)"] = c.metrics?.shares || 0;
                      row[isId ? "Saves (Organik)" : "Saves (Organic)"] = c.metrics?.saves || 0;
                      row[isId ? "Profile Visits (Organik)" : "Profile Visits (Organic)"] = c.metrics?.profileVisits || 0;
                      row[isId ? "Bio Link Taps (Organik)" : "Bio Link Taps (Organic)"] = c.metrics?.bioLinkTaps || 0;
                      row[isId ? "Follows (Organik)" : "Follows (Organic)"] = c.metrics?.follows || 0;

                      // 5. Ads Metrics
                      row[isId ? "Views (Ads)" : "Views (Ads)"] = c.adsMetrics?.views || 0;
                      row[isId ? "Reach (Ads)" : "Reach (Ads)"] = c.adsMetrics?.reach || 0;
                      row[isId ? "Likes (Ads)" : "Likes (Ads)"] = c.adsMetrics?.likes || 0;
                      row[isId ? "Comments (Ads)" : "Comments (Ads)"] = c.adsMetrics?.comments || 0;
                      row[isId ? "Reposts (Ads)" : "Reposts (Ads)"] = c.adsMetrics?.reposts || 0;
                      row[isId ? "Shares (Ads)" : "Shares (Ads)"] = c.adsMetrics?.shares || 0;
                      row[isId ? "Saves (Ads)" : "Saves (Ads)"] = c.adsMetrics?.saves || 0;
                      row[isId ? "Profile Visits (Ads)" : "Profile Visits (Ads)"] = c.adsMetrics?.profileVisits || 0;
                      row[isId ? "Bio Link Taps (Ads)" : "Bio Link Taps (Ads)"] = c.adsMetrics?.bioLinkTaps || 0;
                      row[isId ? "Follows (Ads)" : "Follows (Ads)"] = c.adsMetrics?.follows || 0;
                      row[isId ? "Clicks (Ads)" : "Clicks (Ads)"] = c.adsMetrics?.clicks || 0;
                      row[isId ? "Conversions (Ads)" : "Conversions (Ads)"] = c.adsMetrics?.conversions || 0;
                      row[isId ? "Conversations Started (Ads)" : "Conversations Started (Ads)"] = c.adsMetrics?.msgConvStarted || 0;
                      row[isId ? "3s Plays (Ads)" : "3s Plays (Ads)"] = c.adsMetrics?.threeSecPlays || 0;
                      row[isId ? "Spend Budget (Ads)" : "Spend Budget (Ads)"] = c.adsMetrics?.spendBudget || 0;
                      row[isId ? "Daily Budget (Ads)" : "Daily Budget (Ads)"] = c.adsMetrics?.dailyBudget || 0;
                      row[isId ? "Duration Days (Ads)" : "Duration Days (Ads)"] = c.adsMetrics?.duration || 0;
                      row[isId ? "CPR Profile Visit (Ads)" : "CPR Profile Visit (Ads)"] = c.adsMetrics?.cprProfileVisit || 0;
                      row[isId ? "Audience Target (Ads)" : "Audience Target (Ads)"] = c.adsMetrics?.audience || "";


                      // Add custom fields
                      if (Array.isArray(c.customFields)) {
                          c.customFields.forEach((cf) => {
                              if (cf && cf.name) {
                                  row[`Field: ${cf.name}`] = cf.value || "";
                              }
                          });
                      }

                      return row;
                 });
                 import("xlsx").then((XLSX) => {
                     const ws = XLSX.utils.json_to_sheet(exportData);
                     const wb = XLSX.utils.book_new();
                     XLSX.utils.book_append_sheet(wb, ws, "Content");
                     
                     // Format nama file: Export_Content_[Nama Workspace]_[Tanggal Ekspor YYYY-MM-DD].xlsx
                     const now = new Date();
                     const padDate = (num) => String(num).padStart(2, "0");
                     const formattedDate = `${now.getFullYear()}-${padDate(now.getMonth() + 1)}-${padDate(now.getDate())}`;
                     const safeWorkspaceName = (workspace?.name || "Workspace").replace(/[^a-zA-Z0-9_-]/g, "_");
                     const finalFileName = `Export_Content_${safeWorkspaceName}_${formattedDate}.xlsx`;
                     
                     XLSX.writeFile(wb, finalFileName);
                     setExportModal(false);
                     setIsExportLoading(false);
                 }).catch((err) => {
                     console.error("XLSX load error:", err);
                     setIsExportLoading(false);
                 });
              }} style={{...B(true, "var(--theme-primary)"), flex:2, height:48, fontSize:14, borderRadius:24, display:"flex", alignItems:"center", justifyContent:"center", gap:8}}>
                  {isExportLoading && <Loader2 className="animate-spin" size={16} />}
                  {isExportLoading ? (lang === "id" ? "Memproses..." : "Processing...") : (lang === "id" ? "Unduh File Excel" : "Download Excel File")}
              </button>
             </div>
          </motion.div>
        </motion.div>}
        </AnimatePresence>
      <AnimatePresence>
        {isImporting && (
          <motion.div key="importing" initial={{opacity:0, y: -20}} animate={{opacity:1, y: 0}} exit={{opacity:0, y: -20}} style={{position:"fixed", top:24, left:"50%", transform:"translateX(-50%)", background:"white", zIndex:999999, display:"flex", alignItems:"center", gap: 12, padding: "12px 24px", borderRadius: 100, boxShadow:"0 10px 25px rgba(0,0,0,0.1)", border: "1px solid rgba(0,0,0,0.05)"}}>
            {importStatus.state === 'loading' && <Loader2 className="animate-spin" color="#3B82F6" size={18} />}
            {importStatus.state === 'success' && <CheckCircle2 color="#10B981" size={18} />}
            {importStatus.state === 'error' && <AlertTriangle color="#EF4444" size={18} />}
            <span style={{fontSize: 14, fontWeight: 600, color: "#111827"}}>{importStatus.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmAction && (
          <motion.div key="confirm" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.8)", zIndex:999999, display:"flex", alignItems:"center", justifyContent:"center"}}>
            <motion.div initial={{scale:0.95, opacity:0, y:20}} animate={{scale:1, opacity:1, y:0}} exit={{scale:0.95, opacity:0, y:20}} transition={{ type: "spring", damping: 25, stiffness: 300 }} style={{...CARD({width:400, padding:32, borderRadius:24, boxShadow:"0 20px 40px rgba(0,0,0,0.2)", textAlign:"center"}), background: "#FFFFFF", backdropFilter: "none", WebkitBackdropFilter: "none"}}>
               <h3 style={{fontSize:20, fontWeight:700, marginBottom:16, color: (confirmAction.title.includes("Hapus") || confirmAction.title.includes("Delete")) ? "#9C2B4E" : "#2C2016"}}>{confirmAction.title}</h3>
               <p style={{fontSize:14, color:"rgba(44,32,22,0.6)", marginBottom:24, lineHeight:1.5}}>{confirmAction.msg}</p>
               <div style={{display:"flex",gap:12,justifyContent:"center"}}>
                 <button className="hover-scale" onClick={()=>setConfirmAction(null)} style={{...B(false), flex:1, height:48, fontSize:14, borderRadius:24}}>{lang === "id" ? "Batal" : "Cancel"}</button>
                 <button className="hover-scale btn-hover" onClick={()=>{confirmAction.onConfirm(); setConfirmAction(null);}} style={{...B(true, (confirmAction.title.includes("Hapus") || confirmAction.title.includes("Delete")) ? "#9C2B4E" : "#3B82F6"), flex:1, height:48, fontSize:14, borderRadius:24}}>{(confirmAction.title.includes("Hapus") || confirmAction.title.includes("Delete")) ? ((confirmAction.title.includes("Keluar") || confirmAction.title.includes("Leave")) ? (lang === "id" ? "Keluar" : "Leave") : (lang === "id" ? "Hapus" : "Delete")) : (lang === "id" ? "Lanjutkan" : "Continue")}</button>
               </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>

      <AnimatePresence>
        {pendingTab && (
          <motion.div key="unsaved" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", zIndex:1001, display:"flex", alignItems:"center", justifyContent:"center", padding:16}}>
            <motion.div initial={{scale:0.95, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.95, opacity:0}} transition={{ type: "spring", duration: 0.4 }} style={{background: "white", borderRadius: 24, width: "100%", maxWidth: 380, padding: 24, textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.2)"}}>
               <div style={{ width: 48, height: 48, borderRadius: 24, background: "#FFFBEB", color: "#D97706", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                 <AlertTriangle size={24} />
               </div>
               <h3 style={{fontSize: 16, fontWeight: 800, color: "#111827", marginBottom: 6}}>{lang === "id" ? "Simpan Perubahan?" : "Save Changes?"}</h3>
               <p style={{fontSize: 12, color: "#6B7280", lineHeight: 1.5, marginBottom: 24, fontWeight: 500}}>
                 {lang === "id" ? "Anda memiliki perubahan yang belum disimpan. Ingin menyimpannya sekarang sebelum meninggalkan halaman ini?" : "You have unsaved changes. Want to save them now before leaving this page?"}
               </p>
               <div style={{display:"flex", gap:12}}>
                 <button className="hover-scale" onClick={() => {
                    setTab(pendingTab!);
                    setIsSettingsDirty(false);
                    setPendingTab(null);
                 }} style={{ flex: 1, background: "#F9FAFB", color: "#374151", fontWeight: 800, padding: "12px 0", borderRadius: 12, border: "1px solid #E5E7EB", cursor: "pointer", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {lang === "id" ? "Abaikan" : "Discard"}
                 </button>
                 <button className="hover-scale" onClick={async () => {
                    setPendingTab(null);
                 }} style={{ flex: 1, background: "var(--theme-primary)", color: "white", fontWeight: 800, padding: "12px 0", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", boxShadow: "0 4px 12px rgba(var(--theme-primary-rgb), 0.2)" }}>
                    {lang === "id" ? "Tetap di Sini" : "Stay Here"}
                 </button>
               </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>
      <AnimatePresence>
        {saveMsg && (
          <motion.div key="saveMsgToast" initial={{opacity:0, y:50}} animate={{opacity:1, y:0}} exit={{opacity:0, y:50}} 
            style={{position:"fixed", bottom:40, right:40, background:"#2D7A5E", color:"white", padding:"16px 24px", borderRadius:16, display:"flex", alignItems:"center", gap:12, boxShadow:"0 10px 30px rgba(45,122,94,0.3)", zIndex:9999, fontWeight:700}}>
            <CheckCircle2 color="white" size={20} />
            {saveMsg}
          </motion.div>
        )}
        </AnimatePresence>

      <AnimatePresence>
        {showBroadcastModal && activeBroadcast && (
          <motion.div 
            key="broadcastDetailModal" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            style={{
              position: "fixed", 
              inset: 0, 
              background: "rgba(0,0,0,0.6)", 
              backdropFilter: "blur(4px)", 
              WebkitBackdropFilter: "blur(4px)", 
              zIndex: 100000, 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              padding: 16
            }}
            onClick={() => setShowBroadcastModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 20 }} 
              transition={{ type: "spring", damping: 25, stiffness: 350 }} 
              style={{
                background: "white", 
                borderRadius: 24, 
                width: "100%", 
                maxWidth: 520, 
                padding: 32, 
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                position: "relative"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const mStyle = getBroadcastStyles(activeBroadcast);
                return (
                  <>
                    {/* Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <div style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          background: mStyle.iconBg,
                          color: mStyle.iconColor,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0
                        }}>
                          <Megaphone size={20} />
                        </div>
                        <div>
                          <span style={{
                            fontSize: 10,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            color: mStyle.iconColor,
                            background: mStyle.iconBg,
                            padding: "2px 8px",
                            borderRadius: 12,
                            display: "inline-block",
                            marginBottom: 4
                          }}>
                            {mStyle.badgeLabel}
                          </span>
                          <div style={{ fontSize: 12, color: "rgba(0,0,0,0.4)" }}>
                            {new Date(activeBroadcast.createdAt).toLocaleDateString(lang === "id" ? "id-ID" : "en-US", {
                              dateStyle: "medium"
                            })}
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => setShowBroadcastModal(false)}
                        style={{
                          background: "rgba(0,0,0,0.04)",
                          border: "none",
                          borderRadius: "50%",
                          width: 32,
                          height: 32,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          color: "#6B7280"
                        }}
                        className="hover-bg-gray-100 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {/* Content */}
                    <h3 style={{ fontSize: 20, fontWeight: 800, color: "#111827", marginBottom: 14, lineHeight: 1.3 }}>
                      {activeBroadcast.title}
                    </h3>
                    <div 
                      style={{ 
                        fontSize: 14, 
                        color: "#4B5563", 
                        lineHeight: 1.6, 
                        maxHeight: 300, 
                        overflowY: "auto", 
                        whiteSpace: "pre-wrap",
                        paddingRight: 8,
                        marginBottom: 28
                      }}
                      className="scrollbar-thin"
                    >
                      {activeBroadcast.desc}
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <button 
                        className="hover-scale btn-hover"
                        onClick={() => setShowBroadcastModal(false)}
                        style={{
                          ...B(true, mStyle.btnBg),
                          padding: "12px 28px",
                          borderRadius: 24,
                          fontSize: 14,
                          fontWeight: 700,
                          cursor: "pointer",
                          boxShadow: `0 4px 12px ${mStyle.btnBg}33`
                        }}
                      >
                        {lang === "id" ? "Selesai Membaca" : "Close"}
                      </button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <HubyTutorial 
        profile={profile} 
        onUpdateProfile={onUpdateProfile} 
        tab={tab} 
        setTab={setTab} 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onActiveChange={setTutorialActive}
      />
    </div>
  </div>
);
}

