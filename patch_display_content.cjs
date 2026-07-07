const fs = require('fs');
let code = fs.readFileSync('src/SocialStudioView.tsx', 'utf8');

const displayContentStr = `  const DISPLAY_CONTENT = React.useMemo(() => {
    let list = Array.from({ length: 40 }).map((_, i) => {
      const month = 5 + (i % 4); // Bulan: 5 (May), 6 (June), 7 (July), 8 (August)
      const day = ((i * 7) % 28) + 1;
      const images = [
        "https://images.unsplash.com/photo-1515347619362-67396c01e523?w=100&h=100&fit=crop",
        "https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?w=100&h=100&fit=crop",
        "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=100&h=100&fit=crop",
      ];
      const type = ["ig", "tt", "fb", "yt"][i % 4];
      const status = ["published", "scheduled", "draft"][i % 3];
      return {
        id: "post" + i,
        title: \`Ide Konten \${type.toUpperCase()} \${i + 1}\`,
        type: type,
        status: status,
        date: \`2026-\${month.toString().padStart(2, "0")}-\${day
          .toString()
          .padStart(2, "0")}\`,
        views: Math.floor(Math.random() * 5000),
        likes: Math.floor(Math.random() * 500),
        comments: Math.floor(Math.random() * 50),
        er: (Math.random() * 5).toFixed(1) + "%",
        image: images[i % 3],
      };
    });`;

const newDisplayContentStr = `  const DISPLAY_CONTENT = React.useMemo(() => {
    let list = realPosts.length > 0 ? realPosts.map(p => ({
        id: p.id,
        title: p.content,
        type: p.platform === "meta" ? "fb" : "ig",
        status: p.status,
        date: p.date,
        views: 0,
        likes: p.likes,
        comments: p.comments,
        er: "0%",
        image: p.media || "https://images.unsplash.com/photo-1515347619362-67396c01e523?w=100&h=100&fit=crop"
    })) : Array.from({ length: 40 }).map((_, i) => {
      const month = 5 + (i % 4); // Bulan: 5 (May), 6 (June), 7 (July), 8 (August)
      const day = ((i * 7) % 28) + 1;
      const images = [
        "https://images.unsplash.com/photo-1515347619362-67396c01e523?w=100&h=100&fit=crop",
        "https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?w=100&h=100&fit=crop",
        "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=100&h=100&fit=crop",
      ];
      const type = ["ig", "tt", "fb", "yt"][i % 4];
      const status = ["published", "scheduled", "draft"][i % 3];
      return {
        id: "post" + i,
        title: \`Ide Konten \${type.toUpperCase()} \${i + 1}\`,
        type: type,
        status: status,
        date: \`2026-\${month.toString().padStart(2, "0")}-\${day
          .toString()
          .padStart(2, "0")}\`,
        views: Math.floor(Math.random() * 5000),
        likes: Math.floor(Math.random() * 500),
        comments: Math.floor(Math.random() * 50),
        er: (Math.random() * 5).toFixed(1) + "%",
        image: images[i % 3],
      };
    });`;

code = code.replace(displayContentStr, newDisplayContentStr);
fs.writeFileSync('src/SocialStudioView.tsx', code);
