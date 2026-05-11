import { defineMiddlewares } from "@medusajs/framework/http"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/blog/images",
      methods: ["POST"],
      bodyParser: {
        sizeLimit: "15mb",
      },
    },
  ],
})
