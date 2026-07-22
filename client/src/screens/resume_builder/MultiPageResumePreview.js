import React, { useRef, useState, useEffect, useCallback } from "react";

const A4_RATIO = 297 / 210;
const PAGE_GAP_PX = 20;
const TOP_PADDING_MM = 12;
const BOTTOM_PADDING_MM = 12;

import { getTemplateComponent } from "./resume_components/templateRegistry";

const templateThemes = {
  template1: { type: "split", sidebarWidth: "35%", sidebarBg: "#f4f4f4", mainBg: "#ffffff" },
  template2: { type: "split", sidebarWidth: "240px", sidebarBg: "#111111", mainBg: "#ffffff" },
  template3: { type: "solid", mainBg: "#ffffff" },
  template3p: { type: "solid", mainBg: "#ffffff" },
  template4: { type: "solid", mainBg: "#ffffff" },
  template4p: { type: "solid", mainBg: "#ffffff" },
  template5: { type: "solid", mainBg: "#ffffff" },
  template5p: { type: "solid", mainBg: "#ffffff" },
  template6: { type: "border", borderWidth: "6px", borderBg: "#1e3a5f", mainBg: "#ffffff" },
  template6p: { type: "border", borderWidth: "6px", borderBg: "#1e3a5f", mainBg: "#ffffff" },
  template7: { type: "solid", mainBg: "#ffffff" },
  template7p: { type: "solid", mainBg: "#ffffff" },
  template8: { type: "border", borderWidth: "8px", borderBg: "linear-gradient", mainBg: "#ffffff" },
  template8p: { type: "border", borderWidth: "8px", borderBg: "linear-gradient", mainBg: "#ffffff" },
  template9: { type: "solid", mainBg: "#ffffff" },
  template9p: { type: "solid", mainBg: "#ffffff" },
  template11: { type: "solid", mainBg: "#ffffff" },
  template11p: { type: "solid", mainBg: "#ffffff" },
  template12: { type: "split", sidebarWidth: "220px", sidebarBg: "#F4F1EE", mainBg: "#FDFCFA" },
  template13: { type: "solid", mainBg: "#ffffff" },
  template14: { type: "solid", mainBg: "#ffffff" },
  template15: { type: "solid", mainBg: "#ffffff" },
  template15p: { type: "solid", mainBg: "#ffffff" },
};

const getTemplateTheme = (id) => templateThemes[id] || { type: "solid", mainBg: "#ffffff" };

