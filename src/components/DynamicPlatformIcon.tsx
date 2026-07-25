import React, { useState, useEffect } from "react";
import { Globe } from "lucide-react";

interface DynamicPlatformIconProps {
  platformName: string;
  size?: number;
  color?: string;
}

const sourcesMap: Record<string, string[]> = {
  instagram: ["/Instagram.svg.webp", "/instagram.svg.webp", "/instagram.svg", "/instagram.png"],
  facebook: ["/Facebook.svg.webp", "/facebook.svg.webp", "/facebook.svg", "/facebook.png"],
  linkedin: ["/LinkedIn.svg.webp", "/linkedin.svg.webp", "/linkedin.svg", "/linkedin.png"],
  threads: ["/Threads.svg.webp", "/threads.svg.webp", "/threads.svg", "/threads.png"],
  tiktok: ["/TikTok.png", "/tiktok.png", "/tiktok.svg"],
  twitter: ["/X.webp", "/x.webp", "/twitter.svg", "/twitter.png"],
  youtube: ["/youtube.svg", "/youtube.png"]
};

export function DynamicPlatformIcon({ platformName, size = 16, color }: DynamicPlatformIconProps) {
  const name = String(platformName || "").trim().toLowerCase();
  
  // Clean up name for standard filename matching
  let fileKey = name;
  if (name.includes("instagram") || name === "ig") fileKey = "instagram";
  else if (name.includes("tiktok") || name === "tt") fileKey = "tiktok";
  else if (name.includes("facebook") || name === "fb" || name === "meta") fileKey = "facebook";
  else if (name.includes("threads")) fileKey = "threads";
  else if (name === "x" || name.includes("twitter")) fileKey = "twitter";
  else if (name.includes("linkedin") || name === "li") fileKey = "linkedin";
  else if (name.includes("youtube") || name === "yt") fileKey = "youtube";

  const candidates = sourcesMap[fileKey] || [`/${fileKey}.svg`, `/${fileKey}.png`];

  const [srcIndex, setSrcIndex] = useState(0);
  const [imgError, setImgError] = useState(false);

  // Reset states when the platform name changes
  useEffect(() => {
    setSrcIndex(0);
    setImgError(false);
  }, [name]);

  if (!imgError && srcIndex < candidates.length) {
    const src = candidates[srcIndex];
    return (
      <img 
        src={src} 
        alt={platformName}
        referrerPolicy="no-referrer"
        style={{ 
          width: size, 
          height: size, 
          objectFit: 'contain', 
          display: 'inline-block', 
          verticalAlign: 'middle',
          borderRadius: (fileKey === 'facebook' || fileKey === 'instagram' || fileKey === 'linkedin' || fileKey === 'threads' || fileKey === 'twitter') ? '4px' : '0px'
        }}
        onError={() => {
          if (srcIndex + 1 < candidates.length) {
            setSrcIndex(prev => prev + 1);
          } else {
            setImgError(true);
          }
        }}
      />
    );
  }

  // Fallback beautiful inline SVGs
  if (fileKey === "instagram") {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} style={{ display: "inline-block", verticalAlign: "middle" }}>
        <defs>
          <linearGradient id="ig-grad-dynamic" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F9CE3F" />
            <stop offset="50%" stopColor="#E1306C" />
            <stop offset="100%" stopColor="#833AB4" />
          </linearGradient>
        </defs>
        <rect width="24" height="24" rx="5" fill="url(#ig-grad-dynamic)" />
        <rect x="5.5" y="5.5" width="13" height="13" rx="3.5" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="3" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
        <circle cx="15.5" cy="8.5" r="0.75" fill="#FFFFFF" />
      </svg>
    );
  }

  if (fileKey === "tiktok") {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} style={{ display: "inline-block", verticalAlign: "middle" }}>
        <rect width="24" height="24" rx="5" fill="#000000" />
        <g transform="translate(4.5, 4)">
          <path 
            d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.38 13.84 4 15 4V6c-1.63 0-3.083-.793-4-2.022v7.241c0 2.22-1.778 4.072-4 4.072a4.007 4.007 0 0 1-4-4V8.536a4.017 4.017 0 0 1 4-4c.48 0 .931.083 1.346.233V2.412A5.5 5.5 0 0 0 9 0z" 
            fill="#FE0979" 
            transform="translate(0.4, 0.4)"
          />
          <path 
            d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.38 13.84 4 15 4V6c-1.63 0-3.083-.793-4-2.022v7.241c0 2.22-1.778 4.072-4 4.072a4.007 4.007 0 0 1-4-4V8.536a4.017 4.017 0 0 1 4-4c.48 0 .931.083 1.346.233V2.412A5.5 5.5 0 0 0 9 0z" 
            fill="#25F4EE" 
            transform="translate(-0.4, -0.4)"
          />
          <path 
            d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.38 13.84 4 15 4V6c-1.63 0-3.083-.793-4-2.022v7.241c0 2.22-1.778 4.072-4 4.072a4.007 4.007 0 0 1-4-4V8.536a4.017 4.017 0 0 1 4-4c.48 0 .931.083 1.346.233V2.412A5.5 5.5 0 0 0 9 0z" 
            fill="#FFFFFF" 
          />
        </g>
      </svg>
    );
  }

  if (fileKey === "facebook") {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} style={{ display: "inline-block", verticalAlign: "middle" }}>
        <circle cx="12" cy="12" r="12" fill="#1877F2" />
        <path d="M13.5 8.5H15V6h-2c-1.8 0-3 1-3 2.8V10H8v2.5h2V18h3v-5.5h2L15.5 10H13V8.5z" fill="#FFFFFF" />
      </svg>
    );
  }

  if (fileKey === "threads") {
    return (
      <svg viewBox="0 0 192 192" width={size} height={size} style={{ display: "inline-block", verticalAlign: "middle" }}>
        <rect width="192" height="192" rx="40" fill="#000000" />
        <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C119.988 17.1113 137.539 24.4614 148.97 38.6654C156.974 48.6186 161.42 61.6441 161.761 76.4449H178.615C178.271 58.1147 172.637 42.1287 162.247 29.171C148.72 12.3551 127.393 3.6331 97.0135 3.4246C66.633 3.6331 45.3061 12.3551 31.7788 29.171C19.3458 44.6293 12.9333 66.8617 12.7153 96C12.9333 125.138 19.3458 147.371 31.7788 162.829C45.3061 179.645 66.633 188.367 97.0135 188.575C121.282 188.396 138.868 181.773 154.341 166.315C171.868 148.804 172.585 125.432 166.529 111.285C162.33 101.472 153.947 93.8184 141.537 88.9883ZM98.4405 129.507C88.0005 130.095 77.1544 125.409 76.6196 115.372C76.2232 107.93 81.9158 99.626 99.0812 98.6368C101.047 98.5234 102.976 98.468 104.871 98.468C111.106 98.468 116.939 99.0737 122.242 100.233C120.264 124.935 108.662 128.946 98.4405 129.507Z" fill="#FFFFFF" />
      </svg>
    );
  }

  if (fileKey === "twitter") {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} style={{ display: "inline-block", verticalAlign: "middle" }}>
        <rect width="24" height="24" rx="5" fill="#000000" />
        <path d="M14.2 6h1.8l-4 4.5L16.5 17h-3.6l-2.8-3.7L6.9 17H5.1l4.2-4.8L5 6h3.7l2.5 3.3L14.2 6zm-.6 10H14.6L7.9 7H6.8l6.8 9z" fill="#FFFFFF" />
      </svg>
    );
  }

  if (fileKey === "linkedin") {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} style={{ display: "inline-block", verticalAlign: "middle" }}>
        <rect width="24" height="24" rx="5" fill="#0077B5" />
        <path d="M6.5 8.5h2.5V17H6.5V8.5zM7.8 5.2a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8z M10.5 8.5h2.4v1.2h.1c.3-.6 1.1-1.4 2.4-1.4 2.5 0 3 1.6 3 3.8V17h-2.5v-4.1c0-1-.1-2.2-1.3-2.2-1.3 0-1.5 1-1.5 2.1V17h-2.5V8.5z" fill="#FFFFFF" />
      </svg>
    );
  }

  if (fileKey === "youtube") {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} style={{ display: "inline-block", verticalAlign: "middle" }}>
        <rect width="24" height="24" rx="5" fill="#FF0000" />
        <path d="M10 8.5l5.5 3.5-5.5 3.5v-7z" fill="#FFFFFF" />
      </svg>
    );
  }

  return <Globe size={size} color={color || "#888888"} />;
}
