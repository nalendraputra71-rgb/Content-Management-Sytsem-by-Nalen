const fs = require('fs');
let code = fs.readFileSync('src/AdminPanel.tsx', 'utf8');

const replacement = `                        </div>
                      </div>
                   </div>
                 </div>
               </div>
               
               {/* Modal Sticky Footer */}`;

code = code.replace(/                        <\/div>\n                      <\/div>\n<\/div>\n               <\/div>\n\n               \{\/\* Modal Sticky Footer \*\/\}/g, replacement);

fs.writeFileSync('src/AdminPanel.tsx', code);
