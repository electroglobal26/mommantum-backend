import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createPostWorkflow } from "../../../../../workflows/blog/create-post"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const n8nApiKey = req.headers["x-n8n-api-key"]
    const isAuthorized = n8nApiKey === process.env.N8N_API_KEY

    if (!isAuthorized) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const body = req.body as any

    if (!body.title) {
      return res.status(400).json({ message: "Title is required" })
    }

    const slug: string = body.slug || body.title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")

    const { result: post } = await createPostWorkflow(req.scope).run({
      input: {
        title:            body.title,
        slug,
        status:           body.status        || "draft",
        author_name:      body.author_name    || null,
        featured_image:   body.featured_image || null,
        image_urls:       body.image_urls     || [],
        excerpt:          body.excerpt        || null,
        content:          body.content        || null,
        published_at:     body.status === "published" ? new Date() : null,
        meta_title:       body.meta_title        || null,
        meta_description: body.meta_description  || null,
        faqs:             body.faqs           || [],
      },
    })

    res.json({ post })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}