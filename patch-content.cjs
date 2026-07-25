const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldContent = `              } else if (dataType === "content_performance") {
                const posts = docs
                  .filter(
                    (d) => d.status === "published" || d.status === "posted",
                  )
                  .map((c) => {
                    const metrics = c.metrics || {};
                    const totalViews = metrics.views || 0;
                    const totalLikes = metrics.likes || 0;
                    return {
                      title: c.title,
                      date:
                        c.date ||
                        (c.year && c.month
                          ? \`\${c.year}-\${String(c.month).padStart(2, "0")}\`
                          : ""),
                      platform: Array.isArray(c.platform)
                        ? c.platform.join(",")
                        : c.platform,
                      views: totalViews,
                      likes: totalLikes,
                      status: c.status,
                    };
                  })
                  .sort((a, b) => b.views - a.views)
                  .slice(0, 10); // Ambil 10 teratas untuk hemat token
                result = { posts };`;

const newContent = `              } else if (dataType === "content_performance") {
                const posts = docs
                  .filter(
                    (d) => d.status === "published" || d.status === "posted",
                  )
                  .map((c) => {
                    const m = c.metrics || {};
                    const am = c.adsMetrics || {};
                    const v = (m.views || 0) + (am.views || 0);
                    const r = (m.reach || 0) + (am.reach || 0);
                    const l = (m.likes || 0) + (am.likes || 0);
                    const comm = (m.comments || 0) + (am.comments || 0);
                    const sh = (m.shares || 0) + (am.shares || 0);
                    const sa = (m.saves || 0) + (am.saves || 0);
                    const rep = (m.reposts || 0) + (am.reposts || 0);
                    const eng = l + comm + sh + sa + rep;
                    const er = r > 0 ? ((eng / r) * 100).toFixed(2) + "%" : "0%";
                    return {
                      title: c.title,
                      date:
                        c.date ||
                        (c.year && c.month
                          ? \`\${c.year}-\${String(c.month).padStart(2, "0")}\`
                          : ""),
                      platform: Array.isArray(c.platform)
                        ? c.platform.join(",")
                        : c.platform,
                      views: v,
                      reach: r,
                      likes: l,
                      comments: comm,
                      engagement: eng,
                      engagementRate: er,
                      status: c.status,
                    };
                  })
                  .sort((a, b) => b.engagement - a.engagement)
                  .slice(0, 10); // Ambil 10 teratas untuk hemat token
                result = { posts };`;

code = code.replace(oldContent, newContent);
fs.writeFileSync('server.ts', code);
console.log('patched content_performance');
