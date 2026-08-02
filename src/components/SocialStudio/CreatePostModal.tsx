import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Edit3,
  Smartphone,
  Sparkles,
  ChevronRight,
  Upload,
  AlertTriangle
} from "lucide-react";
import { PlatformPreview } from "./PlatformPreview";

export function CreatePostModal({ ctx }: { ctx: any }) {
  const {
    isMobileHubAi,
    lang,
    showCreatePostPopup,
    setShowCreatePostPopup,
    tab,
    setTab,
    createPostMobileTab,
    setCreatePostMobileTab,
    PLATFORMS,
    connectedPlatforms,
    createPostPlatforms,
    setCreatePostPlatforms,
    createPostPlatformTypes,
    setCreatePostPlatformTypes,
    expandedEditPlatforms,
    setExpandedEditPlatforms,
    activePreviewPlatform,
    setActivePreviewPlatform,
    platformOverrides,
    setPlatformOverrides,
    createPostCaption,
    setCreatePostCaption,
    createPostMedia,
    setCreatePostMedia,
    workspace,
    createPostMode,
    setCreatePostMode,
    createPostDate,
    setCreatePostDate,
    createPostTime,
    setCreatePostTime,
    handleCreatePost
  } = ctx;

    const renderEditorBlock = (pId: string | null, pInfo?: any) => {
    const caption = pId
      ? (platformOverrides[pId]?.caption ?? createPostCaption)
      : createPostCaption;
    const setCaption = (c: string) => {
      if (pId) {
        setPlatformOverrides((prev: any) => ({
          ...prev,
          [pId]: { ...prev[pId], caption: c },
        }));
        setCreatePostCaption(c);
      } else setCreatePostCaption(c);
    };

    const media = pId
      ? platformOverrides[pId]?.media !== undefined
        ? platformOverrides[pId]?.media
        : createPostMedia
      : createPostMedia;
    const setMedia = (newMedia: { url: string; type: "image" | "video" }[]) => {
      if (pId) {
        setPlatformOverrides((prev: any) => ({
          ...prev,
          [pId]: { ...prev[pId], media: newMedia },
        }));
        setCreatePostMedia(newMedia);
      } else setCreatePostMedia(newMedia);
    };

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 24,
          padding: pId ? (isMobileHubAi ? "12px 2px" : 20) : 0,
        }}
      >
        {pId && pInfo?.contentTypes && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {pInfo.contentTypes.map((ct: any) => {
              const isActive =
                (createPostPlatformTypes[pId] || pInfo.contentTypes[0].id) ===
                ct.id;
              return (
                <div
                  key={ct.id}
                  onClick={() =>
                    setCreatePostPlatformTypes((prev: any) => ({
                      ...prev,
                      [pId]: ct.id,
                    }))
                  }
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "4px 10px",
                    borderRadius: 12,
                    background: isActive
                      ? "var(--theme-primary)"
                      : "rgba(44,32,22,0.04)",
                    color: isActive ? "white" : "rgba(44,32,22,0.6)",
                    cursor: "pointer",
                    borderWidth: "1px",
                    borderStyle: "solid",
                    borderColor: isActive
                      ? "var(--theme-primary)"
                      : "transparent",
                  }}
                  className={isActive ? "" : "hover-bg"}
                >
                  {ct.label}
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <label
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "rgba(44,32,22,0.5)",
                margin: 0,
                display: "block",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Caption
            </label>
            <button
              style={{
                background: "transparent",
                color: "var(--theme-primary)",
                borderWidth: 0,
                borderStyle: "none",
                padding: 0,
                fontSize: 12,
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
              className="hover-scale"
            >
              <Sparkles size={14} /> Generate AI
            </button>
          </div>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="What's on your mind?"
            style={{
              width: "100%",
              minHeight: 120,
              borderRadius: 16,
              borderWidth: 0,
              borderStyle: "none",
              background: "rgba(44,32,22,0.03)",
              padding: "16px",
              fontSize: 14,
              resize: "vertical",
              outline: "none",
              fontFamily: "inherit",
              lineHeight: 1.6,
              color: "#2C2016",
              transition: "all 0.2s",
            }}
            onFocus={(e: any) => (e.target.style.background = "rgba(44,32,22,0.06)")}
            onBlur={(e: any) => (e.target.style.background = "rgba(44,32,22,0.03)")}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <label
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "rgba(44,32,22,0.5)",
              marginBottom: 12,
              display: "block",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Media
          </label>
          <div
            style={{
              width: "100%",
              minHeight: 140,
              borderRadius: 16,
              borderWidth: "2px",
              borderStyle: "dashed",
              borderColor: "rgba(44,32,22,0.1)",
              background: "rgba(44,32,22,0.02)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              padding: media && media.length > 0 ? "16px" : "0",
              cursor: "pointer",
              color: "rgba(44,32,22,0.5)",
              position: "relative",
              transition: "all 0.2s",
            }}
            className="hover-bg"
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const files = (Array.from(e.dataTransfer.files) as File[]).filter(
                (f) =>
                  f.type.startsWith("image/") || f.type.startsWith("video/"),
              );
              if (files.length > 0) {
                const newMedia = files.map((file) => ({
                  url: URL.createObjectURL(file),
                  type: file.type.startsWith("video/")
                    ? ("video" as const)
                    : ("image" as const),
                }));
                setMedia([...(media || []), ...newMedia]);
              }
            }}
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = "image/*,video/*";
              input.multiple = true;
              input.onchange = (e: any) => {
                if (e.target.files?.length > 0) {
                  const files = Array.from(e.target.files) as File[];
                  const newMedia = files.map((file) => ({
                    url: URL.createObjectURL(file),
                    type: file.type.startsWith("video/")
                      ? ("video" as const)
                      : ("image" as const),
                  }));
                  setMedia([...(media || []), ...newMedia]);
                }
              };
              input.click();
            }}
          >
            {media && media.length > 0 ? (
              <div
                style={{
                  width: "100%",
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                  gap: 12,
                }}
              >
                {media.map((m: any, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      aspectRatio: "1",
                      borderRadius: 12,
                      overflow: "hidden",
                      position: "relative",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {m.type === "video" ? (
                      <video
                        src={m.url}
                        autoPlay
                        loop
                        muted
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <img
                        src={m.url}
                        alt="Preview"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    )}
                    <div
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        background: "rgba(0,0,0,0.5)",
                        color: "white",
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        backdropFilter: "blur(4px)",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        const newMedia = [...media];
                        newMedia.splice(idx, 1);
                        setMedia(newMedia);
                      }}
                      className="hover-scale"
                    >
                      <X size={12} />
                    </div>
                  </div>
                ))}
                <div
                  style={{
                    aspectRatio: "1",
                    borderRadius: 12,
                    borderWidth: "2px",
                    borderStyle: "dashed",
                    borderColor: "rgba(44,32,22,0.1)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "rgba(44,32,22,0.4)",
                    gap: 4,
                  }}
                >
                  <Upload size={16} />
                  <span style={{ fontSize: 11, fontWeight: 600 }}>Add</span>
                </div>
              </div>
            ) : (
              <>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    background: "rgba(44,32,22,0.04)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    pointerEvents: "none",
                  }}
                >
                  <Upload size={20} color="rgba(44,32,22,0.5)" />
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "rgba(44,32,22,0.4)",
                    pointerEvents: "none",
                  }}
                >
                  Drag & drop files or click to browse
                </div>
              </>
            )}
          </div>

          {(() => {
            if (!media || media.length === 0 || !pId) return null;
            const firstMediaType = media[0].type;
            const warnings: string[] = [];
            const typeId =
              createPostPlatformTypes[pId] || pInfo?.contentTypes?.[0]?.id;
            if (!typeId) return null;

            const typeLabel =
              pInfo?.contentTypes?.find((x: any) => x.id === typeId)?.label ||
              typeId;

            if (
              firstMediaType === "image" &&
              ["reel", "video"].includes(typeId)
            ) {
              warnings.push(
                `${pInfo.name} (${typeLabel}) membutuhkan format Video.`,
              );
            }
            if (
              firstMediaType === "video" &&
              ["photo_carousel"].includes(typeId)
            ) {
              warnings.push(
                `${pInfo.name} (${typeLabel}) membutuhkan format Gambar.`,
              );
            }

            if (warnings.length > 0) {
              return (
                <div
                  style={{
                    marginTop: 16,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    padding: 12,
                    background: "rgba(239,68,68,0.1)",
                    borderRadius: 12,
                    borderWidth: "1px",
                    borderStyle: "solid",
                    borderColor: "rgba(239,68,68,0.2)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      color: "#EF4444",
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    <AlertTriangle size={16} /> Format Tidak Sesuai
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#EF4444",
                      fontWeight: 500,
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                    }}
                  >
                    {warnings.map((w, i) => (
                      <span key={i}>• {w}</span>
                    ))}
                  </div>
                </div>
              );
            }
            return null;
          })()}
        </div>
      </div>
    );
  };

  return isMobileHubAi ? (
        /* MOBILE VIEW - Beautiful, Clean, Modern, and Touch-Friendly */
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          className="flex-1 min-h-0 flex flex-col bg-[#FAFAFA] overflow-hidden"
          style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
        >
          {/* Header & Mobile Tab Switcher */}
          <div className="bg-white border-b border-black/[0.03] flex-shrink-0 flex flex-col pt-3 pb-2 px-4 shadow-sm z-10">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-extrabold text-[#111827] m-0">
                {lang === "id" ? "Buat Postingan Baru" : "Create a Post"}
              </h2>
              <button
                onClick={() => {
                  setShowCreatePostPopup(false);
                  if (tab === "social-studio" && setTab) {
                    setTab("social-dashboard");
                  }
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors border-none cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Premium Tab Switcher */}
            <div className="bg-black/[0.03] p-1 rounded-xl flex">
              <button
                onClick={() => setCreatePostMobileTab("editor")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg border-none cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                  createPostMobileTab === "editor"
                    ? "bg-white text-[var(--theme-primary)] shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
                    : "bg-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                <Edit3 size={14} />
                <span>{lang === "id" ? "Tulis Konten" : "Post Editor"}</span>
              </button>
              <button
                onClick={() => setCreatePostMobileTab("preview")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg border-none cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                  createPostMobileTab === "preview"
                    ? "bg-white text-[var(--theme-primary)] shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
                    : "bg-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                <Smartphone size={14} />
                <span>{lang === "id" ? "Pratinjau HP" : "Mobile Preview"}</span>
              </button>
            </div>
          </div>

          {/* Main Scrollable Area */}
          <div className="flex-1 overflow-y-auto p-4 pb-6 flex flex-col gap-4">
            {createPostMobileTab === "editor" ? (
              /* EDITOR TAB */
              <>
                {/* Under development banner */}
                <div className="bg-blue-50/70 border border-blue-100/50 rounded-2xl p-4 flex items-start gap-3">
                  <div className="bg-blue-100/50 p-2 rounded-xl text-[var(--theme-primary)] flex-shrink-0 mt-0.5">
                    <Sparkles size={16} />
                  </div>
                  <div className="min-w-0">
                    <h5 className="font-extrabold text-blue-900 text-xs m-0 leading-tight">
                      {lang === "id"
                        ? "Direct Publishing Preview 🚀"
                        : "Feature Preview 🚀"}
                    </h5>
                    <p className="text-[10px] text-blue-700/80 m-0 mt-1 leading-normal font-medium">
                      {lang === "id"
                        ? "Fitur penerbitan langsung ke media sosial sedang dalam uji coba internal dan akan segera hadir secara penuh."
                        : "Direct publishing is currently in internal preview and will be fully available very soon."}
                    </p>
                  </div>
                </div>

                {/* Platforms selection */}
                <div className="bg-white rounded-2xl border border-black/[0.02] p-4 shadow-sm">
                  <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-3 block">
                    {lang === "id"
                      ? "Pilih Platform Tujuan"
                      : "Select Platforms"}
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {PLATFORMS.filter(
                      (p: any) =>
                        p.id !== "all" && connectedPlatforms.includes(p.id),
                    ).length === 0 ? (
                      <div className="text-xs text-gray-400 py-1.5 flex flex-col gap-1.5">
                        <span>
                          {lang === "id"
                            ? "Belum ada platform yang terhubung."
                            : "No connected platforms."}
                        </span>
                        <button
                          onClick={() => {
                            setShowCreatePostPopup(false);
                            setTab("social-dashboard");
                          }}
                          className="text-[10px] font-bold text-[var(--theme-primary)] underline text-left border-none bg-transparent cursor-pointer"
                        >
                          {lang === "id"
                            ? "Hubungkan sekarang di Dashboard"
                            : "Connect now in Dashboard"}
                        </button>
                      </div>
                    ) : (
                      PLATFORMS.filter(
                        (p: any) =>
                          p.id !== "all" && connectedPlatforms.includes(p.id),
                      ).map((p: any) => {
                        const isSelected = createPostPlatforms.includes(p.id);
                        return (
                          <button
                            key={p.id}
                            onClick={() => {
                              if (isSelected) {
                                setCreatePostPlatforms((prev: any[]) =>
                                  prev.filter((id) => id !== p.id),
                                );
                                setCreatePostPlatformTypes((prev: any) => {
                                  const next = { ...prev };
                                  delete next[p.id];
                                  return next;
                                });
                              } else {
                                setCreatePostPlatforms((prev: any[]) => [
                                  ...prev,
                                  p.id,
                                ]);
                                if (
                                  p.contentTypes &&
                                  p.contentTypes.length > 0
                                ) {
                                  setCreatePostPlatformTypes((prev: any) => ({
                                    ...prev,
                                    [p.id]: p.contentTypes![0].id,
                                  }));
                                }
                              }
                            }}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-extrabold cursor-pointer transition-all border-none active:scale-95 ${
                              isSelected
                                ? "text-white shadow-sm"
                                : "bg-black/[0.02] text-gray-500 hover:bg-black/[0.04]"
                            }`}
                            style={{
                              backgroundColor: isSelected ? p.color : "",
                            }}
                          >
                            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-current">
                              {typeof p.icon === "string" ? (
                                <span className="text-[9px] font-black">
                                  {p.icon}
                                </span>
                              ) : (
                                React.cloneElement(
                                  p.icon as React.ReactElement<any>,
                                  { size: 10 },
                                )
                              )}
                            </div>
                            <span>{p.name}</span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Editor Inputs (caption, media, formats) */}
                {createPostPlatforms.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-dashed border-black/[0.06] py-10 px-5 text-center flex flex-col items-center justify-center shadow-sm">
                    <Edit3 size={24} className="text-gray-300 mb-2" />
                    <span className="text-xs font-bold text-gray-400">
                      {lang === "id"
                        ? "Pilih platform untuk mulai mengedit"
                        : "Select at least one platform to edit"}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {createPostPlatforms.map((pId: string) => {
                      const p = PLATFORMS.find((x: any) => x.id === pId);
                      if (!p) return null;
                      const isExpanded = expandedEditPlatforms[pId] !== false;
                      return (
                        <div
                          key={pId}
                          className="bg-white rounded-2xl border border-black/[0.02] shadow-sm overflow-hidden"
                        >
                          {/* Accordion Header */}
                          <div
                            onClick={() =>
                              setExpandedEditPlatforms((prev: any) => ({
                                ...prev,
                                [pId]: prev[pId] === false ? true : false,
                              }))
                            }
                            className="p-4 flex items-center justify-between cursor-pointer bg-black/[0.01] hover:bg-black/[0.02] transition-colors select-none"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-7 h-7 rounded-full flex items-center justify-center text-white shadow-sm"
                                style={{ backgroundColor: p.color }}
                              >
                                {typeof p.icon === "string" ? (
                                  <span className="text-[10px] font-black text-white">
                                    {p.icon}
                                  </span>
                                ) : (
                                  React.cloneElement(
                                    p.icon as React.ReactElement<any>,
                                    { size: 12, color: "#FFFFFF" },
                                  )
                                )}
                              </div>
                              <span className="text-xs font-extrabold text-[#111827]">
                                {p.name} {lang === "id" ? "Konten" : "Content"}
                              </span>
                            </div>
                            <ChevronRight
                              size={16}
                              className="text-gray-400 transition-transform duration-200"
                              style={{
                                transform: isExpanded
                                  ? "rotate(90deg)"
                                  : "none",
                              }}
                            />
                          </div>

                          {/* Accordion Body */}
                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="p-4 border-t border-black/[0.03]">
                                  {renderEditorBlock(pId, p)}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              /* PREVIEW TAB */
              <div className="flex flex-col items-center gap-4">
                {createPostPlatforms.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-dashed border-black/[0.06] w-full py-12 px-6 text-center flex flex-col items-center justify-center shadow-sm">
                    <Smartphone size={28} className="text-gray-300 mb-2" />
                    <span className="text-xs font-bold text-gray-400">
                      {lang === "id"
                        ? "Belum ada platform yang dipilih untuk pratinjau"
                        : "Select at least one platform to preview"}
                    </span>
                  </div>
                ) : (
                  <>
                    {/* Horizontal Platform Select for Preview */}
                    {createPostPlatforms.length > 1 && (
                      <div className="flex gap-1.5 overflow-x-auto pb-1.5 w-full max-w-[340px] px-1 no-scrollbar">
                        {createPostPlatforms.map((pId: string) => {
                          const p = PLATFORMS.find((x: any) => x.id === pId);
                          if (!p) return null;
                          const isActive =
                            activePreviewPlatform &&
                            createPostPlatforms.includes(activePreviewPlatform)
                              ? activePreviewPlatform === pId
                              : createPostPlatforms[0] === pId;
                          return (
                            <button
                              key={`preview-tab-mob-${pId}`}
                              onClick={() => setActivePreviewPlatform(pId)}
                              className={`px-3 py-1.5 rounded-full text-[11px] font-extrabold cursor-pointer transition-all border-none flex items-center gap-1.5 shrink-0 active:scale-95 shadow-xs ${
                                isActive
                                  ? "text-white"
                                  : "bg-white text-gray-500 border border-black/[0.04] hover:bg-gray-50"
                              }`}
                              style={{
                                backgroundColor: isActive ? p.color : "",
                              }}
                            >
                              {typeof p.icon === "string" ? (
                                <span className="text-[9px] font-black">
                                  {p.icon}
                                </span>
                              ) : (
                                React.cloneElement(
                                  p.icon as React.ReactElement<any>,
                                  { size: 10 },
                                )
                              )}
                              <span>{p.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Beautiful, Realistic Integrated Mockup from PlatformPreview directly */}
                    <div className="w-full flex justify-center py-2">
                      {(() => {
                        const pId =
                          createPostPlatforms.length > 0
                            ? activePreviewPlatform &&
                              createPostPlatforms.includes(
                                activePreviewPlatform,
                              )
                              ? activePreviewPlatform
                              : createPostPlatforms[0]
                            : null;
                        const caption = pId
                          ? (platformOverrides[pId]?.caption ??
                            createPostCaption)
                          : createPostCaption;
                        const mediaList = pId
                          ? platformOverrides[pId]?.media !== undefined
                            ? platformOverrides[pId]?.media
                            : createPostMedia
                          : createPostMedia;

                        return (
                          <div className="w-full max-w-[310px] flex justify-center">
                            <PlatformPreview
                              platform={pId || "instagram"}
                              contentType={
                                createPostPlatformTypes[pId || ""] || "feed"
                              }
                              caption={caption}
                              mediaList={mediaList || []}
                              workspaceName={workspace?.name || "Workspace"}
                            />
                          </div>
                        );
                      })()}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* STICKY BOTTOM ACTIONS BAR - Non-fixed, natural sibling of scrollable content area to ensure absolutely no overlapping */}
          <div className="flex-shrink-0 bg-white border-t border-black/[0.04] py-3.5 px-4 shadow-[0_-5px_20px_rgba(0,0,0,0.03)] z-10 flex flex-col gap-3">
            {/* Mode selection Slider and Scheduler details side-by-side or stacked cleanly */}
            <div className="flex flex-col gap-2">
              <div className="bg-black/[0.03] p-0.5 rounded-xl flex w-full">
                <button
                  onClick={() => setCreatePostMode("now")}
                  className={`flex-1 py-1.5 text-[11px] font-extrabold rounded-lg border-none cursor-pointer transition-all ${
                    createPostMode === "now"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "bg-transparent text-gray-400"
                  }`}
                >
                  Post Sekarang
                </button>
                <button
                  onClick={() => setCreatePostMode("schedule")}
                  className={`flex-1 py-1.5 text-[11px] font-extrabold rounded-lg border-none cursor-pointer transition-all ${
                    createPostMode === "schedule"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "bg-transparent text-gray-400"
                  }`}
                >
                  Jadwal Post
                </button>
              </div>

              {/* Collapsible Schedule Picker Inputs */}
              {createPostMode === "schedule" && (
                <div className="grid grid-cols-2 gap-2 mt-1 animate-[fadeIn_0.15s_ease-out]">
                  <div className="bg-black/[0.02] border border-black/[0.03] rounded-xl px-2.5 py-1 flex flex-col">
                    <span className="text-[8px] font-extrabold text-gray-400 uppercase tracking-wider">
                      {lang === "id" ? "Tanggal" : "Date"}
                    </span>
                    <input
                      type="date"
                      value={createPostDate}
                      onChange={(e) => setCreatePostDate(e.target.value)}
                      className="border-none bg-transparent text-xs font-bold text-gray-800 outline-none p-0 mt-0.5"
                    />
                  </div>
                  <div className="bg-black/[0.02] border border-black/[0.03] rounded-xl px-2.5 py-1 flex flex-col">
                    <span className="text-[8px] font-extrabold text-gray-400 uppercase tracking-wider">
                      {lang === "id" ? "Waktu" : "Time"}
                    </span>
                    <input
                      type="time"
                      value={createPostTime}
                      onChange={(e) => setCreatePostTime(e.target.value)}
                      className="border-none bg-transparent text-xs font-bold text-gray-800 outline-none p-0 mt-0.5"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Cancel and Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCreatePostPopup(false);
                  if (tab === "social-studio" && setTab) {
                    setTab("social-dashboard");
                  }
                }}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors border-none cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleCreatePost}
                disabled={createPostPlatforms.length === 0}
                className={`flex-1.5 py-2.5 px-4 rounded-xl text-xs font-black text-white shadow-sm transition-all border-none cursor-pointer active:scale-95 ${
                  createPostPlatforms.length === 0
                    ? "bg-gray-300 cursor-not-allowed opacity-50"
                    : "bg-[var(--theme-primary)] hover:opacity-95"
                }`}
              >
                {createPostMode === "now" ? "Post Sekarang" : "Jadwal Post"}
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        /* DESKTOP VIEW - Kept 100% original */
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex-1 min-h-0 flex flex-col bg-white overflow-hidden"
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "20px 28px",
              borderBottom: "1px solid rgba(44,32,22,0.05)",
              flexShrink: 0,
            }}
          >
            <h2
              style={{
                fontSize: 18,
                fontWeight: 800,
                margin: 0,
                color: "#2C2016",
              }}
            >
              Create a Post
            </h2>
            <button
              onClick={() => {
                setShowCreatePostPopup(false);
                if (tab === "social-studio" && setTab) {
                  setTab("social-dashboard");
                }
              }}
              style={{
                background: "transparent",
                borderWidth: 0,
                borderStyle: "none",
                width: 28,
                height: 28,
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "rgba(44,32,22,0.4)",
              }}
              className="hover-bg"
            >
              <X size={16} />
            </button>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: 28,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Info Banner: Feature Coming Soon */}
            <div
              style={{
                background:
                  "linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)",
                border: "1px solid rgba(37, 99, 235, 0.15)",
                borderRadius: "16px",
                padding: "16px 20px",
                marginBottom: "24px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  background: "rgba(37, 99, 235, 0.1)",
                  borderRadius: "50%",
                  padding: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Sparkles size={18} color="var(--theme-primary)" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 800,
                    color: "#1E3A8A",
                  }}
                >
                  {lang === "id"
                    ? "Fitur dalam Pengembangan (Segera Hadir) 🚀"
                    : "Feature in Development (Coming Soon) 🚀"}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#1E40AF",
                    opacity: 0.85,
                    lineHeight: "1.4",
                  }}
                >
                  {lang === "id"
                    ? "Fitur penerbitan otomatis ke media sosial saat ini sedang dalam tahap uji coba internal dan akan segera dapat digunakan secara penuh."
                    : "Direct publishing to social media platforms is currently in internal preview and will be fully available very soon."}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 340px",
                gap: 40,
                alignItems: "start",
              }}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: 24 }}
              >
                <div>
                  <label
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "rgba(44,32,22,0.5)",
                      marginBottom: 12,
                      display: "block",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    Platform
                  </label>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {PLATFORMS.filter(
                      (p: any) =>
                        p.id !== "all" && connectedPlatforms.includes(p.id),
                    ).length === 0 ? (
                      <div
                        style={{ fontSize: 13, color: "rgba(44,32,22,0.5)" }}
                      >
                        {lang === "id"
                          ? "Silakan hubungkan akun di pengaturan terlebih dahulu."
                          : "Please connect your account in settings first."}
                      </div>
                    ) : (
                      PLATFORMS.filter(
                        (p: any) =>
                          p.id !== "all" && connectedPlatforms.includes(p.id),
                      ).map((p: any) => {
                        const isSelected = createPostPlatforms.includes(p.id);
                        return (
                          <div
                            key={p.id}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 8,
                            }}
                          >
                            <div
                              onClick={() => {
                                if (isSelected) {
                                  setCreatePostPlatforms((prev: any[]) =>
                                    prev.filter((id) => id !== p.id),
                                  );
                                  setCreatePostPlatformTypes((prev: any) => {
                                    const next = { ...prev };
                                    delete next[p.id];
                                    return next;
                                  });
                                } else {
                                  setCreatePostPlatforms((prev: any[]) => [
                                    ...prev,
                                    p.id,
                                  ]);
                                  if (
                                    p.contentTypes &&
                                    p.contentTypes.length > 0
                                  ) {
                                    setCreatePostPlatformTypes((prev: any) => ({
                                      ...prev,
                                      [p.id]: p.contentTypes![0].id,
                                    }));
                                  }
                                }
                              }}
                              title={p.name}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                padding: "6px 16px 6px 6px",
                                borderRadius: 20,
                                borderWidth: isSelected ? "0" : "1px",
                                borderStyle: isSelected ? "none" : "solid",
                                borderColor: isSelected
                                  ? "transparent"
                                  : "rgba(44,32,22,0.08)",
                                background: isSelected
                                  ? p.color
                                  : "transparent",
                                color: isSelected
                                  ? "white"
                                  : "rgba(44,32,22,0.6)",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                fontWeight: 600,
                                fontSize: 13,
                              }}
                              className={!isSelected ? "hover-bg" : ""}
                            >
                              <div
                                style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: 14,
                                  background: isSelected
                                    ? "rgba(255,255,255,0.2)"
                                    : "rgba(44,32,22,0.05)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                {typeof p.icon === "string" ? (
                                  <span
                                    style={{ fontWeight: 800, fontSize: 12 }}
                                  >
                                    {p.icon}
                                  </span>
                                ) : (
                                  React.cloneElement(
                                    p.icon as React.ReactElement<any>,
                                    { size: 14 },
                                  )
                                )}
                              </div>
                              <span>{p.name}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {createPostPlatforms.length === 0 ? (
                  renderEditorBlock(null, null)
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    {createPostPlatforms.map((pId: string) => {
                      const p = PLATFORMS.find((x: any) => x.id === pId);
                      if (!p) return null;
                      const isExpanded = expandedEditPlatforms[pId] !== false;
                      return (
                        <div
                          key={pId}
                          style={{
                            borderWidth: "1px",
                            borderStyle: "solid",
                            borderColor: "rgba(44,32,22,0.08)",
                            borderRadius: 16,
                            overflow: "hidden",
                            background: "white",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
                          }}
                        >
                          <div
                            onClick={() =>
                              setExpandedEditPlatforms((prev: any) => ({
                                ...prev,
                                [pId]: prev[pId] === false ? true : false,
                              }))
                            }
                            style={{
                              padding: 16,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              background: isExpanded
                                ? "rgba(44,32,22,0.02)"
                                : "transparent",
                              cursor: "pointer",
                              transition: "all 0.2s",
                            }}
                            className="hover-bg"
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                              }}
                            >
                              <div
                                style={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: 12,
                                  background: p.color,
                                  color: "white",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                {typeof p.icon === "string" ? (
                                  <span
                                    style={{ fontWeight: 800, fontSize: 10 }}
                                  >
                                    {p.icon}
                                  </span>
                                ) : (
                                  React.cloneElement(
                                    p.icon as React.ReactElement<any>,
                                    { size: 12 },
                                  )
                                )}
                              </div>
                              <strong
                                style={{ fontSize: 14, color: "#2C2016" }}
                              >
                                {p.name} Edit
                              </strong>
                            </div>
                            <ChevronRight
                              size={16}
                              style={{
                                color: "rgba(44,32,22,0.4)",
                                transform: isExpanded
                                  ? "rotate(90deg)"
                                  : "none",
                                transition: "transform 0.2s",
                              }}
                            />
                          </div>
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                style={{ overflow: "hidden" }}
                              >
                                <div
                                  style={{
                                    borderTop: "1px solid rgba(44,32,22,0.04)",
                                  }}
                                >
                                  {renderEditorBlock(pId, p)}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    marginTop: createPostPlatforms.length > 1 ? 0 : 30,
                  }}
                >
                  {createPostPlatforms.length > 1 && (
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        marginBottom: 12,
                        overflowX: "auto",
                        paddingBottom: 4,
                      }}
                    >
                      {createPostPlatforms.map((pId: string) => {
                        const p = PLATFORMS.find((x: any) => x.id === pId);
                        if (!p) return null;
                        const isActive =
                          activePreviewPlatform &&
                          createPostPlatforms.includes(activePreviewPlatform)
                            ? activePreviewPlatform === pId
                            : createPostPlatforms[0] === pId;
                        return (
                          <div
                            key={`preview-tab-${pId}`}
                            onClick={() => setActivePreviewPlatform(pId)}
                            style={{
                              padding: "6px 12px",
                              borderRadius: 16,
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: "pointer",
                              background: isActive
                                ? p.color
                                : "rgba(44,32,22,0.04)",
                              color: isActive ? "white" : "rgba(44,32,22,0.6)",
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                            className={isActive ? "" : "hover-bg"}
                          >
                            {typeof p.icon === "string" ? (
                              <span>{p.icon}</span>
                            ) : (
                              React.cloneElement(
                                p.icon as React.ReactElement<any>,
                                {
                                  size: 12,
                                },
                              )
                            )}
                            {p.name}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {(() => {
                    const pId =
                      createPostPlatforms.length > 0
                        ? activePreviewPlatform &&
                          createPostPlatforms.includes(activePreviewPlatform)
                          ? activePreviewPlatform
                          : createPostPlatforms[0]
                        : null;
                    const caption = pId
                      ? (platformOverrides[pId]?.caption ?? createPostCaption)
                      : createPostCaption;
                    const mediaList = pId
                      ? platformOverrides[pId]?.media !== undefined
                        ? platformOverrides[pId]?.media
                        : createPostMedia
                      : createPostMedia;

                    return (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          padding: "10px 0",
                        }}
                      >
                        <PlatformPreview
                          platform={pId || "instagram"}
                          contentType={
                            createPostPlatformTypes[pId || ""] || "feed"
                          }
                          caption={caption}
                          mediaList={mediaList || []}
                          workspaceName={workspace?.name || "Workspace"}
                        />
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "20px 28px",
              borderTop: "1px solid rgba(44,32,22,0.05)",
              background: "white",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  display: "flex",
                  background: "rgba(44,32,22,0.03)",
                  borderRadius: 10,
                  padding: 4,
                }}
              >
                <button
                  onClick={() => setCreatePostMode("now")}
                  style={{
                    background:
                      createPostMode === "now" ? "white" : "transparent",
                    borderWidth: 0,
                    borderStyle: "none",
                    borderRadius: 8,
                    padding: "8px 16px",
                    fontSize: 13,
                    fontWeight: 700,
                    color:
                      createPostMode === "now"
                        ? "#2C2016"
                        : "rgba(44,32,22,0.4)",
                    cursor: "pointer",
                    boxShadow:
                      createPostMode === "now"
                        ? "0 2px 8px rgba(0,0,0,0.04)"
                        : "none",
                    transition: "all 0.2s",
                  }}
                >
                  Post Sekarang
                </button>
                <button
                  onClick={() => setCreatePostMode("schedule")}
                  style={{
                    background:
                      createPostMode === "schedule" ? "white" : "transparent",
                    borderWidth: 0,
                    borderStyle: "none",
                    borderRadius: 8,
                    padding: "8px 16px",
                    fontSize: 13,
                    fontWeight: 700,
                    color:
                      createPostMode === "schedule"
                        ? "#2C2016"
                        : "rgba(44,32,22,0.4)",
                    cursor: "pointer",
                    boxShadow:
                      createPostMode === "schedule"
                        ? "0 2px 8px rgba(0,0,0,0.04)"
                        : "none",
                    transition: "all 0.2s",
                  }}
                >
                  Jadwal Post
                </button>
              </div>

              {createPostMode === "schedule" && (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    type="date"
                    value={createPostDate}
                    onChange={(e) => setCreatePostDate(e.target.value)}
                    style={{
                      borderRadius: 10,
                      borderWidth: 0,
                      borderStyle: "none",
                      background: "rgba(44,32,22,0.03)",
                      padding: "8px 12px",
                      fontSize: 13,
                      outline: "none",
                      fontFamily: "inherit",
                      color: "#2C2016",
                      transition: "all 0.2s",
                    }}
                    onFocus={(e: any) =>
                      (e.target.style.background = "rgba(44,32,22,0.06)")
                    }
                    onBlur={(e: any) =>
                      (e.target.style.background = "rgba(44,32,22,0.03)")
                    }
                  />
                  <input
                    type="time"
                    value={createPostTime}
                    onChange={(e) => setCreatePostTime(e.target.value)}
                    style={{
                      borderRadius: 10,
                      borderWidth: 0,
                      borderStyle: "none",
                      background: "rgba(44,32,22,0.03)",
                      padding: "8px 12px",
                      fontSize: 13,
                      outline: "none",
                      fontFamily: "inherit",
                      color: "#2C2016",
                      transition: "all 0.2s",
                    }}
                    onFocus={(e: any) =>
                      (e.target.style.background = "rgba(44,32,22,0.06)")
                    }
                    onBlur={(e: any) =>
                      (e.target.style.background = "rgba(44,32,22,0.03)")
                    }
                  />
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => {
                  setShowCreatePostPopup(false);
                  if (tab === "social-studio" && setTab) {
                    setTab("social-dashboard");
                  }
                }}
                style={{
                  background: "transparent",
                  borderWidth: 0,
                  borderStyle: "none",
                  borderRadius: 10,
                  padding: "10px 20px",
                  fontWeight: 700,
                  cursor: "pointer",
                  color: "rgba(44,32,22,0.4)",
                  fontSize: 13,
                }}
                className="hover-bg"
              >
                Batal
              </button>
              <button
                onClick={handleCreatePost}
                style={{
                  background: "var(--theme-primary)",
                  borderWidth: 0,
                  borderStyle: "none",
                  borderRadius: 10,
                  padding: "10px 24px",
                  fontWeight: 700,
                  cursor: "pointer",
                  color: "white",
                  fontSize: 13,
                }}
                className="hover-scale hover-bg"
              >
                {createPostMode === "now" ? "Post Sekarang" : "Jadwal Post"}
              </button>
            </div>
          </div>
        </motion.div>
      )}
