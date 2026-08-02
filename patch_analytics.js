const fs = require('fs');
let code = fs.readFileSync('src/AnalyticsView.tsx', 'utf8');
console.log(code.includes('const isDateMatch = (c:any, isPrev:boolean=false) => {'));
