import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260417062426 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "post" add column if not exists "author" text null, add column if not exists "author_image" text null, add column if not exists "meta_title" text null, add column if not exists "meta_description" text null;`);
    this.addSql(`alter table if exists "post" rename column "intro" to "content";`);
    this.addSql(`alter table if exists "post" rename column "sections" to "faqs";`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "post" drop column if exists "author", drop column if exists "author_image", drop column if exists "meta_title", drop column if exists "meta_description";`);

    this.addSql(`alter table if exists "post" rename column "content" to "intro";`);
    this.addSql(`alter table if exists "post" rename column "faqs" to "sections";`);
  }

}
