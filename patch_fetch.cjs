const fs = require('fs');
let code = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');

const oldQuery = `        const wsQuery = query(collection(db, "workspaces"), where(documentId(), "in", wsIds));
        const wsSnap = await getDocs(wsQuery);
        
        const list = wsSnap.docs.map(docSnap => ({
          ...docSnap.data(),
          id: docSnap.id,
          userRole: userRoles[docSnap.id] || "viewer"
        }));`;

const newQuery = `        // Fetch each workspace individually to guarantee 'get' rules are evaluated instead of 'list' rules
        const wsPromises = wsIds.map(id => getDoc(doc(db, "workspaces", id)));
        const wsSnaps = await Promise.all(wsPromises);
        
        const list = wsSnaps
          .filter(snap => snap.exists())
          .map(docSnap => ({
            ...docSnap.data(),
            id: docSnap.id,
            userRole: userRoles[docSnap.id] || "viewer"
          }));`;

code = code.replace(oldQuery, newQuery);

code = code.replace(`import { 
  collection, query, where, getDocs, doc, deleteDoc, updateDoc, writeBatch, serverTimestamp, 
  onSnapshot, documentId, getDoc, collectionGroup, setDoc, limit, orderBy
} from "firebase/firestore";`, `import { 
  collection, query, where, getDocs, doc, deleteDoc, updateDoc, writeBatch, serverTimestamp, 
  onSnapshot, documentId, getDoc, collectionGroup, setDoc, limit, orderBy
} from "firebase/firestore";`);

fs.writeFileSync('src/layouts/MainLayout.tsx', code);
