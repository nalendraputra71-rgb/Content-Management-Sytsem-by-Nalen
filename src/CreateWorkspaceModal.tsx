import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Building, Copy, CheckCircle2 } from 'lucide-react';

export function CreateWorkspaceModal({ workspaces, onClose, onCreate }: any) {
  const [name, setName] = useState("");
  // "" means empty, anything else is the ID of the workspace to copy from
  const [copyFromId, setCopyFromId] = useState("");

  return (
    <motion.div 
      initial={{opacity:0}} 
      animate={{opacity:1}} 
      exit={{opacity:0}} 
      transition={{ duration: 0.15 }} 
      style={{position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.8)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16}}
    >
      <motion.div 
        initial={{scale:0.95, opacity:0, y:20}} 
        animate={{scale:1, opacity:1, y:0}} 
        exit={{scale:0.95, opacity:0, y:20}} 
        transition={{ type: "spring", damping: 25, stiffness: 300 }} 
        style={{ width:"100%", maxWidth:400, background: "#FFFFFF", borderRadius: 24, boxShadow:"0 20px 40px rgba(0,0,0,0.2)", position:"relative", overflow: "hidden" }}
      >
        <div style={{ padding: "24px 24px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #F3F4F6" }}>
          <h3 style={{fontSize:18, fontWeight:800, margin:0, color:"#111827", display:"flex", alignItems:"center", gap:8}}>
            <div style={{background: "#F3F4F6", padding: 6, borderRadius: 8}}>
              <Building size={18} color="#4B5563" />
            </div>
            Buat Workspace Baru
          </h3>
          <button onClick={onClose} style={{background:"transparent", border:"none", cursor:"pointer", color:"#9CA3AF", padding: 4, borderRadius: 8}} className="hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: 24 }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Nama Workspace</label>
            <input 
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Tim Marketing"
              style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 14, outline: "none", color: "#111827", background: "#F9FAFB" }}
              className="focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 10 }}>Pengaturan Awal</label>
            
            <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
              <div 
                onClick={() => setCopyFromId("")}
                style={{ flex: 1, border: copyFromId === "" ? "2px solid #3B82F6" : "1px solid #E5E7EB", borderRadius: 12, padding: "12px", cursor: "pointer", background: copyFromId === "" ? "#EFF6FF" : "#FFFFFF", transition: "all 0.2s" }}
              >
                <div style={{ fontWeight: 700, fontSize: 13, color: copyFromId === "" ? "#1D4D7A" : "#374151", marginBottom: 4 }}>Mulai Kosong</div>
                <div style={{ fontSize: 11, color: copyFromId === "" ? "#3B82F6" : "#6B7280", lineHeight: 1.3 }}>Pengaturan default sistem.</div>
              </div>
              <div 
                onClick={() => {
                  if (workspaces && workspaces.length > 0 && copyFromId === "") {
                    setCopyFromId(workspaces[0].id);
                  } else if (copyFromId === "") {
                    setCopyFromId("select");
                  }
                }}
                style={{ flex: 1, border: copyFromId !== "" ? "2px solid #3B82F6" : "1px solid #E5E7EB", borderRadius: 12, padding: "12px", cursor: "pointer", background: copyFromId !== "" ? "#EFF6FF" : "#FFFFFF", transition: "all 0.2s" }}
              >
                <div style={{ fontWeight: 700, fontSize: 13, color: copyFromId !== "" ? "#1D4D7A" : "#374151", marginBottom: 4 }}>Salin Data</div>
                <div style={{ fontSize: 11, color: copyFromId !== "" ? "#3B82F6" : "#6B7280", lineHeight: 1.3 }}>Salin pilar & platform lain.</div>
              </div>
            </div>

            <AnimatePresence>
              {copyFromId !== "" && workspaces && workspaces.length > 0 && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
                  <div style={{ paddingTop: 4 }}>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#6B7280", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Pilih Sumber:</label>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 150, overflowY: "auto", paddingRight: 4 }}>
                      {workspaces.map((ws: any) => (
                        <div 
                          key={ws.id}
                          onClick={() => setCopyFromId(ws.id)}
                          style={{ 
                            padding: "10px 14px", borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between",
                            border: copyFromId === ws.id ? "1.5px solid #3B82F6" : "1px solid #E5E7EB",
                            background: copyFromId === ws.id ? "#EFF6FF" : "#F9FAFB",
                            transition: "all 0.15s"
                          }}
                        >
                          <span style={{ fontSize: 13, fontWeight: 600, color: copyFromId === ws.id ? "#1D4D7A" : "#374151" }}>{ws.name}</span>
                          {copyFromId === ws.id && <CheckCircle2 size={16} color="#3B82F6" />}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={() => {
              if (name.trim()) {
                onCreate(name.trim(), copyFromId === "select" ? null : copyFromId || null);
              }
            }}
            disabled={!name.trim()}
            style={{ 
              width: "100%", padding: "14px", borderRadius: 12, border: "none", 
              background: name.trim() ? "#3B82F6" : "#E5E7EB", 
              color: name.trim() ? "white" : "#9CA3AF", 
              fontSize: 14, fontWeight: 700, cursor: name.trim() ? "pointer" : "not-allowed",
              transition: "all 0.2s"
            }}
            className={name.trim() ? "hover:bg-blue-600 shadow-sm" : ""}
          >
            Buat Workspace
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

