import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit, startAfter, where } from "firebase/firestore";
import { db } from "../firebase";
import { ArrowLeft, History, X, ChevronDown } from 'lucide-react';
import { HistoryChangeItem } from './HistoryChangeItem';

import { usePlanLimits } from '../hooks/usePlanLimits';

export const HistoryView = ({
  isMobile,
  setShowHistory,
  lang,
  d,
  workspaceId,
  onClose,
  editorProfiles,
  planDetails
}: {
  isMobile: boolean;
  setShowHistory: (v: boolean) => void;
  lang: string;
  d: any;
  workspaceId: string;
  onClose: () => void;
  editorProfiles: any;
  planDetails: any;
}) => {
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);


  const { hasCapability } = usePlanLimits(planDetails);
  // Actually historyDays is a numeric capability? Wait, usePlanLimits hasCapability returns boolean. Let's get it directly from planDetails
  const historyDays = planDetails?.capabilities?.historyDays ?? 0;
  
  useEffect(() => {
    const fetchHistory = async () => {
      if (!d.id || !workspaceId) return;
      try {
        setLoading(true);
        let items: any[] = [];
        
        // Load legacy history if exists
        if (d.history && Array.isArray(d.history) && d.history.length > 0) {
          items = [...d.history];
        }

        // Fetch from subcollection
        const historyRef = collection(db, "workspaces", workspaceId, "content", d.id, "history");

        let q;
        if (historyDays > 0) {
           const cutoff = new Date();
           cutoff.setDate(cutoff.getDate() - historyDays);
           const cutoffISO = cutoff.toISOString();
           q = query(historyRef, where("timestamp", ">=", cutoffISO), orderBy("timestamp", "desc"), limit(20));
        } else {
           q = query(historyRef, orderBy("timestamp", "desc"), limit(20));
        }
        const snapshot = await getDocs(q);
        
        const fetchedItems = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
        
        if (historyDays > 0) {
           const cutoff = new Date();
           cutoff.setDate(cutoff.getDate() - historyDays);
           const cutoffTime = cutoff.getTime();
           items = items.filter(item => new Date(item.timestamp).getTime() >= cutoffTime);
        }
        if (fetchedItems.length > 0) {
          // Merge legacy and new history, sort by timestamp desc
          items = [...fetchedItems, ...items].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          
          // Deduplicate by ID if needed, but legacy might not have IDs. So deduplicate by timestamp
          const uniqueItems = Array.from(new Map(items.map(item => [item.timestamp, item])).values());
          items = uniqueItems;
        }
        
        setHistoryItems(items);
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
        setHasMore(snapshot.docs.length === 20);
      } catch (err) {
        console.error("Error fetching history:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, [d.id, workspaceId, d.history]);

  const fetchMoreHistory = async () => {
    if (!d.id || !workspaceId || !lastVisible || !hasMore) return;
    try {
      setLoadingMore(true);
      const historyRef = collection(db, "workspaces", workspaceId, "content", d.id, "history");

      let q;
      if (historyDays > 0) {
         const cutoff = new Date();
         cutoff.setDate(cutoff.getDate() - historyDays);
         const cutoffISO = cutoff.toISOString();
         q = query(historyRef, where("timestamp", ">=", cutoffISO), orderBy("timestamp", "desc"), startAfter(lastVisible), limit(20));
      } else {
         q = query(historyRef, orderBy("timestamp", "desc"), startAfter(lastVisible), limit(20));
      }
      const snapshot = await getDocs(q);
      
      const fetchedItems = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      
      if (fetchedItems.length > 0) {
        setHistoryItems(prev => {
          const items = [...prev, ...fetchedItems].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          const uniqueItems = Array.from(new Map(items.map(item => [item.timestamp, item])).values());
          return uniqueItems;
        });
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
        setHasMore(snapshot.docs.length === 20);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error fetching more history:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", overflow: "hidden", background: "#FFFFFF", borderRadius: isMobile ? "24px 24px 0 0" : 24 }}>
      {/* Header */}
      <div style={{
        padding: "18px 28px",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#FFFFFF",
        flexShrink: 0
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => setShowHistory(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(0,0,0,0.04)",
              border: "none",
              borderRadius: "100px",
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 700,
              color: "#374151",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseOver={(e: any) => e.currentTarget.style.background = "rgba(0,0,0,0.08)"}
            onMouseOut={(e: any) => e.currentTarget.style.background = "rgba(0,0,0,0.04)"}
          >
            <ArrowLeft size={16} />
            <span>{lang === "id" ? "Kembali ke Brief" : "Back to Brief"}</span>
          </button>
          <div style={{ width: 1, height: 20, background: "rgba(0,0,0,0.1)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "rgba(37, 99, 235, 0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#2563eb"
            }}>
              <History size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#111827", lineHeight: 1.2 }}>
                {lang === "id" ? "Riwayat Perubahan" : "Edit History"}
              </h3>
              <span style={{ fontSize: 11, color: "#6B7280", fontWeight: 500 }}>
                {d.title ? d.title : (lang === "id" ? "Daftar jejak revisi brief ini" : "Revision history log")}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => onClose()}
          style={{
            background: "rgba(0,0,0,0.04)",
            border: "none",
            borderRadius: "50%",
            width: 32,
            height: 32,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#4B5563",
            transition: "all 0.2s"
          }}
          onMouseOver={(e: any) => e.currentTarget.style.background = "rgba(0,0,0,0.08)"}
          onMouseOut={(e: any) => e.currentTarget.style.background = "rgba(0,0,0,0.04)"}
        >
          <X size={16} />
        </button>
      </div>

      {/* Content Body */}
      <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "16px" : "24px 32px", display: "flex", flexDirection: "column", gap: 20 }}>
        {!historyItems || historyItems.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#6B7280" }}>
            <History size={44} style={{ color: "#D1D5DB", marginBottom: 12 }} />
            <div style={{ fontSize: 15, fontWeight: 700, color: "#374151", marginBottom: 4 }}>
              {lang === "id" ? "Belum ada riwayat perubahan" : "No edit history yet"}
            </div>
            <div style={{ fontSize: 13, color: "#9CA3AF" }}>
              {lang === "id" ? "Setiap kali ada pengubahan brief ini, jejak edit akan terekam otomatis di sini." : "Every edit made to this brief will be tracked here automatically."}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {historyItems.map((h: any, i: number) => {
              const prof = editorProfiles[h.editorId] || {};
              const name = prof.fullName || prof.nickname || h.editorName || "Editor";
              const avatar = prof.avatar || prof.photoURL || h.editorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`;
              const formattedTime = new Date(h.timestamp).toLocaleString(lang === "id" ? "id-ID" : "en-US", {
                dateStyle: "medium",
                timeStyle: "short"
              });

              return (
                <div key={i} style={{
                  background: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: 16,
                  padding: isMobile ? "14px 16px" : "18px 20px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14
                }}>
                  {/* Editor header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #F3F4F6", paddingBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <img src={avatar} style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", border: "1.5px solid #E5E7EB" }} alt={name} />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 14, color: "#111827" }}>{name}</div>
                        <div style={{ fontSize: 11, color: "#6B7280", fontWeight: 500 }}>
                          {h.action === "created" 
                            ? (lang === "id" ? "Membuat draf konten" : "Created content draft") 
                            : (lang === "id" ? "Memperbarui brief konten" : "Updated content brief")}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", background: "#F3F4F6", padding: "4px 10px", borderRadius: 8 }}>
                      {formattedTime}
                    </div>
                  </div>

                  {/* Changes list */}
                  {h.action === "created" ? (
                    <div style={{ fontSize: 13, color: "#4B5563", background: "#F9FAFB", padding: 12, borderRadius: 10, border: "1px solid #F3F4F6" }}>
                      {lang === "id" ? "Konten pertama kali dibuat." : "Content initially created."}
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {h.changes?.map((ch: any, idx: number) => (
                        <HistoryChangeItem key={idx} ch={ch} lang={lang} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            
            {hasMore && (
              <button
                onClick={fetchMoreHistory}
                disabled={loadingMore}
                style={{
                  background: "#F3F4F6",
                  color: "#374151",
                  border: "none",
                  padding: "10px 16px",
                  borderRadius: 12,
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: loadingMore ? "default" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  marginTop: 8,
                  opacity: loadingMore ? 0.7 : 1,
                  transition: "background 0.2s"
                }}
                onMouseOver={(e: any) => { if (!loadingMore) e.currentTarget.style.background = "#E5E7EB"; }}
                onMouseOut={(e: any) => { if (!loadingMore) e.currentTarget.style.background = "#F3F4F6"; }}
              >
                {loadingMore ? (
                   <span className="animate-spin" style={{ display: "inline-block", border: "2px solid #374151", borderTopColor: "transparent", borderRadius: "50%", width: 14, height: 14 }}></span>
                ) : (
                  <ChevronDown size={16} />
                )}
                {lang === "id" ? "Muat Lebih Banyak" : "Load More"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
