import React, { useRef, useState, useEffect, useCallback } from "react";
import { Box } from "@mui/material";
import { getTemplateComponent } from "./resume_components/templateRegistry";

// A4 height-to-width ratio: 297mm / 210mm
const A4_RATIO = 297 / 210;

// Gap (px) shown between rendered A4 pages
const PAGE_GAP_PX = 20;

/**
 * MultiPageResumePreview
 *
 * Renders the resume template as a series of A4 page frames stacked
 * vertically, automatically paginating content that exceeds one page.
 *
 * Strategy:
 *  1. Render the full template once in a hidden, off-screen div to measure
 *     its true pixel height at 210mm width.
 *  2. Compute how many A4 pages are needed:
 *       pageHeightPx = elementWidthPx * A4_RATIO
 *       pageCount    = ceil(contentHeight / pageHeightPx)
 *  3. For each page N render an A4 "viewport" div (210mm × 297mm,
 *     overflow: hidden) that absolutely positions the same template
 *     content shifted upward by N * pageHeightPx — showing only that
 *     page's slice.
 */
const TOP_PADDING_MM = 12;
const BOTTOM_PADDING_MM = 12;

const templateThemes = {
  template1:  { type: "split", sidebarWidth: "35%", sidebarBg: "#f4f4f4", mainBg: "#ffffff" },
  template2:  { type: "split", sidebarWidth: "240px", sidebarBg: "#111111", mainBg: "#ffffff" },
  template3:  { type: "solid", mainBg: "#ffffff" },
  template3p: { type: "solid", mainBg: "#ffffff" },
  template4:  { type: "solid", mainBg: "#ffffff" },
  template4p: { type: "solid", mainBg: "#ffffff" },
  template5:  { type: "solid", mainBg: "#ffffff" },
  template5p: { type: "solid", mainBg: "#ffffff" },
  template6:  { type: "border", borderWidth: "6px", borderBg: "#1e3a5f", mainBg: "#ffffff" },
  template6p: { type: "border", borderWidth: "6px", borderBg: "#1e3a5f", mainBg: "#ffffff" },
  template7:  { type: "solid", mainBg: "#ffffff" },
  template7p: { type: "solid", mainBg: "#ffffff" },
  template8:  { type: "border", borderWidth: "8px", borderBg: "linear-gradient", mainBg: "#ffffff" },
  template8p: { type: "border", borderWidth: "8px", borderBg: "linear-gradient", mainBg: "#ffffff" },
  template9:  { type: "solid", mainBg: "#ffffff" },
  template9p: { type: "solid", mainBg: "#ffffff" },
  template11: { type: "solid", mainBg: "#ffffff" },
  template11p:{ type: "solid", mainBg: "#ffffff" },
  template12: { type: "split", sidebarWidth: "220px", sidebarBg: "#F4F1EE", mainBg: "#FDFCFA" },
  template13: { type: "solid", mainBg: "#ffffff" },
  template14: { type: "solid", mainBg: "#ffffff" },
};

const getTemplateTheme = (id) => {
  return templateThemes[id] || { type: "solid", mainBg: "#ffffff" };
};

