const fs = require('fs');
let code = fs.readFileSync('src/firebase.ts', 'utf8');

// Modify callAiWithQuota
code = code.replace(
  /export async function callAiWithQuota\(uid: string, plan: string \| undefined, payload: any, maxAiGenerations: number = 50\): Promise<any> \{[\s\S]*?return result;\n\}/g,
  `export const AI_MODELS = [
  { id: "gemini-3.1-flash-lite", name: "Gemini 3.1 Flash Lite", multiplier: 1 },
  { id: "gemini-3.5-flash-lite", name: "Gemini 3.5 Flash Lite", multiplier: 2 },
  { id: "gemini-3.5-flash", name: "Gemini 3.5 Flash", multiplier: 5 },
  { id: "gemini-3.6-flash", name: "Gemini 3.6 Flash", multiplier: 10 },
  { id: "gemini-3.1-pro", name: "Gemini 3.1 Pro", multiplier: 25 },
];

export async function callAiWithQuota(uid: string, plan: string | undefined, payload: any, aiTokenLimit: number = 1000000): Promise<any> {
    const userDocRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userDocRef);
    let aiTokensUsed = 0;
    let lastAiRequestDate = "";
    
    const currentUser = auth.currentUser;
    let isAdmin = currentUser?.email?.toLowerCase() === "nalendraputra71@gmail.com";

    if (userSnap.exists()) {
        const data = userSnap.data();
        aiTokensUsed = data?.aiTokensUsed || 0;
        lastAiRequestDate = data?.lastAiRequestDate || "";
        if (data?.role === "admin" || data?.email?.toLowerCase() === "nalendraputra71@gmail.com") {
            isAdmin = true;
        }
    }

    const todayMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
    if (lastAiRequestDate.substring(0, 7) !== todayMonth) {
        aiTokensUsed = 0; // Reset every month
    }

    const MAX_TOKENS = isAdmin ? 999999999 : (plan === 'vip' ? 999999999 : (aiTokenLimit || 1000000));
    
    if (!isAdmin && aiTokensUsed >= MAX_TOKENS) {
        throw new Error(\`Limit AI Credits bulanan habis (\${aiTokensUsed.toLocaleString()}/\${MAX_TOKENS.toLocaleString()} credits). Silakan upgrade plan Anda.\`);
    }

    // Dapatkan ID Token untuk verifikasi di sisi server
    let token = "";
    if (currentUser) {
        token = await currentUser.getIdToken();
    }

    const req = await fetch("/api/gemini", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": \`Bearer \${token}\` 
        },
        body: JSON.stringify(payload)
    });
    
    if (!req.ok) {
        let errorMsg = "Gagal menghubungi server AI";
        try {
            const err = await req.json();
            errorMsg = err.error || errorMsg;
        } catch (e) {}
        throw new Error(errorMsg);
    }
    
    const result = await req.json();
    
    const modelUsed = payload.model || "gemini-3.5-flash";
    const modelInfo = AI_MODELS.find(m => m.id === modelUsed);
    const multiplier = modelInfo ? modelInfo.multiplier : 5;
    
    const rawTokens = result.usageMetadata?.totalTokenCount || 0;
    const creditsUsed = rawTokens * multiplier;

    // Increment request count & credits
    await setDoc(userDocRef, {
        aiRequestsToday: increment(1),
        lastAiRequestDate: new Date().toISOString().split('T')[0],
        aiTokensUsed: increment(creditsUsed)
    }, { merge: true });

    return result;
}`
);

fs.writeFileSync('src/firebase.ts', code);
console.log("Updated callAiWithQuota in src/firebase.ts");
