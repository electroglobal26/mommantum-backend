import { useEffect, useState } from "react"

type ImageItem = {
  name: string
  url: string
}

type Props = {
  onSelect: (url: string) => void
  onClose: () => void
  activeField?: string
}

export default function ImagePicker({ onSelect, onClose, activeField }: Props) {
  const [images, setImages] = useState<ImageItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadImages()
  }, [])

  function loadImages() {
    setLoading(true)
    setError("")

    fetch("/admin/blog/images", { credentials: "include" })
      .then((r) => r.json())
      .then(({ images, message }) => {
        if (message) {
          setError(message)
        } else {
          setImages(images || [])
        }
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }

  function fileToBase64(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = String(reader.result || "")
        resolve(result.includes(",") ? result.split(",")[1] : result)
      }
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(file)
    })
  }

  async function handleUpload(file: File | null) {
    if (!file) return

    setUploading(true)
    setError("")

    try {
      const data = await fileToBase64(file)
      const res = await fetch("/admin/blog/images", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: file.name,
          type: file.type,
          data,
        }),
      })
      const uploaded = await res.json()

      if (!res.ok) {
        setError(uploaded.message || "Upload failed")
        return
      }

      setImages((prev) => [uploaded, ...prev])
      setSelected(uploaded.url)
    } catch (err: any) {
      setError(err.message || "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const filtered = images.filter((img) =>
    img.name.toLowerCase().includes(search.toLowerCase())
  )

  function handleConfirm() {
    if (selected) {
      onSelect(selected)
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="flex flex-col bg-white rounded-[16px] shadow-[0_24px_64px_rgba(0,0,0,0.25)] w-[740px] max-w-[95vw] max-h-[85vh] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ui-border-base">
          <div>
            <h2 className="text-[16px] font-extrabold" style={{ color: "#0e2547" }}>
              Image Library
            </h2>
            {activeField && (
              <p className="text-[11px] text-ui-fg-subtle mt-0.5">
                Inserting into:{" "}
                <span className="font-semibold" style={{ color: "#e61e73" }}>
                  {activeField}
                </span>
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-ui-bg-base-hover text-ui-fg-subtle text-[16px] transition-all"
          >
            ✕
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-ui-border-base">
          <div className="flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by filename..."
              autoFocus
              className="w-full rounded-[8px] border border-ui-border-base bg-ui-bg-field px-3 py-2 text-sm outline-none"
              style={{ boxShadow: "none" }}
              onFocus={(e) => (e.target.style.borderColor = "#99dcf8")}
              onBlur={(e) => (e.target.style.borderColor = "")}
            />
            <label
              className="flex shrink-0 cursor-pointer items-center rounded-[8px] px-4 py-2 text-[13px] font-semibold text-white transition-all"
              style={{
                background: uploading ? "#f3a3c7" : "#e61e73",
                cursor: uploading ? "not-allowed" : "pointer",
              }}
            >
              <input
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={(e) => handleUpload(e.target.files?.[0] || null)}
                className="hidden"
              />
              {uploading ? "Uploading..." : "Upload Image"}
            </label>
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex h-52 items-center justify-center text-ui-fg-subtle text-sm">
              Loading images from Supabase...
            </div>
          ) : error ? (
            <div className="flex h-52 flex-col items-center justify-center gap-2">
              <p className="text-sm text-red-500 font-semibold">Failed to load images</p>
              <p className="text-xs text-ui-fg-subtle">{error}</p>
              <p className="text-xs text-ui-fg-subtle">
                Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex h-52 flex-col items-center justify-center gap-2 text-ui-fg-subtle">
              <p className="text-[32px]">🖼</p>
              <p className="text-sm font-semibold">
                {search ? "No images match your search" : "No images found"}
              </p>
              <p className="text-xs">
                Upload images to your Supabase Storage → blog-images bucket
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
              {filtered.map((img) => {
                const isSelected = selected === img.url
                return (
                  <button
                    key={img.name}
                    type="button"
                    onClick={() => setSelected(isSelected ? null : img.url)}
                    className="group relative overflow-hidden rounded-[10px] transition-all duration-150"
                    style={{
                      border: `2px solid ${isSelected ? "#e61e73" : "transparent"}`,
                      boxShadow: isSelected
                        ? "0 0 0 3px rgba(230,30,115,0.15), 0 4px 12px rgba(0,0,0,0.1)"
                        : "0 2px 8px rgba(0,0,0,0.08)",
                      outline: "none",
                    }}
                  >
                    {/* Image */}
                    <div className="aspect-square w-full overflow-hidden bg-slate-100">
                      <img
                        src={img.url}
                        alt={img.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.06]"
                      />
                    </div>

                    {/* Checkmark badge */}
                    {isSelected && (
                      <div
                        className="absolute right-1.5 top-1.5 flex h-[20px] w-[20px] items-center justify-center rounded-full text-white text-[10px] font-bold shadow-md"
                        style={{ background: "#e61e73" }}
                      >
                        ✓
                      </div>
                    )}

                    {/* Filename on hover */}
                    <div className="absolute inset-x-0 bottom-0 translate-y-full bg-[#0e2547]/85 px-2 py-1.5 transition-transform duration-150 group-hover:translate-y-0">
                      <p className="truncate text-[9px] font-medium text-white">
                        {img.name}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-ui-border-base bg-ui-bg-subtle">
          <p className="text-[11px] text-ui-fg-subtle">
            {loading ? "Loading..." : `${filtered.length} image${filtered.length !== 1 ? "s" : ""}`}
            {selected && (
              <span className="ml-2 font-semibold" style={{ color: "#e61e73" }}>
                · 1 selected
              </span>
            )}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={loadImages}
              className="rounded-[8px] border border-ui-border-base bg-white px-4 py-2 text-[13px] font-semibold text-ui-fg-base hover:bg-ui-bg-base-hover transition-all"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-[8px] border border-ui-border-base bg-white px-4 py-2 text-[13px] font-semibold text-ui-fg-base hover:bg-ui-bg-base-hover transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!selected}
              className="rounded-[8px] px-5 py-2 text-[13px] font-semibold text-white transition-all"
              style={{
                background: selected ? "#e61e73" : "#e5e7eb",
                color: selected ? "white" : "#9ca3af",
                cursor: selected ? "pointer" : "not-allowed",
              }}
            >
              Use This Image
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
