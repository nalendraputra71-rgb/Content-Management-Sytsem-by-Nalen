const fs = require('fs');

let s = fs.readFileSync('src/ContentModal.tsx', 'utf8');

const startMarker = '{/* Block 1: Area Identitas Atas */}';
const endMarker = '{/* AI Analysis Result Section if exists */}';

const startIndex = s.indexOf(startMarker);
const endIndex = s.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
    console.error("Could not find markers");
    process.exit(1);
}

const leftColContent = `
          {/* Title Area */}
          <div 
            onDoubleClick={(e) => { 
                if (isReaderMode) {
                    setIsReaderMode(false);
                    setFocusTarget("title");
                } 
            }}
            style={{ display: "flex", flexDirection: "column", gap: 24, width: "100%", position: "relative", cursor: isReaderMode ? "pointer" : "default" }}
            title={isReaderMode ? "Klik ganda untuk mengedit" : undefined}
          >
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-start",gap:8, width: "100%"}}>
                  <motion.div 
                    animate={isShaking && (!d.title || !String(d.title).trim()) ? { x: [-10, 10, -10, 10, 0] } : { x: 0 }} 
                    transition={{ duration: 0.5 }}
                    style={{width: "100%"}}
                  >
                     {isReaderMode ? (
                       <div style={{fontSize:40, fontWeight:900, letterSpacing:"-1.2px", color:"#111827", width:"100%", padding:"0", lineHeight: 1.1, wordBreak: "break-word", whiteSpace: "pre-wrap"}}>
                         {d.title || "(Ketik Judul Konten)"}
                       </div>
                     ) : (
                       <TextareaAutosize 
                          inputRef={titleRef}
                          value={d.title} 
                          onChange={(e)=>set("title",e.target.value)} 
                          minRows={1}
                          style={{background:"transparent",border:"none",fontSize:40,fontWeight:900, letterSpacing:"-1.2px",color:"#111827",width:"100%",outline:"none",padding:0, resize: "none", overflow: "hidden", lineHeight: 1.1, wordBreak: "break-word", whiteSpace: "pre-wrap"}} 
                          placeholder="Ketik Judul Konten..."/>
                     )}
                  </motion.div>
              </div>

              {/* PROPERTIES (NOTION STYLE) */}
              <div style={{display: "flex", flexDirection: "column", gap: 14, width: "100%", marginTop: 8}}>
                 
                 {/* Item: PIC / Assign */}
                 <div style={{display: "flex", minHeight: 28}}>
                    <div style={{width: 140, display: "flex", alignItems: "center", gap: 8, color: "#6b7280", fontSize: 13, fontWeight: 500, flexShrink: 0}}>
                        <Users size={14}/> Assign
                    </div>
                    <div style={{flex: 1, display: "flex", alignItems: "center"}}>
                      {isReaderMode ? (
                        <span style={{fontSize: 13, fontWeight: 600, color: "#111827", display: "inline-block", maxWidth: "100%", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap"}}>
                          {d.pic || "Empty"}
                        </span>
                      ) : (
                        <CustomDropdown dark={false} multiple={true} value={d.pic} options={pics} prefix="" onChange={(v)=>set("pic", Array.isArray(v) ? v.join(", ") : v)} onUpdateOptions={(opts) => onSettingUpdate && onSettingUpdate({pics: opts})} 
                          style={{ width: "100%", padding: "4px 8px 4px 0", fontSize: 13, fontWeight: 600, background: "transparent", color: "#111827", border: "none", boxShadow: "none" }} />
                      )}
                    </div>
                 </div>

                 {/* Item: Status */}
                 <div style={{display: "flex", minHeight: 28}}>
                    <div style={{width: 140, display: "flex", alignItems: "center", gap: 8, color: "#6b7280", fontSize: 13, fontWeight: 500, flexShrink: 0}}>
                        <ArrowDownCircle size={14}/> Status
                    </div>
                    <div style={{flex: 1, display: "flex", alignItems: "center"}}>
                      {isReaderMode ? (
                        <span style={{fontSize: 12, fontWeight: 600, color: activeStatusColor, background: getTranslucentColor(activeStatusColor, "20"), padding: "4px 10px", borderRadius: 6, display: "inline-block"}}>
                          {d.status || "Empty"}
                        </span>
                      ) : (
                        <CustomDropdown dark={false} value={d.status} options={statuses} prefix="" onChange={(v)=>set("status", v)} onUpdateOptions={(opts) => onSettingUpdate && onSettingUpdate({statuses: opts})} 
                          style={{ padding: "4px 10px", fontSize: 12, fontWeight: 600, background: getTranslucentColor(activeStatusColor, "20"), color: activeStatusColor, border: "none", boxShadow: "none", borderRadius: 6 }} />
                      )}
                    </div>
                 </div>

                 {/* Item: Referensi */}
                 <div style={{display: "flex", minHeight: 28}}>
                    <div style={{width: 140, display: "flex", alignItems: "center", gap: 8, color: "#6b7280", fontSize: 13, fontWeight: 500, flexShrink: 0}}>
                        <LinkIcon size={14}/> Referensi
                    </div>
                    <div style={{flex: 1, display: "flex", alignItems: "center"}}>
                      {isReaderMode ? (
                        <a href={d.assetLink || "#"} target="_blank" rel="noopener noreferrer" style={{fontSize: 13, fontWeight: 500, color: d.assetLink ? "#2563eb" : "#9ca3af", textDecoration: d.assetLink ? "underline" : "none"}}>
                          {d.assetLink ? "Link Referensi" : "Empty"}
                        </a>
                      ) : (
                        <input type="text" value={d.assetLink} onChange={(e:any)=>set("assetLink", e.target.value)} placeholder="Empty" style={{background: "transparent", border: "none", outline: "none", fontSize: 13, fontWeight: 500, color: "#111827", width: "100%"}} />
                      )}
                    </div>
                 </div>

                 {/* Item: Content Type / Type */}
                 <div style={{display: "flex", minHeight: 28}}>
                    <div style={{width: 140, display: "flex", alignItems: "center", gap: 8, color: "#6b7280", fontSize: 13, fontWeight: 500, flexShrink: 0}}>
                        <GripVertical size={14}/> Type
                    </div>
                    <div style={{flex: 1, display: "flex", alignItems: "center"}}>
                      {isReaderMode ? (
                        <span style={{fontSize: 12, fontWeight: 600, color: activeContentTypeColor, background: getTranslucentColor(activeContentTypeColor, "20"), padding: "4px 10px", borderRadius: 6, display: "inline-block"}}>
                          {d.contentType || "Empty"}
                        </span>
                      ) : (
                        <CustomDropdown dark={false} value={d.contentType} options={contentTypes} prefix="" onChange={(v)=>set("contentType", v)} onUpdateOptions={(opts) => onSettingUpdate && onSettingUpdate({contentTypes: opts})} 
                          style={{ padding: "4px 10px", fontSize: 12, fontWeight: 600, background: getTranslucentColor(activeContentTypeColor, "20"), color: activeContentTypeColor, border: "none", boxShadow: "none", borderRadius: 6 }} />
                      )}
                    </div>
                 </div>

                 {/* Item: Platform (Media) */}
                 <div style={{display: "flex", minHeight: 28}}>
                    <div style={{width: 140, display: "flex", alignItems: "center", gap: 8, color: "#6b7280", fontSize: 13, fontWeight: 500, flexShrink: 0}}>
                        <Paperclip size={14}/> Media
                    </div>
                    <div style={{flex: 1, display: "flex", alignItems: "center"}}>
                      {isReaderMode ? (
                        <span style={{fontSize: 12, fontWeight: 600, color: "#4b5563", display: "inline-block"}}>
                          {d.platform || "Empty"}
                        </span>
                      ) : (
                        <CustomDropdown dark={false} value={d.platform} options={platforms} prefix="" onChange={(v)=>set("platform", v)} onUpdateOptions={(opts) => onSettingUpdate && onSettingUpdate({platforms: opts})} 
                          style={{ padding: "4px 0", fontSize: 12, fontWeight: 600, background: "transparent", color: "#4b5563", border: "none", boxShadow: "none" }} />
                      )}
                    </div>
                 </div>

                 {/* Item: Jadwal Produksi */}
                 <div style={{display: "flex", minHeight: 28}}>
                    <div style={{width: 140, display: "flex", alignItems: "center", gap: 8, color: "#6b7280", fontSize: 13, fontWeight: 500, flexShrink: 0}}>
                        <Calendar size={14}/> Jadwal Produksi
                    </div>
                    <div style={{flex: 1, display: "flex", alignItems: "center"}}>
                        <span style={{fontSize: 13, fontWeight: 500, color: "#9ca3af"}}>Empty</span>
                    </div>
                 </div>

                 {/* Item: Jadwal Upload */}
                 <div style={{display: "flex", minHeight: 28}}>
                    <div style={{width: 140, display: "flex", alignItems: "center", gap: 8, color: "#6b7280", fontSize: 13, fontWeight: 500, flexShrink: 0}}>
                        <Calendar size={14}/> Jadwal Upload
                    </div>
                    <div style={{flex: 1, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap"}}>
                      {isReaderMode ? (
                        <span style={{fontSize: 13, fontWeight: 500, color: (d.day && d.month && d.year) ? "#4b5563" : "#9ca3af"}}>
                          {d.day && d.month && d.year ? \`\${String(d.day).padStart(2,'0')}/\${String(d.month).padStart(2,'0')}/\${d.year} (\${String(d.uploadHour || 0).padStart(2,'0')}:\${String(d.uploadMinute || 0).padStart(2,'0')})\` : "Empty"}
                        </span>
                      ) : (
                        <div style={{display: "flex", alignItems: "center", gap: 4}}>
                          <input type="date" value={\`\${d.year || new Date().getFullYear()}-\${String(d.month || new Date().getMonth()+1).padStart(2, '0')}-\${String(d.day || new Date().getDate()).padStart(2, '0')}\`} 
                            onChange={(e:any) => {
                              const parts = e.target.value.split("-");
                              if (parts.length === 3) {
                                set("year", parseInt(parts[0], 10)); set("month", parseInt(parts[1], 10)); set("day", parseInt(parts[2], 10));
                              }
                            }} 
                            style={{ background: "transparent", border: "none", fontSize: 13, fontWeight: 500, color: "#111827", outline: "none", cursor: "pointer", padding: "4px 0" }}
                          />
                          <input type="number" min={d.timeFormat === '24H' ? 0 : 1} max={d.timeFormat === '24H' ? 23 : 12} value={d.uploadHour !== undefined && d.uploadHour !== null ? d.uploadHour : ""} onChange={handleHourChange} 
                            style={{ background: "rgba(0,0,0,0.04)", border: "none", fontSize: 13, fontWeight: 500, color: "#111827", width: 28, textAlign: "center", outline: "none", padding: "2px 0", borderRadius: 4 }} placeholder="00" />
                          <span style={{color:"#111827", fontWeight: 700, fontSize: 13}}>:</span>
                          <input type="number" min={0} max={59} step={5} value={d.uploadMinute !== undefined && d.uploadMinute !== null ? d.uploadMinute : ""} onChange={handleMinuteChange} 
                            style={{ background: "rgba(0,0,0,0.04)", border: "none", fontSize: 13, fontWeight: 500, color: "#111827", width: 28, textAlign: "center", outline: "none", padding: "2px 0", borderRadius: 4 }} placeholder="00" />
                        </div>
                      )}
                    </div>
                 </div>

                 {/* Item: Pillar / Section */}
                 <div style={{display: "flex", minHeight: 28}}>
                    <div style={{width: 140, display: "flex", alignItems: "center", gap: 8, color: "#6b7280", fontSize: 13, fontWeight: 500, flexShrink: 0}}>
                        <ArrowDownCircle size={14}/> Section
                    </div>
                    <div style={{flex: 1, display: "flex", alignItems: "center"}}>
                      {isReaderMode ? (
                        <span style={{fontSize: 12, fontWeight: 600, color: "#4b5563", background: "rgba(0,0,0,0.06)", padding: "4px 10px", borderRadius: 6, display: "inline-block", textTransform: "uppercase"}}>
                          {d.pillar || "Empty"}
                        </span>
                      ) : (
                        <CustomDropdown dark={false} value={d.pillar} options={pillars} prefix="" onChange={(v)=>set("pillar", v)} onUpdateOptions={(opts) => onSettingUpdate && onSettingUpdate({pillars: opts})} 
                          style={{ padding: "4px 10px", fontSize: 12, fontWeight: 600, background: "rgba(0,0,0,0.06)", color: "#4b5563", border: "none", boxShadow: "none", borderRadius: 6, textTransform: "uppercase" }} />
                      )}
                    </div>
                 </div>

              </div>
          </div>
          
`;

s = s.substring(0, startIndex) + leftColContent + s.substring(endIndex);

fs.writeFileSync('src/ContentModal.tsx', s);
console.log("Replaced identitas with Notion style!");
