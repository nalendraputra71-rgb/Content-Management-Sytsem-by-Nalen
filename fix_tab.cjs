const fs = require('fs');
let content = fs.readFileSync('src/DashboardTab.tsx', 'utf8');

// The file currently ends with:
//             </motion.div>
//           
//           {/* ANALYTICS EXPERT */}
//   );
// }

const match = content.indexOf('</motion.div>');
if (match !== -1) {
    const start = content.substring(0, match + '</motion.div>'.length);
    fs.writeFileSync('src/DashboardTab.tsx', start + '\n  );\n}\n');
}
