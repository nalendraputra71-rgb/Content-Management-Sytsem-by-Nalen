import re

with open('src/SocialStudioView.tsx', 'r') as f:
    content = f.read()

# We need to replace the calendar div style and chevron down back.
# Find the CalendarMock div.
start_str = '            <div\n              key={d}\n              style={{\n                padding: "12px",\n                background: "white",\n                border: "1px solid rgba(44,32,22,0.1)",\n                borderRadius: 12,\n                minHeight: 130,\n                position: "relative",\n                display: "flex",\n                flexDirection: "column",\n                overflow: "hidden",\n              }}\n            >\n              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 8 }}>{d}</div>\n              <div\n                className="[&::-webkit-scrollbar]:hidden"\n                style={{\n                  display: "flex",\n                  flexDirection: "column",\n                  gap: 6,\n                  flex: 1,\n                  overflowY: "auto",\n                  maxHeight: 110,\n                  scrollbarWidth: "none",\n                  msOverflowStyle: "none",\n                }}'
replacement_str = '            <div\n              key={d}\n              style={{\n                padding: "12px 12px 40px",\n                background: "white",\n                border: "1px solid rgba(44,32,22,0.1)",\n                borderRadius: 12,\n                minHeight: 100,\n                position: "relative",\n              }}\n            >\n              <div style={{ fontWeight: 800, fontSize: 14 }}>{d}</div>\n              <div\n                style={{\n                  marginTop: 8,\n                  display: "flex",\n                  flexDirection: "column",\n                  gap: 6,\n                }}'

content = content.replace(start_str, replacement_str)

end_str = '              {posts.length > 3 && (\n                <div\n                  style={{\n                    position: "absolute",\n                    bottom: 0,\n                    left: 0,\n                    right: 0,\n                    height: 24,\n                    background: "linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,1) 60%)",\n                    display: "flex",\n                    alignItems: "flex-end",\n                    justifyContent: "center",\n                    paddingBottom: 2,\n                    pointerEvents: "none",\n                  }}\n                >\n                  <ChevronDown size={14} color="rgba(44,32,22,0.4)" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.15))" }} />\n                </div>\n              )}\n            </div>\n          );\n        })}\n      </div>\n    );\n  };\n\n  const ContentModalMock'
replacement_end = '            </div>\n          );\n        })}\n      </div>\n    );\n  };\n\n  const ContentModalMock'

content = content.replace(end_str, replacement_end)

with open('src/SocialStudioView.tsx', 'w') as f:
    f.write(content)
