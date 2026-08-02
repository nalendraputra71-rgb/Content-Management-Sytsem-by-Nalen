const fs = require('fs');

let code = fs.readFileSync('src/DashboardTab.tsx', 'utf8');

// I just need to add )} before the last </div> \n </motion.div>
// Let's split by lines.
let lines = code.split('\n');
let i = lines.length - 1;
for (; i >= 0; i--) {
  if (lines[i].includes('</motion.div>')) {
     break;
  }
}

// i is the line with </motion.div>
// the line before it is </div>
lines.splice(i-1, 0, ')}');

fs.writeFileSync('src/DashboardTab.tsx', lines.join('\n'));
