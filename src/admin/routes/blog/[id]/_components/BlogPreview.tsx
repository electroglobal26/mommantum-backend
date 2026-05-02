type FAQ = { question: string; answer: string }

type PreviewProps = {
  title: string
  category_id: string
  author_name: string
  featured_image: string
  excerpt: string
  content: string
  faqs: FAQ[]
  published_at?: string
}

export default function BlogPreview({
  title,
  category_id,
  author_name,
  featured_image,
  excerpt,
  content,
  faqs,
  published_at,
}: PreviewProps) {
  return (
    <div className="rounded-[16px] border border-ui-border-base bg-[#f8f9fa] overflow-hidden">

      {/* Preview header */}
      <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-ui-border-base">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-400" />
          <div className="h-3 w-3 rounded-full bg-yellow-400" />
          <div className="h-3 w-3 rounded-full bg-green-400" />
        </div>
        <p className="text-xs text-ui-fg-subtle font-medium">
          Preview — mommantum.com/blog/{title?.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || "post-slug"}
        </p>
        <div className="w-16" />
      </div>

      {/* Preview content */}
      <div className="overflow-y-auto max-h-[600px] bg-[#f3f4f6] p-4">
        <div className="mx-auto max-w-[680px] bg-white rounded-[16px] overflow-hidden shadow-sm">

          {/* Cover image */}
          {featured_image ? (
            <img
              src={featured_image}
              alt={title}
              className="w-full aspect-video object-cover"
            />
          ) : (
            <div className="w-full aspect-video bg-gradient-to-br from-[#0e2547] to-[#e61e73] flex items-center justify-center">
              <p className="text-white/40 text-sm">No cover image</p>
            </div>
          )}

          <div className="p-6">
            {/* Category + date */}
            <div className="flex items-center gap-3 mb-3">
              {category_id && (
                <span className="text-[13px] font-bold text-[#e61e73]">
                  {category_id}
                </span>
              )}
              {category_id && published_at && (
                <span className="h-1 w-1 rounded-full bg-slate-300" />
              )}
              {published_at && (
                <span className="text-[12px] text-slate-400 uppercase tracking-wider">
                  {new Date(published_at).toLocaleDateString("en-IN", {
                    year: "numeric", month: "long", day: "numeric",
                  })}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 style={{
              fontSize: "26px",
              fontWeight: 800,
              color: "#0e2547",
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
              marginBottom: "12px",
            }}>
              {title || "Post Title"}
            </h1>

            {/* Author */}
            {author_name && (
              <div className="flex items-center gap-2 mb-4">
                <div className="h-7 w-7 rounded-full bg-[#0e2547] flex items-center justify-center">
                  <span className="text-white text-[11px] font-bold">
                    {author_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-[13px] font-semibold text-slate-600">
                  {author_name}
                </span>
                <span className="text-[12px] text-slate-400">· Mommantum</span>
              </div>
            )}

            {/* Excerpt */}
            {excerpt && (
              <p style={{
                fontSize: "15px",
                lineHeight: 1.8,
                color: "#64748b",
                marginBottom: "16px",
                paddingBottom: "16px",
                borderBottom: "1px solid #f1f5f9",
              }}>
                {excerpt}
              </p>
            )}

            {/* Content */}
            {content ? (
              <>
                <style>{`
                  .preview-content h2 { font-size: 20px; font-weight: 800; color: #0e2547; margin: 20px 0 8px; }
                  .preview-content h3 { font-size: 17px; font-weight: 700; color: #0e2547; margin: 16px 0 6px; }
                  .preview-content p { font-size: 14px; line-height: 1.85; color: #64748b; margin: 8px 0; }
                  .preview-content strong { font-weight: 700; color: #0e2547; }
                  .preview-content ul { list-style: none; padding: 0; margin: 12px 0; }
                  .preview-content ul li { display: flex; align-items: flex-start; gap: 8px; font-size: 14px; line-height: 1.75; color: #64748b; margin: 6px 0; }
                  .preview-content ul li::before { content: ""; display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #e61e73; flex-shrink: 0; margin-top: 8px; }
                  .preview-content ol { padding-left: 20px; margin: 12px 0; }
                  .preview-content ol li { font-size: 14px; line-height: 1.75; color: #64748b; margin: 6px 0; }
                  .preview-content blockquote { border-left: 3px solid #e61e73; padding: 8px 16px; margin: 16px 0; background: #fff5f8; border-radius: 0 6px 6px 0; color: #64748b; font-size: 14px; }
                  .preview-content a { color: #e61e73; }
                  .preview-content img { max-width: 100%; border-radius: 10px; margin: 12px 0; display: block; }
                  .preview-content .ql-align-center { text-align: center; }
                  .preview-content .ql-align-right { text-align: right; }
                `}</style>
                <div
                  className="preview-content"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </>
            ) : (
              <p className="text-sm text-slate-400 italic">
                No content yet — start writing in the editor above
              </p>
            )}

            {/* FAQs preview */}
            {faqs && faqs.filter(f => f.question).length > 0 && (
              <div style={{ marginTop: "24px", borderTop: "1px solid #f1f5f9", paddingTop: "20px" }}>
                <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#0e2547", marginBottom: "14px" }}>
                  Frequently Asked Questions
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {faqs.filter(f => f.question).map((faq, i) => (
                    <div key={i} style={{
                      background: "#f9fafb",
                      borderRadius: "10px",
                      padding: "14px",
                      border: "1px solid #f1f5f9",
                    }}>
                      <p style={{ fontSize: "14px", fontWeight: 700, color: "#0e2547", marginBottom: "6px" }}>
                        {faq.question}
                      </p>
                      <p style={{ fontSize: "13px", lineHeight: 1.7, color: "#64748b" }}>
                        {faq.answer || "No answer yet"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}