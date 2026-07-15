import re

with open('src/PublicBriefView.tsx', 'r') as f:
    content = f.read()

target = '''  // Platform Preview Media Handler
  const previewMediaList = brief.referenceImage 
    ? [{ url: brief.referenceImage, type: "image" as const }] 
    : (brief.mediaList || []);'''

replacement = '''  // Platform Preview Media Handler
  let previewMediaList = brief.referenceImage 
    ? [{ url: brief.referenceImage, type: "image" as const }] 
    : (brief.mediaList || []);

  if (previewMediaList.length === 0 && brief.assetLink) {
    const driveMatch = brief.assetLink.match(/\\/d\\/([a-zA-Z0-9_-]+)/);
    if (driveMatch) {
      previewMediaList = [{ url: `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`, type: "image" as const }];
    }
  }'''

content = content.replace(target, replacement)

with open('src/PublicBriefView.tsx', 'w') as f:
    f.write(content)
