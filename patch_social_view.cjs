const fs = require('fs');
let code = fs.readFileSync('src/SocialStudioView.tsx', 'utf8');

// Replace MOCK_CHART_DATA useMemo with real state
const stateDeclarations = `  const [aiLoading, setAiLoading] = useState(false);

  const [realPosts, setRealPosts] = useState<any[]>([]);
  const [realComments, setRealComments] = useState<any[]>([]);
  const [realInsights, setRealInsights] = useState<any>(null);
  
  useEffect(() => {
    if (!workspaceId) return;
    
    const fetchData = async () => {
      try {
        let allPosts: any[] = [];
        let allComments: any[] = [];
        
        // Fetch for meta and instagram if connected
        for (const platform of ['meta', 'instagram']) {
          if (connectedAccountsData[platform]) {
            try {
              const postsRes = await fetch(\`/api/meta/data?workspaceId=\${workspaceId}&platform=\${platform}&type=posts\`);
              if (postsRes.ok) {
                const postsData = await postsRes.json();
                if (postsData.data) {
                  const mappedPosts = postsData.data.map((p: any) => ({
                    id: p.id,
                    platform: platform,
                    content: p.message || p.caption || "No content",
                    date: new Date(p.created_time || p.timestamp).toLocaleDateString(),
                    status: "published",
                    likes: p.likes?.summary?.total_count || p.like_count || 0,
                    comments: p.comments?.summary?.total_count || p.comments_count || 0,
                    media: p.media_url || p.attachments?.data?.[0]?.media?.image?.src || "",
                    author: connectedAccountsData[platform].accountName
                  }));
                  allPosts = [...allPosts, ...mappedPosts];
                }
              }
              
              const commentsRes = await fetch(\`/api/meta/data?workspaceId=\${workspaceId}&platform=\${platform}&type=comments\`);
              if (commentsRes.ok) {
                const commentsData = await commentsRes.json();
                if (commentsData.data) {
                  const commentsList: any[] = [];
                  commentsData.data.forEach((item: any) => {
                    if (item.comments && item.comments.data) {
                      item.comments.data.forEach((c: any) => {
                        commentsList.push({
                          id: c.id,
                          platform: platform,
                          senderName: c.from?.name || c.username || "Unknown",
                          content: c.message || c.text || "",
                          time: new Date(c.created_time || c.timestamp).toLocaleDateString(),
                          avatar: "https://i.pravatar.cc/150?u=" + (c.from?.id || c.id)
                        });
                      });
                    }
                  });
                  allComments = [...allComments, ...commentsList];
                }
              }
            } catch (err) {
              console.error(\`Failed to fetch \${platform} data\`, err);
            }
          }
        }
        
        setRealPosts(allPosts);
        setRealComments(allComments);
      } catch (e) {
        console.error(e);
      }
    };
    
    fetchData();
  }, [workspaceId, connectedAccountsData]);
`;

code = code.replace(`  const [aiLoading, setAiLoading] = useState(false);`, stateDeclarations);

// Update MOCK_CHART_DATA to just return some static data or realInsights based for now to not break the UI
const chartReplacement = `  const MOCK_CHART_DATA = React.useMemo(() => {
    // We could map realInsights here but let's just keep the shape for the graph
    // Or we can return real chart data if we fetched it, for now we will keep dummy chart data to avoid breaking the chart component, but we will replace posts and comments below.
`;

code = code.replace(`  const MOCK_CHART_DATA = React.useMemo(() => {`, chartReplacement);

fs.writeFileSync('src/SocialStudioView.tsx', code);
