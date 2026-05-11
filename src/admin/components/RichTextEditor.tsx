import { useEffect, useRef, useState, useCallback } from "react"
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

  // Custom Image Options Modal State
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [editingImage, setEditingImage] = useState<HTMLImageElement | null>(null)
  const [tempAlt, setTempAlt] = useState("")
  const [tempWidth, setTempWidth] = useState("")

  // Hover delete state
  const [hoveredImage, setHoveredImage] = useState<{ node: HTMLElement; rect: DOMRect } | null>(null)

  // Move image click handler here to avoid closure issues in loadQuill
  const handleImageClick = useCallback((ev: MouseEvent) => {
    const target = ev.target as HTMLImageElement
    if (target.tagName === "IMG" && quillRef.current) {
      setEditingImage(target)
      setTempAlt(target.getAttribute("alt") || "")
      setTempWidth(target.getAttribute("width") || "")
      setImageModalOpen(true)
    }
  }, [])

  // Attach/detach click and hover listeners when quill is ready
  useEffect(() => {
    if (!quillRef.current) return
    const root = quillRef.current.root
    
    root.addEventListener("click", handleImageClick)

    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const isImg = target.tagName === "IMG"
      const isDeleteBtn = target.closest(".image-delete-btn")
      
      if (isImg) {
        setHoveredImage({ node: target, rect: target.getBoundingClientRect() })
      } else if (!isDeleteBtn) {
        setHoveredImage(null)
      }
    }

    const handleScroll = () => setHoveredImage(null)
    
    root.addEventListener("mousemove", handleMouseMove)
    root.addEventListener("scroll", handleScroll, true)

    return () => {
      root.removeEventListener("click", handleImageClick)
      root.removeEventListener("mousemove", handleMouseMove)
      root.removeEventListener("scroll", handleScroll, true)
    }
  }, [handleImageClick])

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
        link.href = "https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.snow.css"
        document.head.appendChild(link)
      }

      if (!document.querySelector("#quill-custom-css")) {
        const style = document.createElement("style")
        style.id = "quill-custom-css"
        style.textContent = `
          .ql-toolbar { border-top-left-radius: 8px; border-top-right-radius: 8px; background: #f9fafb; border-color: #e5e7eb !important; }
          .ql-container { border-color: #e5e7eb !important; font-size: 15px; font-family: inherit; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; }
          .ql-editor { min-height: 320px; line-height: 1.8; }
          .ql-editor.ql-blank::before { color: #9ca3af; font-style: normal; }
          .ql-editor h2 { font-size: 22px; font-weight: 700; margin: 16px 0 8px; color: #0e2547; }
          .ql-editor h3 { font-size: 18px; font-weight: 600; margin: 12px 0 6px; color: #0e2547; }
          .ql-editor h4 { font-size: 16px; font-weight: 600; margin: 10px 0 4px; color: #0e2547; }
          .ql-editor p { margin: 8px 0; }
          .ql-editor img { 
            max-width: 100%; 
            border-radius: 8px; 
            margin: 12px auto; 
            display: block; 
            cursor: pointer;
            transition: outline 0.1s;
          }
          .ql-editor img:hover {
            outline: 2px solid #e61e73;
          }
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

      // Extend Image blot to support alt and width
      const ImageBlot = Quill.import("formats/image") as any
      class CustomImage extends ImageBlot {
        static create(value: any) {
          const node = super.create(value)
          if (typeof value === "string") {
            node.setAttribute("src", value)
          } else if (typeof value === "object") {
            node.setAttribute("src", value.url)
            if (value.alt) node.setAttribute("alt", value.alt)
            if (value.width) node.setAttribute("width", value.width)
            if (value.style) node.setAttribute("style", value.style)
          }
          return node
        }

        static value(node: HTMLElement) {
          return {
            url: node.getAttribute("src"),
            alt: node.getAttribute("alt"),
            width: node.getAttribute("width"),
            style: node.getAttribute("style"),
          }
        }
      }
      Quill.register(CustomImage, true)

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
  function replacePlaceholderWithImage(url: string, index: number | null, altText?: string) {
    let updated = htmlValue
    const alt = altText || "blog image"

    if (index !== null) {
      const imgTag = `<img src="${url}" alt="${alt}" style="max-width:100%;border-radius:10px;margin:16px 0;display:block;" />`

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
      updated = updated + `\n<img src="${url}" alt="${alt}" style="max-width:100%;border-radius:10px;margin:16px 0;display:block;" />`
    }

    setHtmlValue(updated)
    onChange(updated)
  }

  function handleImageFromPicker(url: string) {
    const replacingImg = (window as any).__quillReplacingImg || editingImage
    if (replacingImg) {
      replacingImg.setAttribute("src", url)
      delete (window as any).__quillReplacingImg
      const html = quillRef.current?.root.innerHTML || htmlValue
      setHtmlValue(html)
      onChange(html)
      setImagePickerOpen(false)
      // If we were in the modal, we stay in the modal to update alt text for the new image
      return
    }

    // For new images, we'll insert them then open the modal for Alt text
    if (mode === "preview" || mode === "html") {
      replacePlaceholderWithImage(url, imagePlaceholderIndex, "blog image")
      setImagePickerOpen(false)
      return
    }
    if (!quillRef.current) return
    const index = quillRangeRef.current
      ? quillRangeRef.current.index
      : quillRef.current.getLength()
    
    // Using object for value because CustomImage blot handles it
    quillRef.current.insertEmbed(index, "image", { url, alt: "blog image" })
    quillRef.current.setSelection(index + 1)
    
    // Immediately select the newly inserted image to open modal
    setTimeout(() => {
      const imgs = quillRef.current.root.querySelectorAll("img")
      const newImg = imgs[imgs.length - 1] // Roughly the last one
      if (newImg) {
        setEditingImage(newImg)
        setTempAlt("")
        setTempWidth(newImg.getAttribute("width") || "")
        setImageModalOpen(true)
      }
    }, 100)

    setImagePickerOpen(false)
  }

  function saveImageOptions() {
    if (!editingImage || !quillRef.current) return
    editingImage.setAttribute("alt", tempAlt)
    if (tempWidth) {
      editingImage.setAttribute("width", tempWidth)
      editingImage.style.width = tempWidth
    } else {
      editingImage.removeAttribute("width")
      editingImage.style.width = ""
    }

    const html = quillRef.current.root.innerHTML
    onChange(html)
    setHtmlValue(html)
    setImageModalOpen(false)
    setEditingImage(null)
  }

  function deleteImage(nodeToHuber?: HTMLElement) {
    const targetNode = nodeToHuber || editingImage
    if (!targetNode || !quillRef.current) return
    
    if (window.confirm("Are you sure you want to remove this image?")) {
      // Find the blot and remove it through Quill for better consistency
      if (mode === "visual") {
        const blot = (window as any).Quill?.find(targetNode)
        if (blot) blot.remove()
        else targetNode.remove()
      } else {
        targetNode.remove()
      }
      
      const html = quillRef.current.root.innerHTML
      const clean = html === "<p><br></p>" ? "" : html
      onChange(clean)
      setHtmlValue(clean)
      setImageModalOpen(false)
      setEditingImage(null)
      setHoveredImage(null)
    }
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
      // Use clipboard for safer HTML pasting in Quill 2
      quillRef.current.clipboard.dangerouslyPasteHTML(htmlValue || "")
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
            onScroll={() => setHoveredImage(null)}
            onMouseMove={(e) => {
              const target = e.target as HTMLElement
              const isImg = target.tagName === "IMG"
              const isDeleteBtn = target.closest(".image-delete-btn")
              if (isImg) {
                setHoveredImage({ node: target, rect: target.getBoundingClientRect() })
              } else if (!isDeleteBtn) {
                setHoveredImage(null)
              }
            }}
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

    {/* Custom Image Options Modal */}
      {imageModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 text-left">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
              <h3 className="text-lg font-bold text-[#0e2547]">🖼 Image Options</h3>
              <p className="text-xs text-gray-500">Update SEO alt text and display settings</p>
            </div>
            
            <div className="p-6 space-y-5">
              {/* Preview */}
              {editingImage && (
                <div className="flex justify-center bg-gray-50 rounded-lg p-2 border border-gray-100">
                  <img 
                    src={editingImage.src} 
                    alt="Preview" 
                    className="max-h-32 rounded object-contain shadow-sm"
                  />
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    Alt Text (SEO Description)
                  </label>
                  <input
                    type="text"
                    value={tempAlt}
                    onChange={(e) => setTempAlt(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-[#e61e73] focus:ring-2 focus:ring-[#e61e73]/10"
                    placeholder="Describe this image for search engines..."
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    Display Width
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tempWidth}
                      onChange={(e) => setTempWidth(e.target.value)}
                      className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-[#e61e73] focus:ring-2 focus:ring-[#e61e73]/10"
                      placeholder="e.g. 100%, 400px"
                    />
                    <button
                      type="button"
                      onClick={() => setTempWidth("100%")}
                      className="rounded-lg border border-gray-200 px-3 text-xs font-semibold hover:bg-gray-50 active:bg-gray-100"
                    >
                      Full
                    </button>
                  </div>
                </div>
              </div>

            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-4">
              <button
                type="button"
                onClick={() => {
                  setImageModalOpen(false)
                  setEditingImage(null)
                }}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveImageOptions}
                className="rounded-lg bg-[#0e2547] px-6 py-2 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition-all hover:bg-[#1a3a6b] hover:-translate-y-0.5 active:translate-y-0"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hover Delete Button Overlay */}
      {hoveredImage && (
        <button
          type="button"
          onMouseEnter={() => setHoveredImage(hoveredImage)}
          onMouseLeave={() => setHoveredImage(null)}
          onClick={(e) => {
            e.stopPropagation()
            deleteImage(hoveredImage.node)
          }}
          className="image-delete-btn fixed z-[100] flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow-xl transition-all hover:bg-red-600 hover:scale-110 active:scale-90"
          style={{
            top: hoveredImage.rect.top + 10,
            left: hoveredImage.rect.right - 35,
          }}
          title="Remove image"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      )}

    </div>
  )
}

export default RichTextEditor