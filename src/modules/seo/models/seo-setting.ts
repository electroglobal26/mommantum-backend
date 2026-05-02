import { model } from "@medusajs/framework/utils"

const SeoSetting = model.define("seo_setting", {
  id: model.id().primaryKey(),

  // Page identifier
  page_key: model.text(),        // "homepage", "about", "contact", "services", "blog"
  page_label: model.text(),      // "Home Page", "About Us" etc — for display

  // ── Core SEO ──────────────────────────────────
  meta_title: model.text().nullable(),
  meta_description: model.text().nullable(),
  slug: model.text().nullable(),
  canonical_url: model.text().nullable(),
  robots_index: model.boolean().default(true),
  robots_follow: model.boolean().default(true),
  primary_keyword: model.text().nullable(),
  secondary_keywords: model.json(),   // string[]
  meta_keywords: model.text().nullable(),

  // ── Open Graph ────────────────────────────────
  og_title: model.text().nullable(),
  og_description: model.text().nullable(),
  og_image: model.text().nullable(),
  og_url: model.text().nullable(),
  og_type: model.text().nullable(),   // website | article | service

  // ── Twitter ───────────────────────────────────
  twitter_card: model.text().nullable(),
  twitter_title: model.text().nullable(),
  twitter_description: model.text().nullable(),
  twitter_image: model.text().nullable(),

  // ── Schema ────────────────────────────────────
  schema_type: model.text().nullable(),  // WebPage | Article | Service
  schema_json: model.text().nullable(),  // auto-generated JSON-LD string

  // ── Page Specific ─────────────────────────────
  hero_title: model.text().nullable(),
  hero_subtitle: model.text().nullable(),
  page_title: model.text().nullable(),
  page_description: model.text().nullable(),
  content_body: model.text().nullable(),
  faq_section: model.json(),       // [{question, answer}]
  internal_links: model.json(),    // [{page, anchor}]

  // ── Technical SEO ─────────────────────────────
  sitemap_inclusion: model.boolean().default(true),
  hreflang: model.text().nullable(),
  redirect_url: model.text().nullable(),
  last_updated: model.dateTime().nullable(),
})

export default SeoSetting