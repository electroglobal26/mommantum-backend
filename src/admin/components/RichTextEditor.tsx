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

// Detect if content is complex HTML from n8n (has style tags or blog-wrap class)
function isComplexHtml(val: string): boolean {
  return val.includes("<style>") || val.includes("blog-wrap") || val.includes("<!DOCTYPE")
}

const RichTextEditor = ({ value, onChange, placeholder, forceHtml }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const quillRef = useRef<any>(null)
  const isInitialized = useRef(false)

  // Auto-detect complex HTML and force HTML mode
  const [showHtml, setShowHtml] = useState(
    forceHtml || isComplexHtml(value || "")
  )
  const [htmlValue, setHtmlValue] = useState(value || "")
  const [imagePickerOpen, setImagePickerOpen] = useState(false)
  const quillRangeRef = useRef<any>(null)

  // If value arrives after mount and is complex HTML — switch to HTML mode
  useEffect(() => {
    if (value && isComplexHtml(value) && !showHtml) {
      setShowHtml(true)
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
          .ql-toolbar {
            border-top-left-radius: 8px;
            border-top-right-radius: 8px;
            background: #f9fafb;
            border-color: #e5e7eb !important;
          }
          .ql-container {
            border-color: #e5e7eb !important;
            font-size: 15px;
            font-family: inherit;
          }
          .ql-editor {
            min-height: 320px;
            line-height: 1.8;
          }
          .ql-editor.ql-blank::before {
            color: #9ca3af;
            font-style: normal;
          }
          .ql-editor h2 { font-size: 22px; font-weight: 700; margin: 16px 0 8px; color: #0e2547; }
          .ql-editor h3 { font-size: 18px; font-weight: 600; margin: 12px 0 6px; color: #0e2547; }
          .ql-editor h4 { font-size: 16px; font-weight: 600; margin: 10px 0 4px; color: #0e2547; }
          .ql-editor p { margin: 8px 0; }
          .ql-editor img { max-width: 100%; border-radius: 8px; margin: 12px 0; display: block; }
          .ql-editor blockquote { border-left: 4px solid #e61e73; padding-left: 16px; color: #6b7280; margin: 12px 0; }
          .ql-editor ul, .ql-editor ol { padding-left: 24px; margin: 8px 0; }
          .ql-editor a { color: #e61e73; }
          .ql-image-url-prompt {
            position: fixed; inset: 0;
            background: rgba(0,0,0,0.5);
            display: flex; align-items: center; justify-content: center;
            z-index: 9999;
          }
          .ql-image-url-box {
            background: white; border-radius: 12px; padding: 24px;
            width: 500px; max-width: 90vw;
            box-shadow: 0 20px 60px rgba(0,0,0,0.2);
          }
          .ql-image-url-box h3 { font-size: 16px; font-weight: 700; color: #0e2547; margin: 0 0 16px; }
          .ql-image-url-box input[type="text"] {
            width: 100%; border: 1px solid #e5e7eb; border-radius: 8px;
            padding: 10px 14px; font-size: 14px; outline: none; box-sizing: border-box;
          }
          .ql-image-url-box input[type="text"]:focus { border-color: #99dcf8; }
          .ql-image-url-box p { font-size: 12px; color: #9ca3af; margin: 6px 0 16px; }
          .ql-image-url-actions { display: flex; gap: 8px; justify-content: flex-end; }
          .ql-image-url-cancel {
            padding: 8px 16px; border: 1px solid #e5e7eb; border-radius: 8px;
            background: white; font-size: 13px; font-weight: 600; cursor: pointer; color: #6b7280;
          }
          .ql-image-url-cancel:hover { background: #f9fafb; }
          .ql-image-url-insert {
            padding: 8px 16px; border: none; border-radius: 8px;
            background: #e61e73; color: white; font-size: 13px; font-weight: 600; cursor: pointer;
          }
          .ql-image-url-insert:hover { background: #ca155f; }
          .ql-image-tabs { display: flex; gap: 4px; margin-bottom: 16px; border-bottom: 2px solid #f3f4f6; }
          .ql-tab-btn {
            padding: 8px 16px; border: none; background: none; font-size: 13px;
            font-weight: 600; color: #9ca3af; cursor: pointer;
            border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all 0.2s;
          }
          .ql-tab-btn.active { color: #0e2547; border-bottom-color: #e61e73; }
          .ql-tab-panel { display: block; }
          .ql-tab-panel.hidden { display: none; }
          .ql-upload-area {
            border: 2px dashed #e5e7eb; border-radius: 10px; padding: 32px 16px;
            text-align: center; cursor: pointer; transition: all 0.2s; background: #f9fafb;
          }
          .ql-upload-area:hover { border-color: #99dcf8; background: #f0f9ff; }
          .ql-upload-area span { font-size: 32px; display: block; margin-bottom: 8px; }
          .ql-upload-area p { font-size: 14px; font-weight: 600; color: #374151; margin: 4px 0; }
          .ql-upload-area small { font-size: 12px; color: #9ca3af; }
          .ql-upload-area.hidden { display: none; }
          #ql-upload-preview { text-align: center; margin-top: 8px; }
          #ql-upload-preview.hidden { display: none; }
          #ql-upload-preview img {
            max-height: 160px; max-width: 100%; border-radius: 8px;
            object-fit: cover; margin: 0 auto; display: block;
          }
          .ql-preview-name { font-size: 12px; color: #6b7280; margin-top: 6px; }
          .ql-upload-insert {
            padding: 8px 16px; border: none; border-radius: 8px;
            background: #e61e73; color: white; font-size: 13px; font-weight: 600; cursor: pointer;
          }
          .ql-upload-insert:disabled { background: #e5e7eb; color: #9ca3af; cursor: not-allowed; }
          .ql-upload-insert:not(:disabled):hover { background: #ca155f; }
          .ql-html-editor {
            width: 100%;
            min-height: 400px;
            padding: 16px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.6;
            border: 1px solid #e5e7eb;
            border-top: none;
            outline: none;
            resize: vertical;
            color: #374151;
            background: #fafafa;
            box-sizing: border-box;
          }
          .ql-html-editor:focus { background: #fff; }
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
                setImagePickerOpen(true)
              },
            },
          },
        },
      })

      // Only set content in Quill if it's simple HTML (not complex n8n HTML)
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

  // Sync if value changes after mount — only for simple HTML
  useEffect(() => {
    if (!quillRef.current || !value) return
    if (isComplexHtml(value)) return // skip Quill for complex HTML
    if (quillRef.current.root.innerHTML !== value) {
      quillRef.current.root.innerHTML = value
      setHtmlValue(value)
    }
  }, [value])

  function handleToggleHtml() {
    if (showHtml) {
      // Only go back to visual if content is simple HTML
      if (isComplexHtml(htmlValue)) {
        alert("This content has complex HTML from n8n automation. Edit in HTML mode only to preserve formatting.")
        return
      }
      if (quillRef.current) {
        quillRef.current.root.innerHTML = htmlValue
        onChange(htmlValue)
      }
      setShowHtml(false)
    } else {
      const current = quillRef.current?.root.innerHTML || ""
      setHtmlValue(current === "<p><br></p>" ? "" : current)
      setShowHtml(true)
    }
  }

  function handleHtmlChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setHtmlValue(e.target.value)
    onChange(e.target.value)
  }

  function handleImageFromPicker(url: string) {
    if (!quillRef.current) return
    const index = quillRangeRef.current
      ? quillRangeRef.current.index
      : quillRef.current.getLength()
    quillRef.current.insertEmbed(index, "image", url)
    quillRef.current.setSelection(index + 1)
    setImagePickerOpen(false)
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-ui-border-base">

      {/* Toggle bar */}
      <div className="flex items-center justify-between border-b border-ui-border-base bg-ui-bg-base px-3 py-2">
        <div className="flex items-center gap-2">
          <p className="text-[11px] font-semibold text-ui-fg-subtle uppercase tracking-wider">
            {showHtml ? "HTML Source" : "Visual Editor"}
          </p>
          {/* Badge for n8n generated content */}
          {isComplexHtml(htmlValue) && (
            <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
              style={{ background: "#e61e73" }}>
              n8n generated
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleToggleHtml}
          className="flex items-center gap-1.5 rounded-[6px] border border-ui-border-base px-2.5 py-1 text-[11px] font-semibold transition-all hover:bg-ui-bg-base-hover"
          style={{
            color: showHtml ? "#e61e73" : "#6b7280",
            borderColor: showHtml ? "#e61e73" : "",
          }}
        >
          {showHtml ? (
            <><span>👁</span> Visual</>
          ) : (
            <><span style={{ fontFamily: "monospace" }}>{`</>`}</span> HTML</>
          )}
        </button>
      </div>

      {/* Quill visual editor — hidden when HTML mode or complex content */}
      <div style={{ display: showHtml ? "none" : "block" }}>
        <div ref={containerRef} />
      </div>

      {/* HTML source textarea */}
      {showHtml && (
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
          activeField="Inline Image (inside article)"
          onSelect={handleImageFromPicker}
          onClose={() => setImagePickerOpen(false)}
        />
      )}

    </div>
  )
}

export default RichTextEditor