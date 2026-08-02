import React from "react";
import { motion } from "motion/react";
import { PlayCircle, X } from "lucide-react";

interface ContentModalProps {
  selectedContent: any;
  setSelectedContent: (content: any) => void;
  lang: string;
}

export function ContentModal({
  selectedContent,
  setSelectedContent,
  lang,
}: ContentModalProps) {
  if (!selectedContent) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(44,32,22,0.6)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{
          background: "white",
          borderRadius: 24,
          width: "100%",
          maxWidth: 800,
          display: "flex",
          overflow: "hidden",
          maxHeight: "90vh",
        }}
      >
        <div
          style={{
            flex: 1,
            background: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            minHeight: 400,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {selectedContent.thumbnail ? (
            <img
              src={selectedContent.thumbnail}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
              referrerPolicy="no-referrer"
            />
          ) : (
            <PlayCircle size={48} opacity={0.5} />
          )}
          <div
            style={{
              position: "absolute",
              top: 16,
              left: 16,
              background: "rgba(0,0,0,0.5)",
              padding: "6px 12px",
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {selectedContent.type.toUpperCase()} • {selectedContent.time}
          </div>
        </div>
        <div style={{ width: 400, display: "flex", flexDirection: "column" }}>
          <div
            style={{
              padding: 20,
              borderBottom: "1px solid rgba(44,32,22,0.1)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3
              style={{
                fontSize: 18,
                fontWeight: 800,
                margin: 0,
                wordBreak: "break-word",
              }}
            >
              {selectedContent.title}
            </h3>
            <button
              onClick={() => setSelectedContent(null)}
              className="hover-scale"
              style={{
                background: "rgba(44,32,22,0.05)",
                borderWidth: 0,
                borderStyle: "none",
                cursor: "pointer",
                width: 32,
                height: 32,
                borderRadius: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#2C2016",
                flexShrink: 0,
              }}
            >
              <X size={18} />
            </button>
          </div>
          <div style={{ padding: 20, flex: 1, overflowY: "auto" }}>
            <div
              style={{
                fontSize: 13,
                color: "rgba(44,32,22,0.6)",
                lineHeight: 1.5,
                marginBottom: 24,
              }}
            >
              "Caption panjang lebar bla bla bla #hashtag #viral #fyp"
            </div>
            <h4 style={{ fontSize: 14, fontWeight: 800, marginBottom: 16 }}>
              {lang === "id" ? "Insight Detail" : "Insight Details"}
            </h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              {["Views", "Reach", "Likes", "Komen", "Share", "Save"].map(
                (m, i) => (
                  <div
                    key={m}
                    style={{
                      background: "#FAFAFA",
                      borderRadius: 8,
                      padding: 12,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: "rgba(44,32,22,0.5)",
                        fontWeight: 700,
                        marginBottom: 4,
                      }}
                    >
                      {m === "Komen"
                        ? lang === "id"
                          ? "Komen"
                          : "Comments"
                        : m === "Save"
                          ? lang === "id"
                            ? "Simpan"
                            : "Saves"
                          : m === "Share"
                            ? lang === "id"
                              ? "Share"
                              : "Shares"
                            : m}
                    </div>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 800,
                        color: "#2C2016",
                      }}
                    >
                      {m === "Views"
                        ? (selectedContent as any).views || (i * 10) % 5000
                        : m === "Reach"
                          ? Math.floor(
                              ((selectedContent as any).views || 5000) * 0.8,
                            )
                          : m === "Likes"
                            ? Math.floor(
                                ((selectedContent as any).views || 5000) *
                                  0.1,
                              )
                            : m === "Komen"
                              ? (selectedContent as any).comments ||
                                (i * 20) % 5000
                              : m === "Share"
                                ? (selectedContent as any).shares ||
                                  (i * 5) % 1000
                                : (selectedContent as any).saves ||
                                  (i * 15) % 10000}
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
          <div
            style={{ padding: 20, borderTop: "1px solid rgba(44,32,22,0.1)" }}
          >
            <button
              className="hover-scale"
              style={{
                width: "100%",
                background: "var(--theme-primary)",
                color: "white",
                borderWidth: 0,
                borderStyle: "none",
                padding: "12px",
                borderRadius: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {lang === "id"
                ? "Buka di Platform Asli"
                : "Open in Native Platform"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
