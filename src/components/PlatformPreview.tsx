import React from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Share2, Repeat2, ChevronLeft, ChevronRight } from 'lucide-react';

const cleanHtmlToPlainText = (html: string): string => {
  if (!html) return "";
  let text = html;
  
  // Replace HTML breaks/paragraphs with standard newlines
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<\/p>/gi, "\n");
  text = text.replace(/<\/h[1-6]>/gi, "\n");
  text = text.replace(/<\/li>/gi, "\n");
  
  // Strip all other HTML tags
  text = text.replace(/<[^>]+>/g, "");
  
  // Decode common HTML entity decoders
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");

  return text.trim();
};

interface PlatformPreviewProps {
  platform: string;
  contentType: string;
  caption: string;
  mediaList: { url: string, type: "image" | "video" }[];
  workspaceName: string;
}

const MediaCarousel: React.FC<{
  mediaList: { url: string, type: "image" | "video" }[];
  style: React.CSSProperties;
  hideCarouselDots?: boolean;
  showArrows?: boolean;
}> = ({ mediaList, style, hideCarouselDots, showArrows }) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  if (!mediaList || mediaList.length === 0) {
    return (
      <div style={{ ...style, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "#9ca3af", fontSize: 14 }}>No media</span>
      </div>
    );
  }

  if (mediaList.length === 1) {
    const item = mediaList[0];
    if (item.type === "video") {
        return <video src={item.url} autoPlay loop muted style={{ ...style, objectFit: "cover" }} />;
    }
    return <img src={item.url} alt="Preview" style={{ ...style, objectFit: "cover" }} />;
  }

  const containerStyle = { ...style };
  if (!containerStyle.height && !containerStyle.aspectRatio) {
      containerStyle.aspectRatio = "1";
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setCurrentIndex(index);
  };

  const scrollTo = (index: number) => {
    if (scrollRef.current) {
        scrollRef.current.scrollTo({
            left: index * scrollRef.current.clientWidth,
            behavior: "smooth"
        });
    }
  };

  const nextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    scrollTo(Math.min(currentIndex + 1, mediaList.length - 1));
  };

  const prevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    scrollTo(Math.max(currentIndex - 1, 0));
  };

  return (
      <div style={{ position: "relative", ...containerStyle }}>
          <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: style.borderRadius }}>
              <div 
                  ref={scrollRef}
                  onScroll={handleScroll}
                  className="hide-scrollbar"
                  style={{ 
                      display: "flex", 
                      width: "100%", 
                      height: "100%", 
                      overflowX: "auto",
                      scrollSnapType: "x mandatory",
                      scrollbarWidth: "none",
                      msOverflowStyle: "none"
                  }}
              >
                  <style>{`
                      .hide-scrollbar::-webkit-scrollbar {
                          display: none;
                      }
                  `}</style>
                  {mediaList.map((item, idx) => (
                      <div key={idx} style={{ flex: "0 0 100%", height: "100%", scrollSnapAlign: "start" }}>
                          {item.type === "video" ? (
                              <video src={item.url} autoPlay loop muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                              <img src={item.url} alt={`Preview ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          )}
                      </div>
                  ))}
              </div>
          </div>

          {/* Navigation Arrows */}
          {showArrows && currentIndex > 0 && (
              <div 
                  onClick={prevSlide}
                  style={{ position: "absolute", top: "50%", left: 8, transform: "translateY(-50%)", width: 26, height: 26, borderRadius: 13, background: "rgba(255, 255, 255, 0.9)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 10, boxShadow: "0 2px 5px rgba(0,0,0,0.15)" }}
              >
                  <ChevronLeft size={16} color="#000" strokeWidth={2.5} style={{ marginLeft: -1 }} />
              </div>
          )}
          {showArrows && currentIndex < mediaList.length - 1 && (
              <div 
                  onClick={nextSlide}
                  style={{ position: "absolute", top: "50%", right: 8, transform: "translateY(-50%)", width: 26, height: 26, borderRadius: 13, background: "rgba(255, 255, 255, 0.9)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 10, boxShadow: "0 2px 5px rgba(0,0,0,0.15)" }}
              >
                  <ChevronRight size={16} color="#000" strokeWidth={2.5} style={{ marginRight: -1 }} />
              </div>
          )}

          {!hideCarouselDots && (
              <div style={{ position: "absolute", bottom: -20, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 4, pointerEvents: "none" }}>
                  {mediaList.map((_, idx) => (
                      <div key={idx} style={{ width: idx === currentIndex ? 6 : 4, height: idx === currentIndex ? 6 : 4, borderRadius: 3, background: idx === currentIndex ? "#0095f6" : "#c7c7c7", transition: "all 0.3s" }} />
                  ))}
              </div>
          )}
      </div>
  );
};

export const PlatformPreview: React.FC<PlatformPreviewProps> = ({
  platform,
  contentType,
  caption,
  mediaList,
  workspaceName
}) => {
  const avatar = workspaceName?.charAt(0)?.toUpperCase() || 'U';
  const name = workspaceName || 'Workspace';
  const plainTextCaption = cleanHtmlToPlainText(caption);

  // Fallback to first item for single media renders
  const mediaUrl = mediaList && mediaList.length > 0 ? mediaList[0].url : null;
  const mediaType = mediaList && mediaList.length > 0 ? mediaList[0].type : null;

  // Common Phone Container
  const PhoneFrame: React.FC<{children: React.ReactNode}> = ({children}) => (
    <div style={{
      width: "100%",
      maxWidth: 340,
      aspectRatio: "375/812",
      background: "white",
      borderRadius: 40,
      border: "12px solid #000",
      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
      overflow: "hidden",
      position: "relative",
      display: "flex",
      flexDirection: "column",
      margin: "0 auto"
    }}>
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", scrollbarWidth: "none", msOverflowStyle: "none" } as any}>
        <style>{`
            div::-webkit-scrollbar {
                display: none;
            }
        `}</style>
        {children}
      </div>
    </div>
  );

  const renderMedia = (style: React.CSSProperties, hideCarouselDots?: boolean, showArrows?: boolean) => {
    return <MediaCarousel mediaList={mediaList} style={style} hideCarouselDots={hideCarouselDots} showArrows={showArrows} />;
  };

  const renderGridMedia = (style: React.CSSProperties) => {
    if (!mediaList || mediaList.length === 0) {
      return (
        <div style={{ ...style, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "#9ca3af", fontSize: 14 }}>No media</span>
        </div>
      );
    }
    
    if (mediaList.length === 1) {
      return renderMedia(style, true, false);
    }

    const count = mediaList.length;
    return (
        <div style={{ display: "grid", gap: 2, gridTemplateColumns: count === 2 ? "1fr 1fr" : "1fr 1fr", ...style }}>
            {mediaList.slice(0, 4).map((item, idx) => {
                const isLast = idx === 3;
                const hasMore = count > 4;
                const gridColumn = (count === 3 && idx === 0) ? "1 / span 2" : "auto";
                const itemHeight = (count === 2 || (count === 3 && idx === 0)) ? 250 : 150;
                
                return (
                    <div key={idx} style={{ position: "relative", width: "100%", height: itemHeight, gridColumn }}>
                        {item.type === "video" ? (
                            <video src={item.url} autoPlay loop muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                            <img src={item.url} alt={`Preview ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        )}
                        {isLast && hasMore && (
                            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 24, fontWeight: 600 }}>
                                +{count - 4}
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    );
  };

  const renderInstagramFeed = () => (
    <div style={{ background: "white", flex: 1, display: "flex", flexDirection: "column", paddingTop: 32 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", padding: "10px 12px", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 16, background: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)", padding: 2 }}>
            <div style={{ width: "100%", height: "100%", borderRadius: 14, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid white", color: "#333", fontSize: 12, fontWeight: "bold" }}>
                {avatar}
            </div>
        </div>
        <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#262626" }}>{name}</div>
        <MoreHorizontal size={16} color="#262626" />
      </div>
      {/* Image */}
      {renderMedia({ width: "100%", aspectRatio: "4/5", marginBottom: 16 }, false, true)}
      {/* Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 14px 8px" }}>
        <div style={{ display: "flex", gap: 16 }}>
          <Heart size={24} color="#262626" />
          <MessageCircle size={24} color="#262626" style={{ transform: "scaleX(-1)" }} />
          <Send size={24} color="#262626" />
        </div>
        <Bookmark size={24} color="#262626" />
      </div>
      {/* Likes */}
      <div style={{ padding: "0 14px", fontSize: 13, fontWeight: 600, color: "#262626", marginBottom: 6 }}>
        1,234 likes
      </div>
      {/* Caption */}
      <div style={{ padding: "0 14px", fontSize: 13, color: "#262626", lineHeight: 1.4 }}>
        <span style={{ fontWeight: 600, marginRight: 6 }}>{name}</span>
        {plainTextCaption || <span style={{ color: "#8e8e8e" }}>Write a caption...</span>}
      </div>
    </div>
  );

  const renderInstagramReel = () => (
    <div style={{ background: "#000", flex: 1, position: "relative" }}>
      {renderMedia({ width: "100%", height: "100%" }, true)}
      {/* Overlay */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 16, background: "linear-gradient(transparent, rgba(0,0,0,0.6))", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div style={{ flex: 1, paddingRight: 40 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 16, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#333", fontSize: 12, fontWeight: "bold" }}>{avatar}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "white" }}>{name}</div>
                <div style={{ padding: "2px 8px", border: "1px solid white", borderRadius: 12, fontSize: 12, fontWeight: 600, color: "white" }}>Follow</div>
            </div>
            <div style={{ fontSize: 13, color: "white", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {plainTextCaption || "Write a caption..."}
            </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <Heart size={28} color="white" />
                <span style={{ color: "white", fontSize: 12 }}>1.2K</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <MessageCircle size={28} color="white" style={{ transform: "scaleX(-1)" }} />
                <span style={{ color: "white", fontSize: 12 }}>45</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <Send size={28} color="white" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <MoreHorizontal size={28} color="white" />
            </div>
        </div>
      </div>
    </div>
  );

  const renderInstagramStory = () => (
    <div style={{ background: "#000", flex: 1, position: "relative" }}>
      {renderMedia({ width: "100%", height: "100%" }, true)}
      {/* Top Progress Bar */}
      <div style={{ position: "absolute", top: 12, left: 12, right: 12, display: "flex", gap: 4 }}>
          {mediaList && mediaList.length > 0 ? mediaList.map((_, idx) => (
              <div key={idx} style={{ flex: 1, height: 2, background: "rgba(255,255,255,0.4)", borderRadius: 2 }}>
                  {idx === 0 && <div style={{ width: mediaList.length > 1 ? "100%" : "30%", height: "100%", background: "white", borderRadius: 2 }} />}
              </div>
          )) : (
              <div style={{ flex: 1, height: 2, background: "rgba(255,255,255,0.4)", borderRadius: 2 }}>
                  <div style={{ width: "30%", height: "100%", background: "white", borderRadius: 2 }} />
              </div>
          )}
      </div>
      {/* Header */}
      <div style={{ position: "absolute", top: 24, left: 12, right: 12, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 16, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#333", fontSize: 12, fontWeight: "bold" }}>{avatar}</div>
        <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "white", textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>{name} <span style={{opacity:0.8, fontWeight: 400}}>2h</span></div>
        <MoreHorizontal size={20} color="white" />
      </div>
      {/* Text Overlay */}
      {plainTextCaption && (
          <div style={{ position: "absolute", top: "50%", left: 20, right: 20, transform: "translateY(-50%)", textAlign: "center", color: "white", fontSize: 24, fontWeight: 700, textShadow: "0 2px 10px rgba(0,0,0,0.5)", wordWrap: "break-word" }}>
              {plainTextCaption}
          </div>
      )}
      {/* Bottom Bar */}
      <div style={{ position: "absolute", bottom: 16, left: 16, right: 16, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, height: 44, borderRadius: 22, border: "1px solid rgba(255,255,255,0.6)", display: "flex", alignItems: "center", padding: "0 16px", color: "white", fontSize: 14 }}>
              Send message
          </div>
          <Heart size={28} color="white" />
          <Send size={28} color="white" />
      </div>
    </div>
  );

  const renderFacebookStory = () => (
    <div style={{ background: "#000", flex: 1, position: "relative" }}>
      {renderMedia({ width: "100%", height: "100%" }, true)}
      {/* Top Progress Bar */}
      <div style={{ position: "absolute", top: 12, left: 12, right: 12, display: "flex", gap: 4 }}>
          {mediaList && mediaList.length > 0 ? mediaList.map((_, idx) => (
              <div key={idx} style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.4)", borderRadius: 2 }}>
                  {idx === 0 && <div style={{ width: mediaList.length > 1 ? "100%" : "30%", height: "100%", background: "white", borderRadius: 2 }} />}
              </div>
          )) : (
              <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.4)", borderRadius: 2 }}>
                  <div style={{ width: "30%", height: "100%", background: "white", borderRadius: 2 }} />
              </div>
          )}
      </div>
      {/* Header */}
      <div style={{ position: "absolute", top: 24, left: 12, right: 12, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 40, height: 40, borderRadius: 20, background: "var(--theme-primary)", border: "2px solid #1877F2", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 14, fontWeight: "bold" }}>{avatar}</div>
        <div style={{ flex: 1, fontSize: 15, fontWeight: 600, color: "white", textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}>{name}</div>
        <div style={{ width: 32, height: 32, borderRadius: 16, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <MoreHorizontal size={20} color="white" />
        </div>
      </div>
      {/* Text Overlay */}
      {plainTextCaption && (
          <div style={{ position: "absolute", top: "40%", left: 24, right: 24, textAlign: "center", color: "white", fontSize: 22, fontWeight: 700, textShadow: "0 2px 8px rgba(0,0,0,0.6)", wordWrap: "break-word" }}>
              {plainTextCaption}
          </div>
      )}
      {/* Bottom Bar */}
      <div style={{ position: "absolute", bottom: 16, left: 16, right: 16, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, height: 44, borderRadius: 22, background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", padding: "0 16px", color: "white", fontSize: 14, backdropFilter: "blur(4px)" }}>
              Reply...
          </div>
          <div style={{ display: "flex", gap: 8 }}>
              <div style={{ width: 44, height: 44, borderRadius: 22, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}><Heart size={24} color="white" /></div>
              <div style={{ width: 44, height: 44, borderRadius: 22, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}><Share2 size={24} color="white" /></div>
          </div>
      </div>
    </div>
  );

  const renderFacebookReel = () => (
    <div style={{ background: "#000", flex: 1, position: "relative" }}>
      {renderMedia({ width: "100%", height: "100%" }, true)}
      {/* Overlay */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 16, background: "linear-gradient(transparent, rgba(0,0,0,0.7))", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div style={{ flex: 1, paddingRight: 40 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: 18, background: "var(--theme-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 14, fontWeight: "bold" }}>{avatar}</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "white", textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>{name}</div>
                <div style={{ padding: "4px 12px", background: "rgba(255,255,255,0.2)", borderRadius: 14, fontSize: 13, fontWeight: 600, color: "white", backdropFilter: "blur(4px)" }}>Follow</div>
            </div>
            <div style={{ fontSize: 14, color: "white", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>
                {plainTextCaption || "Write a caption..."}
            </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24, alignItems: "center", paddingBottom: 8 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ width: 44, height: 44, borderRadius: 22, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
                    <span style={{fontSize: 22}}>👍</span>
                </div>
                <span style={{ color: "white", fontSize: 13, fontWeight: 600 }}>1.2K</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ width: 44, height: 44, borderRadius: 22, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
                    <MessageCircle size={24} color="white" />
                </div>
                <span style={{ color: "white", fontSize: 13, fontWeight: 600 }}>45</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ width: 44, height: 44, borderRadius: 22, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
                    <Share2 size={24} color="white" />
                </div>
                <span style={{ color: "white", fontSize: 13, fontWeight: 600 }}>Share</span>
            </div>
        </div>
      </div>
    </div>
  );

  const renderTikTok = () => (
    <div style={{ background: "#000", flex: 1, position: "relative" }}>
      {renderMedia({ width: "100%", height: "100%" }, true)}
      <div style={{ position: "absolute", top: 40, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 16 }}>
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 15, fontWeight: 600 }}>Following</span>
          <span style={{ color: "white", fontSize: 15, fontWeight: 700, borderBottom: "2px solid white", paddingBottom: 4 }}>For You</span>
      </div>
      {/* Overlay */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px 12px", background: "linear-gradient(transparent, rgba(0,0,0,0.6))", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div style={{ flex: 1, paddingRight: 16, paddingBottom: 16 }}>
            {contentType === "photo_carousel" && mediaList && mediaList.length > 1 && (
                <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
                    {mediaList.map((_, idx) => (
                        <div key={idx} style={{ width: 8, height: 8, borderRadius: 4, background: idx === 0 ? "white" : "rgba(255,255,255,0.4)" }} />
                    ))}
                </div>
            )}
            <div style={{ fontSize: 15, fontWeight: 600, color: "white", marginBottom: 8 }}>@{name.toLowerCase().replace(/\s+/g, '')}</div>
            <div style={{ fontSize: 14, color: "white", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {plainTextCaption || "Your caption here..."}
            </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center", paddingBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 20, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#333", fontSize: 16, fontWeight: "bold", border: "1px solid white", position: "relative" }}>
                {avatar}
                <div style={{ position: "absolute", bottom: -6, background: "#FE2C55", borderRadius: 10, width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 12 }}>+</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <Heart size={32} color="white" fill="white" />
                <span style={{ color: "white", fontSize: 12, fontWeight: 600 }}>124K</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <MessageCircle size={32} color="white" fill="white" style={{ transform: "scaleX(-1)" }} />
                <span style={{ color: "white", fontSize: 12, fontWeight: 600 }}>432</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <Bookmark size={32} color="white" fill="white" />
                <span style={{ color: "white", fontSize: 12, fontWeight: 600 }}>12K</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <Share2 size={32} color="white" fill="white" />
                <span style={{ color: "white", fontSize: 12, fontWeight: 600 }}>Share</span>
            </div>
        </div>
      </div>
    </div>
  );

  const renderFacebookFeed = () => (
    <div style={{ background: "#f0f2f5", flex: 1, display: "flex", flexDirection: "column", paddingTop: 32 }}>
      <div style={{ background: "white", paddingBottom: 12 }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 18, background: "var(--theme-primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800 }}>
                {avatar}
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#050505" }}>{name}</div>
                <div style={{ fontSize: 12, color: "#65676B", display: "flex", alignItems: "center", gap: 4 }}>
                    Just now · 🌍
                </div>
            </div>
            <MoreHorizontal size={18} color="#65676B" />
          </div>
          {/* Caption */}
          <div style={{ padding: "0 16px 12px", fontSize: 14, color: "#050505", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
            {plainTextCaption || <span style={{ color: "#65676B" }}>What's on your mind?</span>}
          </div>
          {/* Image */}
          {renderGridMedia({ width: "100%", maxHeight: 400 })}
          {/* Stats */}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 16px", borderBottom: "1px solid #CED0D4", color: "#65676B", fontSize: 13 }}>
              <span>👍 12</span>
              <span>2 Comments</span>
          </div>
          {/* Actions */}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 16px 0" }}>
            <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", gap: 6, padding: "8px 0", color: "#65676B", fontWeight: 600, fontSize: 14 }}>
              <span style={{fontSize: 18}}>👍</span> Like
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", gap: 6, padding: "8px 0", color: "#65676B", fontWeight: 600, fontSize: 14 }}>
              <MessageCircle size={18} /> Comment
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", gap: 6, padding: "8px 0", color: "#65676B", fontWeight: 600, fontSize: 14 }}>
              <Share2 size={18} /> Share
            </div>
          </div>
      </div>
    </div>
  );

  const renderLinkedIn = () => (
    <div style={{ background: "#f3f2ef", flex: 1, display: "flex", flexDirection: "column", paddingTop: 32 }}>
      <div style={{ background: "white", paddingBottom: 8 }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "flex-start", padding: "12px 16px", gap: 8 }}>
            <div style={{ width: 48, height: 48, background: "var(--theme-primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800 }}>
                {avatar}
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(0,0,0,0.9)" }}>{name}</div>
                <div style={{ fontSize: 12, color: "rgba(0,0,0,0.6)" }}>Company · 1,234 followers</div>
                <div style={{ fontSize: 12, color: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", gap: 4 }}>
                    Just now · 🌍
                </div>
            </div>
            <MoreHorizontal size={20} color="rgba(0,0,0,0.6)" />
          </div>
          {/* Caption */}
          <div style={{ padding: "4px 16px 12px", fontSize: 14, color: "rgba(0,0,0,0.9)", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
            {plainTextCaption || <span style={{ color: "rgba(0,0,0,0.6)" }}>What do you want to talk about?</span>}
          </div>
          {/* Image */}
          {renderGridMedia({ width: "100%", maxHeight: 400 })}
          {/* Actions */}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 16px 0", borderTop: "1px solid rgba(0,0,0,0.08)", marginTop: 8 }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 4, padding: "12px 0", color: "rgba(0,0,0,0.6)", fontWeight: 600, fontSize: 12 }}>
              <span style={{fontSize: 20}}>👍</span> Like
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 4, padding: "12px 0", color: "rgba(0,0,0,0.6)", fontWeight: 600, fontSize: 12 }}>
              <MessageCircle size={20} /> Comment
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 4, padding: "12px 0", color: "rgba(0,0,0,0.6)", fontWeight: 600, fontSize: 12 }}>
              <Repeat2 size={20} /> Repost
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 4, padding: "12px 0", color: "rgba(0,0,0,0.6)", fontWeight: 600, fontSize: 12 }}>
              <Send size={20} /> Send
            </div>
          </div>
      </div>
    </div>
  );

  const renderThreads = () => (
    <div style={{ background: "white", flex: 1, display: "flex", flexDirection: "column", paddingTop: 32 }}>
        <div style={{ display: "flex", padding: "16px", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: 18, background: "black", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800 }}>
                    {avatar}
                </div>
                <div style={{ width: 2, flex: 1, background: "#E5E5E5" }} />
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "black" }}>{name.toLowerCase().replace(/\s+/g, '')}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 14, color: "#999" }}>1m</span>
                        <MoreHorizontal size={16} color="#999" />
                    </div>
                </div>
                <div style={{ fontSize: 15, color: "black", lineHeight: 1.4, marginBottom: 12, whiteSpace: "pre-wrap" }}>
                    {plainTextCaption || <span style={{ color: "#999" }}>Start a thread...</span>}
                </div>
                {mediaList && mediaList.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                        {mediaList.length === 1 ? (
                            <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #E5E5E5", display: "flex", justifyContent: "center", alignItems: "center", maxHeight: 500 }}>
                                {mediaList[0].type === "video" ? (
                                    <video src={mediaList[0].url} autoPlay loop muted style={{ width: "100%", maxHeight: 500, objectFit: "contain" }} />
                                ) : (
                                    <img src={mediaList[0].url} alt="Preview" style={{ width: "100%", maxHeight: 500, objectFit: "contain" }} />
                                )}
                            </div>
                        ) : (
                            <div style={{ display: "flex", gap: 8, overflowX: "auto", scrollSnapType: "x mandatory", scrollbarWidth: "none", msOverflowStyle: "none", marginRight: -16, paddingRight: 16 }} className="hide-scrollbar">
                                <style>{`
                                    .hide-scrollbar::-webkit-scrollbar {
                                        display: none;
                                    }
                                `}</style>
                                {mediaList.map((item, idx) => (
                                    <div key={idx} style={{ flex: "0 0 75%", scrollSnapAlign: "start", borderRadius: 12, overflow: "hidden", border: "1px solid #E5E5E5", aspectRatio: "3/4" }}>
                                        {item.type === "video" ? (
                                            <video src={item.url} autoPlay loop muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        ) : (
                                            <img src={item.url} alt={`Preview ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                <div style={{ display: "flex", gap: 16 }}>
                    <Heart size={20} color="black" />
                    <MessageCircle size={20} color="black" style={{ transform: "scaleX(-1)" }} />
                    <Repeat2 size={20} color="black" />
                    <Send size={20} color="black" />
                </div>
            </div>
        </div>
    </div>
  );

  let content = null;
  if (platform === "instagram") {
    if (contentType === "reel") content = renderInstagramReel();
    else if (contentType === "story") content = renderInstagramStory();
    else content = renderInstagramFeed();
  } else if (platform === "tiktok") {
    content = renderTikTok();
  } else if (platform === "meta" || platform === "facebook") {
    if (contentType === "reel") content = renderFacebookReel();
    else if (contentType === "story") content = renderFacebookStory();
    else content = renderFacebookFeed();
  } else if (platform === "linkedin") {
    content = renderLinkedIn();
  } else if (platform === "threads") {
    content = renderThreads();
  } else {
    content = renderInstagramFeed();
  }

  return <PhoneFrame>{content}</PhoneFrame>;
};
