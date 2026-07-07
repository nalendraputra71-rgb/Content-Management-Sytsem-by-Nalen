const fs = require('fs');
let code = fs.readFileSync('src/SocialStudioView.tsx', 'utf8');

const oldCommentsUsage = `                      {MOCK_COMMENTS.filter((m) =>
                        inboxFilter === "all"
                          ? true
                          : m.platform === inboxFilter ||
                            m.platform ===
                              (inboxFilter === "instagram" ? "meta" : ""),
                      ).length === 0 && (
                        <div className="p-6 text-center text-gray-400 text-sm font-semibold">
                          Belum ada komentar untuk saat ini.
                        </div>
                      )}
                      {MOCK_COMMENTS.filter((m) =>`;

const newCommentsUsage = `                      {(realComments.length > 0 ? realComments : MOCK_COMMENTS).filter((m) =>
                        inboxFilter === "all"
                          ? true
                          : m.platform === inboxFilter ||
                            m.platform ===
                              (inboxFilter === "instagram" ? "meta" : ""),
                      ).length === 0 && (
                        <div className="p-6 text-center text-gray-400 text-sm font-semibold">
                          Belum ada komentar untuk saat ini.
                        </div>
                      )}
                      {(realComments.length > 0 ? realComments : MOCK_COMMENTS).filter((m) =>`;

code = code.replace(oldCommentsUsage, newCommentsUsage);
fs.writeFileSync('src/SocialStudioView.tsx', code);
