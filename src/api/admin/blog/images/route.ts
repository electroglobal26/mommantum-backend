import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createClient } from "@supabase/supabase-js"
import { Buffer } from "buffer"

const BLOG_IMAGES_BUCKET = "blog-images"

function getSupabaseClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function sanitizeFileName(name: string) {
  const extension = name.split(".").pop()?.toLowerCase() || "webp"
  const baseName = name
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)

  return `${baseName || "blog-image"}-${Date.now()}.${extension}`
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase.storage
      .from(BLOG_IMAGES_BUCKET)
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
      url: `${process.env.SUPABASE_URL}/storage/v1/object/public/${BLOG_IMAGES_BUCKET}/${file.name}`,
      created_at: file.created_at,
    }))

    res.json({ images })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const body = req.body as {
      name?: string
      type?: string
      data?: string
    }

    if (!body?.name || !body?.type || !body?.data) {
      return res.status(400).json({ message: "Image file is required" })
    }

    if (!body.type.startsWith("image/")) {
      return res.status(400).json({ message: "Only image files are allowed" })
    }

    const supabase = getSupabaseClient()
    const path = sanitizeFileName(body.name)
    const bytes = Buffer.from(body.data, "base64")

    const { error } = await supabase.storage
      .from(BLOG_IMAGES_BUCKET)
      .upload(path, bytes, {
        contentType: body.type,
        upsert: false,
      })

    if (error) {
      return res.status(500).json({ message: error.message })
    }

    res.json({
      name: path,
      url: `${process.env.SUPABASE_URL}/storage/v1/object/public/${BLOG_IMAGES_BUCKET}/${path}`,
    })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { name } = req.query as { name?: string }

    if (!name) {
      return res.status(400).json({ message: "Image name is required" })
    }

    const supabase = getSupabaseClient()
    const { error } = await supabase.storage
      .from(BLOG_IMAGES_BUCKET)
      .remove([name])

    if (error) {
      return res.status(500).json({ message: error.message })
    }

    res.json({ message: "Image deleted successfully" })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}
