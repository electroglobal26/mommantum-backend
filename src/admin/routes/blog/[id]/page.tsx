import {
  Button, Container, Heading,
  Input, Label, Textarea,
} from "@medusajs/ui"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import RichTextEditor from "../../../components/RichTextEditor"
import FaqEditor from "../../../components/FaqEditor"
import BlogPreview from "./_components/BlogPreview"
import ImagePicker from "../../../components/ImagePicker"

type FAQ = { question: string; answer: string }
type PickerTarget = "featured" | 0 | 1 | 2

const EditBlogPostPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>("featured")

  const [form, setForm] = useState({
    title: "",
    slug: "",
    status: "draft",
    author_name: "",
    category_id: "",
    featured_image: "",
    excerpt: "",
    meta_title: "",
    meta_description: "",
  })

  const [content, setContent] = useState("")
  const [image_urls, setImageUrls] = useState(["", "", ""])
  const [faqs, setFaqs] = useState<FAQ[]>([])

  useEffect(() => {
    fetch(`/admin/blog/posts/${id}`, { credentials: "include" })
      .then((r) => r.json())
      .then(({ post }) => {
        if (!post) return
        setForm({
          title: post.title || "",
          slug: post.slug || "",
          status: post.status || "draft",
          author_name: post.author_name || "",
          category_id: post.category_id || "",
          featured_image: post.featured_image || "",
          excerpt: post.excerpt || "",
          meta_title: post.meta_title || "",
          meta_description: post.meta_description || "",
        })

        // Handle both old (intro+sections) and new (content HTML) formats
        if (post.content) {
          setContent(post.content)
        } else if (post.intro || post.sections?.length) {
          let html = ""
          if (post.intro) html += `<p>${post.intro}</p>`
          if (post.sections?.length) {
            post.sections.forEach((s: any) => {
              if (s.heading) html += `<h2>${s.heading}</h2>`
              if (s.body) html += `<p>${s.body}</p>`
              if (s.image) html += `<img src="${s.image}" alt="${s.heading || ""}" />`
            })
          }
          setContent(html)
        } else {
          setContent("")
        }

        const imgs = post.image_urls || post.images || []
        setImageUrls([imgs[0] || "", imgs[1] || "", imgs[2] || ""])
        setFaqs(post.faqs?.length ? post.faqs : [])
      })
      .finally(() => setLoading(false))
  }, [id])

  function updateForm(key: string, value: any) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function openPicker(target: PickerTarget) {
    setPickerTarget(target)
    setPickerOpen(true)
  }

  function handleImageSelected(url: string) {
    if (pickerTarget === "featured") {
      updateForm("featured_image", url)
    } else {
      const updated = [...image_urls]
      updated[pickerTarget as number] = url
      setImageUrls(updated)
    }
  }

  function pickerLabel() {
    if (pickerTarget === "featured") return "Featured Image (cover)"
    return `Image URL ${(pickerTarget as number) + 1}`
  }

  async function handleSave() {
    if (!form.title) { alert("Title is required"); return }
    setSaving(true)
    const res = await fetch(`/admin/blog/posts/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        slug: form.slug,
        status: form.status,
        author_name: form.author_name || null,
        category_id: form.category_id || null,
        featured_image: form.featured_image || null,
        image_urls: image_urls.filter(Boolean),
        excerpt: form.excerpt || null,
        content,
        meta_title: form.meta_title || null,
        meta_description: form.meta_description || null,
        faqs: faqs.filter((f) => f.question && f.answer),
      }),
    })
    setSaving(false)
    if (res.ok) navigate("/blog")
    else alert("Error saving post")
  }

  if (loading) return (
    <div className="flex h-64 items-center justify-center text-ui-fg-subtle">
      Loading post...
    </div>
  )

  const inputClass = "w-full rounded-md border border-ui-border-base bg-ui-bg-field px-3 py-2 text-sm"

  return (
    <div className="flex flex-col gap-4 p-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Heading level="h1">Edit Post</Heading>
          <p className="text-sm text-ui-fg-subtle mt-1">/{form.slug}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? "Hide Preview" : "Show Preview"}
          </Button>
          <Button variant="secondary" onClick={() => navigate("/blog")}>
            ← Back
          </Button>
          <Button onClick={handleSave} isLoading={saving}>
            Save Changes
          </Button>
        </div>
      </div>

      {/* Live Preview */}
      {showPreview && (
        <BlogPreview
          title={form.title}
          category_id={form.category_id}
          author_name={form.author_name}
          featured_image={form.featured_image}
          excerpt={form.excerpt}
          content={content}
          faqs={faqs}
        />
      )}

      {/* Basic Info */}
      <Container className="p-6 flex flex-col gap-4">
        <Heading level="h2">Basic Info</Heading>
        <div>
          <Label>Title *</Label>
          <Input
            value={form.title}
            onChange={(e) => updateForm("title", e.target.value)}
            placeholder="Enter post title..."
          />
        </div>
        <div>
          <Label>Slug</Label>
          <Input
            value={form.slug}
            onChange={(e) => updateForm("slug", e.target.value)}
            placeholder="post-slug-here"
          />
          <p className="text-xs text-ui-fg-subtle mt-1">
            URL: /blog/{form.slug || "your-slug"}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Category</Label>
            <select
              value={form.category_id}
              onChange={(e) => updateForm("category_id", e.target.value)}
              className={inputClass}
            >
              <option value="">Select category</option>
              <option>Strategy</option>
              <option>Performance</option>
              <option>Creative</option>
              <option>SEO</option>
              <option>Branding</option>
              <option>Growth</option>
              <option>Social Media</option>
            </select>
          </div>
          <div>
            <Label>Author Name</Label>
            <Input
              value={form.author_name}
              onChange={(e) => updateForm("author_name", e.target.value)}
              placeholder="e.g. Kuldeep Ahir"
            />
          </div>
        </div>
        <div>
          <Label>Excerpt</Label>
          <Textarea
            value={form.excerpt}
            onChange={(e) => updateForm("excerpt", e.target.value)}
            placeholder="1-2 sentence description..."
            rows={3}
          />
        </div>
      </Container>

      {/* Images */}
      <Container className="p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Heading level="h2">Images</Heading>
          <button
            type="button"
            onClick={() => openPicker("featured")}
            className="rounded-[8px] border border-ui-border-base bg-ui-bg-field px-3 py-1.5 text-xs font-semibold text-ui-fg-base hover:bg-ui-bg-base-hover transition-all"
          >
            📁 Open Image Library
          </button>
        </div>
        <p className="text-sm text-ui-fg-subtle -mt-2">
          Paste a URL directly or click the 🖼 thumbnail to pick from your Supabase library
        </p>

        {/* Featured image */}
        <div>
          <Label>Featured Image (cover)</Label>
          <div className="mt-1 flex gap-2">
            <Input
              value={form.featured_image}
              onChange={(e) => updateForm("featured_image", e.target.value)}
              placeholder="Paste URL or click thumbnail →"
              className="flex-1"
            />
            <button
              type="button"
              onClick={() => openPicker("featured")}
              className="flex h-[38px] w-[38px] shrink-0 items-center justify-center overflow-hidden rounded-[8px] border-2 transition-all hover:border-[#e61e73]"
              style={{
                borderColor: form.featured_image ? "#e61e73" : "#e5e7eb",
                background: "#f9fafb",
              }}
              title="Pick from Supabase library"
            >
              {form.featured_image ? (
                <img src={form.featured_image} alt="cover" className="h-full w-full object-cover" />
              ) : (
                <span className="text-[16px]">🖼</span>
              )}
            </button>
          </div>
        </div>

        {/* Extra images */}
        {([0, 1, 2] as const).map((i) => (
          <div key={i}>
            <Label>Image URL {i + 1} (shown below article)</Label>
            <div className="mt-1 flex gap-2">
              <Input
                value={image_urls[i]}
                onChange={(e) => {
                  const updated = [...image_urls]
                  updated[i] = e.target.value
                  setImageUrls(updated)
                }}
                placeholder="Paste URL or click thumbnail →"
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => openPicker(i)}
                className="flex h-[38px] w-[38px] shrink-0 items-center justify-center overflow-hidden rounded-[8px] border-2 transition-all hover:border-[#e61e73]"
                style={{
                  borderColor: image_urls[i] ? "#e61e73" : "#e5e7eb",
                  background: "#f9fafb",
                }}
                title="Pick from Supabase library"
              >
                {image_urls[i] ? (
                  <img src={image_urls[i]} alt={`img ${i + 1}`} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-[16px]">🖼</span>
                )}
              </button>
            </div>
          </div>
        ))}
      </Container>

{/* Article Content */}
<Container className="p-6 flex flex-col gap-4">
  <Heading level="h2">Article Content</Heading>
  <p className="text-sm text-ui-fg-subtle -mt-2">
    Use toolbar for headings, bold, lists, inline images
  </p>
  {content !== undefined && (
    <RichTextEditor
      key={content.slice(0, 50)}
      value={content}
      onChange={setContent}
      forceHtml={content.includes("<style>") || content.includes("blog-wrap")}
    />
  )}
</Container>

      {/* FAQs */}
      <Container className="p-6 flex flex-col gap-4">
        <div>
          <Heading level="h2">FAQs</Heading>
          <p className="text-sm text-ui-fg-subtle mt-1">
            Shown at the bottom of the article — improves SEO
          </p>
        </div>
        <FaqEditor faqs={faqs} onChange={setFaqs} />
      </Container>

      {/* SEO */}
      <Container className="p-6 flex flex-col gap-4">
        <Heading level="h2">SEO Settings</Heading>
        <div>
          <Label>Meta Title</Label>
          <Input
            value={form.meta_title}
            onChange={(e) => updateForm("meta_title", e.target.value)}
            placeholder="SEO title (leave blank to use post title)"
          />
          <p className="text-xs text-ui-fg-subtle mt-1">
            Recommended: 50-60 characters · Current: {form.meta_title.length}
          </p>
        </div>
        <div>
          <Label>Meta Description</Label>
          <Textarea
            value={form.meta_description}
            onChange={(e) => updateForm("meta_description", e.target.value)}
            placeholder="SEO description shown in Google results..."
            rows={3}
          />
          <p className="text-xs text-ui-fg-subtle mt-1">
            Recommended: 150-160 characters · Current: {form.meta_description.length}
          </p>
        </div>
      </Container>

      {/* Status */}
      <Container className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <Label>Status</Label>
            <p className="text-sm text-ui-fg-subtle mt-1">
              {form.status === "published"
                ? "Visible on live site"
                : "Draft — hidden from site"}
            </p>
          </div>
          <select
            value={form.status}
            onChange={(e) => updateForm("status", e.target.value)}
            className="rounded-md border border-ui-border-base bg-ui-bg-field px-4 py-2 text-sm font-semibold"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      </Container>

      <div className="flex justify-end gap-2 pb-8">
        <Button variant="secondary" onClick={() => navigate("/blog")}>Cancel</Button>
        <Button onClick={handleSave} isLoading={saving}>Save Changes</Button>
      </div>

      {/* Image Picker Modal */}
      {pickerOpen && (
        <ImagePicker
          activeField={pickerLabel()}
          onSelect={handleImageSelected}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  )
}

export default EditBlogPostPage