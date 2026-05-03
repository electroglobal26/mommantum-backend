import { useEffect, useRef, useState } from "react"
import ImagePicker from "./ImagePicker"

type Props = {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  forceHtml?: boolean
}

const toolbarOptions = [
  [{ header: [2, 3, 4, false] }],
  ["bold", "italic", "underline", "strike"],
  [{ list: "ordered" }, { list: "bullet" }],
  ["blockquote"],
  ["link", "image"],
  [{ align: [] }],
  ["clean"],
]

function isComplexHtml(val: string): boolean {
  return val.includes("<style>") || val.includes("blog-wrap") || val.includes("<!DOCTYPE")
}

type EditorMode = "visual" | "html" | "preview"

const RichTextEditor = ({ value, onChange, placeholder, forceHtml }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const quillRef = useRef<any>(null)
  const isInitialized = useRef(false)
  const isComplex = isComplexHtml(value || "")

  const [mode, setMode] = useState<EditorMode>(
    forceHtml || isComplex ? "html" : "visual"
  )
  const [htmlValue, setHtmlValue] = useState(value || "")
  const [imagePickerOpen, setImagePickerOpen] = useState(false)
  const [imagePlaceholderIndex, setImagePlaceholderIndex] = useState<number | null>(null)
  const quillRangeRef = useRef<any>(null)

  // Auto switch to HTML mode if complex HTML arrives
  useEffect(() => {
    if (value && isComplexHtml(value) && mode === "visual") {
      setMode("html")
      setHtmlValue(value)
    }
  }, [value])

  useEffect(() => {
    if (isInitialized.current || !containerRef.current) return
    isInitialized.current = true

    const loadQuill = async () => {
      if (!document.querySelector("#quill-snow-css")) {
        const link = document.createElement("link")
        link.id = "quill-snow-css"
        link.rel = "stylesheet"
        link.href = "https://cdn.quilljs.com/1.3.7/quill.snow.css"
        document.head.appendChild(link)
      }

      if (!document.querySelector("#quill-custom-css")) {
        const style = document.createElement("style")
        style.id = "quill-custom-css"
        style.textContent = `
          .ql-toolbar { border-top-left-radius: 8px; border-top-right-radius: 8px; background: #f9fafb; border-color: #e5e7eb !important; }
          .ql-container { border-color: #e5e7eb !important; font-size: 15px; font-family: inherit; }
          .ql-editor { min-height: 320px; line-height: 1.8; }
          .ql-editor.ql-blank::before { color: #9ca3af; font-style: normal; }
          .ql-editor h2 { font-size: 22px; font-weight: 700; margin: 16px 0 8px; color: #0e2547; }
          .ql-editor h3 { font-size: 18px; font-weight: 600; margin: 12px 0 6px; color: #0e2547; }
          .ql-editor h4 { font-size: 16px; font-weight: 600; margin: 10px 0 4px; color: #0e2547; }
          .ql-editor p { margin: 8px 0; }
          .ql-editor img { max-width: 100%; border-radius: 8px; margin: 12px 0; display: block; }
          .ql-editor blockquote { border-left: 4px solid #e61e73; padding-left: 16px; color: #6b7280; margin: 12px 0; }
          .ql-editor ul, .ql-editor ol { padding-left: 24px; margin: 8px 0; }
          .ql-editor a { color: #e61e73; }
          .ql-html-editor {
            width: 100%; min-height: 400px; padding: 16px;
            font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.6;
            border: 1px solid #e5e7eb; border-top: none; outline: none;
            resize: vertical; color: #374151; background: #fafafa; box-sizing: border-box;
          }
          .ql-html-editor:focus { background: #fff; }
          .img-placeholder-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            width: 100%;
            padding: 20px;
            margin: 16px 0;
            border: 2px dashed #e61e73;
            border-radius: 12px;
            background: #fff5f8;
            color: #e61e73;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }
          .img-placeholder-btn:hover {
            background: #fce7f3;
            border-color: #be185d;
            transform: scale(1.01);
          }
        `
        document.head.appendChild(style)
      }

      const Quill = (await import("quill")).default

      const quill = new Quill(containerRef.current!, {
        theme: "snow",
        placeholder: placeholder || "Write your blog content here...",
        modules: {
          toolbar: {
            container: toolbarOptions,
            handlers: {
              image: () => {
                quillRangeRef.current = quill.getSelection()
                setImagePlaceholderIndex(null)
                setImagePickerOpen(true)
              },
            },
          },
        },
      })

      if (value && !isComplexHtml(value)) {
        quill.root.innerHTML = value
        setHtmlValue(value)
      }

      quill.on("text-change", () => {
        const html = quill.root.innerHTML
        const clean = html === "<p><br></p>" ? "" : html
        onChange(clean)
        setHtmlValue(clean)
      })

      quillRef.current = quill
    }

    loadQuill()
  }, [])

  useEffect(() => {
    if (!quillRef.current || !value) return
    if (isComplexHtml(value)) return
    if (quillRef.current.root.innerHTML !== value) {
      quillRef.current.root.innerHTML = value
      setHtmlValue(value)
    }
  }, [value])

  // Replace image placeholder with actual image URL
  function replacePlaceholderWithImage(url: string, index: number | null) {
    let updated = htmlValue

    if (index !== null) {
      const imgTag = `<img src="${url}" alt="blog image ${index}" style="max-width:100%;border-radius:10px;margin:16px 0;display:block;" />`

      // Try to replace featured image placeholder
      const featuredPattern = /<p><em>\[Featured Image[^\]]*\]<\/em><\/p>/gi
      // Try to replace section image placeholder by index
      const sectionPattern = new RegExp(
        `<p><em>\\[Section ${index} Image[^\\]]*\\]<\\/em><\\/p>`,
        "gi"
      )

      if (index === 0 && featuredPattern.test(updated)) {
        updated = updated.replace(featuredPattern, imgTag)
      } else if (sectionPattern.test(updated)) {
        updated = updated.replace(sectionPattern, imgTag)
      } else {
        // Fallback — replace nth placeholder regardless of type
        let count = 0
        updated = updated.replace(
          /<p><em>\[[^\]]*Image[^\]]*\]<\/em><\/p>/gi,
          (m) => {
            if (count === index) {
              count++
              return imgTag
            }
            count++
            return m
          }
        )
      }
    } else {
      // Append at end when using toolbar image button
      updated = updated + `\n<img src="${url}" alt="blog image" style="max-width:100%;border-radius:10px;margin:16px 0;display:block;" />`
    }

    setHtmlValue(updated)
    onChange(updated)
  }

  function handleImageFromPicker(url: string) {
    if (mode === "preview" || mode === "html") {
      replacePlaceholderWithImage(url, imagePlaceholderIndex)
      setImagePickerOpen(false)
      return
    }
    if (!quillRef.current) return
    const index = quillRangeRef.current
      ? quillRangeRef.current.index
      : quillRef.current.getLength()
    quillRef.current.insertEmbed(index, "image", url)
    quillRef.current.setSelection(index + 1)
    setImagePickerOpen(false)
  }

  // Build preview HTML — replace placeholders with clickable pink buttons
  function buildPreviewHtml(html: string): string {
    let i = 0
    return html.replace(
      /<p><em>(\[(?:Featured Image|Section \d+ Image)[^\]]*\])<\/em><\/p>/gi,
      (_match, label) => {
        const idx = i++
        return `<button
          class="img-placeholder-btn"
          onclick="window.__insertImageAt(${idx})"
          type="button"
        >
          🖼 Click to insert image — ${label}
        </button>`
      }
    )
  }

  function switchMode(newMode: EditorMode) {
    if (newMode === "visual" && quillRef.current) {
      quillRef.current.root.innerHTML = htmlValue
      onChange(htmlValue)
    }
    if (newMode === "html" && mode === "visual" && quillRef.current) {
      const current = quillRef.current.root.innerHTML
      setHtmlValue(current === "<p><br></p>" ? "" : current)
    }
    setMode(newMode)
  }

  function handleHtmlChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setHtmlValue(e.target.value)
    onChange(e.target.value)
  }

  // Register global click handler for preview placeholder buttons
  useEffect(() => {
    (window as any).__insertImageAt = (index: number) => {
      setImagePlaceholderIndex(index)
      setImagePickerOpen(true)
    }
    return () => {
      delete (window as any).__insertImageAt
    }
  }, [])

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-ui-border-base">

      {/* Mode toggle bar */}
      <div className="flex items-center justify-between border-b border-ui-border-base bg-ui-bg-base px-3 py-2">
        <div className="flex items-center gap-2">
          {isComplexHtml(htmlValue) && (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
              style={{ background: "#e61e73" }}
            >
              n8n generated
            </span>
          )}
        </div>

        {/* Three mode buttons */}
        <div className="flex items-center gap-1 rounded-[8px] border border-ui-border-base bg-ui-bg-subtle p-0.5">
          <button
            type="button"
            onClick={() => switchMode("visual")}
            className="rounded-[6px] px-3 py-1 text-[11px] font-semibold transition-all"
            style={{
              background: mode === "visual" ? "#0e2547" : "transparent",
              color: mode === "visual" ? "white" : "#6b7280",
            }}
          >
            ✏️ Edit
          </button>
          <button
            type="button"
            onClick={() => switchMode("preview")}
            className="rounded-[6px] px-3 py-1 text-[11px] font-semibold transition-all"
            style={{
              background: mode === "preview" ? "#0e2547" : "transparent",
              color: mode === "preview" ? "white" : "#6b7280",
            }}
          >
            👁 Preview
          </button>
          <button
            type="button"
            onClick={() => switchMode("html")}
            className="rounded-[6px] px-3 py-1 text-[11px] font-semibold transition-all"
            style={{
              background: mode === "html" ? "#e61e73" : "transparent",
              color: mode === "html" ? "white" : "#6b7280",
              fontFamily: mode === "html" ? "monospace" : "inherit",
            }}
          >
            {`</>`} HTML
          </button>
        </div>

        {/* Image insert button */}
        <button
          type="button"
          onClick={() => {
            setImagePlaceholderIndex(null)
            quillRangeRef.current = quillRef.current?.getSelection() || null
            setImagePickerOpen(true)
          }}
          className="rounded-[6px] border border-ui-border-base px-2.5 py-1 text-[11px] font-semibold transition-all hover:bg-ui-bg-base-hover"
          style={{ color: "#6b7280" }}
          title="Insert image from Supabase library"
        >
          🖼 Image
        </button>
      </div>

      {/* VISUAL EDITOR — Quill */}
      <div style={{ display: mode === "visual" ? "block" : "none" }}>
        <div ref={containerRef} />
      </div>

      {/* PREVIEW MODE */}
      {mode === "preview" && (
        <div
          className="overflow-y-auto"
          style={{ minHeight: "400px", maxHeight: "700px", background: "#fff" }}
        >
          <div
            className="flex items-center gap-2 px-4 py-2 text-[12px] font-medium"
            style={{
              background: "#f0f9ff",
              color: "#0369a1",
              borderBottom: "1px solid #bae6fd",
            }}
          >
            <span>👆</span>
            <span>
              Click any pink button to insert image from Supabase · or use{" "}
              <strong>🖼 Image</strong> button above to insert anywhere
            </span>
          </div>
          <div
            className="p-6"
            dangerouslySetInnerHTML={{ __html: buildPreviewHtml(htmlValue) }}
          />
        </div>
      )}

      {/* HTML SOURCE */}
      {mode === "html" && (
        <textarea
          className="ql-html-editor"
          value={htmlValue}
          onChange={handleHtmlChange}
          spellCheck={false}
          placeholder="<h2>Your heading</h2><p>Your content...</p>"
        />
      )}

      {/* Image Picker Modal */}
      {imagePickerOpen && (
        <ImagePicker
          activeField={
            imagePlaceholderIndex !== null
              ? `Section ${imagePlaceholderIndex} Image`
              : "Inline Image"
          }
          onSelect={handleImageFromPicker}
          onClose={() => setImagePickerOpen(false)}
        />
      )}

    </div>
  )
}

export default RichTextEditor