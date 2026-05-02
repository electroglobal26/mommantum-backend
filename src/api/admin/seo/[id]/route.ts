import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SEO_MODULE } from "../../../../modules/seo"
import SeoModuleService from "../../../../modules/seo/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const seoService: SeoModuleService = req.scope.resolve(SEO_MODULE)
    const setting = await seoService.retrieveSeoSetting(req.params.id)
    if (!setting) return res.status(404).json({ message: "Not found" })
    res.json({ setting })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

export async function PUT(req: MedusaRequest, res: MedusaResponse) {
  try {
    const seoService: SeoModuleService = req.scope.resolve(SEO_MODULE)
    const body = req.body as any
    const setting = await seoService.updateSeoSettings({
      id: req.params.id,
      ...body,
      last_updated: new Date(),
    } as any)
    res.json({ setting })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}