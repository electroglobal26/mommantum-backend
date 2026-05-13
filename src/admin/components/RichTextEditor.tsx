"use client"
import { useEffect, useRef, useState } from "react"
import ImagePicker from "./ImagePicker"

type Props = {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  forceHtml?: boolean
}

type EditorMode = "preview" | "html"

// ─── CSS injected once ───────────────────────────────────────────────────────
const PREVIEW_CSS = `
  .rte-blog-content { font-family: inherit; }
  .rte-blog-content h2 { font-size: 24px; font-weight: 800; color: #0e2547; letter-spacing: -0.03em; margin: 32px 0 12px; line-height: 1.15; padding-bottom: 8px; border-bottom: 2px solid #f1f5f9; }
  .rte-blog-content h2:first-child { margin-top: 0; }
  .rte-blog-content h3 { font-size: 19px; font-weight: 700; color: #0e2547; margin: 24px 0 8px; }
  .rte-blog-content h4 { font-size: 16px; font-weight: 700; color: #1e3a5f; margin: 18px 0 6px; }
  .rte-blog-content p  { font-size: 15px; line-height: 1.9; color: #475569; margin: 12px 0; }
  .rte-blog-content strong { font-weight: 700; color: #0e2547; }
  .rte-blog-content em { font-style: italic; }
  .rte-blog-content u  { text-decoration: underline; }
  .rte-blog-content s  { text-decoration: line-through; color: #94a3b8; }
  .rte-blog-content ul { list-style: none; padding: 0; margin: 16px 0; }
  .rte-blog-content ul li { display: flex; align-items: flex-start; gap: 10px; font-size: 15px; line-height: 1.8; color: #475569; margin: 8px 0; padding: 8px 12px; background: #f8fafc; border-radius: 8px; border-left: 3px solid #e61e73; }
  .rte-blog-content ul li::before { content: ""; display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #e61e73; flex-shrink: 0; margin-top: 8px; }
  .rte-blog-content ol { padding-left: 0; margin: 16px 0; counter-reset: ol-c; list-style: none; }
  .rte-blog-content ol li { counter-increment: ol-c; display: flex; align-items: flex-start; gap: 12px; font-size: 15px; line-height: 1.8; color: #475569; margin: 8px 0; padding: 8px 12px; background: #f8fafc; border-radius: 8px; }
  .rte-blog-content ol li::before { content: counter(ol-c); display: flex; align-items: center; justify-content: center; min-width: 24px; height: 24px; border-radius: 50%; background: #0e2547; color: white; font-size: 11px; font-weight: 800; flex-shrink: 0; margin-top: 2px; }
  .rte-blog-content blockquote { border-left: 4px solid #e61e73; padding: 14px 20px; margin: 20px 0; background: #fff5f8; border-radius: 0 10px 10px 0; color: #475569; font-size: 16px; line-height: 1.8; font-style: italic; }
  .rte-blog-content a { color: #e61e73; text-decoration: none; font-weight: 600; border-bottom: 1px solid rgba(230,30,115,0.3); }
  .rte-blog-content a:hover { border-bottom-color: #e61e73; }
  .rte-blog-content img { max-width: 100%; border-radius: 10px; margin: 16px auto; display: block; cursor: pointer; transition: outline 0.15s; }
  .rte-blog-content img:hover { outline: 2px solid #e61e73; outline-offset: 2px; }
  .rte-img-placeholder { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 18px; margin: 14px 0; border: 2px dashed #e61e73; border-radius: 10px; background: #fff5f8; color: #e61e73; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; box-sizing: border-box; }
  .rte-img-placeholder:hover { background: #fce7f3; border-color: #be185d; }
  .ql-html-editor { width: 100%; min-height: 420px; padding: 14px; font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.6; border: none; outline: none; resize: vertical; color: #374151; background: #fafafa; box-sizing: border-box; }
  .ql-html-editor:focus { background: #fff; }
`

function injectCss() {
  if (typeof document === "undefined") return
  if (document.getElementById("rte-preview-css")) return
  const s = document.createElement("style")
  s.id = "rte-preview-css"
  s.textContent = PREVIEW_CSS
  document.head.appendChild(s)
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function stripMeta(html: string): string {
  let out = html
  out = out.replace(/<p[^>]*>\s*<em[^>]*>\s*\[Featured Image[^\]]*\]\s*<\/em>\s*<\/p>/gi, "")
  out = out.replace(
    /<p[^>]*>(?:(?!<\/p>)[\s\S])*?(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}(?:(?!<\/p>)[\s\S])*?min read(?:(?!<\/p>)[\s\S])*?<\/p>/gi,
    ""
  )
  return out
}

function buildPreviewHtml(html: string): string {
  let i = 0
  return html.replace(
    /<p[^>]*>\s*<em[^>]*>(\[(?:Featured Image|Section \d+ Image)[^\]]*\])<\/em>\s*<\/p>/gi,
    (_m, label) => {
      const idx = i++
      return `<button class="rte-img-placeholder" onclick="window.__rteInsertImg(${idx})" type="button">🖼 Insert image — ${label}</button>`
    }
  )
}

