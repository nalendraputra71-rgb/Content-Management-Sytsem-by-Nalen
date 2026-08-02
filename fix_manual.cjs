const fs = require('fs');

function fixDash() {
    let code = fs.readFileSync('src/DashboardTab.tsx', 'utf8');
    // I will just add )} after <div className="flex flex-col gap-2 mt-2"> ... </div>
    // wait, where is it currently?
    // It currently looks like:
    //                    )}
    //                  </div>
    //
    //              </div>
    //            </motion.div>
    
    // Let's just find the last </div> before </div> \n </motion.div>
    
    const target = '                  </div>\n                              </div>\n            </motion.div>';
    const replacement = '                  </div>\n                )}\n              </div>\n            </motion.div>';
    code = code.replace(target, replacement);
    fs.writeFileSync('src/DashboardTab.tsx', code);
}

fixDash();
