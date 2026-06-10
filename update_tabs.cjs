const fs = require('fs');
let s = fs.readFileSync('src/ContentModal.tsx', 'utf-8');

const oldTabs = `          {/* TAB NAVIGATION */}
          <div style={{ 
            display: "flex", gap: "8px", background: "rgba(0,0,0,0.03)", padding: "4px", 
            borderRadius: "12px", alignSelf: "flex-start", marginTop: "4px" 
          }}>
            {["draft", "refs", "metrics"].map((tabCode: any) => (
              <button 
                key={tabCode}
                onClick={(e) => { e.preventDefault(); setActiveTab(tabCode); }}
                style={{
                  padding: "6px 16px",
                  borderRadius: "8px",
                  border: "none",
                  fontSize: "12px",
                  fontWeight: 650,
                  cursor: "pointer",
                  background: activeTab === tabCode ? "#FFFFFF" : "transparent",
                  color: activeTab === tabCode ? "#2C2016" : "rgba(44,32,22,0.5)",
                  boxShadow: activeTab === tabCode ? "0 2px 8px rgba(0,0,0,0.05)" : "none",
                  transition: "all 0.2s"
                }}
              >
                {tabCode === "draft" ? "Brief & Konten" : tabCode === "refs" ? "Referensi & Aset" : "Metrik & Ads"}
              </button>
            ))}
          </div>`;

const newTabs = `          {/* APPLE-LIKE SEGMENTED CONTROL */}
          <div style={{ 
            display: "flex", background: "rgba(118,118,128,0.12)", padding: "2px", 
            borderRadius: "10px", width: "100%", marginTop: "10px", marginBottom: "8px" 
          }}>
            {[
              { id: "draft", label: "Brief & Konten" },
              { id: "refs", label: "Aset & Referensi" },
              { id: "metrics", label: "Metrik & Ads" }
            ].map(({ id, label }) => (
              <button 
                key={id}
                onClick={(e) => { e.preventDefault(); setActiveTab(id as any); }}
                style={{
                  flex: 1,
                  padding: "6px 0",
                  borderRadius: "8px",
                  border: "none",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  background: activeTab === id ? "#FFFFFF" : "transparent",
                  color: activeTab === id ? "#000000" : "rgba(0,0,0,0.6)",
                  boxShadow: activeTab === id ? "0 3px 8px rgba(0,0,0,0.12), 0 3px 1px rgba(0,0,0,0.04)" : "none",
                  transition: "background 0.2s, box-shadow 0.2s, color 0.2s"
                }}
              >
                {label}
              </button>
            ))}
          </div>`;

if (s.includes(oldTabs)) {
   s = s.replace(oldTabs, newTabs);
   fs.writeFileSync('src/ContentModal.tsx', s);
   console.log("Updated tabs");
} else {
   console.log("oldTabs not found!");
}
