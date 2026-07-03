const fs = require('fs');
let code = fs.readFileSync('src/PricingPage.tsx', 'utf8');

const starterRegex = /\{\(lang === 'id' \? \[\s*"Integrasi 5 Akun Sosmed"[\s\S]*?"1 GB Asset Storage"\s*\]\)\.map/g;

const starterId = `[
                  "Integrasi 5 Akun Sosmed", 
                  "Auto-Publishing Terjadwal", 
                  "100x Generate AI / Bulan", 
                  "Analitik & Multi-View Calendar", 
                  "1 GB Penyimpanan Aset",
                  "Manajemen Komentar & DM Basic",
                  "Template Caption Siap Pakai",
                  "Customer Support via Email"
                ]`;
const starterEn = `[
                  "5 Social Accounts Integration", 
                  "Scheduled Auto-Publishing", 
                  "100x AI Generation / Month", 
                  "Analytics & Multi-View Calendar", 
                  "1 GB Asset Storage",
                  "Basic Comment & DM Management",
                  "Ready-to-use Caption Templates",
                  "Email Customer Support"
                ]`;

code = code.replace(starterRegex, `{(lang === 'id' ? ${starterId} : ${starterEn}).map`);

fs.writeFileSync('src/PricingPage.tsx', code);
