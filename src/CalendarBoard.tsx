import React, { useState } from "react";
import { motion } from "motion/react";
import { Globe } from "lucide-react";
import { DynamicPlatformIcon } from "./components/DynamicPlatformIcon";
import { db, doc, setDoc } from "./firebase";

function getPlatformIcon(platformIdentifier: string, size = 12) {
  const name = String(platformIdentifier || "")
    .trim()
    .toLowerCase();

  const exactMatches = ["ig", "tt", "fb", "meta", "x", "li", "yt"];
  const includesMatches = [
    "instagram",
    "tiktok",
    "facebook",
    "threads",
    "twitter",
    "linkedin",
    "youtube",
  ];
  const isKnown =
    exactMatches.includes(name) ||
    includesMatches.some((k) => name.includes(k));

  if (name.includes("semua") || name === "all" || name.includes("globe")) {
    return <Globe size={size} color="#888888" />;
  }

  if (isKnown) {
    return (
      <DynamicPlatformIcon platformName={platformIdentifier} size={size} />
    );
  }

  return null;
}

export function CalendarBoard({ ctx }: { ctx: any }) {
  const {
    calendarPosts,
    setCalendarPosts,
    content = [],
    contentPlatform,
    lang,
    workspace,
    workspaceId,
    onOpenModal,
    setSelectedContent,
  } = ctx;

  const [dragOverDate, setDragOverDate] = useState<number | null>(null);

  const days = Array.from({ length: 31 }).map((_, i) => i + 1);

  // Parse workspace content items into calendar-friendly structures
  const realCalendarPosts = (content || []).map((c: any) => {
    let day = 1;
    if (c.publishDate) {
      const parts = c.publishDate.split("-");
      if (parts.length === 3) day = parseInt(parts[2], 10);
    }
    return {
      ...c,
      day,
      type: Array.isArray(c.platform) ? c.platform[0] : c.platform || "ig",
    };
  });

  // Combine local Auto-Plan posts with real workspace content
  // Assign stable, drag-compatible IDs if they are missing
  const mergedPosts = [
    ...calendarPosts.map((p: any, idx: number) => ({
      ...p,
      id: p.id || `local-cal-${idx}`,
      isLocal: true,
    })),
    ...realCalendarPosts.map((p: any) => ({
      ...p,
      isLocal: false,
    })),
  ];

  // Filter posts based on selected contentPlatform dropdown
  const filteredPosts = contentPlatform && contentPlatform !== "all"
    ? mergedPosts.filter(
        (p: any) =>
          String(p.type || "").trim().toLowerCase() ===
          String(contentPlatform).trim().toLowerCase()
      )
    : mergedPosts;

  // Handle Drag Start
  const handleDragStart = (e: React.DragEvent, post: any) => {
    e.dataTransfer.setData("application/json", JSON.stringify(post));
    e.dataTransfer.effectAllowed = "move";
  };

  // Handle Drag Over (Allow drop and set state for drop cell indicator)
  const handleDragOver = (e: React.DragEvent, date: number) => {
    e.preventDefault();
    if (dragOverDate !== date) {
      setDragOverDate(date);
    }
  };

  // Handle Drag Leave
  const handleDragLeave = () => {
    setDragOverDate(null);
  };

  // Handle Drop onto a specific day cell
  const handleDrop = async (e: React.DragEvent, targetDate: number) => {
    e.preventDefault();
    setDragOverDate(null);

    try {
      const rawData = e.dataTransfer.getData("application/json");
      if (!rawData) return;
      
      const draggedPost = JSON.parse(rawData);
      
      if (draggedPost.isLocal) {
        // Drop local post -> update day field in the local calendarPosts state
        const updatedLocalPosts = calendarPosts.map((p: any, idx: number) => {
          const tempId = p.id || `local-cal-${idx}`;
          if (tempId === draggedPost.id) {
            return { ...p, day: targetDate };
          }
          return p;
        });
        setCalendarPosts(updatedLocalPosts);
      } else {
        // Drop database post -> update day field in Firestore
        const activeWorkspaceId = workspaceId || (workspace && workspace.id);
        if (activeWorkspaceId && draggedPost.id) {
          const docRef = doc(db, "workspaces", activeWorkspaceId, "content", draggedPost.id);
          await setDoc(docRef, { day: targetDate }, { merge: true });
        } else {
          // Fallback if no db/workspace: update locally if possible or log warning
          console.warn("No workspace configuration found to update Firestore. Simulating locally.");
        }
      }
    } catch (err) {
      console.error("Error during drag-and-drop schedule update:", err);
    }
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        gap: 12,
        width: "100%",
        marginTop: 24,
      }}
    >
      {(lang === "id"
        ? ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]
        : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      ).map((d) => (
        <div
          key={d}
          style={{
            textAlign: "center",
            fontWeight: 800,
            fontSize: 13,
            color: "rgba(44,32,22,0.5)",
          }}
        >
          {d}
        </div>
      ))}
      {/* 3 offset days to align August 2026 calendar starting with Saturday offset */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={"empty" + i}
          style={{
            padding: "20px",
            background: "rgba(44,32,22,0.02)",
            borderRadius: 12,
          }}
        />
      ))}
      {days.map((d) => {
        const postsInDay = filteredPosts.filter((p: any) => p.day === d);
        const isToday = d === new Date().getDate();
        const isDraggingOver = dragOverDate === d;

        return (
          <div
            key={d}
            onDragOver={(e) => handleDragOver(e, d)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, d)}
            style={{
              padding: "12px 12px 40px",
              background: isDraggingOver
                ? "rgba(37, 99, 235, 0.12)"
                : isToday
                ? "rgba(37, 99, 235, 0.08)"
                : "white",
              borderWidth: isDraggingOver || isToday ? "2px" : "1px",
              borderStyle: isDraggingOver ? "dashed" : "solid",
              borderColor: isDraggingOver || isToday
                ? "var(--theme-primary)"
                : "rgba(44,32,22,0.1)",
              borderRadius: 12,
              minHeight: 120,
              position: "relative",
              boxShadow: isToday
                ? "0 8px 24px rgba(37, 99, 235, 0.12)"
                : "none",
              transition: "background-color 0.2s, border-color 0.2s",
            }}
          >
            <div
              style={{
                fontWeight: 800,
                fontSize: 14,
                color: isToday ? "var(--theme-primary)" : "inherit",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              {d}
              {isToday && (
                <span
                  style={{
                    fontSize: 9,
                    padding: "2px 6px",
                    background: "var(--theme-primary)",
                    color: "white",
                    borderRadius: 9999,
                    fontWeight: 800,
                  }}
                >
                  {lang === "id" ? "Hari Ini" : "Today"}
                </span>
              )}
            </div>
            <div
              style={{
                marginTop: 8,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              {postsInDay.map((p: any, i) => {
                const pType = String(p.type || "")
                  .trim()
                  .toLowerCase();
                let blockColor = "#2D5A86";
                let blockBg = "#F0F4F8";

                if (pType === "ig" || pType === "instagram") {
                  blockColor = "#E1306C";
                  blockBg = "#FDF0F5";
                } else if (
                  pType === "fb" ||
                  pType === "facebook" ||
                  pType === "meta"
                ) {
                  blockColor = "#1877F2";
                  blockBg = "#EBF3FC";
                } else if (pType === "tt" || pType === "tiktok") {
                  blockColor = "#000000";
                  blockBg = "#F1F1F1";
                } else if (pType === "li" || pType === "linkedin") {
                  blockColor = "#0077B5";
                  blockBg = "#E6F0F8";
                } else if (pType === "yt" || pType === "youtube") {
                  blockColor = "#FF0000";
                  blockBg = "#FFF0F0";
                } else if (
                  pType === "x" ||
                  pType === "twitter" ||
                  pType === "threads"
                ) {
                  blockColor = "#111111";
                  blockBg = "#F3F3F3";
                }

                return (
                  <motion.div
                    draggable
                    onDragStart={(e: any) => handleDragStart(e, p)}
                    whileHover={{ scale: 1.02 }}
                    key={p.id || i}
                    onClick={() => {
                      if (onOpenModal) {
                        onOpenModal(p);
                      } else if (setSelectedContent) {
                        setSelectedContent(p);
                      }
                    }}
                    style={{
                      background: blockBg,
                      color: blockColor,
                      padding: "6px 8px",
                      borderRadius: 6,
                      fontSize: 10,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      cursor: "grab",
                    }}
                  >
                    {getPlatformIcon(p.type, 12)}
                    <div
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        flex: 1,
                      }}
                    >
                      {p.title}
                    </div>
                    {p.time && (
                      <div
                        style={{ fontSize: 9, opacity: 0.7, flexShrink: 0 }}
                      >
                        {p.time}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
