import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { BLOG_MODULE } from "../../modules/blog"
import BlogModuleService from "../../modules/blog/service"

type FAQ = { question: string; answer: string }

type CreatePostInput = {
  title: string
  slug: string
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

const createPostStep = createStep(
  "create-post-step",
  async (input: CreatePostInput, { container }) => {
    const blogService: BlogModuleService = container.resolve(BLOG_MODULE)
    const post = await blogService.createPosts(input as any)
    return new StepResponse(post, post.id)
  },
  async (postId: string, { container }) => {
    if (!postId) return
    const blogService: BlogModuleService = container.resolve(BLOG_MODULE)
    await blogService.deletePosts(postId as any)
  }
)

export const createPostWorkflow = createWorkflow(
  "create-post",
  (input: CreatePostInput) => {
    const post = createPostStep(input)
    return new WorkflowResponse(post)
  }
)