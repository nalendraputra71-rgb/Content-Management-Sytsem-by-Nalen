const fs = require('fs');
let code = fs.readFileSync('src/SocialStudioView.tsx', 'utf8');

const oldFetch = `        setRealPosts(allPosts);
        setRealComments(allComments);
      } catch (e) {
        console.error(e);
      }`;

const newFetch = `
              const insightsRes = await fetch(\`/api/meta/data?workspaceId=\${workspaceId}&platform=\${platform}&type=insights\`);
              if (insightsRes.ok) {
                const insightsData = await insightsRes.json();
                if (insightsData.data && insightsData.data.length > 0) {
                  setRealInsights((prev: any) => ({ ...prev, [platform]: insightsData.data }));
                }
              }
              
        setRealPosts(allPosts);
        setRealComments(allComments);
      } catch (e) {
        console.error(e);
      }`;

code = code.replace(oldFetch, newFetch);

const oldChart = `  const MOCK_CHART_DATA = React.useMemo(() => {
    // We could map realInsights here but let's just keep the shape for the graph
    // Or we can return real chart data if we fetched it, for now we will keep dummy chart data to avoid breaking the chart component, but we will replace posts and comments below.

    // Generate different seeds based on platform and what is being viewed`;

const newChart = `  const MOCK_CHART_DATA = React.useMemo(() => {
    if (realInsights && Object.keys(realInsights).length > 0) {
      // Just map some basic data from insights for the chart if we have it
      // Let's create a 14-day array mapping the values if available, or just mock it cleanly
      const dataToUse = realInsights[analyticsPlatform] || realInsights['meta'] || realInsights['instagram'];
      if (dataToUse) {
        // Typically insights have {name: 'page_impressions', values: [{value, end_time}]}
        // We'll extract the first metric's values for dates.
        const metric = dataToUse[0];
        if (metric && metric.values) {
          return metric.values.map((v: any, i: number) => ({
             date: new Date(v.end_time).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}),
             views: v.value || 0,
             reach: v.value || 0,
             likes: 0,
             comments: 0,
             shares: 0,
             er: 0,
             reposts: 0,
             saves: 0
          }));
        }
      }
    }

    // Generate different seeds based on platform and what is being viewed`;

code = code.replace(oldChart, newChart);
fs.writeFileSync('src/SocialStudioView.tsx', code);
