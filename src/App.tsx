import { OnboardingOverlay } from './OnboardingOverlay';
import { LoadingScreen } from './LoadingScreen';
import { useI18n } from "./i18n";
import { useState, useEffect, useMemo } from "react";
import { BrowserRouter } from "react-router-dom";
import { THEMES } from "./data";

import { 
  db, doc, getDoc, collection, updateDoc,
  handleFirestoreError, testFirestoreConnection, getDocs
} from "./firebase";

import { AppRoutes } from "./AppRoutes";
import { useAuth } from "./contexts/AuthContext";
import { AnimatePresence } from "motion/react";

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
  const { lang } = useI18n();
  const { user, profile, authLoading, systemConfig, showOnboarding, setShowOnboarding, setUser, setProfile } = useAuth();
  
  const [planDetails, setPlanDetails] = useState<any>(null);
  
  
  

  

  useEffect(() => { testFirestoreConnection(); }, []);

  useEffect(() => {
    const fetchPlan = async () => {
      if (profile?.plan && profile.plan !== "free" && profile.plan !== "trial") {
        try {
          const snap = await getDoc(doc(db, "plans", profile.plan));
          if (snap.exists()) {
            const planData = snap.data();
            setPlanDetails({
              ...planData,
              maxWorkspaces: planData.limits?.workspaces ?? 1,
              maxSocialAccounts: planData.limits?.socialAccounts ?? 10,
              aiTokenLimit: planData.limits?.aiCreditsPerMonth ?? 50,
              maxTeamMembers: planData.limits?.teamMembers ?? 0,
            });
          } else {
            const fallbackSnap = await getDocs(collection(db, "plans"));
            const matched = fallbackSnap.docs.find(d => {
               const nameLower = (d.data().name || '').toLowerCase();
               return nameLower.includes(profile.plan);
            });
            if (matched) {
               const planData = matched.data();
               setPlanDetails({
                 ...planData,
                 maxWorkspaces: planData.limits?.workspaces ?? 1,
                 maxSocialAccounts: planData.limits?.socialAccounts ?? 10,
                 aiTokenLimit: planData.limits?.aiCreditsPerMonth ?? 50,
                 maxTeamMembers: planData.limits?.teamMembers ?? 0,
               });
            }
            else setPlanDetails(null);
          }
        } catch (e) { console.error("Error fetching plan:", e); }
      } else if (profile?.plan === "trial") {
         setPlanDetails({
           maxWorkspaces: 2,
           maxSocialAccounts: 15,
           aiTokenLimit: 100,
           maxTeamMembers: 3,
           features: [],
           limits: { workspaces: 2, socialAccounts: 15, aiCreditsPerMonth: 100, teamMembers: 3, storageMB: 5000 },
           capabilities: { autoPublishing: true, analyticsLevel: 'advanced', exportReports: 'basic', contentApproval: false, commentManagement: true, supportLevel: 'email' }
         });
      } else {
         try {
           const snap = await getDoc(doc(db, "plans", "free-monthly"));
           if (snap.exists()) {
             const freeData = snap.data();
             setPlanDetails({
               maxWorkspaces: freeData.limits?.workspaces ?? 1,
               maxSocialAccounts: freeData.limits?.socialAccounts ?? 3,
               aiTokenLimit: freeData.limits?.aiCreditsPerMonth ?? 10,
               maxTeamMembers: freeData.limits?.teamMembers ?? 0,
               features: []
             });
           } else {
             setPlanDetails({
               maxWorkspaces: 1,
               maxSocialAccounts: 3,
               aiTokenLimit: 10,
               maxTeamMembers: 0,
               features: [],
               limits: { workspaces: 1, socialAccounts: 3, aiCreditsPerMonth: 10, teamMembers: 0, storageMB: 100 },
               capabilities: { autoPublishing: false, analyticsLevel: 'basic', exportReports: 'none', contentApproval: false, commentManagement: false, supportLevel: 'community' }
             });
           }
         } catch (e) {
           setPlanDetails({
             maxWorkspaces: 1,
             maxSocialAccounts: 3,
             aiTokenLimit: 10,
             maxTeamMembers: 0,
             features: [],
             limits: { workspaces: 1, socialAccounts: 3, aiCreditsPerMonth: 10, teamMembers: 0, storageMB: 100 },
             capabilities: { autoPublishing: false, analyticsLevel: 'basic', exportReports: 'none', contentApproval: false, commentManagement: false, supportLevel: 'community' }
           });
         }
      }
    };
    fetchPlan();
  }, [profile?.plan]);

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
    <BrowserRouter>
      <AppRoutes planDetails={planDetails} updateProfileSettings={updateProfileSettings} currentTheme={currentTheme} />
      <AnimatePresence>
        {showOnboarding && user && (
          <OnboardingOverlay 
            user={user}
            profile={profile}
            onUpdate={updateProfileSettings}
          />
        )}
      </AnimatePresence>
    </BrowserRouter>
  );
}

export function CMSLayout({ children }: any) {
  return (
    <div style={{fontFamily:"'Inter', sans-serif",background:"var(--theme-bg, #FAFAFA)",minHeight:"100vh",color:"#2C2016"}}>
      {children}
    </div>
  );
}
