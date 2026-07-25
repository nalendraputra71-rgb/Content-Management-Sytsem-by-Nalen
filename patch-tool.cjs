const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldDesc = `"Jenis data yang ingin diambil: 'content_performance' (untuk melihat performa konten individu), 'analytics_summary' (untuk melihat total keseluruhan metrik), atau 'scheduled_posts' (untuk melihat konten yang akan dipublikasikan).",`;
const newDesc = `"Jenis data yang ingin diambil: 'content_performance' (untuk melihat performa konten individu), 'analytics_summary' (untuk melihat total keseluruhan metrik termasuk breakdown per platform), atau 'scheduled_posts' (untuk melihat konten yang akan dipublikasikan).",`;

code = code.replace(oldDesc, newDesc);
fs.writeFileSync('server.ts', code);
console.log('patched tool description');
