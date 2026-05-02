import { Button, Input, Label, Textarea } from "@medusajs/ui"

type FAQ = { question: string; answer: string }

type Props = {
  faqs: FAQ[]
  onChange: (faqs: FAQ[]) => void
}

export default function FaqEditor({ faqs, onChange }: Props) {
  function addFaq() {
    onChange([...faqs, { question: "", answer: "" }])
  }

  function removeFaq(index: number) {
    onChange(faqs.filter((_, i) => i !== index))
  }

  function updateFaq(index: number, key: keyof FAQ, value: string) {
    onChange(faqs.map((f, i) => i === index ? { ...f, [key]: value } : f))
  }

  function moveFaq(index: number, direction: "up" | "down") {
    const updated = [...faqs]
    const swapIndex = direction === "up" ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= updated.length) return;
    [updated[index], updated[swapIndex]] = [updated[swapIndex], updated[index]]
    onChange(updated)
  }

  return (
    <div className="flex flex-col gap-4">

      {/* FAQ blocks */}
      {faqs.length === 0 && (
        <div className="rounded-[12px] border-2 border-dashed border-ui-border-base p-8 text-center">
          <p className="text-ui-fg-subtle text-sm">No FAQs yet.</p>
          <p className="text-ui-fg-subtle text-xs mt-1">
            Click "+ Add FAQ" to add your first question.
          </p>
        </div>
      )}

      {faqs.map((faq, i) => (
        <div
          key={i}
          className="rounded-[14px] border border-ui-border-base bg-ui-bg-subtle overflow-hidden"
        >
          {/* FAQ header */}
          <div className="flex items-center justify-between px-4 py-3 bg-ui-bg-base border-b border-ui-border-base">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e61e73] text-[11px] font-extrabold text-white">
                {i + 1}
              </span>
              <p className="text-sm font-semibold text-ui-fg-base">
                {faq.question || `FAQ ${i + 1}`}
              </p>
            </div>

            <div className="flex items-center gap-1">
              {/* Move up */}
              <button
                type="button"
                onClick={() => moveFaq(i, "up")}
                disabled={i === 0}
                className="flex h-7 w-7 items-center justify-center rounded-[6px] text-ui-fg-subtle hover:bg-ui-bg-base-hover disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Move up"
              >
                ↑
              </button>
              {/* Move down */}
              <button
                type="button"
                onClick={() => moveFaq(i, "down")}
                disabled={i === faqs.length - 1}
                className="flex h-7 w-7 items-center justify-center rounded-[6px] text-ui-fg-subtle hover:bg-ui-bg-base-hover disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Move down"
              >
                ↓
              </button>
              {/* Remove */}
              <button
                type="button"
                onClick={() => removeFaq(i)}
                className="flex h-7 w-7 items-center justify-center rounded-[6px] text-red-400 hover:bg-red-50 transition-all"
                title="Remove FAQ"
              >
                ✕
              </button>
            </div>
          </div>

          {/* FAQ fields */}
          <div className="p-4 flex flex-col gap-3">
            <div>
              <Label className="text-[11px] uppercase tracking-[0.06em]">
                Question *
              </Label>
              <Input
                value={faq.question}
                onChange={(e) => updateFaq(i, "question", e.target.value)}
                placeholder="e.g. What is performance marketing?"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-[11px] uppercase tracking-[0.06em]">
                Answer *
              </Label>
              <Textarea
                value={faq.answer}
                onChange={(e) => updateFaq(i, "answer", e.target.value)}
                placeholder="Write a clear and concise answer..."
                rows={3}
                className="mt-1"
              />
            </div>
          </div>
        </div>
      ))}

      {/* Add button */}
      <button
        type="button"
        onClick={addFaq}
        className="flex w-full items-center justify-center gap-2 rounded-[12px] border-2 border-dashed border-ui-border-base py-3 text-[13px] font-semibold text-ui-fg-subtle hover:border-[#e61e73] hover:text-[#e61e73] hover:bg-[#fff5f8] transition-all"
      >
        <span className="text-[18px] leading-none">+</span>
        Add FAQ
      </button>

      {/* Count */}
      {faqs.length > 0 && (
        <p className="text-[12px] text-ui-fg-subtle text-right">
          {faqs.filter(f => f.question && f.answer).length} of {faqs.length} FAQ{faqs.length !== 1 ? "s" : ""} complete
        </p>
      )}
    </div>
  )
}