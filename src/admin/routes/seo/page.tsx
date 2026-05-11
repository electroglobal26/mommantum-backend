import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Globe } from "@medusajs/icons"
import { Container, Heading, Button, Badge } from "@medusajs/ui"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

const PAGE_TYPES = [
  { key: "homepage",             label: "Home Page",            icon: "🏠", schema: "WebSite + Organization" },
  { key: "about",                label: "About",                icon: "👥", schema: "WebPage" },
  { key: "services",             label: "Services Listing",     icon: "⚙️", schema: "WebPage + Service" },
  { key: "work",                 label: "Work/Portfolio",       icon: "📂", schema: "CollectionPage" },
  { key: "contact",              label: "Contact",              icon: "📞", schema: "WebPage + Organization" },
  { key: "blog",                 label: "Blog Listing",         icon: "📝", schema: "CollectionPage" },
  { key: "privacy-policy",       label: "Privacy Policy",       icon: "🔒", schema: "WebPage" },
  { key: "terms-and-conditions", label: "Terms & Conditions",   icon: "📄", schema: "WebPage" },
]

const SeoListPage = () => {
  const navigate = useNavigate()
  const [settings, setSettings] = useState<any[]>([])
  const [metadata, setMetadata] = useState<{services: any[], work: any[]}>({ services: [], work: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/admin/seo", { credentials: "include" }).then(r => r.json()),
      fetch("/admin/custom/meta-listing", { credentials: "include" }).then(r => r.json()).catch(() => ({ services: [], work: [] }))
    ]).then(([seoData, metaData]) => {
      setSettings(seoData.settings || [])
      setMetadata(metaData)
      setLoading(false)
    })
  }, [])

  function getSettingForPage(key: string) {
    return settings.find(s => s.page_key === key)
  }

  function openSeo(key: string) {
    navigate(`/seo/${encodeURIComponent(key)}`)
  }

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
          🌐 Site Settings
        </Button>
      </div>

      {/* Pages Section */}
      <Container className="p-0 divide-y divide-ui-border-base">
        <div className="px-6 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ui-fg-subtle">
            Main Site Pages
          </p>
        </div>
        {PAGE_TYPES.map((page) => {
          const setting = getSettingForPage(page.key)
          const isConfigured = !!setting?.meta_title

          return (
            <div
              key={page.key}
              className="flex items-center justify-between px-6 py-4 hover:bg-ui-bg-base-hover cursor-pointer transition-all"
              onClick={() => openSeo(page.key)}
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

      {/* Services Section */}
      <Container className="p-0 divide-y divide-ui-border-base">
        <div className="px-6 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ui-fg-subtle">
            Service Pages
          </p>
        </div>
        {metadata.services.length === 0 && !loading && (
          <div className="px-6 py-4 text-sm text-ui-fg-subtle">No services found in database.</div>
        )}
        {metadata.services.map((service) => {
          const pageKey = `service:${service.slug}`
          const setting = getSettingForPage(pageKey)
          const isConfigured = !!setting?.meta_title

          return (
            <div
              key={pageKey}
              className="flex items-center justify-between px-6 py-4 hover:bg-ui-bg-base-hover cursor-pointer transition-all"
              onClick={() => openSeo(pageKey)}
            >
              <div className="flex items-center gap-4">
                <span className="text-[22px]">⚡</span>
                <div>
                  <p className="text-sm font-semibold text-ui-fg-base">
                    {service.title}
                  </p>
                  <p className="text-xs text-ui-fg-subtle mt-0.5">
                    /services/{service.slug}
                  </p>
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

      {/* Work Section */}
      <Container className="p-0 divide-y divide-ui-border-base">
        <div className="px-6 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ui-fg-subtle">
            Work Case Studies
          </p>
        </div>
        {metadata.work.length === 0 && !loading && (
          <div className="px-6 py-4 text-sm text-ui-fg-subtle">No case studies found in database.</div>
        )}
        {metadata.work.map((item) => {
          const pageKey = `work:${item.slug}`
          const setting = getSettingForPage(pageKey)
          const isConfigured = !!setting?.meta_title

          return (
            <div
              key={pageKey}
              className="flex items-center justify-between px-6 py-4 hover:bg-ui-bg-base-hover cursor-pointer transition-all"
              onClick={() => openSeo(pageKey)}
            >
              <div className="flex items-center gap-4">
                <span className="text-[22px]">📂</span>
                <div>
                  <p className="text-sm font-semibold text-ui-fg-base">
                    {item.title}
                  </p>
                  <p className="text-xs text-ui-fg-subtle mt-0.5">
                    /work/{item.slug}
                  </p>
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

    </div>
  )
}

export const config = defineRouteConfig({
  label: "Meta Objects",
  icon: Globe,
})

export default SeoListPage
