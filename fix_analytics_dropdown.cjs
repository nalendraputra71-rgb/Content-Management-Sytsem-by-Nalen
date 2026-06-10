const fs = require('fs');
let s = fs.readFileSync('src/AnalyticsView.tsx', 'utf-8');

s = s.replace(/bg-white\/70 backdrop-blur-md/g, 'bg-white/95 backdrop-blur-xl');
// Change left sidebar in DateFilterPopover to be a bit more solid
s = s.replace(/bg-white\/30 border-r/g, 'bg-white/60 border-r');
s = s.replace(/bg-white\/50 backdrop-blur-md/g, 'bg-white/80 backdrop-blur-xl');

fs.writeFileSync('src/AnalyticsView.tsx', s);
