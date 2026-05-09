import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260420102937 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "post" drop column if exists "category", drop column if exists "date", drop column if exists "cover_image", drop column if exists "author", drop column if exists "author_image", drop column if exists "published";`);

    this.addSql(`alter table if exists "post" add column if not exists "status" text not null default 'draft', add column if not exists "author_name" text null, add column if not exists "category_id" text null, add column if not exists "featured_image" text null, add column if not exists "published_at" timestamptz null;`);
    this.addSql(`alter table if exists "post" alter column "excerpt" type text using ("excerpt"::text);`);
    this.addSql(`alter table if exists "post" alter column "excerpt" drop not null;`);
    this.addSql(`alter table if exists "post" alter column "content" type text using ("content"::text);`);
    this.addSql(`alter table if exists "post" alter column "content" drop not null;`);
    this.addSql(`do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'post' and column_name = 'images'
  ) and not exists (
    select 1 from information_schema.columns
    where table_name = 'post' and column_name = 'image_urls'
  ) then
    alter table "post" rename column "images" to "image_urls";
  end if;
end $$;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "post" drop column if exists "status", drop column if exists "author_name", drop column if exists "category_id", drop column if exists "featured_image", drop column if exists "published_at";`);

    this.addSql(`alter table if exists "post" add column if not exists "category" text not null, add column if not exists "date" text not null, add column if not exists "cover_image" text null, add column if not exists "author" text null, add column if not exists "author_image" text null, add column if not exists "published" boolean not null default false;`);
    this.addSql(`alter table if exists "post" alter column "excerpt" type text using ("excerpt"::text);`);
    this.addSql(`alter table if exists "post" alter column "excerpt" set not null;`);
    this.addSql(`alter table if exists "post" alter column "content" type text using ("content"::text);`);
    this.addSql(`alter table if exists "post" alter column "content" set not null;`);
    this.addSql(`alter table if exists "post" rename column "image_urls" to "images";`);
  }

}
