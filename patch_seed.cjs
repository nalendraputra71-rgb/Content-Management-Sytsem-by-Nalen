const fs = require('fs');
let content = fs.readFileSync('src/data.tsx', 'utf8');

const baseSeedCode = `
const baseSeed: any[] = [
  {
    day: 5,
    pillar: "Edukasi", platform: "Instagram", contentType: "Single Image", pic: "Andi", status: "Published",
    title: "Tips Produktivitas WFH",
    metrics: {views:5430, reach:3200, likes:450, comments:23, shares:45, saves:120}
  },
  {
    day: 12,
    pillar: "Promosi", platform: "TikTok", contentType: "Video", pic: "Budi", status: "Published",
    title: "Promo Merdeka 50%",
    metrics: {views:12400, reach:8900, likes:1200, comments:145, shares:430, saves:230}
  },
  {
    day: 18,
    pillar: "Branding", platform: "LinkedIn", contentType: "Carousel", pic: "Citra", status: "Published",
    title: "Budaya Kerja Perusahaan",
    metrics: {views:2100, reach:1500, likes:340, comments:45, shares:20, saves:50}
  },
  {
    day: 25,
    pillar: "Interaksi", platform: "Facebook", contentType: "Single Image", pic: "Andi", status: "Published",
    title: "Q&A Bisnis Online",
    metrics: {views:3400, reach:2100, likes:230, comments:80, shares:15, saves:10}
  },
  {
    day: 28,
    pillar: "Edukasi", platform: "Instagram", contentType: "Reels", pic: "Budi", status: "Published",
    title: "Tutorial Fitur Baru",
    metrics: {views:8900, reach:6500, likes:890, comments:76, shares:120, saves:340}
  }
];
`;

content = content.replace('const baseSeed: any[] = [];', baseSeedCode);
content = content.replace(/year:2025/g, 'year:new Date().getFullYear()');
content = content.replace(/year:2024/g, 'year:new Date().getFullYear()');
content = content.replace(/Archive 2024-/g, 'Archive 2026-');

fs.writeFileSync('src/data.tsx', content);
