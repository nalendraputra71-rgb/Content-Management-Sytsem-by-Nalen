const fs = require('fs');

let content = fs.readFileSync('./src/SocialStudioView.tsx', 'utf-8');

// add icons
if (!content.includes('MessageSquare')) {
    content = content.replace(/CopyPlus,/, 'CopyPlus, MessageSquare,');
}

// add firebase imports
if (!content.includes('getFirestore')) {
    content = "import { getFirestore, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';\n" + content;
}

const componentStartRegex = /export function SocialStudioView\([^)]+\) \{/;
const newStates = `
  const db = getFirestore();
  const [inboxMessages, setInboxMessages] = useState<any[]>([]);
  const [selectedInboxMsg, setSelectedInboxMsg] = useState<any>(null);
  const [msgContent, setMsgContent] = useState("");
  const [inboxFilter, setInboxFilter] = useState("all");

  useEffect(() => {
    const q = query(collection(db, "inbox"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
        setInboxMessages(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });
    return unsub;
  }, []);
`;
content = content.replace(componentStartRegex, match => match + '\n' + newStates);

const uiRegex = /\{\/\* INBOX \*\/\}\s*\{tab === "social-inbox" && \([\s\S]*?\}\)[\s]*<\/div>[\s]*<\/div>[\s]*\);/m;

