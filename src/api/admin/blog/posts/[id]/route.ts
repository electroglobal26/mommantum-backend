import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BLOG_MODULE } from "../../../../../modules/blog"
import BlogModuleService from "../../../../../modules/blog/service"
import { updatePostWorkflow } from "../../../../../workflows/blog/update-post"
import { deletePostWorkflow } from "../../../../../workflows/blog/delete-post"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const blogService: BlogModuleService = req.scope.resolve(BLOG_MODULE)
    const post = await blogService.retrievePost(req.params.id)
    if (!post) return res.status(404).json({ message: "Not found" })
    res.json({ post })
  } catch {
    res.status(500).json({ message: "Server error" })
  }
}

export async function PUT(req: MedusaRequest, res: MedusaResponse) {
  try {
    const body = req.body as any

    const updateInput: any = {
      id: req.params.id,
      title: body.title,
      slug: body.slug,
      status: body.status,
      author_name: body.author_name || null,
      category_id: body.category_id || null,
      featured_image: body.featured_image || null,
      image_urls: body.image_urls || [],
      excerpt: body.excerpt || null,
      content: body.content || null,
      meta_title: body.meta_title || null,
      meta_description: body.meta_description || null,
      faqs: body.faqs || [],
    }

    // Only set published_at if status is published and not already set
    if (body.status === "published") {
      updateInput.published_at = body.published_at || new Date().toISOString()
    } else {
      updateInput.published_at = null
    }

    const { result: post } = await updatePostWorkflow(req.scope).run({
      input: updateInput,
    })

    res.json({ post })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  try {
    await deletePostWorkflow(req.scope).run({
      input: { id: req.params.id },
    })
    res.json({ message: "Deleted" })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}