import { Button, Container, Heading, Input, Label, Textarea } from "@medusajs/ui"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import FaqEditor from "../../../components/FaqEditor"


type FAQ = { question: string; answer: string }

const PAGE_CONFIG: Record<string, {
  label: string
  icon: string
  schemaType: string
  showHero: boolean
  showFaqs: boolean
  showInternalLinks: boolean
  description: string
}> = {
  homepage: {
    label: "Home Page",
    icon: "🏠",
    schemaType: "WebSite + Organization + SearchAction",
    showHero: true,
    showFaqs: true,
    showInternalLinks: true,
    description: "Homepage is your authority page. Needs WebSite + Organization schema.",
  },
  about: {
    label: "About",
    icon: "👥",
    schemaType: "WebPage",
    showHero: false,
    showFaqs: true,
    showInternalLinks: false,
    description: "About page uses WebPage schema. Add FAQs for rich results.",
  },
  services: {
    label: "Services",
    icon: "⚙️",
    schemaType: "WebPage + Service",
    showHero: false,
    showFaqs: true,
    showInternalLinks: true,
    description: "Services page uses WebPage + Service schema.",
  },
  contact: {
    label: "Contact",
    icon: "📞",
    schemaType: "WebPage + Organization",
    showHero: false,
    showFaqs: false,
    showInternalLinks: false,
    description: "Contact page uses WebPage + Organization schema.",
  },
  blog: {
    label: "Blog Listing",
    icon: "📝",
    schemaType: "CollectionPage",
    showHero: false,
    showFaqs: false,
    showInternalLinks: false,
    description: "Blog listing uses CollectionPage schema.",
  },
}

