import { useState, useEffect, useMemo, useRef } from "react";
import { HashRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import * as XLSX from "xlsx";
import { 
  MONTHS, YEARS, DP, DPL, DPIC, DST, DCT, DH, 
  gid, eng, fmtD, fmtT, emptyItem, makeSeed, 
  I, B, CARD, THEMES, htmlToPlainText
} from "./data";

import { 
  auth, db, onAuthStateChanged, signOut,
  doc, setDoc, getDoc, collection, collectionGroup, query, onSnapshot, deleteDoc, writeBatch, updateDoc,
  handleFirestoreError, testFirestoreConnection, where
} from "./firebase";

import { Header, NavBar, FilterBar, Sidebar } from "./Nav";
import { MonthView, WeekView, BoardView, TimelineView, TableView } from "./Views";
import { AnalyticsView } from "./AnalyticsView";
import { SocialStudioView } from "./SocialStudioView";
import { SocHubView } from "./SocHubView";
import { SettingsPanel, HOLIDAY_API_OPTIONS } from "./SettingsPanel";
import { AdminPanel } from "./AdminPanel";
import { ContentModal } from "./ContentModal";
import { CsvModal } from "./CsvModal";
import { AuthScreen } from "./AuthScreen";
import { UserProfile } from "./UserProfile";
import { BillingView } from "./BillingView";
import { ShareWorkspaceModal } from "./ShareWorkspaceModal";
import { CreateWorkspaceModal } from "./CreateWorkspaceModal";
import { DashboardView } from "./DashboardView";

import { TermsOfService, PrivacyPolicy } from "./TermsAndPrivacy";

import { motion, AnimatePresence } from "motion/react";

import { LandingPage } from "./LandingPage";
import { Calendar, Download, X } from "lucide-react";

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

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [systemConfig, setSystemConfig] = useState<any>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "config", "system"), (snap) => {
      if(snap.exists()) setSystemConfig(snap.data());
    }, (error) => {
      console.warn("config/system onSnapshot warn:", error.message);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    testFirestoreConnection();
    let unsubProfile: any = null;
    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      try {
        if (u) {
          // Check profile existence first to prevent flicker
          const snap = await getDoc(doc(db, "users", u.uid));
          if (snap.exists()) {
             const data = snap.data();
             setProfile(data);
             if (data.emailVerified !== u.emailVerified) {
               await setDoc(doc(db, "users", u.uid), { emailVerified: u.emailVerified }, { merge: true });
             }
             if (u.email?.toLowerCase() === "nalendraputra71@gmail.com" && data.role !== "admin") {
               await setDoc(doc(db, "users", u.uid), { role: "admin" }, { merge: true });
             }
             // Check onboarding
             if (!data.nickname) {
               setShowOnboarding(true);
             }
          }
          
          // Listen to profile for real-time updates
          unsubProfile = onSnapshot(doc(db, "users", u.uid), (snap) => {
            if (snap.exists()) {
              const data = snap.data();
              setProfile(data);
              if (data.nickname) setShowOnboarding(false);
            }
          }, (error) => {
             console.error("Profile onSnapshot error:", error);
          });
          setUser(u);
        } else {
          if (unsubProfile) unsubProfile();
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        setAuthLoading(false);
      }
    });
    return () => { unsubAuth(); if (unsubProfile) unsubProfile(); };
  }, []);

  const currentTheme = useMemo(() => {
    return THEMES.find(t => t.id === profile?.themeId) || THEMES[0];
  }, [profile?.themeId]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--theme-primary", currentTheme.primary);
    root.style.setProperty("--theme-primary-rgb", currentTheme.rgb);
    root.style.setProperty("--theme-sidebar", currentTheme.sidebar);
    root.style.setProperty("--theme-header", currentTheme.header || currentTheme.primary);
    root.style.setProperty("--theme-text", currentTheme.text);
    root.style.setProperty("--theme-gradient", currentTheme.gradient || currentTheme.primary);
    root.style.setProperty("--theme-bg", currentTheme.bg || "#FAFAF8");
    root.style.setProperty("--theme-text-main", currentTheme.textMain || "#2C2016");
    root.style.setProperty("--theme-text-sec", currentTheme.textSec || "rgba(44,32,22,0.6)");
    root.style.setProperty("--theme-border", currentTheme.border || "rgba(0,0,0,0.05)");
  }, [currentTheme]);

  const updateProfileSettings = async (updates: any) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "users", user.uid), updates);
    } catch (e: any) {
      console.error("Update profile error:", e);
      handleFirestoreError(e, 'update');
    }
  };

  if (authLoading) return <LoadingScreen />;

  return (
    <HashRouter>
      <Routes>
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/login" element={(user && profile) ? <Navigate to="/" /> : <AuthScreen currentUser={user && !profile ? user : null} onUserCreated={(u)=>setUser(u)} />} />
        <Route path="/profile" element={(user && profile) ? <CMSLayout><UserProfile userProfile={profile} activeWorkspace={null} onUpdate={setProfile} /></CMSLayout> : <Navigate to="/login" />} />
        <Route path="/billing" element={(user && profile) ? <CMSLayout><BillingView userProfile={profile} activeWorkspace={null} onUpdate={setProfile} /></CMSLayout> : <Navigate to="/login" />} />
        <Route path="/*" element={(user && profile) ? <CMSLayout><Dashboard user={user} profile={profile} onUpdateProfile={updateProfileSettings} currentTheme={currentTheme} systemConfig={systemConfig} /></CMSLayout> : <LandingPage />} />
      </Routes>
      <AnimatePresence>
        {showOnboarding && user && (
          <OnboardingOverlay 
            user={user} 
            profile={profile} 
            onUpdate={updateProfileSettings} 
          />
        )}
      </AnimatePresence>
    </HashRouter>
  );
}

