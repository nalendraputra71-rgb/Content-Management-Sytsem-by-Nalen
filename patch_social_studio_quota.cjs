const fs = require('fs');
let code = fs.readFileSync('src/SocialStudioView.tsx', 'utf8');

const oldQuota1 = /const data = await callAiWithQuota\(\n          auth\.currentUser\?\.uid \|\| "anon",\n          profile\?\.plan,\n          \{\n            prompt: `Buat ${contentCount} ide konten unik dan sangat menarik untuk platform ${platformId\.toUpperCase()} dengan tema "${topic}"\.\n\nBerdasarkan insight audiens berikut:\n${analyticsData ? JSON\.stringify\(analyticsData\) : "Tidak ada data spesifik, gunakan praktik terbaik umum\."}\n\nBerikan hasil HANYA DALAM FORMAT JSON ARRAY murni \(tanpa markdown \`\`\`json\), di mana setiap elemen adalah string ide konten\.`,\n            model: "gemini-3\.5-flash",\n          \},\n          planDetails\?\.aiTokenLimit \|\| 10,\n        \);/g;
        
const newQuota1 = `const data = await callAiWithQuota(
          auth.currentUser?.uid || "anon",
          profile?.plan,
          {
            prompt: \`Buat \${contentCount} ide konten unik dan sangat menarik untuk platform \${platformId.toUpperCase()} dengan tema "\${topic}".

Berdasarkan insight audiens berikut:
\${analyticsData ? JSON.stringify(analyticsData) : "Tidak ada data spesifik, gunakan praktik terbaik umum."}

Berikan hasil HANYA DALAM FORMAT JSON ARRAY murni (tanpa markdown \`\`\`json), di mana setiap elemen adalah string ide konten.\`,
            model: "gemini-3.5-flash",
          },
          aiTokenLimit,
        );`;
        
code = code.replace(oldQuota1, newQuota1);

const oldQuota2 = /const data = await callAiWithQuota\(\n        auth\.currentUser\?\.uid \|\| "anon",\n        profile\?\.plan,\n        \{\n          prompt: basePrompt,\n          model: "gemini-3\.5-flash",\n        \},\n        planDetails\?\.aiTokenLimit \|\| 10,\n      \);/g;
      
const newQuota2 = `const data = await callAiWithQuota(
        auth.currentUser?.uid || "anon",
        profile?.plan,
        {
          prompt: basePrompt,
          model: "gemini-3.5-flash",
        },
        aiTokenLimit,
      );`;

code = code.replace(oldQuota2, newQuota2);


// inject hook destructuring
if (code.includes('const { checkCanAddSocialAccount, maxSocialAccounts } = usePlanLimits();') && !code.includes('aiTokenLimit')) {
    code = code.replace(
        'const { checkCanAddSocialAccount, maxSocialAccounts } = usePlanLimits();',
        'const { checkCanAddSocialAccount, maxSocialAccounts, aiTokenLimit } = usePlanLimits();'
    );
}

fs.writeFileSync('src/SocialStudioView.tsx', code, 'utf8');
