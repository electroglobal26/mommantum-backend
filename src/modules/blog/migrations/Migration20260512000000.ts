import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260512000000 extends Migration {

  override async up(): Promise<void> {
    // Set DB-level defaults so image_urls and faqs never violate NOT NULL
    this.addSql(`alter table if exists "post" alter column "image_urls" set default '[]';`);
    this.addSql(`alter table if exists "post" alter column "faqs" set default '[]';`);

    // Patch any existing rows that somehow have NULL (safety net)
    this.addSql(`update "post" set "image_urls" = '[]' where "image_urls" is null;`);
    this.addSql(`update "post" set "faqs" = '[]' where "faqs" is null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "post" alter column "image_urls" drop default;`);
    this.addSql(`alter table if exists "post" alter column "faqs" drop default;`);
  }

}
