const fs = require('fs');

const tabs = ['ContentTab.tsx', 'CalendarTab.tsx', 'CompetitorTab.tsx', 'InboxTab.tsx'];
tabs.forEach(tab => {
    let tabCode = fs.readFileSync('src/' + tab, 'utf8');
    tabCode = tabCode.replace(/p\n  lang/g, 'p,\n  lang');
    tabCode = tabCode.replace(/posts\n  lang/g, 'posts,\n  lang');
    tabCode = tabCode.replace(/target\n  lang/g, 'target,\n  lang');
    fs.writeFileSync('src/' + tab, tabCode);
});