const MultiPageResumePreview = ({ templateId, data }) => {
  const measureRef = useRef(null);
  const [layout, setLayout] = useState({ 
    pageCount: 1, 
    pageHeightPx: 1122, 
    topPaddingPx: 0, 
    bottomPaddingPx: 0,
    breaks: [0, 1122]
  });

  // ── Recompute page count whenever content or container size changes ──
  const recompute = useCallback(() => {
    const el = measureRef.current;
    if (!el) return;

    const widthPx = el.offsetWidth;
    if (!widthPx) return;

    const pageH = Math.round(widthPx * A4_RATIO);
    const topPad = Math.round((TOP_PADDING_MM * widthPx) / 210);
    const bottomPad = Math.round((BOTTOM_PADDING_MM * widthPx) / 210);
    const totalH = el.scrollHeight;

    // Build rects of text elements to avoid splitting text across page breaks
    const containerRect = el.getBoundingClientRect();
    const allElements = el.getElementsByTagName("*");
    const rects = [];
    for (let i = 0; i < allElements.length; i++) {
      const child = allElements[i];
      const tagName = child.tagName;
      const isTextElement = tagName === "P" || 
                            tagName === "LI" || 
                            tagName === "TR" || 
                            tagName === "TD" || 
                            tagName === "SPAN" || 
                            tagName.match(/^H[1-6]$/) || 
                            (tagName === "DIV" && Array.from(child.childNodes).some(n => n.nodeType === 3 && n.nodeValue.trim()));
      
      if (isTextElement && child.offsetWidth > 0 && child.offsetHeight > 0) {
        const rect = child.getBoundingClientRect();
        const top = rect.top - containerRect.top;
        const bottom = rect.bottom - containerRect.top;
        rects.push({ top, bottom, height: bottom - top });
      }
    }

    const getPageBreaks = (rects, totalHeight, pageHeight, tpad, bpad) => {
      const breaks = [0];
      let currentY = 0;
      let safety = 0;

      while (currentY < totalHeight && safety < 100) {
        safety++;
        const limit = currentY === 0 
          ? (pageHeight - bpad) 
          : (pageHeight - tpad - bpad);
          
        let targetY = currentY + limit;

        if (targetY >= totalHeight) {
          breaks.push(totalHeight);
          break;
        }

        let bestY = targetY;
        let minIntersectionTop = Infinity;

        for (let i = 0; i < rects.length; i++) {
          const rect = rects[i];
          if (rect.top < targetY && rect.bottom > targetY) {
            // We want to break before this element (at rect.top)
            // but only if rect.top is greater than currentY and rect height fits page
            if (rect.top > currentY && rect.height < limit) {
              if (rect.top < minIntersectionTop) {
                minIntersectionTop = rect.top;
              }
            }
          }
        }

        if (minIntersectionTop !== Infinity && minIntersectionTop > currentY) {
          bestY = minIntersectionTop;
        }

        breaks.push(bestY);
        currentY = bestY;
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

  // Attach ResizeObserver to the hidden measurement element
  useEffect(() => {
    const el = measureRef.current;
    if (!el) return;

    const ro = new ResizeObserver(recompute);
    ro.observe(el);
    recompute(); // run once on mount

    return () => ro.disconnect();
  }, [recompute]);

  // Re-measure when template or data changes (allow 1 tick for DOM update)
  useEffect(() => {
    const id = setTimeout(recompute, 50);
    return () => clearTimeout(id);
  }, [templateId, data, recompute]);

  if (!data) return null;

  const TemplateComponent = getTemplateComponent(templateId);
  const { pageCount, pageHeightPx, topPaddingPx, bottomPaddingPx, breaks = [0, pageHeightPx] } = layout;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: `${PAGE_GAP_PX}px`,
        // Animate the whole multi-page block in
        animation: "mpFadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        "@keyframes mpFadeIn": {
          "0%":   { opacity: 0, transform: "translateY(10px)" },
          "100%": { opacity: 1, transform: "translateY(0)"    },
        },
      }}
    >
      {/* ── Hidden measurement render ──────────────────────────────────── */}
      {/* Renders at exact 210mm width, invisible, off-screen.
          ResizeObserver watches this to recompute layout. */}
      <Box
        ref={measureRef}
        aria-hidden="true"
        sx={{
          position:      "fixed",
          left:          "-9999px",
          top:           0,
          width:         "210mm",
          zIndex:        -9999,
          pointerEvents: "none",
          visibility:    "hidden",
          boxSizing:     "border-box",
          "& *": {
            wordBreak:    "normal",
            overflowWrap: "break-word",
            boxSizing:    "border-box",
          },
        }}
      >
        <TemplateComponent data={data} />
      </Box>

      {/* ── A4 page frames ────────────────────────────────────────────── */}
      {Array.from({ length: pageCount }, (_, pageIndex) => {
        const startY = breaks[pageIndex] !== undefined ? breaks[pageIndex] : 0;
        const theme = getTemplateTheme(templateId);
        const maxContentHeight = pageIndex === 0 
          ? (pageHeightPx - bottomPaddingPx) 
          : (pageHeightPx - topPaddingPx - bottomPaddingPx);
        const actualContentHeight = (breaks[pageIndex + 1] !== undefined ? breaks[pageIndex + 1] : pageHeightPx) - startY;

        return (
          <Box
            key={pageIndex}
            sx={{
              position:  "relative",
              width:     "210mm",
              height:    "297mm",
              overflow:  "hidden",
              bgcolor:   theme.mainBg || "white",
              flexShrink: 0,
              borderRadius: "1.5px",
              // Layered shadow to feel like real paper, remove bottom shadow on final page
              boxShadow:
                pageIndex === pageCount - 1
                  ? "0 -1px 2px rgba(0,0,0,0.04), -3px 0 10px rgba(0,0,0,0.05), 3px 0 10px rgba(0,0,0,0.05)"
                  : "0 1px 3px rgba(0,0,0,0.06), 0 4px 14px rgba(0,0,0,0.10), 0 12px 32px rgba(0,0,0,0.08)",
              // Stagger animation per page
              animation: `pageIn 0.35s ease-out ${pageIndex * 0.07}s both`,
              "@keyframes pageIn": {
                "0%":   { opacity: 0, transform: "scale(0.985) translateY(8px)" },
                "100%": { opacity: 1, transform: "scale(1) translateY(0)"       },
              },
            }}
          >
            {/* Background layout decoration to run continuously from absolute top to bottom */}
            {theme.type === "split" && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  bottom: 0,
                  width: "100%",
                  display: "flex",
                  pointerEvents: "none",
                  zIndex: 0,
                }}
              >
                <Box sx={{ width: theme.sidebarWidth, height: "100%", bgcolor: theme.sidebarBg }} />
                <Box sx={{ flex: 1, height: "100%", bgcolor: theme.mainBg }} />
              </Box>
            )}
            {theme.type === "border" && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  bottom: 0,
                  width: "100%",
                  display: "flex",
                  pointerEvents: "none",
                  zIndex: 0,
                }}
              >
                <Box sx={{ 
                  width: theme.borderWidth, 
                  height: "100%", 
                  background: theme.borderBg === "linear-gradient" 
                    ? "linear-gradient(to bottom, #0d3b66 0%, #00838f 100%)" 
                    : theme.borderBg 
                }} />
                <Box sx={{ flex: 1, height: "100%", bgcolor: theme.mainBg }} />
              </Box>
            )}

            {/* Page number badge ─ bottom-right corner */}
            {pageCount > 1 && (
              <Box
                sx={{
                  position:      "absolute",
                  bottom:        10,
                  right:         12,
                  zIndex:        20,
                  bgcolor:       "rgba(255,255,255,0.88)",
                  backdropFilter:"blur(6px)",
                  border:        "1px solid #e2e8f0",
                  borderRadius:  "5px",
                  px:            1,
                  py:            "2px",
                  fontSize:      "9px",
                  fontWeight:    700,
                  color:         "#94a3b8",
                  letterSpacing: "0.06em",
                  lineHeight:    1.4,
                  userSelect:    "none",
                  pointerEvents: "none",
                }}
              >
                PAGE {pageIndex + 1} / {pageCount}
              </Box>
            )}

            {/* Top-edge shadow to simulate paper depth on pages after page 1 */}
            {pageIndex > 0 && (
              <Box
                sx={{
                  position: "absolute",
                  top:      0,
                  left:     0,
                  right:    0,
                  height:   "8px",
                  zIndex:   15,
                  background:
                    "linear-gradient(to bottom, rgba(0,0,0,0.05), transparent)",
                  pointerEvents: "none",
                }}
              />
            )}

            {/* Template content clipped to this page's slice. */}
            <Box
              sx={{
                position: "absolute",
                top:      pageIndex === 0 ? 0 : `${topPaddingPx}px`,
                left:     0,
                width:    "100%",
                height:   `${maxContentHeight}px`,
                overflow: "hidden",
                boxSizing:"border-box",
                zIndex:   1,
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top:      `-${startY}px`,
                  left:     0,
                  width:    "100%",
                  boxSizing:"border-box",
                  "& *": {
                    wordBreak:    "normal",
                    overflowWrap: "break-word",
                    boxSizing:    "border-box",
                  },
                  "& > div": {
                    width:    "100%",
                    maxWidth: "100%",
                  },
                }}
              >
                <TemplateComponent data={data} />
              </Box>
            </Box>

            {/* Cover box to hide next page's text while extending sidebar/main backgrounds */}
            {breaks[pageIndex + 1] !== undefined && actualContentHeight < maxContentHeight && (
              <Box
                sx={{
                  position: "absolute",
                  top:      `${actualContentHeight + (pageIndex === 0 ? 0 : topPaddingPx)}px`,
                  left:     0,
                  right:    0,
                  bottom:   0,
                  zIndex:   10,
                  display:  "flex",
                  pointerEvents: "none",
                }}
              >
                {theme.type === "split" && (
                  <>
                    <Box sx={{ width: theme.sidebarWidth, height: "100%", bgcolor: theme.sidebarBg }} />
                    <Box sx={{ flex: 1, height: "100%", bgcolor: theme.mainBg }} />
                  </>
                )}
                {theme.type === "border" && (
                  <>
                    <Box sx={{ 
                      width: theme.borderWidth, 
                      height: "100%", 
                      background: theme.borderBg === "linear-gradient" 
                        ? "linear-gradient(to bottom, #0d3b66 0%, #00838f 100%)" 
                        : theme.borderBg 
                    }} />
                    <Box sx={{ flex: 1, height: "100%", bgcolor: theme.mainBg }} />
                  </>
                )}
                {theme.type === "solid" && (
                  <Box sx={{ width: "100%", height: "100%", bgcolor: theme.mainBg }} />
                )}
              </Box>
            )}
          </Box>
        );
      })}

      {/* Bottom breathing room */}
      <Box sx={{ height: "8px" }} />
    </Box>
  );
};

export default MultiPageResumePreview;
