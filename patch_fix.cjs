const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/  \}\n  const \{ workspaceId, platform \} = req\.query;\n  if \(\!workspaceId\) \{\n    return res\.status\(400\)\.send\("workspaceId is required"\);\n  \}/, '  }');
fs.writeFileSync('server.ts', code);