// ─── Component ───────────────────────────────────────────────────────────────
const RichTextEditor = ({ value, onChange, placeholder }: Props) => {
  const initialised = useRef(false)
  const [htmlValue, setHtmlValue] = useState("")
  const [mode, setMode] = useState<EditorMode>("preview")
  const [imagePickerOpen, setImagePickerOpen] = useState(false)
  const [insertIndex, setInsertIndex] = useState<number | null>(null)

  // Alt-text modal
  const [altModalOpen, setAltModalOpen] = useState(false)
  const [altSrc, setAltSrc] = useState("")
  const [tempAlt, setTempAlt] = useState("")
  const [replaceMode, setReplaceMode] = useState(false) // true = replacing existing image

  // ── Initialise once from value prop ────────────────────────────────────────
  useEffect(() => {
    if (initialised.current) return
    initialised.current = true
    const raw = value || ""
    const clean = stripMeta(raw)
    if (clean !== raw) setTimeout(() => onChange(clean), 0)
    setHtmlValue(clean)
  }, [value])

  injectCss()

  // ── Register global placeholder click handler ───────────────────────────────
  useEffect(() => {
    ;(window as any).__rteInsertImg = (idx: number) => {
      setInsertIndex(idx)
      setImagePickerOpen(true)
    }
    return () => { delete (window as any).__rteInsertImg }
  }, [])

  // ── Commit htmlValue changes ────────────────────────────────────────────────
  function commit(next: string) {
    setHtmlValue(next)
    onChange(next)
  }

  // ── Image insertion ─────────────────────────────────────────────────────────
  function handleImagePicked(url: string) {
    setImagePickerOpen(false)
    const imgTag = `<img src="${url}" alt="" style="max-width:100%;border-radius:10px;margin:16px 0;display:block;" />`

    let updated = htmlValue

    if (replaceMode && altSrc) {
      // Replace existing image src in-place, keep alt text
      const escaped = altSrc.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      updated = htmlValue.replace(
        new RegExp(`<img([^>]*)src="${escaped}"([^>]*)>`, "gi"),
        (match, before, after) => {
          // Preserve existing alt, just swap src
          return `<img${before}src="${url}"${after}>`
        }
      )
      setReplaceMode(false)
      commit(updated)
      // Re-open alt modal for the replaced image with existing alt
      setAltSrc(url)
      setAltModalOpen(true)
      return
    }

    if (insertIndex !== null) {
      // Replace the nth placeholder
      let count = 0
      let replaced = false
      updated = htmlValue.replace(
        /<p[^>]*>\s*<em[^>]*>\[[^\]]*Image[^\]]*\]<\/em>\s*<\/p>/gi,
        (m) => {
          if (count === insertIndex) { count++; replaced = true; return imgTag }
          count++
          return m
        }
      )
      if (!replaced) updated = htmlValue + "\n" + imgTag
    } else {
      // Append at end
      updated = htmlValue + "\n" + imgTag
    }

    commit(updated)
    setInsertIndex(null)

    // Open alt modal for the newly inserted image
    setAltSrc(url)
    setTempAlt("")
    setAltModalOpen(true)
  }

  // ── Alt text save ───────────────────────────────────────────────────────────
  function saveAlt() {
    if (!altSrc) { setAltModalOpen(false); return }
    const escaped = altSrc.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    // Replace alt="" or add alt attribute on the matching img
    let updated = htmlValue.replace(
      new RegExp(`(<img[^>]*src="${escaped}"[^>]*?)\\s*alt="[^"]*"`, "i"),
      `$1 alt="${tempAlt}"`
    )
    if (updated === htmlValue) {
      updated = htmlValue.replace(
        new RegExp(`(<img[^>]*src="${escaped}")`),
        `$1 alt="${tempAlt}"`
      )
    }
    commit(updated)
    setAltModalOpen(false)
    setAltSrc("")
    setTempAlt("")
    setReplaceMode(false)
  }

  // ── Image delete — replaces with placeholder instead of removing ────────────
  function deleteImageBySrc(src: string) {
    const escaped = src.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const placeholder = `<p><em>[Image Placeholder]</em></p>`
    const updated = htmlValue.replace(
      new RegExp(`<img[^>]*src="${escaped}"[^>]*\\/?>`, "gi"),
      placeholder
    )
    commit(updated)
    setAltModalOpen(false)
    setAltSrc("")
    setTempAlt("")
  }

  // ── Preview click handler ───────────────────────────────────────────────────
  function handlePreviewClick(e: React.MouseEvent) {
    const target = e.target as HTMLElement
    if (target.tagName === "IMG") {
      const src = (target as HTMLImageElement).getAttribute("src") || ""
      setAltSrc(src)
      setTempAlt((target as HTMLImageElement).getAttribute("alt") || "")
      setReplaceMode(false)
      setAltModalOpen(true)
    }
  }

  // ── HTML textarea change ────────────────────────────────────────────────────
  function handleHtmlChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    commit(e.target.value)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-ui-border-base">

      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-ui-border-base bg-ui-bg-base px-3 py-2">
        {/* Mode tabs */}
        <div className="flex items-center gap-1 rounded-[8px] border border-ui-border-base bg-ui-bg-subtle p-0.5">
          <button
            type="button"
            onClick={() => setMode("preview")}
            className="rounded-[6px] px-3 py-1 text-[11px] font-semibold transition-all"
            style={{ background: mode === "preview" ? "#0e2547" : "transparent", color: mode === "preview" ? "white" : "#6b7280" }}
          >
            👁 Preview
          </button>
          <button
            type="button"
            onClick={() => setMode("html")}
            className="rounded-[6px] px-3 py-1 text-[11px] font-semibold transition-all"
            style={{ background: mode === "html" ? "#e61e73" : "transparent", color: mode === "html" ? "white" : "#6b7280", fontFamily: mode === "html" ? "monospace" : "inherit" }}
          >
            {"</>"} HTML
          </button>
        </div>

        {/* Insert image button */}
        <button
          type="button"
          onClick={() => { setInsertIndex(null); setImagePickerOpen(true) }}
          className="rounded-[6px] border border-ui-border-base px-2.5 py-1 text-[11px] font-semibold transition-all hover:bg-ui-bg-base-hover"
          style={{ color: "#6b7280" }}
          title="Insert image"
        >
          🖼 Image
        </button>
      </div>

      {/* PREVIEW */}
      {mode === "preview" && (
        <div className="overflow-y-auto" style={{ minHeight: 400, maxHeight: 700, background: "#fff" }}>
          <div
            className="flex items-center gap-2 px-4 py-2 text-[12px] font-medium"
            style={{ background: "#f0f9ff", color: "#0369a1", borderBottom: "1px solid #bae6fd" }}
          >
            <span>👆</span>
            <span>Click any pink button to insert an image · Click an existing image to edit alt text or remove it</span>
          </div>
          {htmlValue ? (
            <div
              className="p-6 rte-blog-content"
              onClick={handlePreviewClick}
              dangerouslySetInnerHTML={{ __html: buildPreviewHtml(htmlValue) }}
            />
          ) : (
            <div className="flex items-center justify-center p-12 text-[14px] text-slate-400 italic">
              {placeholder || "No content yet. Switch to HTML to paste content."}
            </div>
          )}
        </div>
      )}

      {/* HTML */}
      {mode === "html" && (
        <textarea
          className="ql-html-editor"
          value={htmlValue}
          onChange={handleHtmlChange}
          spellCheck={false}
          placeholder="<h2>Your heading</h2><p>Your content...</p>"
        />
      )}

      {/* Image Picker */}
      {imagePickerOpen && (
        <ImagePicker
          activeField={insertIndex !== null ? `Section ${insertIndex} Image` : "Inline Image"}
          onSelect={handleImagePicked}
          onClose={() => setImagePickerOpen(false)}
        />
      )}

      {/* Alt text modal */}
      {altModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
              <h3 className="text-[16px] font-bold text-[#0e2547]">🖼 Image</h3>
              <p className="text-[12px] text-gray-400 mt-0.5">Set alt text for SEO, or remove the image</p>
            </div>

            <div className="p-6 space-y-4">
              {/* Image preview */}
              {altSrc && (
                <div className="flex justify-center rounded-lg bg-gray-50 p-3 border border-gray-100">
                  <img src={altSrc} alt="preview" className="max-h-36 rounded object-contain" />
                </div>
              )}

              {/* Alt text input */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Alt Text (SEO)
                </label>
                <input
                  type="text"
                  value={tempAlt}
                  onChange={(e) => setTempAlt(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); saveAlt() } }}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#e61e73] focus:ring-2 focus:ring-[#e61e73]/10"
                  placeholder="Describe this image for search engines..."
                  autoFocus
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-6 py-4">
              {/* Delete button */}
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Remove this image? It will be replaced with a placeholder you can fill in later.")) {
                    deleteImageBySrc(altSrc)
                  }
                }}
                className="rounded-lg border border-red-200 px-4 py-2 text-[13px] font-semibold text-red-500 hover:bg-red-50 transition-colors"
              >
                🗑 Remove
              </button>

              <div className="flex items-center gap-2">
                {/* Replace button */}
                <button
                  type="button"
                  onClick={() => {
                    setReplaceMode(true)
                    setAltModalOpen(false)
                    setInsertIndex(null)
                    setImagePickerOpen(true)
                  }}
                  className="rounded-lg border border-[#e61e73] px-4 py-2 text-[13px] font-semibold text-[#e61e73] hover:bg-pink-50 transition-colors"
                >
                  🔄 Replace
                </button>
                <button
                  type="button"
                  onClick={() => { setAltModalOpen(false); setAltSrc(""); setReplaceMode(false) }}
                  className="rounded-lg px-4 py-2 text-[13px] font-semibold text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveAlt}
                  className="rounded-lg bg-[#0e2547] px-5 py-2 text-[13px] font-bold text-white hover:bg-[#1a3a6b] transition-colors"
                >
                  Save Alt Text
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RichTextEditor
