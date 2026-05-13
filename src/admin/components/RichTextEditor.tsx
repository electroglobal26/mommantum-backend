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
  const isProgrammaticChange = useRef(false) // Flag to prevent text-change loop
  const isComplex = isComplexHtml(value || "")

  const [mode, setMode] = useState<EditorMode>(
    forceHtml || isComplex ? "html" : "visual"
  )
  const [htmlValue, setHtmlValue] = useState(value || "")
  const [imagePickerOpen, setImagePickerOpen] = useState(false)
  const [imagePlaceholderIndex, setImagePlaceholderIndex] = useState<number | null>(null)
  const quillRangeRef = useRef<any>(null)

  // Custom Image Options Modal State — alt text only
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [editingImage, setEditingImage] = useState<HTMLImageElement | null>(null)
  const [tempAlt, setTempAlt] = useState("")

  // Hover delete state
  const [hoveredImage, setHoveredImage] = useState<{ node: HTMLElement; rect: DOMRect } | null>(null)

  // Move image click handler here to avoid closure issues in loadQuill
  const handleImageClick = useCallback((ev: MouseEvent) => {
    const target = ev.target as HTMLImageElement
    if (target.tagName === "IMG" && quillRef.current) {
      setEditingImage(target)
      setTempAlt(target.getAttribute("alt") || "")
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
    let initialValue = value || ""
    // Remove Featured Image placeholder globally as requested
    if (initialValue) {
      let stripped = initialValue.replace(/<p[^>]*>\s*<em[^>]*>\s*\[Featured Image[^\]]*\]\s*<\/em>\s*<\/p>/gi, "")
      
      // Strip the n8n generated author/date meta paragraph
      const metaRegex = /<p[^>]*>(?:(?!<\/p>)[\s\S])*?(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}(?:(?!<\/p>)[\s\S])*?min read(?:(?!<\/p>)[\s\S])*?<\/p>/gi;
      stripped = stripped.replace(metaRegex, "");

      if (stripped !== initialValue) {
        initialValue = stripped
        setTimeout(() => onChange(stripped), 0)
      }
    }

    if (initialValue && isComplexHtml(initialValue) && mode === "visual") {
      setMode("html")
      setHtmlValue(initialValue)
    } else if (initialValue && !htmlValue) {
      setHtmlValue(initialValue)
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
          
          /* Frontend Preview Styles */
          .blog-content { font-family: inherit; }
          .blog-content h2 {
            font-size: 26px; font-weight: 800; color: #0e2547;
            letter-spacing: -0.04em; margin: 36px 0 14px; line-height: 1.1;
            padding-bottom: 10px; border-bottom: 2px solid #f1f5f9;
          }
          .blog-content h2:first-child { margin-top: 0; }
          .blog-content h3 { font-size: 20px; font-weight: 700; color: #0e2547; margin: 28px 0 10px; line-height: 1.2; }
          .blog-content h4 { font-size: 17px; font-weight: 700; color: #1e3a5f; margin: 20px 0 8px; }
          .blog-content p { font-size: 16px; line-height: 2; color: #475569; margin: 14px 0; }
          .blog-content strong { font-weight: 700; color: #0e2547; }
          .blog-content em { font-style: italic; }
          .blog-content u { text-decoration: underline; }
          .blog-content s { text-decoration: line-through; color: #94a3b8; }
          .blog-content ul { list-style: none; padding: 0; margin: 20px 0; }
          .blog-content ul li {
            display: flex; align-items: flex-start; gap: 12px;
            font-size: 16px; line-height: 1.85; color: #475569;
            margin: 10px 0; padding: 10px 14px;
            background: #f8fafc; border-radius: 10px; border-left: 3px solid #e61e73;
          }
          .blog-content ul li::before {
            content: ""; display: inline-block; width: 7px; height: 7px;
            border-radius: 50%; background: #e61e73; flex-shrink: 0; margin-top: 9px;
          }
          .blog-content ol { padding-left: 0; margin: 20px 0; counter-reset: ol-counter; list-style: none; }
          .blog-content ol li {
            counter-increment: ol-counter; display: flex; align-items: flex-start;
            gap: 14px; font-size: 16px; line-height: 1.85; color: #475569;
            margin: 10px 0; padding: 10px 14px; background: #f8fafc; border-radius: 10px;
          }
          .blog-content ol li::before {
            content: counter(ol-counter); display: flex; align-items: center;
            justify-content: center; min-width: 26px; height: 26px;
            border-radius: 50%; background: #0e2547; color: white;
            font-size: 12px; font-weight: 800; flex-shrink: 0; margin-top: 2px;
          }
          .blog-content h2:first-of-type {
            border-bottom: 0; margin-bottom: 16px; padding-bottom: 0;
            text-align: center;
          }
          .blog-content h2:first-of-type + ol {
            counter-reset: toc-section; display: flex; flex-direction: column; gap: 14px;
            margin: 18px 0 36px; padding: 20px;
            border: 1px solid #e2e8f0; border-radius: 18px;
            background: #f8fafc; list-style: none;
          }
          .blog-content h2:first-of-type + ol li {
            background: white; border: 1px solid #edf2f7; border-left: 0;
            box-shadow: 0 8px 22px rgba(14,37,71,0.04);
          }
          .blog-content h2:first-of-type + ol > li {
            counter-increment: toc-section; display: block;
            position: relative; margin: 0; padding: 16px 16px 16px 58px;
            border-radius: 14px;
          }
          .blog-content h2:first-of-type + ol > li::before {
            content: counter(toc-section); width: 30px; min-width: 30px; height: 30px;
            display: inline-flex; align-items: center; justify-content: center;
            position: absolute; left: 16px; top: 16px;
            border-radius: 999px; background: #0e2547; color: white;
            font-size: 13px; font-weight: 800; margin-top: 0;
          }
          .blog-content h2:first-of-type + ol > li > a,
          .blog-content h2:first-of-type + ol > li > p,
          .blog-content h2:first-of-type + ol > li > span {
            display: block;
            color: #0e2547; font-weight: 800;
            line-height: 1.55; border-bottom: 0;
            margin-bottom: 8px;
          }
          .blog-content h2:first-of-type + ol > li > a:last-child,
          .blog-content h2:first-of-type + ol > li > p:last-child,
          .blog-content h2:first-of-type + ol > li > span:last-child {
            margin-bottom: 0;
          }
          .blog-content h2:first-of-type + ol ol {
            display: flex; flex-direction: column; gap: 10px;
            margin: 14px 0 0; padding: 0; list-style: none;
          }
          .blog-content h2:first-of-type + ol ol li {
            display: flex; align-items: flex-start; gap: 12px;
            margin: 0; padding: 12px 14px;
            border-radius: 12px;
          }
          .blog-content h2:first-of-type + ol ol li::before {
            content: none;
          }
          .blog-content h2:first-of-type + ol ol a,
          .blog-content h2:first-of-type + ol ol p,
          .blog-content h2:first-of-type + ol ol span {
            color: #334155; border-bottom: 0; font-weight: 700; line-height: 1.6;
            margin: 0;
          }
          .blog-content h2:first-of-type + ol ol span:first-child,
          .blog-content h2:first-of-type + ol ol strong:first-child {
            flex: 0 0 44px; color: #64748b; font-size: 13px;
          }
          .blog-content blockquote {
            border-left: 4px solid #e61e73; padding: 16px 22px; margin: 24px 0;
            background: linear-gradient(135deg, #fff5f8 0%, #fff0f5 100%);
            border-radius: 0 12px 12px 0; color: #475569;
            font-size: 17px; line-height: 1.85; font-style: italic;
            box-shadow: 0 4px 14px rgba(230,30,115,0.08);
          }
          .blog-content a { color: #e61e73; text-decoration: none; font-weight: 600; border-bottom: 1px solid rgba(230,30,115,0.3); transition: border-color 0.2s; }
          .blog-content a:hover { border-bottom-color: #e61e73; }
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
        isProgrammaticChange.current = true
        quill.root.innerHTML = value
        isProgrammaticChange.current = false
        setHtmlValue(value)
      }

      quill.on("text-change", () => {
        if (isProgrammaticChange.current) return // ignore programmatic changes
        const html = quill.root.innerHTML
        const clean = html === "<p><br></p>" ? "" : html
        onChange(clean)
        setHtmlValue(clean)
      })

      quillRef.current = quill
    }

    loadQuill()
  }, [])

  // Track whether Quill has been initialised and loaded with content
  const quillLoadedRef = useRef(false)

  // Safe helper: set Quill innerHTML without triggering text-change → onChange loop
  function setQuillHtml(html: string) {
    if (!quillRef.current) return
    isProgrammaticChange.current = true
    quillRef.current.root.innerHTML = html
    isProgrammaticChange.current = false
  }

  useEffect(() => {
    if (!quillRef.current || value === undefined) return
    if (isComplexHtml(value)) return

    // Only strip placeholders/meta on first load — never overwrite Quill while user is editing
    if (!quillLoadedRef.current) {
      let safeValue = value
      const metaRegex = /<p[^>]*>(?:(?!<\/p>)[\s\S])*?(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}(?:(?!<\/p>)[\s\S])*?min read(?:(?!<\/p>)[\s\S])*?<\/p>/gi
      let stripped = safeValue.replace(/<p[^>]*>\s*<em[^>]*>\s*\[Featured Image[^\]]*\]\s*<\/em>\s*<\/p>/gi, "")
      stripped = stripped.replace(metaRegex, "")

      if (stripped !== safeValue) {
        safeValue = stripped
        onChange(stripped)
      }

      setQuillHtml(safeValue)
      setHtmlValue(safeValue)
      quillLoadedRef.current = true
    }
    // After first load: do NOT overwrite Quill — htmlValue is the source of truth
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
      setTimeout(() => {
        const previewContainer = document.querySelector('.blog-preview-container')
        if (previewContainer) {
          const imgs = previewContainer.querySelectorAll('img')
          const newImg = Array.from(imgs).find(i => i.getAttribute('src') === url)
          if (newImg) {
            setEditingImage(newImg as HTMLImageElement)
            setTempAlt("blog image")
            setImageModalOpen(true)
          }
        }
      }, 100)
      return
    }
    if (!quillRef.current) return
    const index = quillRangeRef.current
      ? quillRangeRef.current.index
      : quillRef.current.getLength()
    
    // Insert as plain URL (Quill default) — no object, no custom blot
    quillRef.current.insertEmbed(index, "image", url)
    quillRef.current.setSelection(index + 1)
    
    // Immediately find the newly inserted image and set alt attribute directly on DOM
    setTimeout(() => {
      const imgs = quillRef.current.root.querySelectorAll("img")
      const newImg = Array.from(imgs).find(i => i.getAttribute("src") === url)
      if (newImg) {
        newImg.setAttribute("alt", "blog image")
        setEditingImage(newImg)
        setTempAlt("blog image")
        setImageModalOpen(true)
      }
    }, 50)

    setImagePickerOpen(false)
  }

  function saveImageOptions() {
    if (!editingImage) return

    // Set alt directly on the DOM node — safe, doesn't touch Quill's delta
    editingImage.setAttribute("alt", tempAlt)

    if (mode === "visual" && quillRef.current) {
      // Read innerHTML AFTER the DOM mutation above
      const html = quillRef.current.root.innerHTML
      onChange(html)
      setHtmlValue(html)
    } else {
      // Preview or HTML mode — update the stored HTML string
      const src = editingImage.getAttribute("src")
      if (src) {
        const escapedSrc = src.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        // Replace existing alt or inject new one
        let updated = htmlValue.replace(
          new RegExp(`(<img[^>]*src="${escapedSrc}"[^>]*?)\\s*alt="[^"]*"`, "i"),
          `$1 alt="${tempAlt}"`
        )
        if (!updated.includes(`alt="${tempAlt}"`)) {
          updated = htmlValue.replace(
            new RegExp(`(<img[^>]*src="${escapedSrc}")`),
            `$1 alt="${tempAlt}"`
          )
        }
        setHtmlValue(updated)
        onChange(updated)
        if (quillRef.current && !isComplexHtml(updated)) {
          setQuillHtml(updated)
        }
      }
    }

    setImageModalOpen(false)
    setEditingImage(null)
  }

  function deleteImage(nodeToHuber?: HTMLElement) {
    const targetNode = nodeToHuber || editingImage
    if (!targetNode) return
    
    if (window.confirm("Are you sure you want to remove this image?")) {
      const src = targetNode.getAttribute("src")
      
      if (mode === "visual" && quillRef.current) {
        const blot = (window as any).Quill?.find(targetNode)
        if (blot) blot.remove()
        else targetNode.remove()
        
        const html = quillRef.current.root.innerHTML
        const clean = html === "<p><br></p>" ? "" : html
        onChange(clean)
        setHtmlValue(clean)
      } else {
        // Preview or HTML mode
        const tempDiv = document.createElement("div")
        tempDiv.innerHTML = htmlValue
        const img = Array.from(tempDiv.querySelectorAll("img")).find(i => i.getAttribute("src") === src)
        if (img) img.remove()
        
        const clean = tempDiv.innerHTML === "<p><br></p>" ? "" : tempDiv.innerHTML
        setHtmlValue(clean)
        onChange(clean)
        if (quillRef.current) setQuillHtml(clean)
        
        // Remove from preview DOM directly to reflect immediately
        targetNode.remove()
      }
      
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
      // Always load the latest htmlValue into Quill when switching to visual
      setQuillHtml(htmlValue || "")
    }
    if (newMode === "html" && mode === "visual" && quillRef.current) {
      // Capture latest Quill content into htmlValue before leaving visual mode
      const current = quillRef.current.root.innerHTML
      const clean = current === "<p><br></p>" ? "" : current
      setHtmlValue(clean)
      onChange(clean)
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
          className="overflow-y-auto blog-preview-container"
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
            className="p-6 blog-content"
            onScroll={() => setHoveredImage(null)}
            onClick={(e) => {
              const target = e.target as HTMLElement
              if (target.tagName === "IMG") {
                setEditingImage(target as HTMLImageElement)
                setTempAlt(target.getAttribute("alt") || "")
                setImageModalOpen(true)
              }
            }}
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
              <p className="text-xs text-gray-500">Add alt text for SEO</p>
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

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Alt Text (SEO Description)
                </label>
                <input
                  type="text"
                  value={tempAlt}
                  onChange={(e) => setTempAlt(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); saveImageOptions() } }}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-[#e61e73] focus:ring-2 focus:ring-[#e61e73]/10"
                  placeholder="Describe this image for search engines..."
                  autoFocus
                />
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