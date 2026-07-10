const fs = require('fs');
let code = fs.readFileSync('src/SocialStudioView.tsx', 'utf8');

const fetchFunctionStart = `    const fetchData = async () => {
      try {
        let allPosts: any[] = [];
        let allComments: any[] = [];
        let apiErrors: string[] = [];
        
        // Fetch for meta and instagram if connected
        for (const platform of ['meta', 'instagram']) {
          if (connectedAccountsData[platform]) {
            try {
              const accToken = connectedAccountsData[platform].accessToken; 
              const accId = connectedAccountsData[platform].accountId; 
              
              const postsRes = await fetch(\`/api/meta/data?workspaceId=\${workspaceId}&platform=\${platform}&type=posts&clientAccessToken=\${accToken}&clientAccountId=\${accId}\`);
              const postsData = await postsRes.json().catch(() => ({}));
              if (postsRes.ok && !postsData.error) {
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
                    author: connectedAccountsData[platform].accountName || platform
                  }));
                  allPosts = [...allPosts, ...mappedPosts];
                }
              } else {
                apiErrors.push(\`\${platform} (posts): \${postsData.error?.message || postsData.error || postsRes.statusText}\`);
              }
              
              const commentsRes = await fetch(\`/api/meta/data?workspaceId=\${workspaceId}&platform=\${platform}&type=comments&clientAccessToken=\${accToken}&clientAccountId=\${accId}\`);
              const commentsData = await commentsRes.json().catch(() => ({}));
              if (commentsRes.ok && !commentsData.error) {
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
              } else {
                apiErrors.push(\`\${platform} (comments): \${commentsData.error?.message || commentsData.error || commentsRes.statusText}\`);
              }

              const insightsRes = await fetch(\`/api/meta/data?workspaceId=\${workspaceId}&platform=\${platform}&type=insights&clientAccessToken=\${accToken}&clientAccountId=\${accId}\`);
              const insightsData = await insightsRes.json().catch(() => ({}));
              if (insightsRes.ok && !insightsData.error) {
                if (insightsData.data && insightsData.data.length > 0) {
                  setRealInsights((prev: any) => ({ ...prev, [platform]: insightsData.data }));
                }
              } else {
                apiErrors.push(\`\${platform} (insights): \${insightsData.error?.message || insightsData.error || insightsRes.statusText}\`);
              }
            } catch (err: any) {
              console.error(\`Failed to fetch \${platform} data\`, err);
              apiErrors.push(\`\${platform}: \${err.message || 'Unknown error'}\`);
            }
          }
        }
        
        if (apiErrors.length > 0) {
          setMetaApiError(apiErrors.join(' | '));
        } else {
          setMetaApiError(null);
        }
        
        setRealPosts(allPosts);
        setRealComments(allComments);
      } catch (e) {
        console.error(e);
      }
    };`;

const oldFetchFunctionStart = /const fetchData = async \(\) => \{[\s\S]*?setRealComments\(allComments\);\n\s*\} catch \(e\) \{\n\s*console\.error\(e\);\n\s*\}\n\s*\};/;

code = code.replace(oldFetchFunctionStart, fetchFunctionStart);

fs.writeFileSync('src/SocialStudioView.tsx', code);
