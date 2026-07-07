const fs = require('fs');
let code = fs.readFileSync('src/SocialStudioView.tsx', 'utf8');

const oldContentBlock = `  const DISPLAY_CONTENT = React.useMemo(() => {
    let list = Array.from({ length: 40 }).map((_, i) => {
      const month = 5 + (i % 4); // Bulan: 5 (May), 6 (June), 7 (July), 8 (August)
      const day = ((i * 7) % 28) + 1;
      const images = [
        "https://images.unsplash.com/photo-1515347619362-67396c01e523?w=100&h=100&fit=crop",
        "https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?w=100&h=100&fit=crop",
        "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=100&h=100&fit=crop",
        "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&h=100&fit=crop",
      ];
      const accounts = ["hausofkahf", "fadkheraofficial", "Fadkhera Pusat"];
      const postTypes = ["Carousel", "Reel", "Multi media", "Post"];

      return {
        id: i,
        title: \`Judul Postingan \${i % 2 === 0 ? "Menarik" : "Viral"} ke-\${i + 1}\`,
        captionSnippet:
          i % 2 === 0
            ? "Apa rahasia di balik penampilan pria yan..."
            : "Mulai hari dengan outfit yang rapi dan di...",
        postTypeLabel: postTypes[i % 4],
        accountName: accounts[i % 3],
        time: \`Mon Jun \${day}, 7:\${10 + (i % 50)}pm\`,
        type: i % 3 === 0 ? "meta" : i % 3 === 1 ? "instagram" : "tiktok",
        views: Math.floor(((i * 789) % 50000) + 1000),
        reach: i % 2 === 0 ? null : Math.floor(((i * 987) % 5000) + 50),
        likes: Math.floor(((i * 234) % 1000) + 10),
        er: (((i * 2.3) % 5) + 1).toFixed(1),
        comments: Math.floor(((i * 456) % 5000) + 10),
        shares: Math.floor(((i * 123) % 1000) + 5),
        saves: Math.floor(((i * 890) % 10000) + 20),
        thumbnail: images[i % images.length],
      };
    });`;

const newContentBlock = `  const DISPLAY_CONTENT = React.useMemo(() => {
    let list = Array.from({ length: 40 }).map((_, i) => {
      const month = 5 + (i % 4); // Bulan: 5 (May), 6 (June), 7 (July), 8 (August)
      const day = ((i * 7) % 28) + 1;
      const images = [
        "https://images.unsplash.com/photo-1515347619362-67396c01e523?w=100&h=100&fit=crop",
        "https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?w=100&h=100&fit=crop",
        "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=100&h=100&fit=crop",
        "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&h=100&fit=crop",
      ];
      const accounts = ["hausofkahf", "fadkheraofficial", "Fadkhera Pusat"];
      const postTypes = ["Carousel", "Reel", "Multi media", "Post"];

      return {
        id: i,
        title: \`Judul Postingan \${i % 2 === 0 ? "Menarik" : "Viral"} ke-\${i + 1}\`,
        captionSnippet:
          i % 2 === 0
            ? "Apa rahasia di balik penampilan pria yan..."
            : "Mulai hari dengan outfit yang rapi dan di...",
        postTypeLabel: postTypes[i % 4],
        accountName: accounts[i % 3],
        time: \`Mon Jun \${day}, 7:\${10 + (i % 50)}pm\`,
        type: i % 3 === 0 ? "meta" : i % 3 === 1 ? "instagram" : "tiktok",
        views: Math.floor(((i * 789) % 50000) + 1000),
        reach: i % 2 === 0 ? null : Math.floor(((i * 987) % 5000) + 50),
        likes: Math.floor(((i * 234) % 1000) + 10),
        er: (((i * 2.3) % 5) + 1).toFixed(1),
        comments: Math.floor(((i * 456) % 5000) + 10),
        shares: Math.floor(((i * 123) % 1000) + 5),
        saves: Math.floor(((i * 890) % 10000) + 20),
        thumbnail: images[i % images.length],
      };
    });

    if (realPosts && realPosts.length > 0) {
      list = realPosts.map((p: any) => ({
        id: p.id,
        title: p.content ? p.content.slice(0, 40) + '...' : 'Post',
        captionSnippet: p.content ? p.content.slice(0, 60) + '...' : '',
        postTypeLabel: 'Post',
        accountName: p.author || 'Account',
        time: p.date ? new Date(p.date).toLocaleString() : '',
        type: p.platform || 'instagram',
        views: p.views || 0,
        reach: p.reach || 0,
        likes: p.likes || 0,
        er: p.er || '0.0',
        comments: p.comments || 0,
        shares: p.shares || 0,
        saves: p.saves || 0,
        thumbnail: p.media || "https://images.unsplash.com/photo-1515347619362-67396c01e523?w=100&h=100&fit=crop"
      }));
    }`;

code = code.replace(oldContentBlock, newContentBlock);
fs.writeFileSync('src/SocialStudioView.tsx', code);
