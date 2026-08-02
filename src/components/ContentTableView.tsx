import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Instagram,
  Facebook,
  User,
  Layout,
  Video,
  Image as ImageIcon,
  MoreHorizontal,
  ArrowDown,
  Info,
  ArrowUpDown,
  Check,
  TrendingUp,
  ExternalLink,
} from "lucide-react";

interface ContentTableViewProps {
  ctx: {
    DISPLAY_CONTENT: any[];
    isMobileHubAi?: boolean;
    onOpenModal?: (post: any) => void;
    setSelectedContent?: (post: any) => void;
    lang?: string;
  };
}

export function ContentTableView({ ctx }: ContentTableViewProps) {
  const {
    DISPLAY_CONTENT = [],
    isMobileHubAi = false,
    onOpenModal,
    setSelectedContent,
    lang = "en",
  } = ctx;

  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const [hoveredRowIndex, setHoveredRowIndex] = useState<number | null>(null);

  const toggleSelectAll = () => {
    const allSelected = DISPLAY_CONTENT.every((post, idx) => selectedIds[post.id || idx]);
    const nextSelected: Record<string, boolean> = {};
    if (!allSelected) {
      DISPLAY_CONTENT.forEach((post, idx) => {
        nextSelected[post.id || idx] = true;
      });
    }
    setSelectedIds(nextSelected);
  };

  const toggleSelectOne = (id: string | number) => {
    setSelectedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const allSelected =
    DISPLAY_CONTENT.length > 0 &&
    DISPLAY_CONTENT.every((post, idx) => selectedIds[post.id || idx]);

  const handleRowClick = (post: any) => {
    if (onOpenModal) {
      onOpenModal(post);
    } else if (setSelectedContent) {
      setSelectedContent(post);
    }
  };

  return (
    <div
      style={{
        background: "white",
        borderRadius: 16,
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "rgba(44,32,22,0.06)",
        overflowX: "auto",
        boxShadow: "0 4px 20px rgba(0,0,0,0.015)",
      }}
    >
      <table
        style={{
          width: "100%",
          minWidth: 800,
          borderCollapse: "collapse",
          fontSize: 13,
        }}
      >
        <thead
          style={{
            background: "#FAFAFA",
            borderBottom: "1px solid rgba(44,32,22,0.06)",
            color: "#111827",
          }}
        >
          <tr>
            <th
              style={{
                padding: "16px",
                width: 48,
                textAlign: "center",
              }}
            >
              <div
                onClick={toggleSelectAll}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 4,
                  border: "1.5px solid #d1d5db",
                  backgroundColor: allSelected ? "var(--theme-primary)" : "transparent",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {allSelected && <Check size={12} color="white" strokeWidth={3} />}
              </div>
            </th>
            <th
              style={{
                padding: "16px 12px",
                textAlign: "left",
                fontWeight: 700,
                minWidth: 320,
              }}
            >
              {lang === "id" ? "Judul & Caption" : "Title & Caption"}
            </th>
            <th
              style={{
                padding: "16px 12px",
                textAlign: "left",
                fontWeight: 700,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  cursor: "default",
                }}
              >
                {lang === "id" ? "Tanggal Publikasi" : "Date published"}{" "}
                <ArrowDown size={14} color="var(--theme-primary)" />
              </div>
            </th>
            <th
              style={{
                padding: "16px 12px",
                textAlign: "left",
                fontWeight: 700,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {lang === "id" ? "Tayangan" : "Views"} <Info size={14} color="#9ca3af" />{" "}
                <ArrowUpDown size={12} color="#9ca3af" />
              </div>
            </th>
            <th
              style={{
                padding: "16px 12px",
                textAlign: "left",
                fontWeight: 700,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {lang === "id" ? "Jangkauan" : "Reach"} <Info size={14} color="#9ca3af" />{" "}
                <ArrowUpDown size={12} color="#9ca3af" />
              </div>
            </th>
            <th
              style={{
                padding: "16px 12px",
                textAlign: "left",
                fontWeight: 700,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {lang === "id" ? "Suka & Reaksi" : "Likes & Reactions"} <Info size={14} color="#9ca3af" />{" "}
                <ArrowUpDown size={12} color="#9ca3af" />
              </div>
            </th>
            <th
              style={{
                padding: "16px 12px",
                textAlign: "left",
                fontWeight: 700,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {lang === "id" ? "Komentar" : "Comments"} <Info size={14} color="#9ca3af" />{" "}
                <ArrowUpDown size={12} color="#9ca3af" />
              </div>
            </th>
            <th
              style={{
                padding: "16px 12px",
                textAlign: "left",
                fontWeight: 700,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {lang === "id" ? "Bagikan" : "Shares"} <Info size={14} color="#9ca3af" />{" "}
                <ArrowUpDown size={12} color="#9ca3af" />
              </div>
            </th>
            <th
              style={{
                padding: "16px 12px",
                textAlign: "left",
                fontWeight: 700,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {lang === "id" ? "Simpan" : "Saves"} <Info size={14} color="#9ca3af" />{" "}
                <ArrowUpDown size={12} color="#9ca3af" />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {DISPLAY_CONTENT.length === 0 ? (
            <tr>
              <td
                colSpan={9}
                style={{
                  padding: "40px 16px",
                  textAlign: "center",
                  color: "rgba(0,0,0,0.4)",
                  fontWeight: 500,
                }}
              >
                {lang === "id" ? "Tidak ada konten ditemukan" : "No content found"}
              </td>
            </tr>
          ) : (
            DISPLAY_CONTENT.map((post, i) => {
              const uniqueKey = post.id || i;
              const isSelected = !!selectedIds[uniqueKey];
              const isHovered = hoveredRowIndex === i;

              return (
                <tr
                  key={uniqueKey}
                  onMouseEnter={() => setHoveredRowIndex(i)}
                  onMouseLeave={() => setHoveredRowIndex(null)}
                  style={{
                    borderBottom: "1px solid rgba(44,32,22,0.05)",
                    backgroundColor: isSelected
                      ? "rgba(37, 99, 235, 0.03)"
                      : isHovered
                      ? "rgba(0, 0, 0, 0.01)"
                      : "white",
                    transition: "background-color 0.15s ease",
                    verticalAlign: "top",
                  }}
                >
                  <td
                    style={{
                      padding: "16px",
                      textAlign: "center",
                      verticalAlign: "middle",
                    }}
                  >
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelectOne(uniqueKey);
                      }}
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 4,
                        border: isSelected ? "1.5px solid var(--theme-primary)" : "1.5px solid #d1d5db",
                        backgroundColor: isSelected ? "var(--theme-primary)" : "transparent",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {isSelected && <Check size={12} color="white" strokeWidth={3} />}
                    </div>
                  </td>
                  <td
                    onClick={() => handleRowClick(post)}
                    style={{
                      padding: "16px 12px",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: 12,
                          alignItems: "center",
                          minWidth: 0,
                          flex: 1,
                        }}
                      >
                        <div
                          style={{
                            position: "relative",
                            width: 48,
                            height: 48,
                            flexShrink: 0,
                            borderRadius: 8,
                            overflow: "hidden",
                            background: "#f0f0f0",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                          }}
                        >
                          <img
                            src={post.thumbnail}
                            alt=""
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              bottom: -4,
                              right: -4,
                              background: "white",
                              borderRadius: "50%",
                              padding: 2,
                              boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                            }}
                          >
                            {post.type === "instagram" ? (
                              <div
                                style={{
                                  width: 16,
                                  height: 16,
                                  borderRadius: "50%",
                                  background:
                                    "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <Instagram size={10} color="white" />
                              </div>
                            ) : post.type === "meta" || post.type === "facebook" ? (
                              <div
                                style={{
                                  width: 16,
                                  height: 16,
                                  borderRadius: "50%",
                                  background: "#1877F2",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <Facebook size={10} color="white" />
                              </div>
                            ) : (
                              <div
                                style={{
                                  width: 16,
                                  height: 16,
                                  borderRadius: "50%",
                                  background: "black",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: 8,
                                    color: "white",
                                    fontWeight: 800,
                                  }}
                                >
                                  TT
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            minWidth: 0,
                            gap: 4,
                          }}
                        >
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: "#111827",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: 240,
                            }}
                          >
                            {post.captionSnippet || post.title || (lang === "id" ? "Konten Tanpa Caption" : "No caption content")}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              fontSize: 12,
                              color: "rgba(0,0,0,0.5)",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                                fontWeight: 500,
                              }}
                            >
                              {post.postTypeLabel === "Carousel" ? (
                                <Layout size={12} />
                              ) : post.postTypeLabel === "Reel" ? (
                                <Video size={12} />
                              ) : (
                                <ImageIcon size={12} />
                              )}
                              {post.postTypeLabel || "Post"}
                            </div>
                            <div
                              style={{
                                width: 3,
                                height: 3,
                                borderRadius: "50%",
                                background: "currentColor",
                              }}
                            />
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                                fontWeight: 500,
                              }}
                            >
                              <div
                                style={{
                                  width: 16,
                                  height: 16,
                                  borderRadius: "50%",
                                  background: "#e5e7eb",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  overflow: "hidden",
                                }}
                              >
                                <User size={10} color="#4b5563" />
                              </div>
                              {post.accountName || "Account"}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                          paddingRight: 16,
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          style={{
                            background: "white",
                            borderWidth: "1px",
                            borderStyle: "solid",
                            borderColor: "rgba(0,0,0,0.1)",
                            borderRadius: 6,
                            padding: "4px 12px",
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#111827",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <TrendingUp size={12} color="var(--theme-primary)" />
                          Boost
                        </button>
                        <button
                          onClick={() => handleRowClick(post)}
                          style={{
                            background: "white",
                            borderWidth: "1px",
                            borderStyle: "solid",
                            borderColor: "rgba(0,0,0,0.1)",
                            borderRadius: 6,
                            padding: "4px 8px",
                            color: "#111827",
                            cursor: "pointer",
                          }}
                        >
                          <ExternalLink size={12} />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td
                    onClick={() => handleRowClick(post)}
                    style={{
                      padding: "16px 12px",
                      verticalAlign: "middle",
                      fontSize: 13,
                      color: "#111827",
                      whiteSpace: "nowrap",
                      cursor: "pointer",
                    }}
                  >
                    {post.time}
                  </td>
                  <td
                    onClick={() => handleRowClick(post)}
                    style={{
                      padding: "16px 12px",
                      verticalAlign: "middle",
                      fontSize: 13,
                      color: "#111827",
                      cursor: "pointer",
                    }}
                  >
                    {post.views > 1000
                      ? (post.views / 1000).toFixed(1) + "K"
                      : post.views}
                  </td>
                  <td
                    onClick={() => handleRowClick(post)}
                    style={{
                      padding: "16px 12px",
                      verticalAlign: "middle",
                      fontSize: 13,
                      color: "#111827",
                      cursor: "pointer",
                    }}
                  >
                    {post.reach
                      ? post.reach > 1000
                        ? (post.reach / 1000).toFixed(1) + "K"
                        : post.reach
                      : "--"}
                  </td>
                  <td
                    onClick={() => handleRowClick(post)}
                    style={{
                      padding: "16px 12px",
                      verticalAlign: "middle",
                      fontSize: 13,
                      color: "#111827",
                      cursor: "pointer",
                    }}
                  >
                    {post.likes}
                  </td>
                  <td
                    onClick={() => handleRowClick(post)}
                    style={{
                      padding: "16px 12px",
                      verticalAlign: "middle",
                      fontSize: 13,
                      color: "#111827",
                      cursor: "pointer",
                    }}
                  >
                    {post.comments}
                  </td>
                  <td
                    onClick={() => handleRowClick(post)}
                    style={{
                      padding: "16px 12px",
                      verticalAlign: "middle",
                      fontSize: 13,
                      color: "#111827",
                      cursor: "pointer",
                    }}
                  >
                    {post.shares}
                  </td>
                  <td
                    onClick={() => handleRowClick(post)}
                    style={{
                      padding: "16px 12px",
                      verticalAlign: "middle",
                      fontSize: 13,
                      color: "#111827",
                      cursor: "pointer",
                    }}
                  >
                    {post.saves}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