function OnboardingOverlay({ user, profile, onUpdate }: any) {
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!nickname.trim()) return;
    setLoading(true);
    try {
      await onUpdate({ nickname: nickname.trim() });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{position:"fixed", inset:0, background:"rgba(255,255,255,0.9)", backdropFilter: "none", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:24}}>
       <motion.div initial={{opacity:0, scale:0.92, y:20}} animate={{opacity:1, scale:1, y:0}} style={{maxWidth:440, width:"100%", background:"white", padding:"48px 40px", borderRadius:40, boxShadow:"0 30px 60px rgba(44,32,22,0.15)", textAlign:"center", border:"1px solid rgba(44,32,22,0.05)"}}>
          <div style={{fontSize:48, marginBottom:24}}>✨</div>
          <h2 style={{fontSize:28, fontWeight:900, marginBottom:12, color:"#2C2016", letterSpacing:"-0.5px"}}>Selamat Datang! 👋</h2>
          <p style={{fontSize:15, color:"rgba(44,32,22,0.6)", marginBottom:32, lineHeight:1.6}}>Senang sekali Anda bergabung. Agar pengalaman mengelola konten jadi lebih akrab, boleh kami tahu siapa nama panggilan Anda?</p>
          
          <div style={{position:"relative", marginBottom:24}}>
            <input 
              value={nickname} 
              onChange={e=>setNickname(e.target.value)} 
              placeholder="Misal: Nalen, Putra, dll." 
              autoFocus
              onKeyDown={e=>e.key==="Enter"&&handleSave()}
              style={{
                width:"100%", borderRadius:20, border:"2px solid rgba(44,32,22,0.08)", padding:"18px 24px", fontSize:16, fontWeight:600, outline:"none", transition:"all 0.3s ease", textAlign:"center", background:"#FAFAF8"
              }}
              className="focus:border-[var(--theme-primary)] focus:bg-white"
            />
          </div>
          
          <button 
            onClick={handleSave} 
            disabled={loading || !nickname.trim()}
            style={{...B(true), width:"100%", height:60, borderRadius:30, fontSize:15, fontWeight:800, letterSpacing:0.5}}
            className="hover-scale shadow-lg"
          >
            {loading ? "Menyiapkan Workspace..." : "Mulai Gunakan Dashboard"}
          </button>
          
          <p style={{fontSize:11, color:"rgba(44,32,22,0.4)", marginTop:24, fontWeight:600}}>Anda dapat mengubah nama ini kapan saja di pengaturan profil.</p>
       </motion.div>
    </div>
  );
}

function LoadingScreen({ title }: { title?: string }) {
  return (
    <div style={{height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#FAFAFA",flexDirection:"column",gap:24}}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        style={{
          width: 40, height: 40, borderRadius: "50%",
          border: "4px solid rgba(var(--theme-primary-rgb), 0.1)",
          borderTopColor: "var(--theme-primary)"
        }}
      />
    </div>
  );
}

function CMSLayout({ children }: any) {
  return (
    <div style={{fontFamily:"'Inter', sans-serif",background:"var(--theme-bg, #FAFAFA)",minHeight:"100vh",color:"#2C2016"}}>
      {children}
    </div>
  );
}

function QuickAddEventModal({ workspace, onClose, onSaveSettings }: any) {
  const [name, setName] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [color, setColor] = useState("#3B82F6");
  const [monthly, setMonthly] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!name.trim() || !start || !end) {
      setError("Harap isi nama event, tanggal mulai, dan tanggal selesai.");
      return;
    }
    setError("");
    const newEv = {
      id: gid(),
      name: name.trim(),
      start,
      end,
      color,
      monthly
    };
    const currentEvents = workspace?.settings?.customEvents || [];
    const settingsUpdate = {
      customEvents: [...currentEvents, newEv]
    };
    await onSaveSettings(settingsUpdate);
    onClose();
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "none" }} />
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0, transition: { duration: 0.15 } }} style={{ position: "relative", zIndex: 1, background: "#FAFAF8", width: "90%", maxWidth: 440, borderRadius: 24, boxShadow: "0 24px 64px rgba(44,32,22,0.3)", overflow: "hidden", display: "flex", flexDirection: "column", maxHeight: "90vh" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(0,0,0,0.05)", background: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#2C2016", display: "flex", alignItems: "center", gap: 8 }}><Calendar size={20} /> Tambah Event Kustom</h3>
          <button onClick={onClose} style={{ background: "rgba(44,32,22,0.05)", border: "none", width: 32, height: 32, borderRadius: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} className="hover-scale">✕</button>
        </div>
        <div style={{ padding: 24, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
          {error && <div style={{ fontSize: 13, background: "#FDF5F8", color: "#9C2B4E", padding: "10px 14px", borderRadius: 10, fontWeight: 600 }}>{error}</div>}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, display: "block", color: "var(--theme-primary)" }}>Nama Event *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Launching Produk" style={I({ fontSize: 14 })} />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, display: "block", color: "var(--theme-primary)" }}>Start Date *</label>
              <input type="date" value={start} onChange={(e) => setStart(e.target.value)} style={I({ fontSize: 14, padding: "10px 12px" })} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, display: "block", color: "var(--theme-primary)" }}>End Date *</label>
              <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} style={I({ fontSize: 14, padding: "10px 12px" })} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, display: "block", color: "var(--theme-primary)" }}>Warna Event</label>
              <div style={{ width: 44, height: 44, borderRadius: 12, overflow: "hidden", border: "2px solid rgba(0,0,0,0.05)", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", flexShrink: 0 }}>
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: "200%", height: "200%", transform: "translate(-25%, -25%)", border: "none", cursor: "pointer", background: "none" }} />
              </div>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer", color: "#2C2016", fontWeight: 600, marginTop: 18 }}>
              <input type="checkbox" checked={monthly} onChange={e => setMonthly(e.target.checked)} style={{ width: 18, height: 18, accentColor: "var(--theme-primary)" }} />
              Ulangi Setiap Bulan
            </label>
          </div>
        </div>
        <div style={{ padding: "16px 24px", background: "white", borderTop: "1px solid rgba(0,0,0,0.05)", display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button onClick={onClose} style={{ ...B(false), fontSize: 13, padding: "10px 20px", height: "auto", borderRadius: 12 }}>Batal</button>
          <button onClick={handleSave} style={{ ...B(true, "var(--theme-primary)"), fontSize: 13, padding: "10px 24px", height: "auto", borderRadius: 12, color: "white", border: "none", fontWeight: 800 }}>Simpan Event</button>
        </div>
      </motion.div>
    </div>
  );
}

