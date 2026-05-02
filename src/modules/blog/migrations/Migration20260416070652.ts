import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260416070652 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "post" ("id" text not null, "title" text not null, "slug" text not null, "category" text not null, "date" text not null, "cover_image" text null, "images" jsonb not null, "excerpt" text not null, "intro" text not null, "sections" jsonb not null, "published" boolean not null default false, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "post_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_post_deleted_at" ON "post" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "post" cascade;`);
  }

}