const PageSeoEditor = () => {
  const { pageKey } = useParams<{ pageKey: string }>()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [settingId, setSettingId] = useState<string | null>(null)

  const config = PAGE_CONFIG[pageKey || ""] || {
    label: pageKey,
    icon: "📄",
    schemaType: "WebPage",
    showHero: false,
    showFaqs: false,
    showInternalLinks: false,
    description: "",
  }

  const [form, setForm] = useState({
    meta_title: "",
    meta_description: "",
    slug: "",
    canonical_url: "",
    robots_index: true,
    robots_follow: true,
    primary_keyword: "",
    secondary_keywords: "",
    meta_keywords: "",
    og_title: "",
    og_description: "",
    og_image: "",
    og_url: "",
    og_type: "website",
    twitter_card: "summary_large_image",
    twitter_title: "",
    twitter_description: "",
    twitter_image: "",
    hero_title: "",
    hero_subtitle: "",
    sitemap_inclusion: true,
    hreflang: "",
    redirect_url: "",
  })

  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [internalLinks, setInternalLinks] = useState<{ page: string; anchor: string }[]>([])

  useEffect(() => {
    fetch("/admin/seo", { credentials: "include" })
      .then(r => r.json())
      .then(({ settings }) => {
        const existing = (settings || []).find((s: any) => s.page_key === pageKey)
        if (existing) {
          setSettingId(existing.id)
          setForm(f => ({
            ...f,
            meta_title: existing.meta_title || "",
            meta_description: existing.meta_description || "",
            slug: existing.slug || "",
            canonical_url: existing.canonical_url || "",
            robots_index: existing.robots_index ?? true,
            robots_follow: existing.robots_follow ?? true,
            primary_keyword: existing.primary_keyword || "",
            secondary_keywords: (existing.secondary_keywords || []).join(", "),
            meta_keywords: existing.meta_keywords || "",
            og_title: existing.og_title || "",
            og_description: existing.og_description || "",
            og_image: existing.og_image || "",
            og_url: existing.og_url || "",
            og_type: existing.og_type || "website",
            twitter_card: existing.twitter_card || "summary_large_image",
            twitter_title: existing.twitter_title || "",
            twitter_description: existing.twitter_description || "",
            twitter_image: existing.twitter_image || "",
            hero_title: existing.hero_title || "",
            hero_subtitle: existing.hero_subtitle || "",
            sitemap_inclusion: existing.sitemap_inclusion ?? true,
            hreflang: existing.hreflang || "",
            redirect_url: existing.redirect_url || "",
          }))
          setFaqs(existing.faq_section || [])
          setInternalLinks(existing.internal_links || [])
        }
        setLoading(false)
      })
  }, [pageKey])

  function updateForm(key: string, value: any) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)

    const payload = {
      page_key: pageKey,
      page_label: config.label,
      ...form,
      secondary_keywords: form.secondary_keywords
        .split(",")
        .map(k => k.trim())
        .filter(Boolean),
      faq_section: faqs,
      internal_links: internalLinks,
      schema_type: config.schemaType,
      last_updated: new Date().toISOString(),
    }

    if (settingId) {
      await fetch(`/admin/seo/${settingId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    } else {
      const res = await fetch("/admin/seo", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      setSettingId(data.setting?.id || null)
    }

    setSaving(false)
    alert("SEO settings saved!")
  }

  if (loading) return <div className="p-6 text-ui-fg-subtle">Loading...</div>

  const inputClass = "w-full rounded-md border border-ui-border-base bg-ui-bg-field px-3 py-2 text-sm"

  return (
    <div className="flex flex-col gap-4 p-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[24px]">{config.icon}</span>
            <Heading level="h1">{config.label} — SEO Settings</Heading>
          </div>
          <p className="text-sm text-ui-fg-subtle mt-1">{config.description}</p>
          <p className="text-xs text-ui-fg-subtle mt-0.5">
            Schema: <span className="font-semibold text-[#e61e73]">{config.schemaType}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate("/seo")}>← Back</Button>
          <Button onClick={handleSave} isLoading={saving}>Save SEO</Button>
        </div>
      </div>

      {/* Hero section — only for homepage */}
      {config.showHero && (
        <Container className="p-6 flex flex-col gap-4">
          <Heading level="h2">🦸 Hero Content</Heading>
          <div>
            <Label>Hero Title</Label>
            <Input value={form.hero_title} onChange={e => updateForm("hero_title", e.target.value)}
              placeholder="We make D2C brands grow faster..." />
          </div>
          <div>
            <Label>Hero Subtitle</Label>
            <Input value={form.hero_subtitle} onChange={e => updateForm("hero_subtitle", e.target.value)}
              placeholder="Strategy. Creative. Performance." />
          </div>
        </Container>
      )}

      {/* Core SEO */}
      <Container className="p-6 flex flex-col gap-4">
        <Heading level="h2">🔍 Core SEO</Heading>

        <div>
          <Label>Meta Title *</Label>
          <Input value={form.meta_title} onChange={e => updateForm("meta_title", e.target.value)}
            placeholder="50-60 characters" />
          <p className="text-xs text-ui-fg-subtle mt-1">
            {form.meta_title.length}/60 characters
            {form.meta_title.length > 60 && <span className="text-red-500 ml-1">⚠ Too long</span>}
          </p>
        </div>

        <div>
          <Label>Meta Description *</Label>
          <Textarea value={form.meta_description} onChange={e => updateForm("meta_description", e.target.value)}
            placeholder="140-160 characters" rows={3} />
          <p className="text-xs text-ui-fg-subtle mt-1">
            {form.meta_description.length}/160 characters
            {form.meta_description.length > 160 && <span className="text-red-500 ml-1">⚠ Too long</span>}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Slug (URL handle)</Label>
            <Input value={form.slug} onChange={e => updateForm("slug", e.target.value)}
              placeholder="about-us" />
          </div>
          <div>
            <Label>Canonical URL</Label>
            <Input value={form.canonical_url} onChange={e => updateForm("canonical_url", e.target.value)}
              placeholder="https://mommantum.com/about" />
          </div>
        </div>

        <div>
          <Label>Primary Keyword</Label>
          <Input value={form.primary_keyword} onChange={e => updateForm("primary_keyword", e.target.value)}
            placeholder="digital marketing agency Jaipur" />
        </div>

        <div>
          <Label>Secondary Keywords (comma separated, max 4)</Label>
          <Input value={form.secondary_keywords} onChange={e => updateForm("secondary_keywords", e.target.value)}
            placeholder="D2C marketing, performance marketing, SEO agency" />
        </div>

        <div>
          <Label>Meta Keywords (optional)</Label>
          <Input value={form.meta_keywords} onChange={e => updateForm("meta_keywords", e.target.value)}
            placeholder="marketing, SEO, brand growth" />
        </div>

        {/* Robots */}
        <div>
          <Label>Robots</Label>
          <div className="flex gap-4 mt-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.robots_index}
                onChange={e => updateForm("robots_index", e.target.checked)} />
              Index
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.robots_follow}
                onChange={e => updateForm("robots_follow", e.target.checked)} />
              Follow
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.sitemap_inclusion}
                onChange={e => updateForm("sitemap_inclusion", e.target.checked)} />
              Include in Sitemap
            </label>
          </div>
        </div>
      </Container>

      {/* Open Graph */}
      <Container className="p-6 flex flex-col gap-4">
        <Heading level="h2">📘 Open Graph (Facebook / LinkedIn)</Heading>
        <p className="text-sm text-ui-fg-subtle -mt-2">
          Controls how this page looks when shared on social media
        </p>

        <div>
          <Label>OG Title</Label>
          <Input value={form.og_title} onChange={e => updateForm("og_title", e.target.value)}
            placeholder="Leave blank to use Meta Title" />
        </div>
        <div>
          <Label>OG Description</Label>
          <Textarea value={form.og_description} onChange={e => updateForm("og_description", e.target.value)}
            placeholder="Leave blank to use Meta Description" rows={2} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>OG Image URL</Label>
            <Input value={form.og_image} onChange={e => updateForm("og_image", e.target.value)}
              placeholder="https://... (1200×630px)" />
          </div>
          <div>
            <Label>OG Type</Label>
            <select value={form.og_type} onChange={e => updateForm("og_type", e.target.value)}
              className={inputClass}>
              <option value="website">website</option>
              <option value="article">article</option>
              <option value="profile">profile</option>
            </select>
          </div>
        </div>
        <div>
          <Label>OG URL</Label>
          <Input value={form.og_url} onChange={e => updateForm("og_url", e.target.value)}
            placeholder="https://mommantum.com/about" />
        </div>
      </Container>

      {/* Twitter */}
      <Container className="p-6 flex flex-col gap-4">
        <Heading level="h2">🐦 Twitter / X Meta</Heading>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Twitter Card</Label>
            <select value={form.twitter_card} onChange={e => updateForm("twitter_card", e.target.value)}
              className={inputClass}>
              <option value="summary_large_image">summary_large_image</option>
              <option value="summary">summary</option>
            </select>
          </div>
          <div>
            <Label>Twitter Image URL</Label>
            <Input value={form.twitter_image} onChange={e => updateForm("twitter_image", e.target.value)}
              placeholder="https://... (1200×628px)" />
          </div>
        </div>
        <div>
          <Label>Twitter Title</Label>
          <Input value={form.twitter_title} onChange={e => updateForm("twitter_title", e.target.value)}
            placeholder="Leave blank to use Meta Title" />
        </div>
        <div>
          <Label>Twitter Description</Label>
          <Textarea value={form.twitter_description} onChange={e => updateForm("twitter_description", e.target.value)}
            placeholder="Leave blank to use Meta Description" rows={2} />
        </div>
      </Container>

      {/* FAQs */}
      {config.showFaqs && (
        <Container className="p-6 flex flex-col gap-4">
          <div>
            <Heading level="h2">❓ FAQ Section</Heading>
            <p className="text-sm text-ui-fg-subtle mt-1">
              Generates FAQPage schema — shows as dropdowns in Google results
            </p>
          </div>
          <FaqEditor faqs={faqs} onChange={setFaqs} />
        </Container>
      )}

      {/* Internal Links */}
      {config.showInternalLinks && (
        <Container className="p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <Heading level="h2">🔗 Internal Linking</Heading>
              <p className="text-sm text-ui-fg-subtle mt-1">
                Priority pages to link from this page — boosts ranking power
              </p>
            </div>
            <Button size="small" variant="secondary"
              onClick={() => setInternalLinks([...internalLinks, { page: "", anchor: "" }])}>
              + Add Link
            </Button>
          </div>
          {internalLinks.map((link, i) => (
            <div key={i} className="grid grid-cols-2 gap-3 rounded-lg border border-ui-border-base p-3">
              <div>
                <Label>Page URL</Label>
                <Input value={link.page}
                  onChange={e => {
                    const updated = [...internalLinks]
                    updated[i] = { ...updated[i], page: e.target.value }
                    setInternalLinks(updated)
                  }}
                  placeholder="/services/seo" />
              </div>
              <div>
                <Label>Anchor Text</Label>
                <Input value={link.anchor}
                  onChange={e => {
                    const updated = [...internalLinks]
                    updated[i] = { ...updated[i], anchor: e.target.value }
                    setInternalLinks(updated)
                  }}
                  placeholder="SEO services" />
              </div>
            </div>
          ))}
        </Container>
      )}

      {/* Technical SEO */}
      <Container className="p-6 flex flex-col gap-4">
        <Heading level="h2">⚙️ Technical SEO</Heading>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Hreflang (if multi-language)</Label>
            <Input value={form.hreflang} onChange={e => updateForm("hreflang", e.target.value)}
              placeholder="en-IN" />
          </div>
          <div>
            <Label>Redirect URL (if page moved)</Label>
            <Input value={form.redirect_url} onChange={e => updateForm("redirect_url", e.target.value)}
              placeholder="https://mommantum.com/new-url" />
          </div>
        </div>
        <p className="text-xs text-ui-fg-subtle">
          Schema Type auto-set: <strong>{config.schemaType}</strong>
        </p>
      </Container>

      <div className="flex justify-end gap-2 pb-8">
        <Button variant="secondary" onClick={() => navigate("/seo")}>Cancel</Button>
        <Button onClick={handleSave} isLoading={saving}>Save SEO Settings</Button>
      </div>
    </div>
  )
}

export default PageSeoEditor