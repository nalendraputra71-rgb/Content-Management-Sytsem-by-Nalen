const fs = require('fs');
let content = fs.readFileSync('src/AnalyticsView.tsx', 'utf8');

const targetChart = `    } else if (dateFilt === "custom") {
       sDate = customS ? new Date(customS) : new Date(now.getFullYear(), now.getMonth(), 1);
       eDate = customE ? new Date(customE) : new Date();
       sDate.setHours(0,0,0,0);
       eDate.setHours(0,0,0,0);
    } else {`;

const replacementChart = `    } else if (dateFilt === "custom") {
       sDate = new Date(now.getFullYear(), now.getMonth(), 1);
       eDate = new Date();
       if (customS) {
         const [y, m, d] = customS.split('-');
         sDate = new Date(Number(y), Number(m)-1, Number(d), 0, 0, 0, 0);
       }
       if (customE) {
         const [y, m, d] = customE.split('-');
         eDate = new Date(Number(y), Number(m)-1, Number(d), 0, 0, 0, 0);
       }
    } else {`;

content = content.replace(targetChart, replacementChart);
fs.writeFileSync('src/AnalyticsView.tsx', content);
