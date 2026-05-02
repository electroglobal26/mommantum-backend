import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SEO_MODULE } from "../../../../modules/seo"
import SeoModuleService from "../../../../modules/seo/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const seoService: SeoModuleService = req.scope.resolve(SEO_MODULE)
    const [setting] = await seoService.listSiteSettings({})
    res.json({ setting: setting || null })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const seoService: SeoModuleService = req.scope.resolve(SEO_MODULE)
    const body = req.body as any
    const [existing] = await seoService.listSiteSettings({})
    let setting
    if (existing) {
      setting = await seoService.updateSiteSettings({ id: existing.id, ...body } as any)
    } else {
      setting = await seoService.createSiteSettings(body as any)
    }
    res.json({ setting })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}