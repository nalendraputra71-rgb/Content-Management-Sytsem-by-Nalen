const fs = require('fs');
let code = fs.readFileSync('src/SocialStudioView.tsx', 'utf8');

const badCode = `            } catch (err) {
              console.error(\`Failed to fetch \${platform} data\`, err);
            }
          }
        }
        
              const insightsRes = await fetch(\`/api/meta/data?workspaceId=\${workspaceId}&platform=\${platform}&type=insights\`);
              if (insightsRes.ok) {
                const insightsData = await insightsRes.json();
                if (insightsData.data && insightsData.data.length > 0) {
                  setRealInsights((prev: any) => ({ ...prev, [platform]: insightsData.data }));
                }
              }
              
        setRealPosts(allPosts);
        setRealComments(allComments);`;

const goodCode = `              const insightsRes = await fetch(\`/api/meta/data?workspaceId=\${workspaceId}&platform=\${platform}&type=insights\`);
              if (insightsRes.ok) {
                const insightsData = await insightsRes.json();
                if (insightsData.data && insightsData.data.length > 0) {
                  setRealInsights((prev: any) => ({ ...prev, [platform]: insightsData.data }));
                }
              }
            } catch (err) {
              console.error(\`Failed to fetch \${platform} data\`, err);
            }
          }
        }
              
        setRealPosts(allPosts);
        setRealComments(allComments);`;

code = code.replace(badCode, goodCode);
fs.writeFileSync('src/SocialStudioView.tsx', code);
