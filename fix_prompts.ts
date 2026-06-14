import fs from 'fs';
let content = fs.readFileSync('src/SocialStudioView.tsx', 'utf-8');
content = content.replace(
  'onClick={() => setChatInput("What are the key benefits of creating short-form content this month?")}',
  'onClick={() => { setChatInput(PROMPTS[3]); setTimeout(() => handleChatSubmit(PROMPTS[3]), 100); }}'
);
content = content.replace(
  '>Apa saja keuntungan membuat konten short-form bulan ini?</div>',
  '>{PROMPTS[3]}</div>'
);
content = content.replace(
  '<FileText size={16} color="#0DB8D3"/> Ide konten Instagram</div>',
  '<FileText size={16} color="#0DB8D3"/> {PROMPTS[0]}</div>'
).replace(
  '<Search size={16} color="#1B7FDC"/> Analisa kompetitor</div>',
  '<Search size={16} color="#1B7FDC"/> {PROMPTS[1]}</div>'
).replace(
  '<MessageCircle size={16} color="#0DB8D3"/> Buat script TikTok</div>',
  '<MessageCircle size={16} color="#0DB8D3"/> {PROMPTS[2]}</div>'
);

content = content.replace(
  'onClick={() => setChatInput("Write an engaging TikTok script")}',
  'onClick={() => { setChatInput(PROMPTS[2]); setTimeout(() => handleChatSubmit(PROMPTS[2]), 100); }}'
);

// We also need to add onClick to the other two
content = content.replace(
  '<div style={{ display: "flex", gap: 8, fontSize: 12, color: "#193546", fontWeight: 500 }}><FileText size={16} color="#0DB8D3"/> {PROMPTS[0]}</div>',
  '<div onClick={() => { setChatInput(PROMPTS[0]); setTimeout(() => handleChatSubmit(PROMPTS[0]), 100); }} style={{ display: "flex", gap: 8, fontSize: 12, color: "#193546", fontWeight: 500, cursor: "pointer" }} className="hover-bg"><FileText size={16} color="#0DB8D3"/> {PROMPTS[0]}</div>'
).replace(
  '<div style={{ display: "flex", gap: 8, fontSize: 12, color: "#193546", fontWeight: 500 }}><Search size={16} color="#1B7FDC"/> {PROMPTS[1]}</div>',
  '<div onClick={() => { setChatInput(PROMPTS[1]); setTimeout(() => handleChatSubmit(PROMPTS[1]), 100); }} style={{ display: "flex", gap: 8, fontSize: 12, color: "#193546", fontWeight: 500, cursor: "pointer" }} className="hover-bg"><Search size={16} color="#1B7FDC"/> {PROMPTS[1]}</div>'
);

fs.writeFileSync('src/SocialStudioView.tsx', content);
