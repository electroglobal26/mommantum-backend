// src/api/custom/seo/route.ts
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SEO_MODULE } from "../../../modules/seo"
import SeoModuleService from "../../../modules/seo/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const seoService: SeoModuleService = req.scope.resolve(SEO_MODULE)
    const { page_key } = req.query as { page_key?: string }

    const filter = page_key ? { page_key } : {}
    const settings = await seoService.listSeoSettings(filter)

    res.json({ settings })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  res.status(405).json({ message: "Method not allowed" })
}
