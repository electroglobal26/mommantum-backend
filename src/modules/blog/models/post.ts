import { model } from "@medusajs/framework/utils"

const Post = model.define("post", {
  id: model.id().primaryKey(),
  title: model.text(),
  slug: model.text(),
  status: model.text().default("draft"),       // "published" | "draft"
  author_name: model.text().nullable(),
  category_id: model.text().nullable(),        // category name/id
  featured_image: model.text().nullable(),     // main cover image
  image_urls: model.json(),                    // array of extra images
  excerpt: model.text().nullable(),
  content: model.text().nullable(),            // Quill HTML
  published_at: model.dateTime().nullable(),
  meta_title: model.text().nullable(),
  meta_description: model.text().nullable(),
  faqs: model.json(),                          // [{question, answer}]
})

export default Post