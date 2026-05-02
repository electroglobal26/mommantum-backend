import { Button, Container, Heading, Input, Label } from "@medusajs/ui"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

const SiteSettingsPage = () => {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({
    site_name: "",
    site_url: "",
    logo_url: "",
    favicon_url: "",
    brand_name: "",
    company_name: "",
    founder_name: "",
    contact_email: "",
    contact_phone: "",
    address: "",
    social_instagram: "",
    social_linkedin: "",
    social_twitter: "",
    social_facebook: "",
    social_youtube: "",
  })

  useEffect(() => {
    fetch("/admin/seo/site", { credentials: "include" })
      .then(r => r.json())
      .then(({ setting }) => {
        if (setting) setForm(f => ({ ...f, ...setting }))
        setLoading(false)
      })
  }, [])

  function updateForm(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    await fetch("/admin/seo/site", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    setSaving(false)
    alert("Site settings saved!")
  }

  if (loading) return <div className="p-6 text-ui-fg-subtle">Loading...</div>

  return (
    <div className="flex flex-col gap-4 p-6 max-w-4xl mx-auto">

      <div className="flex items-center justify-between">
        <div>
          <Heading level="h1">Site & Brand Settings</Heading>
          <p className="text-sm text-ui-fg-subtle mt-1">
            Used in Organization schema and referenced across all pages
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate("/seo")}>← Back</Button>
          <Button onClick={handleSave} isLoading={saving}>Save</Button>
        </div>
      </div>

      {/* Site Identity */}
      <Container className="p-6 flex flex-col gap-4">
        <Heading level="h2">🌐 Site Identity</Heading>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Site Name</Label><Input value={form.site_name} onChange={e => updateForm("site_name", e.target.value)} placeholder="Mommantum" /></div>
          <div><Label>Site URL</Label><Input value={form.site_url} onChange={e => updateForm("site_url", e.target.value)} placeholder="https://mommantum.com" /></div>
          <div><Label>Brand Name</Label><Input value={form.brand_name} onChange={e => updateForm("brand_name", e.target.value)} placeholder="Mommantum" /></div>
          <div><Label>Logo URL</Label><Input value={form.logo_url} onChange={e => updateForm("logo_url", e.target.value)} placeholder="https://..." /></div>
          <div><Label>Favicon URL</Label><Input value={form.favicon_url} onChange={e => updateForm("favicon_url", e.target.value)} placeholder="https://..." /></div>
        </div>
      </Container>

      {/* Organization */}
      <Container className="p-6 flex flex-col gap-4">
        <Heading level="h2">🏢 Organization</Heading>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Company Name</Label><Input value={form.company_name} onChange={e => updateForm("company_name", e.target.value)} placeholder="Mommantum" /></div>
          <div><Label>Founder Name</Label><Input value={form.founder_name} onChange={e => updateForm("founder_name", e.target.value)} placeholder="Kuldeep Ahir" /></div>
          <div><Label>Contact Email</Label><Input value={form.contact_email} onChange={e => updateForm("contact_email", e.target.value)} placeholder="hello@mommantum.com" /></div>
          <div><Label>Contact Phone</Label><Input value={form.contact_phone} onChange={e => updateForm("contact_phone", e.target.value)} placeholder="+91-XXXXXXXXXX" /></div>
        </div>
        <div><Label>Address</Label><Input value={form.address} onChange={e => updateForm("address", e.target.value)} placeholder="Jaipur, Rajasthan, India" /></div>
      </Container>

      {/* Social Links */}
      <Container className="p-6 flex flex-col gap-4">
        <Heading level="h2">📱 Social Links</Heading>
        <p className="text-sm text-ui-fg-subtle -mt-2">Used in Organization schema sameAs field</p>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Instagram</Label><Input value={form.social_instagram} onChange={e => updateForm("social_instagram", e.target.value)} placeholder="https://instagram.com/mommantum" /></div>
          <div><Label>LinkedIn</Label><Input value={form.social_linkedin} onChange={e => updateForm("social_linkedin", e.target.value)} placeholder="https://linkedin.com/company/mommantum" /></div>
          <div><Label>Twitter / X</Label><Input value={form.social_twitter} onChange={e => updateForm("social_twitter", e.target.value)} placeholder="https://twitter.com/mommantum" /></div>
          <div><Label>Facebook</Label><Input value={form.social_facebook} onChange={e => updateForm("social_facebook", e.target.value)} placeholder="https://facebook.com/mommantum" /></div>
          <div><Label>YouTube</Label><Input value={form.social_youtube} onChange={e => updateForm("social_youtube", e.target.value)} placeholder="https://youtube.com/@mommantum" /></div>
        </div>
      </Container>

    </div>
  )
}

export default SiteSettingsPage