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

    if (!body.page_key) {
      return res.status(400).json({ message: "page_key is required" })
    }

    const existing = await seoService.listSeoSettings({ page_key: body.page_key })

    const setting = existing.length
      ? await seoService.updateSeoSettings({
          id: existing[0].id,
          ...body,
          last_updated: new Date(),
        } as any)
      : await seoService.createSeoSettings({
          ...body,
          page_label: body.page_label || body.page_key,
          secondary_keywords: body.secondary_keywords ?? null,
          faq_section: body.faq_section ?? null,
          internal_links: body.internal_links ?? null,
          last_updated: new Date(),
        } as any)

    res.json({ setting })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}
