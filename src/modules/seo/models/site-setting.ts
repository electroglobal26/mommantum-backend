import { model } from "@medusajs/framework/utils"

const SiteSetting = model.define("site_setting", {
  id: model.id().primaryKey(),

  // ── Site Identity ─────────────────────────────
  site_name: model.text().nullable(),
  site_url: model.text().nullable(),
  logo_url: model.text().nullable(),
  favicon_url: model.text().nullable(),
  brand_name: model.text().nullable(),

  // ── Organization ──────────────────────────────
  company_name: model.text().nullable(),
  founder_name: model.text().nullable(),
  contact_email: model.text().nullable(),
  contact_phone: model.text().nullable(),
  address: model.text().nullable(),

  // ── Social Links ──────────────────────────────
  social_instagram: model.text().nullable(),
  social_linkedin: model.text().nullable(),
  social_twitter: model.text().nullable(),
  social_facebook: model.text().nullable(),
  social_youtube: model.text().nullable(),

  // ── Schema ────────────────────────────────────
  organization_schema: model.text().nullable(),  // auto-generated JSON-LD
})

export default SiteSetting