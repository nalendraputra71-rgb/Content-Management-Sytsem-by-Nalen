const fs = require('fs');

let serverCode = fs.readFileSync('server.ts', 'utf8');

const toolsCode = `
    const { prompt, model = "gemini-3.5-flash", system, history = [], useSearchGrounding, workspaceId } = req.body;
    
    // Mengambil API Key murni dari Google AI Studio dropdown atau secret
    apiKey = (process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "").trim();
    apiKeyName = process.env.VITE_GEMINI_API_KEY ? "VITE_GEMINI_API_KEY" : "GEMINI_API_KEY";
    
    console.log(\`[API KEY INFO] Menggunakan kunci: \${apiKeyName} (Prefix: \${apiKey ? apiKey.substring(0, 6) : "none"}). Jika Anda menggunakan kunci gratis, batas limit berlaku.\`);
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY belum dikonfigurasi di server (Settings > Secrets)." });
    }

    // Inisialisasi GoogleGenAI dengan format objek sesuai SDK @google/genai
    const ai = new GoogleGenAI({ apiKey });
    const config: any = {};
    if (system) config.systemInstruction = system;
    if (useSearchGrounding) {
        config.tools = [{ googleSearch: {} }];
    }
    
    // Tambahkan tool fetch_workspace_data jika workspaceId tersedia
    if (workspaceId) {
       if (!config.tools) config.tools = [];
       config.tools.push({
          functionDeclarations: [
             {
                name: "fetch_workspace_data",
                description: "Mengambil data analitik, metrik, performa konten, dan jadwal posting dari workspace media sosial pengguna. Gunakan tool ini jika pengguna menanyakan data performa, jadwal, konten, atau metrik (views, reach, ER, likes).",
                parameters: {
                   type: "OBJECT",
                   properties: {
                      dataType: { type: "STRING", description: "Jenis data yang ingin diambil: 'content_performance' (untuk melihat performa konten individu), 'analytics_summary' (untuk melihat total keseluruhan metrik), atau 'scheduled_posts' (untuk melihat konten yang akan dipublikasikan)." },
                      month: { type: "STRING", description: "Filter bulan dalam format YYYY-MM (contoh: '2025-01' untuk Januari 2025). Kosongkan untuk mengambil semua data terbaru." }
                   },
                   required: ["dataType"]
                }
             }
          ]
       });
    }

    let contents: any[] = [];
`;

serverCode = serverCode.replace(
    /const { prompt, model = "gemini-3.5-flash".*?let contents: any\[\] = \[\];/s,
    toolsCode
);

const execCode = `
    let response;
    let retries = 3;
    let toolCallLimit = 3;

    while (retries > 0) {
      try {
        response = await ai.models.generateContent({
          model: model,
          contents: contents,
          config: Object.keys(config).length > 0 ? config : undefined
        });

        // Tangani Function Calling secara otomatis di backend
        while (response.functionCalls && response.functionCalls.length > 0 && toolCallLimit > 0) {
           toolCallLimit--;
           const call = response.functionCalls[0];
           console.log(\`[Gemini] Model memanggil tool: \${call.name} dengan args:\`, call.args);
           
           let result: any = { error: "Function tidak diketahui" };
           
           try {
              if (call.name === "fetch_workspace_data" && workspaceId) {
                 const { dataType, month } = call.args;
                 const db = getFirestore(getApp(), firestoreDatabaseId || "(default)");
                 const contentSnap = await db.collection("workspaces").doc(workspaceId).collection("content").get();
                 
                 let docs = contentSnap.docs.map(d => d.data());
                 
                 if (month) {
                    docs = docs.filter(d => d.date && d.date.startsWith(month));
                 }
                 
                 if (dataType === "analytics_summary") {
                    let totalViews = 0, totalReach = 0, totalLikes = 0, totalComments = 0;
                    docs.forEach(c => {
                       const metrics = c.metrics || {};
                       const adsMetrics = c.adsMetrics || {};
                       totalViews += (metrics.views || 0) + (adsMetrics.views || 0);
                       totalReach += (metrics.reach || 0) + (adsMetrics.reach || 0);
                       totalLikes += (metrics.likes || 0) + (adsMetrics.likes || 0);
                       totalComments += (metrics.comments || 0) + (adsMetrics.comments || 0);
                    });
                    const totalEng = totalLikes + totalComments;
                    const avgER = totalReach > 0 ? ((totalEng / totalReach) * 100).toFixed(2) + "%" : "0%";
                    
                    result = {
                       summary: \`Ditemukan \${docs.length} postingan\${month ? ' di bulan ' + month : ''}.\`,
                       metrics: { totalViews, totalReach, totalLikes, totalComments, averageEngagementRate: avgER }
                    };
                 } else if (dataType === "content_performance") {
                    result = docs.filter(d => d.status === "published" || d.status === "posted").map(c => {
                       const metrics = c.metrics || {};
                       const totalViews = (metrics.views || 0);
                       const totalLikes = (metrics.likes || 0);
                       return { title: c.title, date: c.date, platform: Array.isArray(c.platform) ? c.platform.join(",") : c.platform, views: totalViews, likes: totalLikes, status: c.status };
                    }).sort((a,b) => b.views - a.views).slice(0, 10); // Ambil 10 teratas untuk hemat token
                 } else if (dataType === "scheduled_posts") {
                    result = docs.filter(d => d.status === "scheduled" || d.status === "draft").map(c => ({
                       title: c.title, scheduledAt: c.scheduledAt || c.date, platform: Array.isArray(c.platform) ? c.platform.join(",") : c.platform, status: c.status
                    })).slice(0, 15);
                 } else {
                    result = { error: "dataType tidak valid" };
                 }
              } else {
                 result = { error: "Tool tidak didukung atau workspaceId tidak diberikan." };
              }
           } catch (err: any) {
              console.error("[Function Calling Error]:", err);
              result = { error: err.message };
           }

           // Append function call & response ke history
           contents.push({ role: "model", parts: [{ functionCall: call }] });
           contents.push({ role: "user", parts: [{ functionResponse: { name: call.name, response: result } }] });

           // Generate lagi setelah mendapatkan hasil fungsi
           response = await ai.models.generateContent({
             model: model,
             contents: contents,
             config: Object.keys(config).length > 0 ? config : undefined
           });
        }

        break; // Success
      } catch (error: any) {
        if (error.status === 503 && retries > 1) {
          retries--;
          await new Promise(resolve => setTimeout(resolve, 2000)); // wait 2 seconds before retry
          continue;
        }
        throw error;
      }
    }
`;

serverCode = serverCode.replace(
    /let response;\s*let retries = 3;\s*while \(retries > 0\) \{.*?throw error;\s*\}\s*\}/s,
    execCode
);

fs.writeFileSync('server.ts', serverCode);
console.log('server.ts updated');
