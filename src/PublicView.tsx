import { useState, useEffect, lazy, Suspense } from "react";
import { useParams } from "react-router-dom";
import { db, doc, getDoc, getDocs, collection } from "./firebase";
import { DP, DPL } from "./data";

const TableView = lazy(() => import("./Views").then(m => ({ default: m.TableView })));

export default function PublicView() {
  const { wsId } = useParams();
  const [content, setContent] = useState<any[]>([]);
  const [ws, setWs] = useState<any>(null);

  useEffect(() => {
    if (!wsId) return;
    
    getDoc(doc(db, "workspaces", wsId))
      .then(s => setWs(s.data()))
      .catch(e => console.warn("PublicView fetch error", e));

    getDocs(collection(db, "workspaces", wsId, "content"))
      .then(snap => {
        setContent(snap.docs.map(d => d.data()));
      })
      .catch(error => {
        console.error("PublicView content fetch error:", error);
      });
  }, [wsId]);

  if (!ws) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAFAFA]">
        <div className="text-center p-8 text-neutral-500">
          Loading workspace...
        </div>
      </div>
    );
  }

  if (!ws.publicLinkEnabled) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAFAFA]">
        <div className="text-center p-8 bg-white border border-neutral-100 rounded-2xl shadow-sm max-w-md">
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Workspace Private</h2>
          <p className="text-neutral-500 text-sm">
            Workspace ini berstatus private atau tidak ditemukan. Hubungi pemilik untuk mendapatkan akses.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 bg-[#FAFAFA] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-[#2C2016] mb-2 tracking-tight">
          {ws.settings?.title || ws.name}
        </h1>
        {ws.settings?.tagline && (
          <p className="text-base text-neutral-500 italic mb-3">
            {ws.settings.tagline}
          </p>
        )}
        <p className="text-xs text-neutral-400 mb-8 font-medium">
          Public Read-Only View • Terakhir diperbarui: {new Date().toLocaleDateString("id-ID")}
        </p>
        
        <Suspense fallback={<div className="p-8 text-center text-neutral-400">Loading table...</div>}>
          <TableView 
            filtered={content} 
            openEdit={() => {}} 
            archiveItem={() => {}} 
            deleteItem={() => {}} 
            pillars={DP} 
            platforms={DPL} 
            showArchived={false} 
            search="" 
            bulkIds={[]} 
            setBulkIds={() => {}} 
            onBulk={() => {}} 
          />
        </Suspense>
      </div>
    </div>
  );
}
