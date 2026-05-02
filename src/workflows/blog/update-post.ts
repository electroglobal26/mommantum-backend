import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { BLOG_MODULE } from "../../modules/blog"
import BlogModuleService from "../../modules/blog/service"

type FAQ = { question: string; answer: string }

type UpdatePostInput = {
  id: string
  title?: string
  slug?: string
  status?: string
  author_name?: string | null
  category_id?: string | null
  featured_image?: string | null
  image_urls?: string[]
  excerpt?: string | null
  content?: string | null
  published_at?: Date | null
  meta_title?: string | null
  meta_description?: string | null
  faqs?: FAQ[]
}

const updatePostStep = createStep(
  "update-post-step",
  async (input: UpdatePostInput, { container }) => {
    const blogService: BlogModuleService = container.resolve(BLOG_MODULE)
    const { id, ...data } = input
    const post = await blogService.updatePosts({ id, ...data } as any)
    return new StepResponse(post, post)
  }
)

export const updatePostWorkflow = createWorkflow(
  "update-post",
  (input: UpdatePostInput) => {
    const post = updatePostStep(input)
    return new WorkflowResponse(post)
  }
)