const fs = require('fs');
let code = fs.readFileSync('src/AdminPanel.tsx', 'utf8');

// replace features: [] with features: editingPlan?.features || []
code = code.replace(/features: \[\],/g, 'features: editingPlan?.features || [],');

// refetch plans after save
code = code.replace(/setShowPlanModal\(false\);/g, `
       setShowPlanModal(false);
       // Refresh plans locally
       getDocs(collection(db, "plans")).then(snap => {
         setPlans(snap.docs.map(d => ({id: d.id, ...(d.data() as any)})));
       });`);

fs.writeFileSync('src/AdminPanel.tsx', code);