const MultiPageResumePreview = ({
  templateId,
  data,
  isExport = false,
  pagesRef = null,
}) => {
  const measureRef = useRef(null);
  const [layout, setLayout] = useState({
    pageCount: 1,
    pageHeightPx: 1122,
    topPaddingPx: 0,
    bottomPaddingPx: 0,
    breaks: [0, 1122],
  });

  const recompute = useCallback(() => {
    const el = measureRef.current;
    if (!el) return;
    const widthPx = el.offsetWidth;
    if (!widthPx) return;

    const pageH = Math.round(widthPx * A4_RATIO);
    const topPad = Math.round((TOP_PADDING_MM * widthPx) / 210);
    const bottomPad = Math.round((BOTTOM_PADDING_MM * widthPx) / 210);
    const totalH = el.scrollHeight;

    const containerRect = el.getBoundingClientRect();
    const allElements = el.getElementsByTagName("*");
    const rects = [];

    for (let i = 0; i < allElements.length; i++) {
      const child = allElements[i];
      const tagName = child.tagName;
      const className = typeof child.className === "string" ? child.className : "";

      const isBlock = (
        className.includes("exp-item") ||
        className.includes("exp-block") ||
        className.includes("proj-item") ||
        className.includes("proj-block") ||
        className.includes("edu-item") ||
        className.includes("edu-block") ||
        className.includes("section-title") ||
        className.includes("section-heading") ||
        className.includes("section-header") ||
        className.includes("ref-item") ||
        className.includes("ref-block") ||
        className.includes("block")
      );

      const isText = (
        tagName === "P" ||
        tagName === "LI" ||
        tagName === "TR" ||
        tagName === "TD" ||
        tagName === "SPAN" ||
        /^H[1-6]$/.test(tagName) ||
        isBlock ||
        (tagName === "DIV" &&
          Array.from(child.childNodes).some(
            (n) => n.nodeType === 3 && n.nodeValue.trim()
          ))
      );

      if (isText && child.offsetWidth > 0 && child.offsetHeight > 0) {
        const r = child.getBoundingClientRect();
        const top = r.top - containerRect.top;
        const bottom = r.bottom - containerRect.top;
        rects.push({ top, bottom });
      }
    }

    const getPageBreaks = (rects, totalHeight, pageHeight, tpad, bpad) => {
      const breaks = [0];
      let currentY = 0;
      let safety = 0;

      while (currentY < totalHeight && safety < 100) {
        safety++;
        const usable = currentY === 0
          ? pageHeight - bpad
          : pageHeight - tpad - bpad;
        const hardCut = currentY + usable;

        if (hardCut >= totalHeight) {
          breaks.push(totalHeight);
          break;
        }

        let breakY = hardCut;

        for (let i = 0; i < rects.length; i++) {
          const { top, bottom } = rects[i];
          if (top < hardCut && bottom > hardCut) {
            if (top > currentY + 20 && top < breakY) {
              breakY = top;
            }
          }
        }

        if (breakY <= currentY) {
          let forceY = hardCut;
          for (let i = 0; i < rects.length; i++) {
            const { top, bottom } = rects[i];
            if (top <= currentY + 5 && bottom > currentY) {
              forceY = Math.min(forceY, bottom + 2);
            }
          }
          breakY = forceY;
        }

        breaks.push(breakY);
        currentY = breakY;
      }

      return breaks;
    };

    const computedBreaks = getPageBreaks(rects, totalH, pageH, topPad, bottomPad);

    setLayout({
      pageCount: Math.max(1, computedBreaks.length - 1),
      pageHeightPx: pageH,
      topPaddingPx: topPad,
      bottomPaddingPx: bottomPad,
      breaks: computedBreaks,
    });
  }, []);

  useEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const ro = new ResizeObserver(recompute);
    ro.observe(el);
    recompute();
    return () => ro.disconnect();
  }, [recompute]);

  useEffect(() => {
    const id = setTimeout(recompute, 50);
    return () => clearTimeout(id);
  }, [templateId, data, recompute]);

  if (!data) return null;

  const TemplateComponent = getTemplateComponent(templateId);
  const {
    pageCount, pageHeightPx, topPaddingPx, bottomPaddingPx,
    breaks = [0, pageHeightPx],
  } = layout;

  return (
    <>
      {/* Keyframe injection for non-export mode */}
      {!isExport && (
        <style>{`
          @keyframes mpFadeIn {
            0%   { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes pageIn {
            0%   { opacity: 0; transform: scale(0.985) translateY(8px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>
      )}

      {/* Pages wrapper — pagesRef attached here so parent can find .resume-pdf-page children */}
      <div
        ref={pagesRef}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: `${PAGE_GAP_PX}px`,
          animation: isExport ? "none" : "mpFadeIn 0.5s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* Hidden measurement element — always 210mm wide, off-screen */}
        <div
          ref={measureRef}
          aria-hidden="true"
          style={{
            position: "fixed",
            left: "-9999px",
            top: 0,
            width: "210mm",
            zIndex: -9999,
            pointerEvents: "none",
            visibility: "hidden",
            boxSizing: "border-box",
          }}
        >
          <TemplateComponent data={data} />
        </div>

        {/* A4 page frames */}
        {Array.from({ length: pageCount }, (_, pageIndex) => {
          const startY = breaks[pageIndex] ?? 0;
          const theme = getTemplateTheme(templateId);
          const maxContentHeight = pageIndex === 0
            ? pageHeightPx - bottomPaddingPx
            : pageHeightPx - topPaddingPx - bottomPaddingPx;
          const nextBreak = breaks[pageIndex + 1] ?? pageHeightPx;
          const actualContentH = nextBreak - startY;

          // Per-page animation delay for stagger effect
          const animDelay = `${pageIndex * 0.07}s`;

          return (
            <div
              key={pageIndex}
              className="resume-pdf-page"
              style={{
                position: "relative",
                width: "210mm",
                height: "297mm",
                overflow: "hidden",
                backgroundColor: theme.mainBg || "#ffffff",
                flexShrink: 0,
                borderRadius: isExport ? 0 : "1.5px",
                boxSizing: "border-box",
                boxShadow: isExport
                  ? "none"
                  : pageIndex === pageCount - 1
                    ? "0 -1px 2px rgba(0,0,0,0.04), -3px 0 10px rgba(0,0,0,0.05), 3px 0 10px rgba(0,0,0,0.05)"
                    : "0 1px 3px rgba(0,0,0,0.06), 0 4px 14px rgba(0,0,0,0.10), 0 12px 32px rgba(0,0,0,0.08)",
                animation: isExport
                  ? "none"
                  : `pageIn 0.35s ease-out ${animDelay} both`,
              }}
            >
              {/* ── Background layout decoration ── */}
              {theme.type === "split" && (
                <div style={{
                  position: "absolute", top: 0, left: 0, bottom: 0,
                  width: "100%", display: "flex",
                  pointerEvents: "none", zIndex: 0,
                }}>
                  <div style={{ width: theme.sidebarWidth, height: "100%", backgroundColor: theme.sidebarBg }} />
                  <div style={{ flex: 1, height: "100%", backgroundColor: theme.mainBg }} />
                </div>
              )}

              {theme.type === "border" && (
                <div style={{
                  position: "absolute", top: 0, left: 0, bottom: 0,
                  width: "100%", display: "flex",
                  pointerEvents: "none", zIndex: 0,
                }}>
                  <div style={{
                    width: theme.borderWidth,
                    height: "100%",
                    background: theme.borderBg === "linear-gradient"
                      ? "linear-gradient(to bottom, #0d3b66 0%, #00838f 100%)"
                      : theme.borderBg,
                  }} />
                  <div style={{ flex: 1, height: "100%", backgroundColor: theme.mainBg }} />
                </div>
              )}

              {/* ── Page number badge (hidden in PDF via data-pdf-hide) ── */}
              {pageCount > 1 && !isExport && (
                <div
                  data-pdf-hide="true"
                  style={{
                    position: "absolute",
                    bottom: 10,
                    right: 12,
                    zIndex: 20,
                    backgroundColor: "rgba(255,255,255,0.88)",
                    backdropFilter: "blur(6px)",
                    border: "1px solid #e2e8f0",
                    borderRadius: "5px",
                    padding: "2px 8px",
                    fontSize: "9px",
                    fontWeight: 600,
                    color: "#94a3b8",
                    letterSpacing: "0.06em",
                    lineHeight: 1.4,
                    userSelect: "none",
                    pointerEvents: "none",
                  }}
                >
                  PAGE {pageIndex + 1} / {pageCount}
                </div>
              )}

              {/* ── Top-edge depth shadow for pages after page 1 (hidden in PDF) ── */}
              {pageIndex > 0 && !isExport && (
                <div
                  data-pdf-hide="true"
                  style={{
                    position: "absolute",
                    top: 0, left: 0, right: 0,
                    height: "8px",
                    zIndex: 15,
                    background: "linear-gradient(to bottom, rgba(0,0,0,0.05), transparent)",
                    pointerEvents: "none",
                  }}
                />
              )}

              {/* ── Template content clipped to this page slice ── */}
              <div style={{
                position: "absolute",
                top: pageIndex === 0 ? 0 : `${topPaddingPx}px`,
                left: 0,
                width: "100%",
                height: `${maxContentHeight}px`,
                overflow: "hidden",
                boxSizing: "border-box",
                zIndex: 1,
              }}>
                <div style={{
                  position: "absolute",
                  top: `-${startY}px`,
                  left: 0,
                  width: "100%",
                  boxSizing: "border-box",
                }}>
                  <TemplateComponent data={data} />
                </div>
              </div>

              {/* ── Cover box: hides overflow content, extends background colors ── */}
              {breaks[pageIndex + 1] !== undefined &&
                actualContentH < maxContentHeight && (
                  <div style={{
                    position: "absolute",
                    top: `${actualContentH + (pageIndex === 0 ? 0 : topPaddingPx)}px`,
                    left: 0, right: 0, bottom: 0,
                    zIndex: 10,
                    display: "flex",
                    pointerEvents: "none",
                  }}>
                    {theme.type === "split" && (
                      <>
                        <div style={{ width: theme.sidebarWidth, height: "100%", backgroundColor: theme.sidebarBg }} />
                        <div style={{ flex: 1, height: "100%", backgroundColor: theme.mainBg }} />
                      </>
                    )}
                    {theme.type === "border" && (
                      <>
                        <div style={{
                          width: theme.borderWidth,
                          height: "100%",
                          background: theme.borderBg === "linear-gradient"
                            ? "linear-gradient(to bottom, #0d3b66 0%, #00838f 100%)"
                            : theme.borderBg,
                        }} />
                        <div style={{ flex: 1, height: "100%", backgroundColor: theme.mainBg }} />
                      </>
                    )}
                    {theme.type === "solid" && (
                      <div style={{ width: "100%", height: "100%", backgroundColor: theme.mainBg }} />
                    )}
                  </div>
                )}
            </div>
          );
        })}

        {/* Bottom breathing room */}
        <div style={{ height: "8px" }} />
      </div>
    </>
  );
};

export default MultiPageResumePreview;