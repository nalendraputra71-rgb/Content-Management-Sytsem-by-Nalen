const fs = require('fs');
let code = fs.readFileSync('src/firebase.ts', 'utf8');

const targetFunction = /export async function callAiWithQuota\([\s\S]*?return data;\n\}/;

const newFunction = `export async function callAiWithQuota(uid: string, plan: string | undefined, payload: any, maxAiTokens: number = 100000): Promise<any> {
    const userDocRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userDocRef);
    let aiTokensUsed = 0;
    let lastAiRequestMonth = "";
    
    const currentUser = auth.currentUser;
    let isAdmin = currentUser?.email?.toLowerCase() === "nalendraputra71@gmail.com";

    if (userSnap.exists()) {
        const data = userSnap.data();
        aiTokensUsed = data?.aiTokensUsed || 0;
        lastAiRequestMonth = data?.lastAiRequestMonth || "";
        if (data?.role === "admin" || data?.email?.toLowerCase() === "nalendraputra71@gmail.com") {
            isAdmin = true;
        }
    }

    const currentMonth = new Date().toISOString().substring(0, 7); // e.g., "2026-08"
    if (lastAiRequestMonth !== currentMonth) {
        aiTokensUsed = 0;
    }

    const MAX_TOKENS = isAdmin ? 999999999 : (maxAiTokens === -1 ? 999999999 : (maxAiTokens || 100000));
    
    if (!isAdmin && aiTokensUsed >= MAX_TOKENS) {
        throw new Error(\`Credit AI Anda bulan ini habis (\${aiTokensUsed.toLocaleString()}/\${MAX_TOKENS.toLocaleString()} credits). Silakan upgrade plan Anda.\`);
    }

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
        let errorMsg = \`Server error (\${req.status})\`;
        try {
            const err = await req.json();
            errorMsg = err.error || errorMsg;
        } catch(e) {
            errorMsg = \`Server error (\${req.status}): respon tidak sesuai format.\`;
        }
        throw new Error(errorMsg);
    }
    
    const data = await req.json();
    
    // Hitung Multiplier berdasarkan model
    const model = payload.model || "gemini-3.5-flash";
    let multiplier = 5; // default gemini-3.5-flash
    if (model.includes("gemini-3.1-flash-lite")) multiplier = 1;
    else if (model.includes("gemini-3.5-flash-lite")) multiplier = 2;
    else if (model.includes("gemini-3.6-flash")) multiplier = 10;
    else if (model.includes("gemini-3.1-pro")) multiplier = 25;

    const rawTokens = data.usage?.totalTokenCount || 0;
    const billedTokens = rawTokens * multiplier;

    try {
        await updateDoc(userDocRef, {
            aiTokensUsed: lastAiRequestMonth !== currentMonth ? billedTokens : increment(billedTokens),
            lastAiRequestMonth: currentMonth
        });
    } catch (e) {
        console.error("Gagal update token stat user", e);
    }

    return data;
}`;

code = code.replace(targetFunction, newFunction);
fs.writeFileSync('src/firebase.ts', code);
console.log("Patched firebase.ts with token logic");
