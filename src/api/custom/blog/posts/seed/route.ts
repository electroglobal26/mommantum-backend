import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createPostWorkflow } from "../../../../../workflows/blog/create-post"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = req.body as any

  try {
    const { result: post } = await createPostWorkflow(req.scope).run({
      input: {
        title: body.title,
        slug: body.slug,
        status: body.status || "published",
        author_name: body.author_name || null,
        category_id: body.category_id || null,
        featured_image: body.featured_image || null,
        image_urls: body.image_urls || [],
        excerpt: body.excerpt || null,
        content: body.content || null,
        published_at: body.status === "published" ? new Date() : null,
        meta_title: body.meta_title || null,
        meta_description: body.meta_description || null,
        faqs: body.faqs || [],
      },
    })

    res.json({ post })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}