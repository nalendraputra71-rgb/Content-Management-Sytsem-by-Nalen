const fs = require('fs');
let code = fs.readFileSync('src/PricingPage.tsx', 'utf8');

// For Growth Master card features
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

let counter2 = 0;
code = code.replace(/\[\s*"Unlimited Akun Sosmed & Tim"[\s\S]*?"Comment & Auto-reply Management"\s*\]/g, (match) => {
  if (counter2 === 0) { counter2++; return masterId; }
  return masterEn;
});


// For the Table: update `Manajemen Komentar` for starter to be true.
// { id: 'Manajemen Komentar', en: 'Comment Management', starter: false, master: true }
// -> { id: 'Manajemen Komentar', en: 'Comment Management', starter: 'Dasar', master: 'Advanced + Auto-reply' }
code = code.replace(
  /{ id: 'Manajemen Komentar', en: 'Comment Management', starter: false, master: true }/g,
  "{ id: 'Manajemen Komentar', en: 'Comment Management', starter: 'Dasar (Basic)', master: 'Advanced + Auto-reply' }"
);

fs.writeFileSync('src/PricingPage.tsx', code);
