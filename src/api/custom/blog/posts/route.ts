import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BLOG_MODULE } from "../../../../modules/blog"
import BlogModuleService from "../../../../modules/blog/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const blogService: BlogModuleService = req.scope.resolve(BLOG_MODULE)
    const posts = await blogService.listPosts(
      {},
      { order: { created_at: "DESC" } }
    )
    res.json({ posts })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}