function Dashboard({ user, profile, onUpdateProfile, currentTheme, systemConfig }: any) {
  const [tab, setTab]           = useState("dashboard");
  const [contentTab, setContentTab] = useState("month");
  const [workspace, setWorkspace] = useState<any>(null);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [createWsModal, setCreateWsModal] = useState(false);
  const [content, setContent]   = useState<any[]>([]);
  const [wsLoading, setWsLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const [year, setYear]         = useState(new Date().getFullYear());
  const [month, setMonth]       = useState(new Date().getMonth() + 1);
  const [modal, setModal]       = useState<any>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [saveMsg, setSaveMsg]   = useState("");
  const [search, setSearch]     = useState("");
  const [confirmAction, setConfirmAction] = useState<{title:string, msg:string, onConfirm:()=>void}|null>(null);
  const [shareModal, setShareModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
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

  useEffect(() => {
    workspaceRef.current = workspace;
  }, [workspace]);

  const [showHolidays, setShowHolidays] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [filters, setFilters]   = useState({pillar:["All"],platform:["All"],contentType:["All"],pic:["All"],status:"All"});
  const [title, setTitle]       = useState("Content Management");
  const [tagline, setTagline]   = useState("Content Management System");
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
    window.addEventListener("openContentModal", handler);
    return () => window.removeEventListener("openContentModal", handler);
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

  const isRestricted = useMemo(() => {
    if (!profile?.activeUntil) return false;
    return new Date() > new Date(profile.activeUntil);
  }, [profile]);

  const isUnverified = useMemo(() => {
    return profile && (profile.emailVerified === false || !profile.nickname);
  }, [profile]);

  const handleCreateWorkspace = async (name: string, copyFromId: string | null = null) => {
    if (!user) return;
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
    setWsLoading(true);
    const q = query(collectionGroup(db, "members"), where("userId", "==", user.uid));
    
    let wsUnsubs: (() => void)[] = [];

    const unsubMembers = onSnapshot(q, (snap) => {
      try {
        const wsIds = snap.docs.filter(d => (d.data() as any).status !== "pending").map(d => (d.data() as any).workspaceId).filter(id => !!id);
        
        // Cleanup previous listeners
        wsUnsubs.forEach(u => u());
        wsUnsubs = [];

        if (wsIds.length === 0) {
          setWorkspaces([]);
          setWsLoading(false);
          return;
        }

        const results: Record<string, any> = {};
        const pendingIds = new Set(wsIds);

        wsIds.forEach(id => {
          const u = onSnapshot(doc(db, "workspaces", id), (wsSnap) => {
            if (wsSnap.exists()) {
              results[id] = { ...wsSnap.data(), id: wsSnap.id };
            } else {
              delete results[id];
            }
            pendingIds.delete(id);
            
            // Only update state once we have checked all initial documents
            if (pendingIds.size === 0) {
              const list = wsIds.map(wid => results[wid]).filter(w => !!w);
              setWorkspaces(list);
              
              const currentWs = workspaceRef.current;
              if (list.length > 0) {
                if (!currentWs || !list.find(w => w.id === currentWs.id)) {
                  setWorkspace(list[0]);
                }
              }
              setWsLoading(false);
            }
          }, (err: any) => {
            if (err.code === "permission-denied") {
               console.warn(`Workspace ${id} fetch warn: permission-denied`);
            } else {
               console.error(`Workspace ${id} fetch error:`, err);
            }
            pendingIds.delete(id);
            if (pendingIds.size === 0) {
              const listArr = wsIds.map(wid => results[wid]).filter(w => !!w);
              setWorkspaces(listArr);
              setWsLoading(false);
            }
          });
          wsUnsubs.push(u);
        });

      } catch (err) {
        console.error("Workspace processing error:", err);
        setWsLoading(false);
      }
    }, (error) => {
      console.error("onSnapshot CollectionGroup error:", error);
      setErrorMsg(error.message);
      setWsLoading(false);
    });

    return () => {
      unsubMembers();
      wsUnsubs.forEach(u => u());
    };
  }, [user]);

  useEffect(() => {
    if (!workspace?.id || !user?.uid) return;
    setContentLoading(true);
    setContent([]); // Fix stale cross-workspace content migration
    const wsRef = doc(db, "workspaces", workspace.id);
    const unsubWs = onSnapshot(wsRef, (snap) => {
       const data = snap.data();
       if (data) {
          // Update current workspace state with fresh data from DB
          setWorkspace((prev: any) => {
             if (JSON.stringify(prev?.settings) === JSON.stringify(data.settings) && prev?.name === data.name) return prev;
             return { ...prev, ...data, id: snap.id };
          });
          
          if (data.settings) {
            setTitle(data.settings.title !== undefined ? data.settings.title : "Content Management");
            setTagline(data.settings.tagline !== undefined ? data.settings.tagline : "Content Management System");
            
            // Real-time synchronization for all settings categories
            if (data.settings.pillars) setPillars(data.settings.pillars);
            if (data.settings.platforms) setPlatforms(data.settings.platforms);
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
    }, (error: any) => {
       if (error.code === "permission-denied") {
          console.warn("Workspace details onSnapshot warn: permission-denied");
       } else {
          console.error("Workspace details onSnapshot error:", error);
       }
    });

    const contentRef = collection(db, "workspaces", workspace.id, "content");
    const unsubContent = onSnapshot(query(contentRef), (snap) => {
      setContent(snap.docs.map(d => ({ ...d.data(), id: d.id })));
      setContentLoading(false);
    }, (e) => {
      handleFirestoreError(e, 'list', contentRef.path);
      setContentLoading(false);
    });

    return () => { unsubWs(); unsubContent(); };
  }, [workspace?.id, user?.uid]);

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
      if(closeModal) alert("Akses Terbatas: Silakan lengkapi nama panggilan dan verifikasi email Anda terlebih dahulu.");
      return;
    }
    const isNew = modal.mode === "add";
    const itemId = data.id || (isNew ? gid() : "");
    if (!itemId) return;
    
    // Clean up undefined values before saving to Firestore to prevent silent or synchronous failures
    const cleanData = { ...data };
    Object.keys(cleanData).forEach(key => {
        if (cleanData[key] === undefined) {
            delete cleanData[key];
        }
    });

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

    const itemData = { ...cleanData, id: itemId, workspaceId: workspace.id, userId: user?.uid || "" };
    console.log("Cleaned itemData:", itemData);
    
    try {
      await setDoc(doc(db, "workspaces", workspace.id, "content", itemId), itemData, { merge: true });
      console.log("Save successful!");
      if (closeModal) {
        setModal(null);
      } else if (isNew) {
        setModal({mode: "edit", data: itemData});
      }
    } catch (e: any) { 
      console.error("Save Error:", e);
      if(closeModal) alert("Gagal menyimpan data: " + e.message);
      if(closeModal) handleFirestoreError(e, isNew?'create':'update', null); 
    }
  };

  const moveItemDate = async (itemId: string, newDate: number) => {
    if (!workspace) return;
    if (isRestricted) return alert("Akses Terbatas: Fitur ini dikunci pada masa uji coba yang telah habis.");
    if (isUnverified) return alert("Akses Terbatas: Silakan lengkapi nama panggilan dan verifikasi email Anda terlebih dahulu.");
    try {
      await setDoc(doc(db, "workspaces", workspace.id, "content", itemId), { day: newDate }, { merge: true });
    } catch (e: any) {
      console.error(e);
      alert("Gagal memindahkan konten: " + e.message);
    }
  };

  const openEdit = (item:any) => setModal({mode:"edit",data:{...item,metrics:{...item.metrics}}});
  const openAdd  = (day:any) => {
    if (isRestricted) return alert("Akses Terbatas: Fitur ini dikunci pada masa uji coba yang telah habis.");
    if (isUnverified) return alert("Akses Terbatas: Silakan lengkapi nama panggilan dan verifikasi email Anda terlebih dahulu.");
    setModal({mode:"add",data:emptyItem(year,month,day,pillars,platforms,pics,statuses,contentTypes)});
  };
  const deleteItem = async (id:string, force:boolean = false) => { 
    if(!workspace || !id || isRestricted) return;
    
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
      title: "Hapus Konten?",
      msg: "Yakin ingin menghapus permanen konten ini? Tindakan ini tidak dapat dikembalikan.",
      onConfirm: doDelete
    });
  };

  const archiveItem = async (id:string) => {
    if(!workspace || !id) return;
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
    
    setConfirmAction({
      title: type === "delete" ? "Hapus Massal?" : type === "restore" ? "Pulihkan Massal?" : "Arsipkan Massal?",
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
    try {
      const wsRef = doc(db, "workspaces", workspace.id);
      const currentSettings = workspace.settings || {};
      const newSettings = { ...currentSettings };
      
      Object.keys(updates).forEach(k => {
        newSettings[k] = updates[k];
      });
      
      const fsUpdates: any = { settings: newSettings };
      if (updates.title) {
        fsUpdates.name = updates.title;
      }
      await updateDoc(wsRef, fsUpdates);
      
      if (updates.title) {
        document.title = updates.title;
      }
    } catch (e: any) {
      console.error("Update settings error:", e);
      handleFirestoreError(e, 'update');
    }
  };

  useEffect(() => {
    if (title) document.title = title;
  }, [title]);

  const handleBulkImport = async (items: any[]) => {
    if (!workspace) return;
    try {
      const CHUNK_SIZE = 450;
      for (let i = 0; i < items.length; i += CHUNK_SIZE) {
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
      setSaveMsg(`Berhasil mengimpor ${items.length} konten.`);
      setTimeout(()=>setSaveMsg(""), 3000);
    } catch (e) {
      handleFirestoreError(e, 'write');
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
          <div style={{maxWidth:500, fontSize:13, color:"#9C2B4E", background:"#F8EAF0", padding:16, borderRadius:12, fontWeight:500}}>
             {errorMsg.includes("index") ? 
               "Firebase sedang membuat indeks untuk pencarian workspace. Proses ini biasanya memakan waktu 1-2 menit. Silakan tunggu sebentar dan refresh halaman ini." : 
               `Oops! Terjadi kendala: ${errorMsg}`}
          </div>
        )}
        
        {errorMsg.includes("index") && (
          <button onClick={()=>window.location.reload()} className="hover-scale" style={{...B(true), padding:"10px 24px", borderRadius:24}}>Coba Refresh Sekarang</button>
        )}
        
        <button onClick={()=>{ signOut(auth).then(() => window.location.hash = "#/login"); }} className="hover-scale" style={{...B(false), fontSize:13, borderRadius:24, marginTop:12}}>Batal & Logout</button>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{display:"flex", height:"100vh", overflow:"hidden", background:"var(--theme-bg, #FAFAFA)"}}>
      <Sidebar 
        systemConfig={systemConfig}
        open={sidebarOpen} setOpen={setSidebarOpen} tab={tab} setTab={handleTabChange} 
        workspaces={workspaces} activeWorkspace={workspace} onWorkspaceSelect={setWorkspace} 
        user={user} profile={profile} onLogout={()=>{ signOut(auth).then(() => window.location.hash = "#/login"); }}
        title={title}
        onOpenSidebar={() => setSidebarOpen(true)}
        onLeaveWorkspace={handleLeaveWorkspace}
        onDeleteWorkspace={handleDeleteWorkspace}
        onCreateWorkspaceRequest={() => setCreateWsModal(true)}
        onRenameWorkspace={async (wsId: string, newName: string) => {
          try {
            await updateDoc(doc(db, "workspaces", wsId), { name: newName });
          } catch(e: any) { handleFirestoreError(e, 'update'); }
        }}
        onTitleChange={async (newTitle: string) => {
          setTitle(newTitle);
          await updateWsSettings({ title: newTitle });
        }}
      />
      {["dashboard", "content_planner", "analytics"].includes(tab) && (
        <div style={{ position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none", background: "radial-gradient(circle at 0% 0%, #E3F2FD 0%, transparent 50%), radial-gradient(circle at 100% 100%, #FFF3E0 0%, transparent 50%), radial-gradient(circle at 100% 0%, #F3E5F5 0%, transparent 50%), #FAFAFA" }} />
      )}
      <div style={{flex:1, minWidth:0, display:"flex", flexDirection:"column", height:"100vh", overflow: ["social-hub-ai", "soc_hub", "admin"].includes(tab) ? "hidden" : "auto", position:"relative", background: "transparent"}}>
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
        </AnimatePresence>

        {(!["dashboard", "settings", "admin", "soc_hub"].includes(tab) && !tab.startsWith("social")) && (
          <Header 
            profile={profile}
          />
        )}
      
      {isUnverified && (
        <div style={{background:"#FBF5E3", borderBottom:"1px solid rgba(166,124,28,0.1)", padding:"12px 24px", display:"flex", alignItems:"center", gap:12, zIndex:50}}>
          <span style={{fontSize:13, fontWeight:700, color:"#A67C12"}}>⚠️ Data Belum Lengkap:</span>
          <span style={{fontSize:13, color:"rgba(44,32,22,0.6)"}}>Silakan isi nama panggilan terlebih dahulu di awal aplikasi dan verifikasi email Anda untuk dapat menggunakan semua fitur CMS.</span>
          <button onClick={() => window.location.hash="/profile"} style={{background:"#A67C12", color:"white", border:"none", padding:"6px 14px", borderRadius:20, fontSize:12, fontWeight:800, cursor:"pointer"}}>Lengkapi Sekarang</button>
        </div>
      )}

      {tab === "content_planner" && (
        <NavBar 
          tab={tab} setTab={setTab} year={year} setYear={setYear} month={month} setMonth={setMonth} 
          contentTab={contentTab} setContentTab={setContentTab}
          onOpenAdd={()=>openAdd(1)} onOpenAddEvent={()=>setShowEventModal(true)} isRestricted={isRestricted}
          search={search} onSearch={setSearch} onShare={()=>setShareModal(true)} sidebarOpen={sidebarOpen}
        />
      )}
      
      {tab === "content_planner" && (
        <FilterBar 
          filters={filters} setFilters={setFilters} 
          pillars={pillars} platforms={platforms} contentTypes={contentTypes} pics={pics} statuses={statuses} 
          showHolidays={showHolidays} setShowHolidays={setShowHolidays} 
          showArchived={showArchived} setShowArchived={setShowArchived}
          onImportClick={()=>setShowCsv(true)}
          onExportClick={()=>setExportModal(true)}
          isRestricted={isRestricted}
          onSettingUpdate={updateWsSettings}
        />
      )}

      <div style={{padding: ["social-hub-ai", "soc_hub", "admin"].includes(tab) ? "0" : "20px 24px 56px", position: "relative", minHeight: 0, flex: ["social-hub-ai", "soc_hub", "admin"].includes(tab) ? 1 : "none", display: "flex", flexDirection: "column"}}>
        {isRestricted && (
          <div style={{background:"#F8EAF0",border:"1px solid #9C2B4E",color:"#9C2B4E",padding:"12px 24px",borderRadius:12,marginBottom:24,display:"flex",alignItems:"center",gap:12,fontWeight:600}}>
            🔒 Mode Terbatas: Masa aktif Anda telah habis. <span style={{flex:1}}></span>
            <button onClick={()=>window.location.hash="/billing"} style={{background:"#9C2B4E",color:"#fff",padding:"8px 16px",borderRadius:8,fontSize:14,border:"none",cursor:"pointer"}}>Berlangganan Untuk Selengkapnya</button>
          </div>
        )}
        <AnimatePresence mode="wait">
          <motion.div key={tab + "-" + contentTab} initial={{ opacity: 0, y: 5, scale: 0.99 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -5, scale: 0.99 }} transition={{ duration: 0.15, ease: "easeOut" }} style={{ flex: ["social-hub-ai", "soc_hub", "admin"].includes(tab) ? 1 : "none", minHeight: 0, display: "flex", flexDirection: "column" }}>

            {tab==="dashboard"&&<DashboardView user={user} profile={profile} activeWorkspace={workspace} content={filtered} theme={currentTheme} setTab={setTab} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} year={year} month={month} />}
            {tab==="content_planner"&&contentTab==="month"&&<MonthView year={year} month={month} monthContent={monthContent} filtered={filtered} openEdit={openEdit} openAdd={openAdd} showHolidays={showHolidays} holidays={combinedHolidays} customEvents={workspace?.settings?.customEvents || []} pillars={pillars} platforms={platforms} isRestricted={isRestricted} showArchived={showArchived} contentTypes={contentTypes} moveItemDate={moveItemDate} />}
            {tab==="content_planner"&&contentTab==="board"&&<BoardView year={year} month={month} content={content} filtered={filtered} openEdit={openEdit} openAdd={openAdd} statuses={statuses} pillars={pillars} platforms={platforms} search={search} isRestricted={isRestricted} showArchived={showArchived} />}
            {tab==="content_planner"&&contentTab==="timeline"&&<TimelineView year={year} month={month} content={content} filtered={filtered} openEdit={openEdit} openAdd={openAdd} pillars={pillars} platforms={platforms} showHolidays={showHolidays} holidays={combinedHolidays} isRestricted={isRestricted} showArchived={showArchived} />}
            {tab==="content_planner"&&contentTab==="table"&&<TableView filtered={filtered} openEdit={openEdit} archiveItem={archiveItem} unarchiveItem={unarchiveItem} deleteItem={deleteItem} pillars={pillars} platforms={platforms} showArchived={showArchived} search={search} bulkIds={bulkIds} setBulkIds={setBulkIds} onBulk={handleBulkActions} isRestricted={isRestricted}/>}
            {tab.startsWith("social")&&<SocialStudioView tab={tab} workspaceId={workspace?.id} content={content} workspace={workspace} user={user} profile={profile} onOpenModal={(data:any) => setModal({mode: "add", data: {...emptyItem(year,month,new Date().getDate(),pillars,platforms,pics,statuses,contentTypes), ...data}})}/> }
            {tab==="analytics"&&<AnalyticsView content={content} pillars={pillars} platforms={platforms} contentTypes={contentTypes} pics={pics} statuses={statuses} openEdit={openEdit} isRestricted={isRestricted}/>}
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
            />}
            {tab==="admin"&&<AdminPanel userProfile={profile} onLogout={()=>{ signOut(auth).then(() => window.location.hash = "#/login"); }} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {shareModal && <ShareWorkspaceModal key="share" workspace={workspace} userProfile={profile} onClose={()=>setShareModal(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {createWsModal && <CreateWorkspaceModal key="createWs" workspaces={workspaces} onClose={()=>setCreateWsModal(false)} onCreate={handleCreateWorkspace} />}
      </AnimatePresence>
      <AnimatePresence>
        {modal && <ContentModal key="content" modal={modal} onSave={handleSave} onClose={()=>setModal(null)} onArchive={archiveItem} onRestore={unarchiveItem} onDelete={deleteItem} onDuplicate={(data:any) => {
          const duplicatedData = {...data, id: gid(), title: data.title + " (Copy)", status: statuses[0]?.name || "Draft", metrics: {}, adsMetrics: {}};
          handleSave(duplicatedData, true);
          setTimeout(() => setSaveMsg("Konten berhasil diduplikasi."), 100);
          setTimeout(()=>setSaveMsg(""), 3100);
        }} pillars={pillars} platforms={platforms} contentTypes={contentTypes} pics={pics} statuses={statuses} isRestricted={isRestricted} onSettingUpdate={updateWsSettings} />}
      </AnimatePresence>
      <AnimatePresence>
        {showCsv && <CsvModal key="csv" onClose={()=>setShowCsv(false)} onImport={handleBulkImport} workspaceId={workspace?.id} pillars={pillars} platforms={platforms} contentTypes={contentTypes} pics={pics} statuses={statuses} existingContent={content} />}
      </AnimatePresence>
      <AnimatePresence>
        {showEventModal && <QuickAddEventModal key="quckAddEvent" workspace={workspace} onClose={() => setShowEventModal(false)} onSaveSettings={updateWsSettings} />}
      </AnimatePresence>
      <AnimatePresence>
        {exportModal && <motion.div key="export" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{ duration: 0.15 }} style={{position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.8)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16}}>
          <motion.div initial={{scale:0.95, opacity:0, y:20}} animate={{scale:1, opacity:1, y:0}} exit={{scale:0.95, opacity:0, y:20}} transition={{ type: "spring", damping: 25, stiffness: 300 }} style={{...CARD({width:"100%", maxWidth:440, padding:32, borderRadius:24, boxShadow:"0 20px 40px rgba(0,0,0,0.2)", position:"relative"}), background: "#FFFFFF", backdropFilter: "none", WebkitBackdropFilter: "none"}}>
             <button className="hover-scale" onClick={()=>setExportModal(false)} style={{position:"absolute",top:20,right:20,background:"rgba(44,32,22,0.05)",border:"none",borderRadius:"50%",width:32,height:32,cursor:"pointer",fontSize:18,color:"#2C2016",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
             <h3 style={{fontSize:20, fontWeight:700, margin:"0 0 8px", color:"#2C2016", display:"flex", alignItems:"center", gap:8}}><Download size={20} /> Ekspor Data (XLSX)</h3>
             <p style={{fontSize:14, color:"rgba(44,32,22,0.6)", marginBottom:24, lineHeight:1.5}}>Unduh data konten workspace <strong style={{color:"var(--theme-primary)"}}>{workspace?.name}</strong> dalam format Excel.</p>
             
             <div style={{display:"flex", flexDirection:"column", gap:16, marginBottom: 28, textAlign: "left"}}>
                <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12}}>
                  <label style={{
                    display:"flex", alignItems:"center", gap:10, fontSize:14, cursor:"pointer",
                    padding: 14, borderRadius: 12, border: exOption === "all" ? "2px solid var(--theme-primary)" : "1px solid rgba(44,32,22,0.1)",
                    background: exOption === "all" ? "rgba(var(--theme-primary-rgb), 0.05)" : "white",
                    fontWeight: exOption === "all" ? 700 : 500, color: "#2C2016", transition: "all 0.2s"
                  }}>
                    <input type="radio" name="exOpt" checked={exOption === "all"} onChange={()=>setExOption("all")} style={{display:"none"}} />
                    <div style={{width:18, height:18, borderRadius:"50%", border: exOption === "all" ? "5px solid var(--theme-primary)" : "2px solid rgba(44,32,22,0.2)"}}></div>
                    Semua Data
                  </label>
                  <label style={{
                    display:"flex", alignItems:"center", gap:10, fontSize:14, cursor:"pointer",
                    padding: 14, borderRadius: 12, border: exOption === "filter" ? "2px solid var(--theme-primary)" : "1px solid rgba(44,32,22,0.1)",
                    background: exOption === "filter" ? "rgba(var(--theme-primary-rgb), 0.05)" : "white",
                    fontWeight: exOption === "filter" ? 700 : 500, color: "#2C2016", transition: "all 0.2s"
                  }}>
                    <input type="radio" name="exOpt" checked={exOption === "filter"} onChange={()=>setExOption("filter")} style={{display:"none"}} />
                    <div style={{width:18, height:18, borderRadius:"50%", border: exOption === "filter" ? "5px solid var(--theme-primary)" : "2px solid rgba(44,32,22,0.2)"}}></div>
                    Filter Spesifik
                  </label>
                </div>

                <AnimatePresence>
                  {exOption === "filter" && (
                     <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:"auto"}} exit={{opacity:0, height:0}} style={{overflow:"hidden"}}>
                       <div style={{display:"flex", flexDirection:"column", gap:16, marginTop: 4, padding: 16, background: "rgba(44,32,22,0.02)", border: "1px solid rgba(44,32,22,0.06)", borderRadius: 16}}>
                         <div style={{display:"flex", gap:12}}>
                           <div style={{flex:1}}>
                             <label style={{display:"block", fontSize:12, fontWeight:700, marginBottom:6, color:"rgba(44,32,22,0.7)"}}>Dari Tanggal</label>
                             <input type="date" value={exStart} onChange={(e)=>setExStart(e.target.value)} style={{width:"100%", padding:"10px 14px", borderRadius:10, border:"1px solid rgba(44,32,22,0.1)", fontSize:13, outline:"none", fontFamily:"inherit", color:"#2C2016"}} />
                           </div>
                           <div style={{flex:1}}>
                             <label style={{display:"block", fontSize:12, fontWeight:700, marginBottom:6, color:"rgba(44,32,22,0.7)"}}>Sampai Tanggal</label>
                             <input type="date" value={exEnd} onChange={(e)=>setExEnd(e.target.value)} style={{width:"100%", padding:"10px 14px", borderRadius:10, border:"1px solid rgba(44,32,22,0.1)", fontSize:13, outline:"none", fontFamily:"inherit", color:"#2C2016"}} />
                           </div>
                         </div>
                         <div>
                           <label style={{display:"block", fontSize:12, fontWeight:700, marginBottom:6, color:"rgba(44,32,22,0.7)"}}>Platform Tertentu</label>
                           <select value={exPlatform} onChange={(e)=>setExPlatform(e.target.value)} style={{width:"100%", padding:"10px 14px", borderRadius:10, border:"1px solid rgba(44,32,22,0.1)", fontSize:13, outline:"none", fontFamily:"inherit", color:"#2C2016", backgroundColor:"white"}}>
                             <option value="All">Semua Platform</option>
                             {platforms.map((p:any) => <option key={p.id||p} value={p.name||p.id||p}>{p.name||p.id||p}</option>)}
                           </select>
                         </div>
                       </div>
                     </motion.div>
                  )}
                </AnimatePresence>
             </div>

             <div style={{display:"flex",gap:12}}>
                 <button className="hover-scale" onClick={()=>setExportModal(false)} style={{...B(false), flex:1, height:48, fontSize:14, borderRadius:24}}>Batal</button>
                 <button className="btn-hover hover-scale" onClick={() => {
                let toExport = content;
                if (exOption === "filter") {
                   if (exStart && exEnd) {
                      const sd = new Date(exStart);
                      const ed = new Date(exEnd);
                      toExport = toExport.filter((c:any) => {
                         const cd = new Date(c.year, c.month - 1, c.day);
                         return cd >= sd && cd <= ed;
                      });
                   }
                   if (exPlatform !== "All") {
                      toExport = toExport.filter((c:any) => String(c.platform).includes(exPlatform));
                   }
                }

                if (toExport.length === 0) {
                   alert("Tidak ada data yang sesuai dengan filter tersebut.");
                   return;
                }

                const exportData = toExport.map((c: any) => ({
                    "ID System (Jangan Diubah)": c.id || "",
                    "Judul Konten": c.title || "",
                    "Tanggal (1-31)": c.day || 1,
                    "Bulan (1-12)": c.month || 1,
                    "Tahun": c.year || 2025,
                    "Jam (0-23)": c.uploadHour || 9,
                    "Menit": c.uploadMinute || 0,
                    "Pillar": c.pillar || "",
                    "Platform": c.platform || "",
                    "Tipe Konten": c.contentType || "",
                    "PIC": c.pic || "",
                    "Status Konten": c.status || "",
                    "Status Ads": c.isAds ? "Y" : "N",
                    "Views": c.metrics?.views || 0,
                    "Reach": c.metrics?.reach || 0,
                    "Likes": c.metrics?.likes || 0,
                    "Comments": c.metrics?.comments || 0,
                    "Shares": c.metrics?.shares || 0,
                    "Saves": c.metrics?.saves || 0,
                    "Objective": htmlToPlainText(c.objective || ""),
                    "Brief Konten": htmlToPlainText(c.briefCopywriting || ""),
                    "Caption": htmlToPlainText(c.caption || ""),
                    "Link Aset": c.linkAsset || "",
                    "Link Sosmed": c.linkSosmed || c.linkUpload || "",
                    "Link Referensi": Array.isArray(c.referenceLinks) ? c.referenceLinks.join(", ") : ""
                }));
                const ws = XLSX.utils.json_to_sheet(exportData);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Content");
                XLSX.writeFile(wb, `Export_${workspace?.name}.xlsx`);
                setExportModal(false);
             }} style={{...B(true, "var(--theme-primary)"), flex:2, height:48, fontSize:14, borderRadius:24, display:"flex", alignItems:"center", justifyContent:"center", gap:8}}>Unduh File Excel</button>
             </div>
          </motion.div>
        </motion.div>}
      </AnimatePresence>
      <AnimatePresence>
        {confirmAction && (
          <motion.div key="confirm" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.8)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center"}}>
            <motion.div initial={{scale:0.95, opacity:0, y:20}} animate={{scale:1, opacity:1, y:0}} exit={{scale:0.95, opacity:0, y:20}} transition={{ type: "spring", damping: 25, stiffness: 300 }} style={{...CARD({width:400, padding:32, borderRadius:24, boxShadow:"0 20px 40px rgba(0,0,0,0.2)", textAlign:"center"}), background: "#FFFFFF", backdropFilter: "none", WebkitBackdropFilter: "none"}}>
               <h3 style={{fontSize:20, fontWeight:700, marginBottom:16, color: confirmAction.title.includes("Hapus") ? "#9C2B4E" : "#2C2016"}}>{confirmAction.title}</h3>
               <p style={{fontSize:14, color:"rgba(44,32,22,0.6)", marginBottom:24, lineHeight:1.5}}>{confirmAction.msg}</p>
               <div style={{display:"flex",gap:12,justifyContent:"center"}}>
                 <button className="hover-scale" onClick={()=>setConfirmAction(null)} style={{...B(false), flex:1, height:48, fontSize:14, borderRadius:24}}>Batal</button>
                 <button className="hover-scale btn-hover" onClick={()=>{confirmAction.onConfirm(); setConfirmAction(null);}} style={{...B(true, confirmAction.title.includes("Hapus") ? "#9C2B4E" : "#3B82F6"), flex:1, height:48, fontSize:14, borderRadius:24}}>{confirmAction.title.includes("Hapus") ? (confirmAction.title.includes("Keluar") ? "Keluar" : "Hapus") : "Lanjutkan"}</button>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {pendingTab && (
          <motion.div key="unsaved" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.8)", zIndex:1001, display:"flex", alignItems:"center", justifyContent:"center"}}>
            <motion.div initial={{scale:0.95, opacity:0, y:20}} animate={{scale:1, opacity:1, y:0}} exit={{scale:0.95, opacity:0, y:20}} style={CARD({width:400, padding:32, borderRadius:24, textAlign:"center"})}>
               <h3 style={{fontSize:20, fontWeight:700, marginBottom:16}}>Simpan Perubahan?</h3>
               <p style={{fontSize:14, color:"rgba(44,32,22,0.6)", marginBottom:24, lineHeight:1.5}}>Anda memiliki perubahan yang belum disimpan. Ingin menyimpannya sekarang sebelum meninggalkan halaman ini?</p>
               <div style={{display:"flex", flexDirection:"column", gap:12}}>
                 <button className="hover-scale" onClick={async () => {
                    // We need a way to trigger save from here or assume SettingsPanel handles it if we pass a trigger
                    // But simpler: just navigate and lose changes or stay
                    setPendingTab(null);
                 }} style={{...B(true, "#2C2016"), borderRadius:24, height:48}}>Tetap di Sini</button>
                 <button className="hover-scale" onClick={() => {
                    setTab(pendingTab!);
                    setIsSettingsDirty(false);
                    setPendingTab(null);
                 }} style={{...B(false, "#9C2B4E"), borderRadius:24, height:48, border:"none", color:"#9C2B4E", fontWeight:700}}>Tinggalkan Tanpa Menyimpan</button>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>
);
}

function PublicView() {
  const { wsId } = useParams();
  const [content, setContent] = useState<any[]>([]);
  const [ws, setWs] = useState<any>(null);

  useEffect(() => {
    if (!wsId) return;
    getDoc(doc(db, "workspaces", wsId)).then(s => setWs(s.data())).catch(e => console.warn("PublicView fetch error", e));
    onSnapshot(collection(db, "workspaces", wsId, "content"), (snap) => {
      setContent(snap.docs.map(d => d.data()));
    }, (error) => {
      console.error("PublicView content onSnapshot error:", error);
    });
  }, [wsId]);

  if (!ws?.publicLinkEnabled) return <div style={{textAlign:"center", padding:100}}>Workspace ini private atau tidak ditemukan.</div>;

  return (
    <div style={{padding:40, background:"#FAFAFA", minHeight:"100vh"}}>
       <div style={{maxWidth:1200, margin:"0 auto"}}>
          <h1 style={{fontSize:32, color:"#2C2016", marginBottom:8, fontWeight:800, letterSpacing:"-1px"}}>{ws.settings?.title || ws.name}</h1>
          {ws.settings?.tagline && <p style={{fontSize:16, color:"rgba(44,32,22,0.6)", fontStyle:"italic", marginBottom:12}}>{ws.settings.tagline}</p>}
          <p style={{fontSize:14, color:"rgba(44,32,22,0.5)", marginBottom:32}}>Public Read-Only View • Terakhir diperbarui: {new Date().toLocaleDateString("id-ID")}</p>
          
          <TableView 
            filtered={content} 
            openEdit={()=>{}} 
            archiveItem={()=>{}} 
            deleteItem={()=>{}} 
            pillars={DP} 
            platforms={DPL} 
            showArchived={false} 
            search="" 
            bulkIds={[]} 
            setBulkIds={()=>{}} 
            onBulk={()=>{}} 
          />
       </div>
    </div>
  );
}
