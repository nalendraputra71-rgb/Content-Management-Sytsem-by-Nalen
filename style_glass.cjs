const fs = require('fs');
let s = fs.readFileSync('src/ContentModal.tsx', 'utf-8');

// 1. Apple Glassmorphism Outer Modal Background
const oldOuter = `background:"rgba(255, 255, 255, 0.85)", backdropFilter:"blur(32px)", WebkitBackdropFilter:"blur(32px)",`;
const newOuter = `background:"rgba(250, 250, 252, 0.65)", backdropFilter:"blur(48px) saturate(150%)", WebkitBackdropFilter:"blur(48px) saturate(150%)",`;
s = s.replace(oldOuter, newOuter);

// 2. Clear out right panel solid background
const oldRightPanelBg = `background: layoutMode === "drawer" ? "transparent" : "#FAFAFA"`;
const newRightPanelBg = `background: "transparent"`;
s = s.replace(oldRightPanelBg, newRightPanelBg);

// 3. Clear out left panel solid background
const oldLeftPanelBg = `background: layoutMode === "drawer" ? "transparent" : "rgba(255, 255, 255, 0.4)",\n              borderRight: layoutMode === "drawer" ? "none" : "1px solid rgba(0,0,0,0.05)",`;
const newLeftPanelBg = `background: "transparent",\n              borderRight: layoutMode === "drawer" ? "none" : "1px solid rgba(0,0,0,0.08)",`;
s = s.replace(/background: layoutMode === "drawer" \? "transparent" : "rgba\(255, 255, 255, 0\.4\)",\s*borderRight: layoutMode === "drawer" \? "none" : "1px solid rgba\(0,0,0,0\.05\)",/g, newLeftPanelBg);

// 4. Update Area Identitas Atas background to blend in nicely. It currently uses `getTranslucentColor(headerBg, "E6")` inside styling.
// We can lower "E6" (90% opacity) to "B3" (70% opacity) to maintain a nice glass tint for the header.
const oldHeaderTrans = `getTranslucentColor(headerBg, "E6")`;
const newHeaderTrans = `getTranslucentColor(headerBg, "B3")`;
s = s.replace(oldHeaderTrans, newHeaderTrans);

fs.writeFileSync('src/ContentModal.tsx', s);
console.log("Applied Apple Glassmorphism");
