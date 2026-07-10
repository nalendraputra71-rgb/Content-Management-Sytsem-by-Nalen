const fs = require('fs');
let code = fs.readFileSync('src/SocialStudioView.tsx', 'utf8');

const missingFunctions = `
  useEffect(() => {
    if (!workspaceId) return;
    
    // Dynamically load firebase to avoid static import errors if not needed everywhere
    import('./firebase').then(({ db }) => {
      import('firebase/firestore').then(({ collection, onSnapshot }) => {
        const accountsRef = collection(db, "workspaces", workspaceId, "connectedAccounts");
        const unsubscribe = onSnapshot(accountsRef, (snapshot) => {
          const accounts: Record<string, any> = {};
          const platforms: string[] = [];
          snapshot.forEach((doc) => {
            accounts[doc.id] = doc.data();
            platforms.push(doc.id);
          });
          setConnectedAccountsData(accounts);
          setConnectedPlatforms(platforms);
        }, (err) => {
          console.error("Failed to subscribe to connectedAccounts", err);
        });
        return unsubscribe;
      });
    });
  }, [workspaceId]);

  useEffect(() => {
    if (!workspaceId || connectedPlatforms.length === 0) return;
    
    const fetchApiData = async () => {
      try {
        let allPosts: any[] = [];
        let allComments: any[] = [];
        let apiErrors: string[] = [];
        
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
              
            } catch (err: any) {
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
      } catch (e) {
        console.error("fetchApiData err:", e);
      }
    };
    
    fetchApiData();
  }, [workspaceId, connectedPlatforms, connectedAccountsData]);

  const [diagnosticResult, setDiagnosticResult] = useState<Record<string, any>>({});
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  const runDiagnostic = async () => {
    setIsDiagnosing(true);
    setDiagnosticResult({});
    const results: Record<string, any> = {};
    
    if (connectedPlatforms.length === 0) {
      results["all"] = { status: "error", message: "Belum ada platform yang terkoneksi di Workspace ini." };
      setDiagnosticResult(results);
      setIsDiagnosing(false);
      return;
    }
    
    for (const platform of connectedPlatforms) {
      try {
        const accToken = connectedAccountsData[platform]?.accessToken;
        const accId = connectedAccountsData[platform]?.accountId;
        
        if (!accToken || !accId) {
          results[platform] = { status: "error", message: "Akses Token atau Account ID tidak ditemukan di database." };
          continue;
        }
        
        const res = await fetch(\`/api/meta/data?workspaceId=\${workspaceId}&platform=\${platform}&type=posts&clientAccessToken=\${accToken}&clientAccountId=\${accId}\`);
        const data = await res.json().catch(() => ({}));
        
        if (res.ok && !data.error) {
          results[platform] = { status: "success", message: "Koneksi berhasil, token valid!" };
        } else {
          results[platform] = { status: "error", message: \`Gagal: \${data.error?.message || data.error || res.statusText}\` };
        }
      } catch (err: any) {
         results[platform] = { status: "error", message: \`Error jaringan/sistem: \${err.message}\` };
      }
    }
    
    setDiagnosticResult(results);
    setIsDiagnosing(false);
  };
`;

code = code.replace(
  `const handleChatSubmit = async (...args: any[]) => {};`,
  `${missingFunctions}\n  const handleChatSubmit = async (...args: any[]) => {};`
);

fs.writeFileSync('src/SocialStudioView.tsx', code);
