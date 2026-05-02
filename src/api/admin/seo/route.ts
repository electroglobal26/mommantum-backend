import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SEO_MODULE } from "../../../modules/seo"
import SeoModuleService from "../../../modules/seo/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const seoService: SeoModuleService = req.scope.resolve(SEO_MODULE)
    const settings = await seoService.listSeoSettings({}, { order: { page_key: "ASC" } })
    res.json({ settings })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const seoService: SeoModuleService = req.scope.resolve(SEO_MODULE)
    const body = req.body as any
    const setting = await seoService.createSeoSettings(body as any)
    res.json({ setting })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}