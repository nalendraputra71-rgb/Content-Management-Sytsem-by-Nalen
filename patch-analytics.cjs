const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldAnalytics = `              if (dataType === "analytics_summary") {
                let totalViews = 0,
                  totalReach = 0,
                  totalLikes = 0,
                  totalComments = 0;
                docs.forEach((c) => {
                  const metrics = c.metrics || {};
                  const adsMetrics = c.adsMetrics || {};
                  totalViews += (metrics.views || 0) + (adsMetrics.views || 0);
                  totalReach += (metrics.reach || 0) + (adsMetrics.reach || 0);
                  totalLikes += (metrics.likes || 0) + (adsMetrics.likes || 0);
                  totalComments +=
                    (metrics.comments || 0) + (adsMetrics.comments || 0);
                });
                const totalEng = totalLikes + totalComments;
                const avgER =
                  totalReach > 0
                    ? ((totalEng / totalReach) * 100).toFixed(2) + "%"
                    : "0%";

                result = {
                  summary: \`Ditemukan \${docs.length} postingan\${month ? " di bulan " + month : ""}.\`,
                  metrics: {
                    totalViews,
                    totalReach,
                    totalLikes,
                    totalComments,
                    averageEngagementRate: avgER,
                  },
                };`;

const newAnalytics = `              if (dataType === "analytics_summary") {
                let totalViews = 0,
                  totalReach = 0,
                  totalLikes = 0,
                  totalComments = 0,
                  totalShares = 0,
                  totalSaves = 0,
                  totalReposts = 0;
                  
                const perPlatform: Record<string, any> = {};

                docs.forEach((c) => {
                  const metrics = c.metrics || {};
                  const adsMetrics = c.adsMetrics || {};
                  
                  const v = (metrics.views || 0) + (adsMetrics.views || 0);
                  const r = (metrics.reach || 0) + (adsMetrics.reach || 0);
                  const l = (metrics.likes || 0) + (adsMetrics.likes || 0);
                  const comm = (metrics.comments || 0) + (adsMetrics.comments || 0);
                  const sh = (metrics.shares || 0) + (adsMetrics.shares || 0);
                  const sa = (metrics.saves || 0) + (adsMetrics.saves || 0);
                  const rep = (metrics.reposts || 0) + (adsMetrics.reposts || 0);
                  
                  totalViews += v;
                  totalReach += r;
                  totalLikes += l;
                  totalComments += comm;
                  totalShares += sh;
                  totalSaves += sa;
                  totalReposts += rep;
                  
                  // Per platform grouping
                  const plats = Array.isArray(c.platform) ? c.platform : (typeof c.platform === "string" ? c.platform.split(',').map((s: string) => s.trim()) : ["unknown"]);
                  plats.forEach((plat: string) => {
                     const p = plat.toLowerCase();
                     if (!perPlatform[p]) {
                        perPlatform[p] = { views: 0, reach: 0, likes: 0, comments: 0, shares: 0, saves: 0, reposts: 0, postsCount: 0 };
                     }
                     perPlatform[p].views += v;
                     perPlatform[p].reach += r;
                     perPlatform[p].likes += l;
                     perPlatform[p].comments += comm;
                     perPlatform[p].shares += sh;
                     perPlatform[p].saves += sa;
                     perPlatform[p].reposts += rep;
                     perPlatform[p].postsCount += 1;
                  });
                });
                const totalEng = totalLikes + totalComments + totalShares + totalSaves + totalReposts;
                const avgER =
                  totalReach > 0
                    ? ((totalEng / totalReach) * 100).toFixed(2) + "%"
                    : "0%";
                    
                Object.keys(perPlatform).forEach(p => {
                    const eng = perPlatform[p].likes + perPlatform[p].comments + perPlatform[p].shares + perPlatform[p].saves + perPlatform[p].reposts;
                    perPlatform[p].engagementRate = perPlatform[p].reach > 0 ? ((eng / perPlatform[p].reach) * 100).toFixed(2) + "%" : "0%";
                });

                result = {
                  summary: \`Ditemukan \${docs.length} postingan\${month ? " di bulan " + month : ""}.\`,
                  metrics: {
                    totalViews,
                    totalReach,
                    totalLikes,
                    totalComments,
                    totalShares,
                    totalSaves,
                    totalReposts,
                    averageEngagementRate: avgER,
                  },
                  perPlatform
                };`;

code = code.replace(oldAnalytics, newAnalytics);
fs.writeFileSync('server.ts', code);
console.log('patched analytics_summary');
