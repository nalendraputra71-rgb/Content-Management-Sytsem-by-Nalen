const fs = require('fs');
let code = fs.readFileSync('src/SocialStudioView.tsx', 'utf8');

const displayContentRegex = /const DISPLAY_CONTENT = React\.useMemo\(\(\) => \{[\s\S]*?if \(contentPlatform !== "all"\) \{/;

const newDisplayContent = `const DISPLAY_CONTENT = React.useMemo(() => {
    let list = realPosts ? realPosts.map((p: any) => ({
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
    })) : [];

    if (contentPlatform !== "all") {`;

code = code.replace(displayContentRegex, newDisplayContent);

const calendarPostsRegex = /const calendarPosts = Array\.from\(\{ length: 20 \}\)\.map\(\(_, i\) => \([\s\S]*?\}\)\);/;
const newCalendarPosts = `const calendarPosts = realPosts ? realPosts.map((p: any) => ({
    id: p.id,
    day: new Date(p.date || Date.now()).getDate(),
    time: p.date ? new Date(p.date).toLocaleTimeString() : '',
    title: p.content ? p.content.slice(0, 20) + '...' : 'Post',
    type: p.platform || 'meta',
    status: 'published'
  })) : [];`;
code = code.replace(calendarPostsRegex, newCalendarPosts);

const inboxMessagesRegex = /setInboxMessages\(MOCK_DMS\);/g;
code = code.replace(inboxMessagesRegex, `setInboxMessages([]);`);

const mockCommentsRegex = /const MOCK_COMMENTS = \[[\s\S]*?\}\];/g;
const newMockComments = `const MOCK_COMMENTS: any[] = [];`;
code = code.replace(mockCommentsRegex, newMockComments);


fs.writeFileSync('src/SocialStudioView.tsx', code);
