const fs = require('fs');
let code = fs.readFileSync('src/AnalyticsView.tsx', 'utf8');

const fetchEffect = `
  // Fetch historical analytics data for requested date range
  useEffect(() => {
    if (!workspaceId || isTutorialActive) return;

    const now = new Date();
    now.setHours(0,0,0,0);
    let targetS = new Date(now);
    let targetE = new Date(now);
    let prevS = new Date(now);
    let prevE = new Date(now);
    let fetchAll = false;

    if(dateFilt === "custom") {
      if (customS) {
         const [y, m, d] = customS.split('-');
         targetS = new Date(Number(y), Number(m)-1, Number(d), 0, 0, 0, 0);
      } else {
         targetS = new Date(0);
      }
      if (customE) {
         const [y, m, d] = customE.split('-');
         targetE = new Date(Number(y), Number(m)-1, Number(d), 23, 59, 59, 999);
      } else {
         targetE = new Date("2100-01-01");
      }
      const diffDays = Math.ceil((targetE.getTime() - targetS.getTime()) / 86400000);
      prevS = new Date(targetS);
      prevS.setDate(prevS.getDate() - diffDays);
      prevE = new Date(targetS);
      prevE.setDate(prevE.getDate() - 1);
    } else if(dateFilt === "all") {
      fetchAll = true;
    } else {
      const dayOfWeek = now.getDay();
      if(dateFilt==="yesterday") {
        targetS.setDate(now.getDate()-1);
        targetE = new Date(targetS);
      } else if(dateFilt==="7d") {
        targetS.setDate(now.getDate()-7);
      } else if(dateFilt==="28d") {
        targetS.setDate(now.getDate()-28);
      } else if(dateFilt==="90d") {
        targetS.setDate(now.getDate()-90);
      } else if(dateFilt==="tw") {
        targetS.setDate(now.getDate() - dayOfWeek);
      } else if(dateFilt==="tm") {
        targetS.setDate(1);
      } else if(dateFilt==="ty") {
        targetS.setMonth(0);
        targetS.setDate(1);
      } else if(dateFilt==="lw") {
        targetS.setDate(now.getDate() - dayOfWeek - 7);
        targetE = new Date(targetS);
        targetE.setDate(targetS.getDate() + 6);
      } else if(dateFilt==="lm") {
        targetS.setDate(1);
        targetS.setMonth(now.getMonth()-1);
        targetE = new Date(now.getFullYear(), now.getMonth(), 0); 
      }
      const diff = targetE.getTime() - targetS.getTime() + 86400000;
      prevE = new Date(targetS.getTime() - 86400000);
      prevS = new Date(targetS.getTime() - diff);
    }

    const neededMonths = new Set<string>();
    
    if (fetchAll) {
       // if all is selected, we could fetch everything but that might be heavy
       // let's just fetch all contents for the workspace
       neededMonths.add("ALL");
    } else {
       const dates = [targetS, targetE, prevS, prevE];
       const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
       const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
       
       let curr = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
       const end = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
       while(curr <= end) {
         neededMonths.add(curr.getFullYear() + "-" + (curr.getMonth() + 1));
         curr.setMonth(curr.getMonth() + 1);
       }
    }

    const monthsToFetch = Array.from(neededMonths).filter(m => !fetchedMonths.has(m));
    if (monthsToFetch.length === 0) return; // already fetched

    const fetchMonthsData = async () => {
       try {
          if (monthsToFetch.includes("ALL")) {
             const q = query(collection(db, "workspaces", workspaceId, "content"));
             const snap = await getDocs(q);
             const docs = snap.docs.map(d => ({id: d.id, ...d.data()}));
             setExtraContent(docs);
             setFetchedMonths(new Set(["ALL"]));
          } else {
             const promises = monthsToFetch.map(m => {
                const [y, mo] = m.split("-").map(Number);
                const q = query(collection(db, "workspaces", workspaceId, "content"), 
                   where("year", "==", y), 
                   where("month", "==", mo)
                );
                return getDocs(q);
             });
             const snaps = await Promise.all(promises);
             let newDocs: any[] = [];
             snaps.forEach(snap => {
                newDocs = newDocs.concat(snap.docs.map(d => ({id: d.id, ...d.data()})));
             });
             setExtraContent(prev => {
                const map = new Map();
                prev.forEach(c => map.set(c.id, c));
                newDocs.forEach(c => map.set(c.id, c));
                return Array.from(map.values());
             });
             setFetchedMonths(prev => {
                const next = new Set(prev);
                monthsToFetch.forEach(m => next.add(m));
                return next;
             });
          }
       } catch (err) {
          console.error("Failed to fetch historical analytics data:", err);
       }
    };
    
    fetchMonthsData();

  }, [workspaceId, isTutorialActive, dateFilt, customS, customE]);
`;

// Insert after dateFilt declarations
code = code.replace(
  'const [customE,setCustomE] = useState("");',
  'const [customE,setCustomE] = useState("");\n' + fetchEffect
);

fs.writeFileSync('src/AnalyticsView.tsx', code);
console.log("Patched fetch logic");
