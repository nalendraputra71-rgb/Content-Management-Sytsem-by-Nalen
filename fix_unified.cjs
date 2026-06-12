const fs = require('fs');
let content = fs.readFileSync('./src/SocHubView.tsx', 'utf-8');

// Add workspaceId to props
content = content.replace(/export function SocHubView\(\{ user, profile \}: any\) \{/, 'export function SocHubView({ user, profile, workspaceId }: any) {\n  const [inboxMessages, setInboxMessages] = useState<any[]>([]);\n  const [inboxFilter, setInboxFilter] = useState<"all"|"meta"|"tiktok">("all");\n  const [selectedInboxMsg, setSelectedInboxMsg] = useState<any>(null);');

// Add useEffect for inbox
const inboxEffect = `
  useEffect(() => {
    if (!workspaceId) return;
    const q = query(collection(db, "workspaces", workspaceId, "inbox"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setInboxMessages(snap.docs.map(d => ({id: d.id, ...d.data()})));
    }, (error) => { console.error("Inbox snap error", error); });
    return () => unsub();
  }, [workspaceId]);
`;

content = content.replace(/useEffect\(\(\) => \{\n    if \(!user\) return;\n    const q = query\(collection\(db, "soc_chats"\)/, inboxEffect + '\n  useEffect(() => {\n    if (!user) return;\n    const q = query(collection(db, "soc_chats")');

const dmsUIRegex = /\{\/\* Chat List \*\/\}.*?(?=\{view === "activity" && \()/s;
const unifiedInboxUI = `{/* Chat List / Unified Inbox */}
                <div style={{ width: 340, borderRight: "1px solid rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", background: "#F9FAFB" }}>
                   <div style={{ padding: "24px", fontWeight: 800, fontSize: 18, color: "#111827", paddingBottom: 16 }}>Unified Inbox</div>
                   
                   <div style={{ display: "flex", gap: 8, padding: "0 24px 16px", overflowX: "auto" }} className="no-scrollbar">
                     <button onClick={() => setInboxFilter("all")} className={\`px-3 py-1.5 rounded-full text-xs font-bold transition-colors \${inboxFilter === "all" ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-700'}\`}>All Messages</button>
                     <button onClick={() => setInboxFilter("meta")} className={\`px-3 py-1.5 rounded-full text-xs font-bold transition-colors \${inboxFilter === "meta" ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}\`}>Instagram</button>
                     <button onClick={() => setInboxFilter("tiktok")} className={\`px-3 py-1.5 rounded-full text-xs font-bold transition-colors \${inboxFilter === "tiktok" ? 'bg-black text-white' : 'bg-gray-200 text-gray-700'}\`}>TikTok</button>
                   </div>
                   
                   <div style={{ flex: 1, overflowY: "auto" }}>
                     {inboxMessages.filter(m => inboxFilter === "all" ? true : m.platform === inboxFilter).length === 0 && chats.length === 0 && (
                       <div className="p-6 text-center text-gray-400 text-sm">
                         Belum ada pesan di kotak masuk ini.
                       </div>
                     )}
                     
                     {/* Internal Chats mapping */}
                     {(inboxFilter === "all" || inboxFilter === "internal" as any) && chats.map(chat => {
                       const otherId = chat.participants.find((p: string) => p !== user.uid);
                       const otherData = chat.participantData?.[otherId] || { name: "User", avatar: "" };
                       return (
                         <div key={chat.id} onClick={() => { setChatUser({uid: otherId, ...otherData}); setSelectedInboxMsg(null); }} style={{ padding: "16px 24px", borderBottom: "1px solid rgba(0,0,0,0.04)", cursor: "pointer", background: chatUser?.uid === otherId ? "white" : "transparent", display: "flex", gap: 12, alignItems: "center" }} className="hover:bg-white transition-colors">
                            <img src={otherData.avatar || getAvatar(null, otherId)} style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 700, fontSize: 14, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{otherData.name} <span className="text-xs bg-gray-200 px-1.5 py-0.5 rounded ml-1 text-gray-600">Internal</span></div>
                              <div style={{ fontSize: 13, color: "#6B7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{chat.lastMessage || "Mulai chat..."}</div>
                            </div>
                         </div>
                       )
                     })}

                     {/* External Inbox mapping */}
                     {inboxMessages.filter(m => inboxFilter === "all" ? true : m.platform === inboxFilter || m.platform === "instagram").map(msg => (
                         <div key={msg.id} onClick={() => { setSelectedInboxMsg(msg); setChatUser(null); }} style={{ padding: "16px 24px", borderBottom: "1px solid rgba(0,0,0,0.04)", cursor: "pointer", background: selectedInboxMsg?.id === msg.id ? "white" : "transparent", display: "flex", gap: 12, alignItems: "center" }} className="hover:bg-white transition-colors">
                            <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 text-white" style={{ background: msg.platform === "meta" || msg.platform === "instagram" ? "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)" : "black" }}>
                               <MessageSquare size={20} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 700, fontSize: 14, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{msg.senderName || \`User \${msg.senderId}\`} <span className={\`text-xs px-1.5 py-0.5 rounded ml-1 text-white \${msg.platform === 'meta' || msg.platform === 'instagram' ? 'bg-gradient-to-r from-pink-500 to-orange-400' : 'bg-black'}\`}>{msg.platform === 'meta' || msg.platform === 'instagram' ? 'Instagram' : 'TikTok'}</span></div>
                              <div style={{ fontSize: 13, color: "#6B7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{msg.content}</div>
                            </div>
                         </div>
                     ))}
                   </div>
                </div>
                
                {/* Chat Window */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  {chatUser && !selectedInboxMsg ? (
                    <>
                      <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 16 }}>
                        <img src={chatUser.avatar || getAvatar(null, chatUser.uid)} style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }} />
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 16, color: "#111827" }}>{chatUser.name || "Pengguna"}</div>
                          <div style={{ fontSize: 13, color: "#6B7280" }}>Internal Chat Active</div>
                        </div>
                      </div>
                      <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                        {messages.map(m => {
                          const isMe = m.senderId === user.uid;
                          return (
                            <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
                              <div style={{ background: isMe ? "var(--theme-primary)" : "#F3F4F6", color: isMe ? "white" : "#111827", padding: "12px 16px", borderRadius: 20, borderBottomRightRadius: isMe ? 4 : 20, borderBottomLeftRadius: isMe ? 20 : 4, fontSize: 15, maxWidth: "70%" }}>{m.content}</div>
                              <span style={{ fontSize: 12, color: "#9CA3AF", marginTop: 6, padding: "0 4px" }}>{m.createdAt?.toMillis ? formatDistanceToNow(m.createdAt.toMillis(), { addSuffix: true, locale: dfnsId }) : 'Baru saja'}</span>
                            </div>
                          )
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                      <div style={{ padding: 24, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                        <div style={{ display: "flex", gap: 12, alignItems: "center", background: "#F9FAFB", padding: "8px 16px", borderRadius: 24, border: "1px solid rgba(0,0,0,0.04)" }}>
                           <input type="text" placeholder="Tulis pesan..." value={msgContent} onChange={e => setMsgContent(e.target.value)} onKeyDown={e => e.key === "Enter" && sendDM()} style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 15, padding: "8px 0" }} />
                           <button onClick={sendDM} style={{ background: "var(--theme-primary)", color: "white", border: "none", width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Send size={16} /></button>
                        </div>
                      </div>
                    </>
                  ) : !chatUser && selectedInboxMsg ? (
                    <>
                      <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 16 }}>
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-white" style={{ background: selectedInboxMsg.platform === 'meta' || selectedInboxMsg.platform === 'instagram' ? "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)" : "black" }}>
                           <MessageSquare size={24} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 16, color: "#111827" }}>{selectedInboxMsg.senderName || \`User \${selectedInboxMsg.senderId}\`}</div>
                          <div style={{ fontSize: 13, color: "#6B7280", marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                             <span className={\`w-2 h-2 rounded-full \${selectedInboxMsg.platform === 'meta' || selectedInboxMsg.platform === 'instagram' ? 'bg-pink-500' : 'bg-black'}\`} /> 
                             Via {selectedInboxMsg.platform === 'meta' || selectedInboxMsg.platform === 'instagram' ? 'Instagram' : 'TikTok'}
                          </div>
                        </div>
                      </div>
                      <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                        {/* Display the received external message */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                           <div style={{ background: "#F3F4F6", color: "#111827", padding: "12px 16px", borderRadius: 20, borderBottomLeftRadius: 4, fontSize: 15, maxWidth: "70%" }}>
                             {selectedInboxMsg.content}
                           </div>
                           <span style={{ fontSize: 12, color: "#9CA3AF", marginTop: 6, padding: "0 4px" }}>
                             {selectedInboxMsg.createdAt ? new Date(selectedInboxMsg.createdAt).toLocaleString('id-ID') : 'Baru saja'}
                           </span>
                        </div>
                        
                        {/* Fake Replies placeholder for now (would be stored logically in firestore) */}
                        {selectedInboxMsg.replies && selectedInboxMsg.replies.map((reply: any, idx: number) => (
                           <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                              <div style={{ background: "var(--theme-primary)", color: "white", padding: "12px 16px", borderRadius: 20, borderBottomRightRadius: 4, fontSize: 15, maxWidth: "70%" }}>{reply.content}</div>
                           </div>
                        ))}
                      </div>
                      <div style={{ padding: 24, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                        <div className="text-xs text-gray-500 mb-2 pl-2">Balas sebagai Official Page (Akan dikirim melalui HTTP POST)</div>
                        <div style={{ display: "flex", gap: 12, alignItems: "center", background: "#F9FAFB", padding: "8px 16px", borderRadius: 24, border: "1px solid rgba(0,0,0,0.04)" }}>
                           <input type="text" placeholder="Ketik balasan untuk pelanggan..." value={msgContent} onChange={e => setMsgContent(e.target.value)} onKeyDown={e => {
                               if (e.key === "Enter") {
                                   alert("Diperlukan Interkoneksi API untuk mengirim balasan!");
                                   setMsgContent("");
                               }
                           }} style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 15, padding: "8px 0" }} />
                           <button onClick={() => {
                               alert("Diperlukan Interkoneksi API untuk mengirim balasan!");
                               setMsgContent("");
                           }} style={{ background: "var(--theme-primary)", color: "white", border: "none", width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Send size={16} /></button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#9CA3AF" }}>
                       <MessageSquare size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
                       <div style={{ fontWeight: 700, fontSize: 16, color: "#4B5563" }}>Unified Inbox</div>
                       <div style={{ fontSize: 14 }}>Pilih pesan inbox internal maupun dari Instagram/TikTok untuk mulai membalas.</div>
                    </div>
                  )}
                </div>
             </div>
           )}
           
           `;

content = content.replace(dmsUIRegex, unifiedInboxUI);
fs.writeFileSync('./src/SocHubView.tsx', content);