const newUI = `{/* INBOX */}
        {tab === "social-inbox" && (
          <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} style={{ height: "calc(100vh - 120px)", display: "flex", gap: 24 }}>
             <div style={{ flex: 1, background: "white", borderRadius: 20, border: "1px solid rgba(44,32,22,0.05)", display: "flex", flexDirection: "column", overflow:"hidden" }}>
                <div style={{ padding: 20, borderBottom: "1px solid rgba(44,32,22,0.05)" }}>
                   <h3 style={{fontSize:18, fontWeight:800, margin:"0 0 16px"}}>Unified Inbox</h3>
                   <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 16 }} className="no-scrollbar">
                     <button onClick={() => setInboxFilter("all")} className={\`px-3 py-1.5 rounded-full text-xs font-bold transition-colors \${inboxFilter === "all" ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-700'}\`}>Semua</button>
                     <button onClick={() => setInboxFilter("instagram")} className={\`px-3 py-1.5 rounded-full text-xs font-bold transition-colors \${inboxFilter === "instagram" ? 'bg-pink-600 text-white' : 'bg-gray-200 text-gray-700'}\`}>Instagram</button>
                     <button onClick={() => setInboxFilter("tiktok")} className={\`px-3 py-1.5 rounded-full text-xs font-bold transition-colors \${inboxFilter === "tiktok" ? 'bg-black text-white' : 'bg-gray-200 text-gray-700'}\`}>TikTok</button>
                   </div>
                   <input placeholder="Cari pesan atau username..." style={{ width: "100%", padding: "10px 16px", borderRadius: 20, border: "1px solid rgba(44,32,22,0.1)", fontSize: 13, fontFamily:"inherit" }} />
                </div>
                <div style={{ flex: 1, overflowY: "auto" }}>
                   {inboxMessages.filter(m => inboxFilter === "all" ? true : m.platform === inboxFilter || m.platform === (inboxFilter === 'instagram' ? 'meta' : '')).length === 0 && (
                     <div className="p-6 text-center text-gray-400 text-sm">
                       Belum ada pesan di kotak masuk ini.
                     </div>
                   )}
                   {inboxMessages.filter(m => inboxFilter === "all" ? true : m.platform === inboxFilter || m.platform === (inboxFilter === 'instagram' ? 'meta' : '')).map((msg, i) => (
                     <div key={msg.id} onClick={() => setSelectedInboxMsg(msg)} className="hover-scale" style={{padding:"16px 20px", borderBottom:"1px solid rgba(44,32,22,0.05)", cursor:"pointer", display:"flex", gap:12, background:selectedInboxMsg?.id === msg.id ?"#FAFAFA":"transparent"}}>
                       <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 text-white" style={{ background: msg.platform === "meta" || msg.platform === "instagram" ? "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)" : "black" }}>
                          <MessageSquare size={20} />
                       </div>
                       <div style={{overflow:"hidden", flex:1}}>
                         <div style={{fontWeight:800, fontSize:14, marginBottom:4, display:"flex", alignItems:"center", gap:6, whiteSpace:"nowrap", textOverflow:"ellipsis"}}>{msg.senderName || \`User \${msg.senderId}\`} <span style={{fontSize:9, background:msg.platform === 'meta' || msg.platform === 'instagram' ? "#F8EAF0" : "#f0f0f0", color:msg.platform === 'meta' || msg.platform === 'instagram' ? "#E4405F" : "#000", padding:"2px 6px", borderRadius:4, fontWeight:800}}>{msg.platform === 'meta' || msg.platform === 'instagram' ? 'Instagram' : 'TikTok'}</span></div>
                         <div style={{fontSize:12, color:"rgba(44,32,22,0.6)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", fontWeight:selectedInboxMsg?.id === msg.id ?800:600}}>{msg.content}</div>
                       </div>
                     </div>
                   ))}
                </div>
             </div>
             
             <div style={{ flex: 2, background: "white", borderRadius: 20, border: "1px solid rgba(44,32,22,0.05)", display: "flex", flexDirection: "column", overflow:"hidden" }}>
                {selectedInboxMsg ? (
                  <>
                     <div style={{ padding: 20, borderBottom: "1px solid rgba(44,32,22,0.05)", display:"flex", alignItems:"center", gap:12 }}>
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-white" style={{ background: selectedInboxMsg.platform === 'meta' || selectedInboxMsg.platform === 'instagram' ? "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)" : "black" }}>
                           <MessageSquare size={24} />
                        </div>
                        <div>
                          <div style={{fontWeight:800, fontSize:18}}>{selectedInboxMsg.senderName || \`User \${selectedInboxMsg.senderId}\`}</div>
                          <div style={{fontSize:12, color:"rgba(44,32,22,0.5)", fontWeight:700}}>Direct Message • {selectedInboxMsg.platform === 'meta' || selectedInboxMsg.platform === 'instagram' ? 'Instagram' : 'TikTok'}</div>
                        </div>
                     </div>
                     <div style={{ flex: 1, padding: 24, overflowY: "auto", display:"flex", flexDirection:"column", gap:16, background:"#FAFAFA" }}>
                        <div style={{background:"white", border:"1px solid rgba(44,32,22,0.05)", padding:16, borderRadius:"16px 16px 16px 4px", maxWidth:"70%", alignSelf:"flex-start", boxShadow:"0 2px 10px rgba(0,0,0,0.02)"}}>
                          <div style={{fontSize:14, lineHeight:1.5, color:"#2C2016", fontWeight:600}}>{selectedInboxMsg.content}</div>
                          <div style={{fontSize:10, color:"rgba(44,32,22,0.4)", fontWeight:800, marginTop:8}}>
                            {selectedInboxMsg.createdAt ? new Date(selectedInboxMsg.createdAt).toLocaleString('id-ID') : 'Baru saja'}
                          </div>
                        </div>
                        {selectedInboxMsg.replies && selectedInboxMsg.replies.map((reply: any, idx: number) => (
                          <div key={idx} style={{background:"var(--theme-primary)", color:"white", padding:16, borderRadius:"16px 16px 4px 16px", maxWidth:"70%", alignSelf:"flex-end", boxShadow:"0 2px 10px rgba(0,0,0,0.02)"}}>
                            <div style={{fontSize:14, lineHeight:1.5, fontWeight:600}}>{reply.content}</div>
                          </div>
                        ))}
                     </div>
                     <div style={{ padding: 20, borderTop: "1px solid rgba(44,32,22,0.05)", display:"flex", gap:12, background:"white" }}>
                        <div style={{flex:1, position:"relative"}}>
                          <div className="text-xs text-gray-500 mb-2 pl-2">Balas sebagai Official Page (Akan dikirim melalui HTTP POST)</div>
                          <input 
                            placeholder="Ketik balasan..." 
                            value={msgContent} 
                            onChange={e => setMsgContent(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === "Enter") {
                                    alert("Diperlukan Interkoneksi API untuk mengirim balasan!");
                                    setMsgContent("");
                                }
                            }}
                            style={{ width: "100%", padding: "14px 20px", borderRadius: 24, border: "1px solid rgba(44,32,22,0.1)", fontSize: 14, outline:"none", fontFamily:"inherit", fontWeight:600 }} 
                          />
                        </div>
                        <button 
                           onClick={() => {
                               alert("Diperlukan Interkoneksi API untuk mengirim balasan!");
                               setMsgContent("");
                           }} 
                           className="hover-scale" 
                           style={{ marginTop: 20, width:48, height:48, borderRadius:24, background: "var(--theme-primary)", color: "white", border: "none", display:"flex", alignItems:"center", justifyContent:"center", cursor: "pointer", flexShrink:0 }}
                        >
                           <Send size={18}/>
                        </button>
                     </div>
                  </>
                ) : (
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#9CA3AF" }}>
                     <MessageSquare size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
                     <div style={{ fontWeight: 700, fontSize: 16, color: "#4B5563" }}>Pilih Pesan</div>
                     <div style={{ fontSize: 14 }}>Pilih pesan inbox dari Instagram/TikTok di sebelah kiri.</div>
                  </div>
                )}
             </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
`;

content = content.replace(uiRegex, newUI);

fs.writeFileSync('./src/SocialStudioView.tsx', content);

console.log("Applied SocialStudioView!");
