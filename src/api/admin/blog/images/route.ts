import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createClient } from "@supabase/supabase-js"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase.storage
      .from("blog-images")
      .list("", {
        limit: 200,
        offset: 0,
        sortBy: { column: "created_at", order: "desc" },
      })

    if (error) {
      return res.status(500).json({ message: error.message })
    }

    const imageFiles = (data || []).filter((file) =>
      file.name !== ".emptyFolderPlaceholder" &&
      file.name.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i)
    )

    const images = imageFiles.map((file) => ({
      name: file.name,
      url: `${process.env.SUPABASE_URL}/storage/v1/object/public/blog-images/${file.name}`,
      created_at: file.created_at,
    }))

    res.json({ images })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}