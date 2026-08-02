import React, { useState, useEffect, useRef } from "react";
import { useI18n } from "../../i18n";
import { motion } from "motion/react";
import { ChevronDown } from "lucide-react";

export const CustomLegend = ({ payload }: any) => {
  return (
    <div style={{ maxHeight: "80px", overflowY: "auto", marginTop: "16px", paddingBottom: "4px" }}>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px 16px" }}>
        {payload.map((entry: any, index: number) => (
          <li key={`item-${index}`} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: entry.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{entry.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const GeminiIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 1.5L14.45 9.55L22.5 12L14.45 14.45L12 22.5L9.55 14.45L1.5 12L9.55 9.55L12 1.5Z" fill="url(#gemini_gradient_helpers)" />
    <defs>
      <linearGradient id="gemini_gradient_helpers" x1="1.5" y1="12" x2="22.5" y2="12" gradientUnits="userSpaceOnUse">
        <stop stopColor="#4285F4"/>
        <stop offset="0.5" stopColor="#9B72CB"/>
        <stop offset="1" stopColor="#D96570"/>
      </linearGradient>
    </defs>
  </svg>
);

export const LoadingDots = () => {
  const { lang } = useI18n();
  return (
    <span>
      {lang === "id" ? "Menganalisis data" : "Analyzing data"}
      <motion.span animate={{opacity: [0, 1, 0]}} transition={{repeat: Infinity, duration: 1.5}}>.</motion.span>
      <motion.span animate={{opacity: [0, 1, 0]}} transition={{repeat: Infinity, duration: 1.5, delay: 0.2}}>.</motion.span>
      <motion.span animate={{opacity: [0, 1, 0]}} transition={{repeat: Infinity, duration: 1.5, delay: 0.4}}>.</motion.span>
    </span>
  );
};

export const METRICS_META: Record<string, { label: string; labelEn: string; desc: string; descEn: string; category: "organic" | "ads"; color: string }> = {
  views: { label: "Views (Tayangan)", labelEn: "Views", desc: "Total tayangan konten di feed / timeline", descEn: "Total content views in feed / timeline", category: "organic", color: "#2C2016" },
  reach: { label: "Reach (Jangkauan)", labelEn: "Reach", desc: "Jumlah akun unik yang melihat konten", descEn: "Number of unique accounts that saw the content", category: "organic", color: "#3B82F6" },
  likes: { label: "Likes (Suka)", labelEn: "Likes", desc: "Jumlah interaksi suka pada konten", descEn: "Like interactions on content", category: "organic", color: "#9C2B4E" },
  comments: { label: "Comments (Komentar)", labelEn: "Comments", desc: "Jumlah komentar di postingan", descEn: "Number of comments on posts", category: "organic", color: "#2B4C7E" },
  reposts: { label: "Reposts (Bagikan Ulang)", labelEn: "Reposts", desc: "Jumlah postingan dibagikan ulang / retweet", descEn: "Number of posts reposted / retweeted", category: "organic", color: "#A67C1C" },
  shares: { label: "Shares (Share Link)", labelEn: "Shares", desc: "Jumlah share link ke platform lain", descEn: "Number of link shares to other platforms", category: "organic", color: "#2D7A5E" },
  saves: { label: "Saves (Simpan)", labelEn: "Saves", desc: "Jumlah user yang menyimpan konten", descEn: "Number of users who saved the content", category: "organic", color: "#723680" },
  profileVisits: { label: "Profile Visits", labelEn: "Profile Visits", desc: "Kunjungan ke halaman profil Anda", descEn: "Visits to your profile page", category: "organic", color: "#059669" },
  bioLinkTaps: { label: "Bio Link Taps", labelEn: "Bio Link Taps", desc: "Ketukan pada link website di bio", descEn: "Taps on the website link in bio", category: "organic", color: "#2563EB" },
  follows: { label: "Follows", labelEn: "Follows", desc: "Jumlah pengikut baru dari konten ini", descEn: "Number of new followers from this content", category: "organic", color: "#D97706" },

  clicks: { label: "Clicks (Klik Iklan)", labelEn: "Clicks", desc: "Total klik pada link/tombol iklan", descEn: "Total clicks on ad link/button", category: "ads", color: "#3B82F6" },
  conversions: { label: "Conversions (Konversi)", labelEn: "Conversions", desc: "Tindakan berharga seperti pembelian/registrasi", descEn: "Valuable actions like purchase/registration", category: "ads", color: "#10B981" },
  msgConvStarted: { label: "Messages Started", labelEn: "Messages Started", desc: "Jumlah percakapan pesan baru yang dimulai", descEn: "Number of new message conversations started", category: "ads", color: "#8B5CF6" },
  threeSecPlays: { label: "3-Sec Video Plays", labelEn: "3-Sec Video Plays", desc: "Pemutaran video minimal selama 3 detik", descEn: "Video plays for at least 3 seconds", category: "ads", color: "#F59E0B" },
  spendBudget: { label: "Spend Budget", labelEn: "Spend Budget", desc: "Total anggaran iklan yang telah dibelanjakan", descEn: "Total ad budget spent", category: "ads", color: "#EF4444" },
  dailyBudget: { label: "Daily Budget", labelEn: "Daily Budget", desc: "Anggaran harian yang disiapkan", descEn: "Daily budget prepared", category: "ads", color: "#F97316" },
  duration: { label: "Duration (Days)", labelEn: "Duration (Days)", desc: "Lama penayangan kampanye iklan", descEn: "Duration of the ad campaign", category: "ads", color: "#6366F1" },
  cprProfileVisit: { label: "CPR Profile Visit", labelEn: "CPR Profile Visit", desc: "Biaya per Kunjungan Profil (Cost Per Result)", descEn: "Biaya per Kunjungan Profil (Cost Per Result)", category: "ads", color: "#EC4899" },
};

export const SocialThumbnail = ({ url, fallback }: { url: string, fallback: any }) => {
  const [img, setImg] = useState<string|null>(null);
  useEffect(() => {
    if(!url) return;
    let isMounted = true;
    fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`)
      .then(r=>r.json())
      .then(d=>{
        if(isMounted && d?.data?.image?.url) {
          setImg(d.data.image.url);
        }
      })
      .catch(e=>console.log("no thumb"));
    return () => { isMounted = false };
  }, [url]);

  if(img) return <img src={img} alt="thumb" style={{width: "100%", height: "100%", objectFit: "cover"}} referrerPolicy="no-referrer" />;
  return fallback;
};

export function getBlankDemographics(platform: string) {
  return {
    platform,
    gender: { male: 0, female: 0 },
    age: [
      { range: "13-17", value: 0 },
      { range: "18-24", value: 0 },
      { range: "25-34", value: 0 },
      { range: "35-44", value: 0 },
      { range: "45+", value: 0 },
    ],
    cities: [
      { name: "", percentage: 0 },
      { name: "", percentage: 0 },
      { name: "", percentage: 0 },
      { name: "", percentage: 0 },
      { name: "", percentage: 0 },
    ],
    countries: [
      { name: "", percentage: 0 },
      { name: "", percentage: 0 },
      { name: "", percentage: 0 },
      { name: "", percentage: 0 },
      { name: "", percentage: 0 },
    ],
    devices: [
      { name: "Android", percentage: 0 },
      { name: "iOS (iPhone)", percentage: 0 },
      { name: "Web / Desktop", percentage: 0 },
    ],
    interests: [
      { name: "", percentage: 0 },
      { name: "", percentage: 0 },
      { name: "", percentage: 0 },
      { name: "", percentage: 0 },
      { name: "", percentage: 0 },
    ]
  };
}

export function getDemographicsForPlatform(platform: string) {
  const norm = (platform || "").toLowerCase();
  
  if (norm.includes("tiktok")) {
    return {
      platform: "TikTok",
      gender: { male: 38, female: 62 },
      age: [
        { range: "13-17", value: 15 },
        { range: "18-24", value: 50 },
        { range: "25-34", value: 25 },
        { range: "35-44", value: 7 },
        { range: "45+", value: 3 },
      ],
      cities: [
        { name: "Jakarta", percentage: 38 },
        { name: "Surabaya", percentage: 18 },
        { name: "Bandung", percentage: 16 },
        { name: "Medan", percentage: 12 },
        { name: "Yogyakarta", percentage: 10 },
      ],
      countries: [
        { name: "Indonesia", percentage: 91 },
        { name: "Malaysia", percentage: 5 },
        { name: "Singapore", percentage: 2 },
        { name: "United States", percentage: 1 },
        { name: "Lainnya", percentage: 1 },
      ],
      devices: [
        { name: "Android", percentage: 76 },
        { name: "iOS (iPhone)", percentage: 23 },
        { name: "Web / Desktop", percentage: 1 },
      ],
      interests: [
        { name: "Entertainment & Comedy", percentage: 35 },
        { name: "Kuliner & Resep", percentage: 22 },
        { name: "Kecantikan & Skincare", percentage: 18 },
        { name: "Musik & Dance", percentage: 15 },
        { name: "Edukasi & Bisnis", percentage: 10 },
      ]
    };
  }

  if (norm.includes("reels")) {
    return {
      platform: "Reels",
      gender: { male: 44, female: 56 },
      age: [
        { range: "13-17", value: 8 },
        { range: "18-24", value: 42 },
        { range: "25-34", value: 38 },
        { range: "35-44", value: 9 },
        { range: "45+", value: 3 },
      ],
      cities: [
        { name: "Jakarta", percentage: 44 },
        { name: "Bandung", percentage: 20 },
        { name: "Surabaya", percentage: 14 },
        { name: "Medan", percentage: 11 },
        { name: "Yogyakarta", percentage: 8 },
      ],
      countries: [
        { name: "Indonesia", percentage: 87 },
        { name: "Malaysia", percentage: 6 },
        { name: "Singapore", percentage: 4 },
        { name: "United States", percentage: 2 },
        { name: "Lainnya", percentage: 1 },
      ],
      devices: [
        { name: "iOS (iPhone)", percentage: 52 },
        { name: "Android", percentage: 46 },
        { name: "Web / Desktop", percentage: 2 },
      ],
      interests: [
        { name: "Fashion & Lifestyle", percentage: 32 },
        { name: "Kuliner", percentage: 26 },
        { name: "Traveling & Estetik", percentage: 20 },
        { name: "Teknologi & Gadget", percentage: 12 },
        { name: "Pengembangan Diri", percentage: 10 },
      ]
    };
  }

  if (norm.includes("feed")) {
    return {
      platform: "Feed",
      gender: { male: 46, female: 54 },
      age: [
        { range: "13-17", value: 5 },
        { range: "18-24", value: 35 },
        { range: "25-34", value: 44 },
        { range: "35-44", value: 12 },
        { range: "45+", value: 4 },
      ],
      cities: [
        { name: "Jakarta", percentage: 46 },
        { name: "Bandung", percentage: 18 },
        { name: "Surabaya", percentage: 15 },
        { name: "Medan", percentage: 10 },
        { name: "Yogyakarta", percentage: 7 },
      ],
      countries: [
        { name: "Indonesia", percentage: 85 },
        { name: "Malaysia", percentage: 6 },
        { name: "Singapore", percentage: 5 },
        { name: "Japan", percentage: 2 },
        { name: "Lainnya", percentage: 2 },
      ],
      devices: [
        { name: "iOS (iPhone)", percentage: 48 },
        { name: "Android", percentage: 49 },
        { name: "Web / Desktop", percentage: 3 },
      ],
      interests: [
        { name: "Inspirasi & Quotes", percentage: 28 },
        { name: "Fotografi & Desain", percentage: 24 },
        { name: "Kuliner & Tempat Nongkrong", percentage: 22 },
        { name: "Teknologi & Finansial", percentage: 16 },
        { name: "Olahraga & Kesehatan", percentage: 10 },
      ]
    };
  }

  if (norm.includes("stories")) {
    return {
      platform: "Stories",
      gender: { male: 40, female: 60 },
      age: [
        { range: "13-17", value: 6 },
        { range: "18-24", value: 38 },
        { range: "25-34", value: 42 },
        { range: "35-44", value: 10 },
        { range: "45+", value: 4 },
      ],
      cities: [
        { name: "Jakarta", percentage: 48 },
        { name: "Bandung", percentage: 22 },
        { name: "Surabaya", percentage: 12 },
        { name: "Medan", percentage: 9 },
        { name: "Yogyakarta", percentage: 6 },
      ],
      countries: [
        { name: "Indonesia", percentage: 88 },
        { name: "Malaysia", percentage: 5 },
        { name: "Singapore", percentage: 4 },
        { name: "Australia", percentage: 1 },
        { name: "Lainnya", percentage: 2 },
      ],
      devices: [
        { name: "iOS (iPhone)", percentage: 58 },
        { name: "Android", percentage: 40 },
        { name: "Web / Desktop", percentage: 2 },
      ],
      interests: [
        { name: "Keseharian & Vlogs", percentage: 35 },
        { name: "Belanja & Promo", percentage: 25 },
        { name: "Makanan & Cafe Baru", percentage: 20 },
        { name: "Interaksi & Tanya Jawab", percentage: 12 },
        { name: "Karir & Produktivitas", percentage: 8 },
      ]
    };
  }

  // All Platforms combined / default fallback
  return {
    platform: "Semua Platform",
    gender: { male: 45, female: 55 },
    age: [
      { range: "13-17", value: 11 },
      { range: "18-24", value: 41 },
      { range: "25-34", value: 35 },
      { range: "35-44", value: 9 },
      { range: "45+", value: 4 },
    ],
    cities: [
      { name: "Jakarta", percentage: 43 },
      { name: "Bandung", percentage: 19 },
      { name: "Surabaya", percentage: 15 },
      { name: "Medan", percentage: 12 },
      { name: "Yogyakarta", percentage: 7 },
    ],
    countries: [
      { name: "Indonesia", percentage: 88 },
      { name: "Malaysia", percentage: 6 },
      { name: "Singapore", percentage: 3 },
      { name: "United States", percentage: 1 },
      { name: "Lainnya", percentage: 2 },
    ],
    devices: [
      { name: "Android", percentage: 60 },
      { name: "iOS (iPhone)", percentage: 37 },
      { name: "Web / Desktop", percentage: 3 },
    ],
    interests: [
      { name: "Kuliner & Foodies", percentage: 28 },
      { name: "Fashion, Beauty & Skincare", percentage: 24 },
      { name: "Entertainment & Vlogs", percentage: 22 },
      { name: "Teknologi & Gadget", percentage: 14 },
      { name: "Gaya Hidup & Finansial", percentage: 12 },
    ]
  };
}

export function getAggregatedDemographics(demographicsState: any, platformsList: any[]) {
  const filledKeys = (platformsList || []).map((p: any) => {
    const name = typeof p === 'string' ? p : p.name;
    return { name, key: name.toLowerCase() };
  }).filter(item => demographicsState && !!demographicsState[item.key]);

  if (filledKeys.length === 0) {
    return null;
  }

  const numPlatforms = filledKeys.length;
  
  let totalFemale = 0;
  let totalMale = 0;
  
  const ageSums: { [range: string]: number } = {
    "13-17": 0, "18-24": 0, "25-34": 0, "35-44": 0, "45+": 0
  };

  const citySums: { [name: string]: number } = {};
  const countrySums: { [name: string]: number } = {};
  const deviceSums: { [name: string]: number } = {};
  const interestSums: { [name: string]: number } = {};

  filledKeys.forEach(item => {
    const data = demographicsState[item.key];
    if (!data) return;
    
    // Gender
    totalFemale += (data.gender?.female !== undefined ? data.gender.female : 50);
    totalMale += (data.gender?.male !== undefined ? data.gender.male : 50);
    
    // Age
    if (Array.isArray(data.age)) {
      data.age.forEach((g: any) => {
        if (g.range && g.value !== undefined) {
          ageSums[g.range] = (ageSums[g.range] || 0) + g.value;
        }
      });
    }

    // Cities
    if (Array.isArray(data.cities)) {
      data.cities.forEach((c: any) => {
        if (c.name && c.percentage !== undefined) {
          const normName = c.name.trim();
          if (normName) {
            citySums[normName] = (citySums[normName] || 0) + c.percentage;
          }
        }
      });
    }

    // Countries
    if (Array.isArray(data.countries)) {
      data.countries.forEach((c: any) => {
        if (c.name && c.percentage !== undefined) {
          const normName = c.name.trim();
          if (normName) {
            countrySums[normName] = (countrySums[normName] || 0) + c.percentage;
          }
        }
      });
    }

    // Devices
    if (Array.isArray(data.devices)) {
      data.devices.forEach((d: any) => {
        if (d.name && d.percentage !== undefined) {
          const normName = d.name.trim();
          if (normName) {
            deviceSums[normName] = (deviceSums[normName] || 0) + d.percentage;
          }
        }
      });
    }

    // Interests
    if (Array.isArray(data.interests)) {
      data.interests.forEach((n: any) => {
        if (n.name && n.percentage !== undefined) {
          const normName = n.name.trim();
          if (normName) {
            interestSums[normName] = (interestSums[normName] || 0) + n.percentage;
          }
        }
      });
    }
  });

  const femaleAvg = Math.round(totalFemale / numPlatforms);
  const maleAvg = 100 - femaleAvg;

  const ageList = Object.keys(ageSums).map(range => ({
    range,
    value: Math.round(ageSums[range] / numPlatforms)
  }));

  const citiesList = Object.keys(citySums).map(name => ({
    name,
    percentage: Math.round(citySums[name] / numPlatforms)
  })).sort((a, b) => b.percentage - a.percentage).slice(0, 5);

  const countriesList = Object.keys(countrySums).map(name => ({
    name,
    percentage: Math.round(countrySums[name] / numPlatforms)
  })).sort((a, b) => b.percentage - a.percentage).slice(0, 5);

  const devicesList = Object.keys(deviceSums).map(name => ({
    name,
    percentage: Math.round(deviceSums[name] / numPlatforms)
  })).sort((a, b) => b.percentage - a.percentage).slice(0, 3);

  const interestsList = Object.keys(interestSums).map(name => ({
    name,
    percentage: Math.round(interestSums[name] / numPlatforms)
  })).sort((a, b) => b.percentage - a.percentage).slice(0, 5);

  return {
    platform: "Semua Platform",
    gender: { male: maleAvg, female: femaleAvg },
    age: ageList,
    cities: citiesList,
    countries: countriesList,
    devices: devicesList,
    interests: interestsList
  };
}
