import { model } from "@medusajs/framework/utils"

const SeoSetting = model.define("seo_setting", {
  id: model.id().primaryKey(),

  // Page identifier — unique per page
  page_key: model.text().unique(),
  page_label: model.text(),

  // ── Core SEO ──────────────────────────────────
  meta_title: model.text().nullable(),
  meta_description: model.text().nullable(),
  slug: model.text().nullable(),
  canonical_url: model.text().nullable(),
  robots_index: model.boolean().default(true),
  robots_follow: model.boolean().default(true),
  primary_keyword: model.text().nullable(),
  secondary_keywords: model.json().nullable(),  // string[]
  meta_keywords: model.text().nullable(),

  // ── Open Graph ────────────────────────────────
  og_title: model.text().nullable(),
  og_description: model.text().nullable(),
  og_image: model.text().nullable(),
  og_url: model.text().nullable(),
  og_type: model.text().nullable(),

  // ── Twitter ───────────────────────────────────
  twitter_card: model.text().nullable(),
  twitter_title: model.text().nullable(),
  twitter_description: model.text().nullable(),
  twitter_image: model.text().nullable(),

  // ── Schema ────────────────────────────────────
  schema_type: model.text().nullable(),
  schema_json: model.text().nullable(),

  // ── Page Specific ─────────────────────────────
  hero_title: model.text().nullable(),
  hero_subtitle: model.text().nullable(),
  page_title: model.text().nullable(),
  page_description: model.text().nullable(),
  content_body: model.text().nullable(),
  faq_section: model.json().nullable(),      // {question, answer}[]
  internal_links: model.json().nullable(),   // {page, anchor}[]

  // ── Technical SEO ─────────────────────────────
  sitemap_inclusion: model.boolean().default(true),
  hreflang: model.text().nullable(),
  redirect_url: model.text().nullable(),
  last_updated: model.dateTime().nullable(),
})

export default SeoSetting
