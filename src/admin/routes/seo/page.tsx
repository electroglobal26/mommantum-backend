import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Globe } from "@medusajs/icons"
import { Container, Heading, Button, Badge } from "@medusajs/ui"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

const PAGE_TYPES = [
  { key: "homepage",  label: "Home Page",      icon: "🏠", schema: "WebSite + Organization" },
  { key: "about",     label: "About",           icon: "👥", schema: "WebPage" },
  { key: "services",  label: "Services",        icon: "⚙️", schema: "WebPage + Service" },
  { key: "contact",   label: "Contact",         icon: "📞", schema: "WebPage + Organization" },
  { key: "blog",      label: "Blog Listing",    icon: "📝", schema: "CollectionPage" },
]

const SeoListPage = () => {
  const navigate = useNavigate()
  const [settings, setSettings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [serviceSlug, setServiceSlug] = useState("")

  useEffect(() => {
    fetch("/admin/seo", { credentials: "include" })
      .then(r => r.json())
      .then(({ settings }) => {
        setSettings(settings || [])
        setLoading(false)
      })
  }, [])

  function getSettingForPage(key: string) {
    return settings.find(s => s.page_key === key)
  }

  function openServiceSeo(slug: string) {
    const cleanSlug = slug
      .trim()
      .replace(/^\/+/, "")
      .replace(/^services\//, "")
      .replace(/\/+$/, "")

    if (!cleanSlug) return

    navigate(`/seo/${encodeURIComponent(`service:${cleanSlug}`)}`)
  }

  const serviceSettings = settings.filter((setting) =>
    setting.page_key?.startsWith("service:")
  )

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">

      <div className="flex items-center justify-between">
        <div>
          <Heading level="h1">SEO & Meta Objects</Heading>
          <p className="text-sm text-ui-fg-subtle mt-1">
            Manage SEO settings, schema markup, and metadata for every page
          </p>
        </div>
        <Button
          size="small"
          variant="secondary"
          onClick={() => navigate("/seo/site")}
        >
          🌐 Site & Brand Settings
        </Button>
      </div>

      {/* Pages Section */}
      <Container className="p-0 divide-y divide-ui-border-base">
        <div className="px-6 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ui-fg-subtle">
            Pages
          </p>
        </div>
        {PAGE_TYPES.map((page) => {
          const setting = getSettingForPage(page.key)
          const isConfigured = !!setting?.meta_title

          return (
            <div
              key={page.key}
              className="flex items-center justify-between px-6 py-4 hover:bg-ui-bg-base-hover cursor-pointer transition-all"
              onClick={() => navigate(`/seo/${page.key}`)}
            >
              <div className="flex items-center gap-4">
                <span className="text-[22px]">{page.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-ui-fg-base">
                    {page.label}
                  </p>
                  <p className="text-xs text-ui-fg-subtle mt-0.5">
                    Schema: {page.schema}
                  </p>
                  {setting?.meta_title && (
                    <p className="text-xs text-ui-fg-subtle mt-0.5 truncate max-w-[400px]">
                      Title: {setting.meta_title}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge color={isConfigured ? "green" : "grey"}>
                  {isConfigured ? "Configured" : "Not set"}
                </Badge>
                <span className="text-ui-fg-subtle text-sm">→</span>
              </div>
            </div>
          )
        })}
      </Container>

      {/* Individual Services Section */}
      <Container className="p-0 divide-y divide-ui-border-base">
        <div className="px-6 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ui-fg-subtle">
            Individual Service Pages
          </p>
        </div>
        <div className="px-6 py-4">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <p className="text-sm font-semibold text-ui-fg-base">
                Add or edit a service page
              </p>
              <p className="text-xs text-ui-fg-subtle mt-0.5">
                Enter the service slug from /services/[slug]
              </p>
              <input
                value={serviceSlug}
                onChange={(e) => setServiceSlug(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") openServiceSeo(serviceSlug)
                }}
                placeholder="performance-marketing"
                className="mt-3 w-full rounded-md border border-ui-border-base bg-ui-bg-field px-3 py-2 text-sm"
              />
            </div>
            <Button
              size="small"
              variant="secondary"
              onClick={() => openServiceSeo(serviceSlug)}
            >
              Edit SEO
            </Button>
          </div>
        </div>
        {serviceSettings.map((setting) => {
          const slug = setting.page_key.replace("service:", "")
          const isConfigured = !!setting.meta_title

          return (
            <div
              key={setting.page_key}
              className="flex items-center justify-between px-6 py-4 hover:bg-ui-bg-base-hover cursor-pointer transition-all"
              onClick={() => openServiceSeo(slug)}
            >
              <div className="flex items-center gap-4">
                <span className="text-[22px]">⚡</span>
                <div>
                  <p className="text-sm font-semibold text-ui-fg-base">
                    /services/{slug}
                  </p>
                  <p className="text-xs text-ui-fg-subtle mt-0.5">
                    Schema: WebPage + Service
                  </p>
                  {setting.meta_title && (
                    <p className="text-xs text-ui-fg-subtle mt-0.5 truncate max-w-[400px]">
                      Title: {setting.meta_title}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge color={isConfigured ? "green" : "grey"}>
                  {isConfigured ? "Configured" : "Not set"}
                </Badge>
                <span className="text-ui-fg-subtle text-sm">→</span>
              </div>
            </div>
          )
        })}
      </Container>

      {/* Blog Posts Note */}
      <Container className="p-0 divide-y divide-ui-border-base">
        <div className="px-6 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ui-fg-subtle">
            Blog
          </p>
        </div>
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <span className="text-[22px]">📄</span>
            <div>
              <p className="text-sm font-semibold text-ui-fg-base">
                Individual Blog Posts
              </p>
              <p className="text-xs text-ui-fg-subtle mt-0.5">
                Schema: Article + BlogPosting + FAQPage
              </p>
              <p className="text-xs text-ui-fg-subtle mt-0.5">
                SEO fields are managed inside each blog post
              </p>
            </div>
          </div>
          <Button
            size="small"
            variant="secondary"
            onClick={() => navigate("/blog")}
          >
            Go to Blog →
          </Button>
        </div>
      </Container>

    </div>
  )
}

export const config = defineRouteConfig({
  label: "Meta Objects",
  icon: Globe,
})

export default SeoListPage
