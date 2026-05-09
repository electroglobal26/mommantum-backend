import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260509000000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "seo_setting" ("id" text not null, "page_key" text not null, "page_label" text not null, "meta_title" text null, "meta_description" text null, "slug" text null, "canonical_url" text null, "robots_index" boolean not null default true, "robots_follow" boolean not null default true, "primary_keyword" text null, "secondary_keywords" jsonb null, "meta_keywords" text null, "og_title" text null, "og_description" text null, "og_image" text null, "og_url" text null, "og_type" text null, "twitter_card" text null, "twitter_title" text null, "twitter_description" text null, "twitter_image" text null, "schema_type" text null, "schema_json" text null, "hero_title" text null, "hero_subtitle" text null, "page_title" text null, "page_description" text null, "content_body" text null, "faq_section" jsonb null, "internal_links" jsonb null, "sitemap_inclusion" boolean not null default true, "hreflang" text null, "redirect_url" text null, "last_updated" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "seo_setting_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_seo_setting_page_key_unique" ON "seo_setting" ("page_key") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_seo_setting_deleted_at" ON "seo_setting" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "site_setting" ("id" text not null, "site_name" text null, "site_url" text null, "logo_url" text null, "favicon_url" text null, "brand_name" text null, "company_name" text null, "founder_name" text null, "contact_email" text null, "contact_phone" text null, "address" text null, "social_instagram" text null, "social_linkedin" text null, "social_twitter" text null, "social_facebook" text null, "social_youtube" text null, "organization_schema" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "site_setting_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_site_setting_deleted_at" ON "site_setting" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "site_setting" cascade;`);
    this.addSql(`drop table if exists "seo_setting" cascade;`);
  }

}
