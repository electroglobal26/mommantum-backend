import { defineRouteConfig } from "@medusajs/admin-sdk"
import { DocumentText } from "@medusajs/icons"
import {
  Button, Container, Heading,
  Table, Badge, usePrompt,
} from "@medusajs/ui"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

const BlogListPage = () => {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const prompt = usePrompt()
  const navigate = useNavigate()

  useEffect(() => { fetchPosts() }, [])

  async function fetchPosts() {
    const res = await fetch("/admin/blog/posts", { credentials: "include" })
    const data = await res.json()
    setPosts(data.posts || [])
    setLoading(false)
  }

  async function handleDelete(id: string, title: string) {
    const ok = await prompt({
      title: "Delete Post",
      description: `Delete "${title}"? This cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
    })
    if (!ok) return
    await fetch(`/admin/blog/posts/${id}`, {
      method: "DELETE",
      credentials: "include",
    })
    setPosts((prev) => prev.filter((p) => p.id !== id))
  }

  async function togglePublish(post: any) {
    const res = await fetch(`/admin/blog/posts/${post.id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !post.published }),
    })
    const data = await res.json()
    setPosts((prev) => prev.map((p) => p.id === post.id ? data.post : p))
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">Blog Posts</Heading>
          <p className="text-ui-fg-subtle text-sm mt-1">
            {posts.length} total posts
          </p>
        </div>
        <Button size="small" onClick={() => navigate("/blog/new")}>
          + New Post
        </Button>
      </div>

      {loading ? (
        <div className="px-6 py-10 text-center text-ui-fg-subtle">
          Loading posts...
        </div>
      ) : posts.length === 0 ? (
        <div className="px-6 py-10 text-center text-ui-fg-subtle">
          No posts yet.{" "}
          <button
            className="text-ui-fg-interactive underline"
            onClick={() => navigate("/blog/new")}
          >
            Create your first post
          </button>
        </div>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Title</Table.HeaderCell>
              <Table.HeaderCell>Category</Table.HeaderCell>
              <Table.HeaderCell>Date</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {posts.map((post) => (
              <Table.Row key={post.id}>
                <Table.Cell className="font-medium max-w-[280px] truncate">
                  {post.title}
                </Table.Cell>
                <Table.Cell>{post.category}</Table.Cell>
                <Table.Cell>{post.date}</Table.Cell>
                <Table.Cell>
                  <Badge color={post.published ? "green" : "grey"}>
                    {post.published ? "Published" : "Draft"}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex gap-2">
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={() => navigate(`/blog/${post.id}`)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={() => togglePublish(post)}
                    >
                      {post.published ? "Unpublish" : "Publish"}
                    </Button>
                    <Button
                      size="small"
                      variant="danger"
                      onClick={() => handleDelete(post.id, post.title)}
                    >
                      Delete
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Blog",
  icon: DocumentText,
})

export default BlogListPage