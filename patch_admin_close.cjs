const fs = require('fs');
let code = fs.readFileSync('src/AdminPanel.tsx', 'utf8');

code = code.replace(/                        <\/div>\n                      <\/div>\n               <\/div>\n               \{\/\* Modal Sticky Footer \*\/\}/g, `                        </div>\n                      </div>\n                    </div>\n               </div>\n               </div>\n               {/* Modal Sticky Footer */}`);

fs.writeFileSync('src/AdminPanel.tsx', code);
