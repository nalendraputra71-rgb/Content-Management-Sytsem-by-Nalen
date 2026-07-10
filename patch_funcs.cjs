const fs = require('fs');
let code = fs.readFileSync('src/SocialStudioView.tsx', 'utf8');

code = code.replace(
  /const handleChatSubmit = async \(\) => \{\};/g,
  `const handleChatSubmit = async (...args: any[]) => {};`
).replace(
  /const handleCloseConfigPanel = \(\) => \{\};/g,
  `const handleCloseConfigPanel = (...args: any[]) => {};`
).replace(
  /const handleCreatePost = async \(\) => \{\};/g,
  `const handleCreatePost = async (...args: any[]) => {};`
).replace(
  /const handleDiscardConfigs = \(\) => \{\};/g,
  `const handleDiscardConfigs = (...args: any[]) => {};`
).replace(
  /const handleToggleConfigPanel = \(\) => \{\};/g,
  `const handleToggleConfigPanel = (...args: any[]) => {};`
).replace(
  /const saveConfig = async \(\) => \{\};/g,
  `const saveConfig = async (...args: any[]) => {};`
).replace(
  /const sendCommentReply = async \(\) => \{\};/g,
  `const sendCommentReply = async (...args: any[]) => {};`
).replace(
  /const sendDMMessage = async \(\) => \{\};/g,
  `const sendDMMessage = async (...args: any[]) => {};`
);

fs.writeFileSync('src/SocialStudioView.tsx', code);
