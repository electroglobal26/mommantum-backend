import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BLOG_MODULE } from "../../../../../modules/blog"
import BlogModuleService from "../../../../../modules/blog/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const blogService: BlogModuleService = req.scope.resolve(BLOG_MODULE)
    const [post] = await blogService.listPosts({
      slug: req.params.slug,
      status: "published",
    })
    if (!post) return res.status(404).json({ message: "Not found" })
    res.json({ post })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}