import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createClient } from "@supabase/supabase-js"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const [servicesRes, workRes] = await Promise.all([
      supabase.from("services").select("title, slug"),
      supabase.from("case_studies").select("title, slug")
    ])

    res.json({
      services: servicesRes.data || [],
      work: workRes.data || []
    })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}
