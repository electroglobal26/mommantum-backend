import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { BLOG_MODULE } from "../../modules/blog"
import BlogModuleService from "../../modules/blog/service"

const deletePostStep = createStep(
  "delete-post-step",
  async ({ id }: { id: string }, { container }) => {
    const blogService: BlogModuleService = container.resolve(BLOG_MODULE)
    await blogService.deletePosts(id as any)
    return new StepResponse(null)
  }
)

export const deletePostWorkflow = createWorkflow(
  "delete-post",
  (input: { id: string }) => {
    deletePostStep(input)
    return new WorkflowResponse(null)
  }
)