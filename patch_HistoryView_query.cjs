const fs = require('fs');
let code = fs.readFileSync('src/components/HistoryView.tsx', 'utf8');

const queryReplacement = `
        let q;
        if (historyDays > 0) {
           const cutoff = new Date();
           cutoff.setDate(cutoff.getDate() - historyDays);
           const cutoffISO = cutoff.toISOString();
           q = query(historyRef, where("timestamp", ">=", cutoffISO), orderBy("timestamp", "desc"), limit(20));
        } else {
           q = query(historyRef, orderBy("timestamp", "desc"), limit(20));
        }`;

code = code.replace(/        const q = query\(historyRef, orderBy\("timestamp", "desc"\), limit\(20\)\);/, queryReplacement);

const fetchMoreReplacement = `
      let q;
      if (historyDays > 0) {
         const cutoff = new Date();
         cutoff.setDate(cutoff.getDate() - historyDays);
         const cutoffISO = cutoff.toISOString();
         q = query(historyRef, where("timestamp", ">=", cutoffISO), orderBy("timestamp", "desc"), startAfter(lastVisible), limit(20));
      } else {
         q = query(historyRef, orderBy("timestamp", "desc"), startAfter(lastVisible), limit(20));
      }`;

code = code.replace(/      const q = query\(historyRef, orderBy\("timestamp", "desc"\), startAfter\(lastVisible\), limit\(20\)\);/, fetchMoreReplacement);

// We should also filter items array (legacy items)
code = code.replace(/        if \(fetchedItems\.length > 0\) \{/, `        
        if (historyDays > 0) {
           const cutoff = new Date();
           cutoff.setDate(cutoff.getDate() - historyDays);
           const cutoffTime = cutoff.getTime();
           items = items.filter(item => new Date(item.timestamp).getTime() >= cutoffTime);
        }
        if (fetchedItems.length > 0) {`);

fs.writeFileSync('src/components/HistoryView.tsx', code);
