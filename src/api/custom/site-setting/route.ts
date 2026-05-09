// src/api/custom/site-setting/route.ts
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SEO_MODULE } from "../../../modules/seo"
import SeoModuleService from "../../../modules/seo/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const seoService: SeoModuleService = req.scope.resolve(SEO_MODULE)
    const results = await seoService.listSiteSettings()
    res.json({ setting: results[0] || null })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

export async function PUT(req: MedusaRequest, res: MedusaResponse) {
  res.status(405).json({ message: "Method not allowed" })
}
