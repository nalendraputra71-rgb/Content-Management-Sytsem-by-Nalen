const fs = require('fs');

let code = fs.readFileSync('src/Nav.tsx', 'utf8');

// Find where Header starts
const headerStartIdx = code.indexOf('export function Header({ profile }: any) {');

// Find where ColsIcon starts
const colsIconStartIdx = code.indexOf('function ColsIcon({ size }: any) {');

if (headerStartIdx !== -1 && colsIconStartIdx !== -1) {
  const newHeaderAndSidebar = `export function Header({ profile }: any) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const hour = time.getHours();
  let greeting = "Selamat Malam";
  if (hour >= 5 && hour < 11) greeting = "Selamat Pagi";
  else if (hour >= 11 && hour < 15) greeting = "Selamat Siang";
  else if (hour >= 15 && hour < 18) greeting = "Selamat Sore";

  return (
    <div style={{ padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "white", borderBottom: "1px solid rgba(0,0,0,0.05)", zIndex: 40 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#1D4D7A" }}>{greeting}, {profile?.name || "User"}</h2>
        <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>{time.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <button className="hover-scale" style={{ width: 40, height: 40, borderRadius: "50%", border: "1px solid #e2e8f0", background: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <Bell size={18} color="#64748b" />
        </button>
        <img 
          src={profile?.avatar || \`https://ui-avatars.com/api/?name=\${profile?.name || "User"}\`} 
          alt="Avatar" 
          style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", border: "2px solid #1D4D7A" }} 
        />
      </div>
    </div>
  );
}

export function Sidebar({ open, setOpen, tab, setTab, workspaces, activeWorkspace, onWorkspaceSelect, user, profile, onLogout, title }: any) {
  const isSuperAdmin = profile?.email?.toLowerCase() === "nalendraputra71@gmail.com" || user?.email?.toLowerCase() === "nalendraputra71@gmail.com";

  const MENU_ITEMS = [
    { id: "dashboard", label: "Dashboard", icon: <Layout size={20} /> },
    { id: "soc_hub", label: "SocHub", icon: <MessageSquare size={20} /> },
    { id: "social-hub-ai", label: "Social Studio", icon: <PieChart size={20} /> },
    { id: "settings", label: "Pengaturan", icon: <Settings size={20} /> },
  ];

  if (isSuperAdmin) {
    MENU_ITEMS.push({ id: "admin", label: "Admin Panel", icon: <Shield size={20} /> });
  }

  return (
    <div style={{ width: open ? 240 : 80, height: "100%", background: "linear-gradient(to bottom, #0B2A4A, #1D4D7A)", color: "white", transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)", display: "flex", flexDirection: "column", position: "relative", zIndex: 50 }}>
      <div style={{ padding: "24px 20px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => window.location.href = '/'}>
        <div style={{ width: 40, height: 40, background: "rgba(255,255,255,0.1)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Flame size={24} color="#3B82F6" />
        </div>
        {open && <span style={{ fontSize: 20, fontWeight: 800, whiteSpace: "nowrap" }}>Hubify<span style={{ color: "#3B82F6" }}>Social</span></span>}
      </div>
      
      {open && (
        <button
          onClick={() => setOpen(false)}
          style={{ position: "absolute", right: -12, top: 32, width: 24, height: 24, borderRadius: "50%", background: "#1D4D7A", color: "white", border: "2px solid #FAFAFA", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 60 }}
        >
          <ChevronLeft size={14} />
        </button>
      )}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{ position: "absolute", right: -12, top: 32, width: 24, height: 24, borderRadius: "50%", background: "#1D4D7A", color: "white", border: "2px solid #FAFAFA", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 60 }}
        >
          <ChevronRight size={14} />
        </button>
      )}

      <div style={{ flex: 1, padding: "20px 0", display: "flex", flexDirection: "column", gap: 8, overflowY: "auto", overflowX: "hidden" }}>
        {MENU_ITEMS.map(item => {
          const isActive = tab === item.id || (item.id === "social-hub-ai" && tab.startsWith("social"));
          return (
            <div 
              key={item.id} 
              onClick={() => setTab(item.id)}
              style={{ 
                padding: "12px 20px", 
                display: "flex", 
                alignItems: "center", 
                gap: 16, 
                cursor: "pointer",
                background: isActive ? "rgba(255,255,255,0.1)" : "transparent",
                borderLeft: isActive ? "4px solid #3B82F6" : "4px solid transparent",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
            >
              <div style={{ flexShrink: 0, opacity: isActive ? 1 : 0.6 }}>{item.icon}</div>
              {open && <span style={{ fontWeight: 600, fontSize: 14, opacity: isActive ? 1 : 0.6, whiteSpace: "nowrap" }}>{item.label}</span>}
            </div>
          );
        })}
      </div>

      <div style={{ padding: "20px" }}>
        <div 
          onClick={onLogout} 
          style={{ display: "flex", alignItems: "center", gap: 16, cursor: "pointer", padding: "12px", borderRadius: 12, background: "rgba(255,255,255,0.05)" }}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
        >
          <LogOut size={20} color="#FCA5A5" />
          {open && <span style={{ fontWeight: 600, fontSize: 14, color: "#FCA5A5", whiteSpace: "nowrap" }}>Keluar</span>}
        </div>
      </div>
    </div>
  );
}

`;

  const newCode = code.substring(0, headerStartIdx) + newHeaderAndSidebar + code.substring(colsIconStartIdx);
  fs.writeFileSync('src/Nav.tsx', newCode);
  console.log("Patched!");
} else {
  console.log("Could not find boundaries");
}
