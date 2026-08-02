const fs = require('fs');
let code = fs.readFileSync('src/AnalyticsView.tsx', 'utf8');

const importReplacement = `import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth, callAiWithQuota } from "./firebase";`;
code = code.replace('import { auth, callAiWithQuota } from "./firebase";', importReplacement);

const newStates = `
  const [extraContent, setExtraContent] = useState<any[]>([]);
  const [fetchedMonths, setFetchedMonths] = useState<Set<string>>(new Set());
`;
code = code.replace('const [isMobile, setIsMobile] = useState(false);', newStates + '\n  const [isMobile, setIsMobile] = useState(false);');

const contentReplacement = `
  const content = useMemo(() => {
    if (isTutorialActive) {
      // Generate dummy content for the tutorial. 
      // Distribute dates over the last 90 days for better trend visualization
      const dummy = [];
      const now = new Date();
      for (let i = 0; i < 90; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() - Math.floor(Math.random() * 90));
        dummy.push({
          id: 'dummy_' + i,
          title: 'Dummy Content ' + (i+1),
          year: d.getFullYear(),
          month: d.getMonth() + 1,
          day: d.getDate(),
          status: 'Published',
          platform: ['Instagram', 'TikTok', 'Facebook'][Math.floor(Math.random() * 3)],
          contentType: ['Reels', 'Carousel', 'Single Post', 'Video'][Math.floor(Math.random() * 4)],
          pic: ['PIC A', 'PIC B', 'PIC C'][Math.floor(Math.random() * 3)],
          metrics: {
            views: Math.floor(Math.random() * 10000) + 1000,
            reach: Math.floor(Math.random() * 8000) + 500,
            engagement: Math.floor(Math.random() * 500) + 50,
            likes: Math.floor(Math.random() * 400) + 50,
            comments: Math.floor(Math.random() * 100) + 5,
            shares: Math.floor(Math.random() * 50) + 1,
            saves: Math.floor(Math.random() * 40) + 1,
          },
          uploadHour: Math.floor(Math.random() * 24),
          isAds: Math.random() > 0.8
        });
      }
      return dummy;
    }
    const map = new Map();
    (originalContent || []).forEach((c: any) => map.set(c.id, c));
    extraContent.forEach(c => map.set(c.id, c));
    return Array.from(map.values());
  }, [originalContent, extraContent, isTutorialActive]);
`;

code = code.replace(/const content = useMemo\(\(\) => \{[\s\S]*?\}, \[originalContent, isTutorialActive\]\);/, contentReplacement);

fs.writeFileSync('src/AnalyticsView.tsx', code);
console.log("Patched states and content memo");
