const fs = require('fs');
let code = fs.readFileSync('src/PricingPage.tsx', 'utf8');

const masterId = `[
                  "Unlimited Akun Sosmed & Tim", 
                  "Kolaborasi & Alur Persetujuan", 
                  "Unlimited AI Generator", 
                  "White-label Export Report", 
                  "Manajemen Komentar & Auto-reply",
                  "Akses API Terbuka",
                  "Prioritas Dukungan 24/7"
                ]`;
const masterEn = `[
                  "Unlimited Social Accounts & Team", 
                  "Collaboration & Approval Workflow", 
                  "Unlimited AI Generator", 
                  "White-label Report Export", 
                  "Comment & Auto-reply Management",
                  "Open API Access",
                  "24/7 Priority Support"
                ]`;

code = code.replace(
  /\{\(lang === 'id' \? \[\s*"Unlimited Akun Sosmed & Tim"[\s\S]*?"Prioritas Dukungan 24\/7"\s*\]\)\.map/g,
  `{(lang === 'id' ? ${masterId} : ${masterEn}).map`
);

fs.writeFileSync('src/PricingPage.tsx', code);
