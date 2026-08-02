const fs = require('fs');
let code = fs.readFileSync('src/AnalyticsView.tsx', 'utf8');

// Remove the declarations from the old place
code = code.replace(/  const \[extraContent, setExtraContent\] = useState<any\[\]>\(\[\]\);\n  const \[fetchedMonths, setFetchedMonths\] = useState<Set<string>>\(new Set\(\)\);\n/g, '');

// Insert them right before content
code = code.replace('  const content = useMemo(() => {', '  const [extraContent, setExtraContent] = useState<any[]>([]);\n  const [fetchedMonths, setFetchedMonths] = useState<Set<string>>(new Set());\n  const content = useMemo(() => {');

fs.writeFileSync('src/AnalyticsView.tsx', code);
console.log("Fixed state ordering");
