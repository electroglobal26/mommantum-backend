const BACKEND_URL = "http://localhost:9000"

const posts = [
  {
    title: "Creative Systems for D2C Brands That Actually Scale",
    slug: "creative-systems-for-d2c-brands",
    status: "published",
    category_id: "Strategy",
    author_name: "Kuldeep Ahir",
    featured_image: "",
    image_urls: [],
    excerpt: "Most D2C brands treat creative as a one-off task. The ones that scale treat it as a system. Here's how to build one.",
    content: `<p>Creative is not a campaign. It's a system. The brands that grow consistently are the ones that produce, test, and iterate content at a pace that compounds — not the ones that go viral once and disappear.</p><h2>Why One-Off Creative Fails</h2><p>When creative is disconnected from strategy, it produces noise. You get beautiful content that doesn't convert, or ads that perform once but can't be scaled. The fix is building a repeatable production system tied to real performance signals.</p><h2>The 3-Layer Creative System</h2><p>Layer one is awareness content — broad hooks, emotion-led storytelling. Layer two is consideration content — product demos, social proof, comparisons. Layer three is conversion — urgency, offer clarity, trust signals. Most brands only have layer three.</p><h2>How to Start Building Yours</h2><p>Start with a content audit. Map what you have against the three layers. Identify the biggest gap and fill it first. Build templates so your team can produce at speed. Then test, measure, and iterate every 30 days.</p>`,
    meta_title: "Creative Systems for D2C Brands That Actually Scale",
    meta_description: "Most D2C brands treat creative as a one-off task. The ones that scale treat it as a system. Here's how to build one.",
    faqs: [
      { question: "What is a creative system for D2C brands?", answer: "A creative system is a repeatable framework for producing, testing, and iterating content consistently. Instead of treating each piece of creative as a one-off task, it connects strategy, production, and performance data into a single workflow." },
      { question: "Why do most D2C brands fail at creative?", answer: "Most brands produce creative without a strategy behind it. They create content in isolation from performance data, which means they cannot learn what works and scale it. The fix is building a system that ties creative output to real business signals." },
      { question: "How long does it take to build a creative system?", answer: "A basic creative system can be built in 30 days. Start with a content audit, identify your biggest gap across the three funnel layers, build templates, and commit to a 30-day test and iterate cycle." },
    ],
  },
  {
    title: "5 Performance Marketing Mistakes D2C Brands Keep Making",
    slug: "performance-marketing-mistakes",
    status: "published",
    category_id: "Performance",
    author_name: "Kuldeep Ahir",
    featured_image: "",
    image_urls: [],
    excerpt: "Running ads without a system is just burning money. Here are the five mistakes we see most often — and how to fix them.",
    content: `<p>Performance marketing is not just about spending more on ads. It's about building a system where every rupee spent has a clear job to do. Most brands skip the system and wonder why their ROAS keeps dropping.</p><h2>Mistake 1: No Funnel Clarity</h2><p>Running the same ad to cold and warm audiences is one of the most common mistakes. Cold audiences need awareness. Warm audiences need proof. Hot audiences need a reason to act now. Segment your funnel first.</p><h2>Mistake 2: Ignoring Creative Fatigue</h2><p>Ads decay fast. If you're running the same three creatives for more than three weeks, you're almost certainly leaving money on the table. Build a creative refresh calendar into your system.</p><h2>Mistake 3: Optimising for the Wrong Metric</h2><p>Clicks feel good. Purchases pay bills. Make sure your campaign objective, bidding strategy, and success metric are all aligned to the outcome that actually matters to your business.</p>`,
    meta_title: "5 Performance Marketing Mistakes D2C Brands Keep Making",
    meta_description: "Running ads without a system is just burning money. Here are the five mistakes we see most often — and how to fix them.",
    faqs: [
      { question: "What is the biggest performance marketing mistake D2C brands make?", answer: "Running the same ad to cold and warm audiences without segmenting by funnel stage. Cold audiences need awareness content, warm audiences need social proof, and hot audiences need a strong offer with urgency." },
      { question: "How often should you refresh ad creatives?", answer: "Every 2-3 weeks at minimum. Ad fatigue sets in fast — if your frequency is high and your CTR is dropping, your creative is tired. Build a refresh calendar into your system so you never run out of new content." },
      { question: "What metric should D2C brands optimise for in Meta ads?", answer: "Purchase or add-to-cart events, not clicks or reach. Your campaign objective, bidding strategy, and success metric should all align to the outcome that actually grows revenue." },
    ],
  },
  {
    title: "SEO Strategy That Builds Long-Term Organic Growth",
    slug: "seo-strategy-for-organic-growth",
    status: "published",
    category_id: "SEO",
    author_name: "Kuldeep Ahir",
    featured_image: "",
    image_urls: [],
    excerpt: "Paid traffic stops the moment you stop paying. Here's how to build an SEO foundation that keeps working for years.",
    content: `<p>SEO is the most underinvested channel for most D2C brands. Everyone chases paid performance, but organic traffic compounds over time and delivers the lowest CAC of any channel when done right.</p><h2>Start With Keyword Intent</h2><p>Not all keywords are equal. Informational keywords build awareness. Commercial keywords signal purchase intent. Transactional keywords are ready to convert. Build content mapped to each stage rather than chasing volume alone.</p><h2>Content Depth Beats Content Volume</h2><p>Publishing 50 thin blog posts will not outperform 10 deeply researched, genuinely useful articles. Google rewards depth, topical authority, and content that answers real questions better than anything else.</p><h2>Technical SEO Is the Foundation</h2><p>Fast page load, clean site structure, proper internal linking, and mobile optimisation are table stakes. Before investing in content, make sure your technical foundation is solid.</p>`,
    meta_title: "SEO Strategy That Builds Long-Term Organic Growth",
    meta_description: "Paid traffic stops the moment you stop paying. Here's how to build an SEO foundation that keeps working for years.",
    faqs: [
      { question: "How long does SEO take to show results?", answer: "Most SEO efforts take 3-6 months to show meaningful results. The compounding effect kicks in after 6-12 months when your content starts ranking consistently." },
      { question: "What is keyword intent and why does it matter?", answer: "Keyword intent is the reason behind a search — informational, commercial, or transactional. Matching your content to the right intent means you attract the right visitor at the right stage of their buying journey." },
      { question: "Is technical SEO more important than content SEO?", answer: "Both matter equally. Technical SEO is the foundation — without it, even great content will not rank. Start with technical health, then invest in content depth." },
    ],
  },
  {
    title: "Brand Identity Is More Than a Logo — Here's What It Really Means",
    slug: "brand-identity-beyond-logo",
    status: "published",
    category_id: "Branding",
    author_name: "Kuldeep Ahir",
    featured_image: "",
    image_urls: [],
    excerpt: "A logo is the start of a brand, not the end. The brands people remember have systems — not just symbols.",
    content: `<p>Brand identity is the sum of every touchpoint your customer experiences. The way you write, the colours you use, the tone of your emails, the feel of your packaging — all of it shapes perception more than your logo ever will.</p><h2>The 5 Elements of a Strong Brand System</h2><p>Visual language, verbal identity, brand story, positioning, and consistency across channels. Most brands have two or three. Strong brands have all five.</p><h2>Why Consistency Is the Real Moat</h2><p>Consistency builds recognition. Recognition builds trust. Trust reduces the friction between seeing and buying. The brands that feel premium are almost always just the ones that show up consistently.</p><h2>How to Audit Your Brand Identity</h2><p>Screenshot 20 touchpoints — ads, website, packaging, social posts, emails. Lay them side by side. If they don't feel like they come from the same place, you have an inconsistency problem that no new logo will solve.</p>`,
    meta_title: "Brand Identity Is More Than a Logo",
    meta_description: "A logo is the start of a brand, not the end. The brands people remember have systems — not just symbols.",
    faqs: [
      { question: "What is the difference between a logo and a brand identity?", answer: "A logo is one visual element. A brand identity is the full system — your colour palette, typography, tone of voice, messaging framework, and visual language across every customer touchpoint." },
      { question: "How many elements make up a strong brand system?", answer: "Five core elements: visual language, verbal identity, brand story, positioning, and consistency across all channels. Most brands have two or three. Strong brands have all five working together." },
      { question: "How do you audit your brand identity?", answer: "Screenshot 20 different brand touchpoints — ads, website, emails, packaging, social posts. Lay them side by side. If they do not feel like they come from the same brand, you have an inconsistency problem." },
    ],
  },
  {
    title: "How to Build a UGC Content Strategy That Converts",
    slug: "ugc-content-strategy",
    status: "published",
    category_id: "Creative",
    author_name: "Kuldeep Ahir",
    featured_image: "",
    image_urls: [],
    excerpt: "User-generated content is the most trusted form of marketing. Here's how to build a system that produces it consistently.",
    content: `<p>UGC outperforms branded creative in almost every performance test. It's more trusted, more relatable, and cheaper to produce. But most brands treat it as an afterthought rather than a core part of their creative strategy.</p><h2>What Makes UGC Actually Work</h2><p>The best UGC feels real because it is real. Overly scripted or heavily edited UGC loses the authenticity that makes it work in the first place. Give creators a brief, not a script.</p><h2>Building a Creator Pipeline</h2><p>You don't need macro-influencers. Micro-creators with 5k–50k followers in your niche will outperform celebrity endorsements for most D2C categories. Build relationships, not transactions.</p><h2>How to Repurpose UGC Across Channels</h2><p>A single UGC video can become a paid ad, an organic reel, a website testimonial, an email asset, and a retargeting creative. Build a repurposing workflow so every piece of content works as hard as possible.</p>`,
    meta_title: "How to Build a UGC Content Strategy That Converts",
    meta_description: "User-generated content is the most trusted form of marketing. Here's how to build a system that produces it consistently.",
    faqs: [
      { question: "What makes UGC content perform better than branded content?", answer: "UGC feels real because it is real. Consumers trust other consumers more than they trust brands. Authentic, unpolished content from a real user carries more credibility than a polished brand video." },
      { question: "Do I need big influencers for UGC?", answer: "No. Micro-creators with 5k-50k followers in your niche consistently outperform macro-influencers for D2C brands. The audience is more engaged, the content feels more relatable, and the cost is significantly lower." },
      { question: "How can I repurpose UGC across multiple channels?", answer: "A single UGC video can become a paid ad, an organic reel, a website testimonial, an email asset, and a retargeting creative. Build a repurposing workflow so every piece of content works across as many channels as possible." },
    ],
  },
  {
    title: "Retention Marketing: The Growth Lever Most Brands Ignore",
    slug: "retention-marketing-guide",
    status: "published",
    category_id: "Growth",
    author_name: "Kuldeep Ahir",
    featured_image: "",
    image_urls: [],
    excerpt: "Acquiring a customer costs 5x more than keeping one. Here's how to build a retention system that compounds.",
    content: `<p>Most D2C brands are obsessed with acquisition. New customers, new ads, new campaigns. But the brands with the best unit economics have cracked retention — and that's where the real margin lives.</p><h2>The Retention Stack</h2><p>Email, SMS, WhatsApp, push notifications, loyalty programmes, and subscription models are the core tools. You don't need all of them. You need the right two or three, executed consistently.</p><h2>Segmentation Is Everything</h2><p>Sending the same message to a first-time buyer and a customer who's bought six times is a missed opportunity. Segment by purchase history, category affinity, and recency. Personalisation at this level is not complicated — it's just disciplined.</p><h2>Measuring Retention Properly</h2><p>Track repeat purchase rate, customer lifetime value, and churn rate by cohort. If you're only looking at monthly revenue, you're missing the story. Cohort analysis will tell you exactly where customers drop off — and that's where you intervene.</p>`,
    meta_title: "Retention Marketing: The Growth Lever Most Brands Ignore",
    meta_description: "Acquiring a customer costs 5x more than keeping one. Here's how to build a retention system that compounds.",
    faqs: [
      { question: "Why is retention marketing more valuable than acquisition?", answer: "Acquiring a new customer costs 5x more than retaining an existing one. Retained customers spend more over time, refer others, and have a higher lifetime value. Brands with strong retention have fundamentally better unit economics." },
      { question: "What are the most effective retention marketing channels?", answer: "Email, WhatsApp, and SMS are the highest ROI owned channels for most D2C brands. Pick the right two or three based on where your customers actually engage, and execute them consistently." },
      { question: "How do you measure retention marketing properly?", answer: "Track repeat purchase rate, customer lifetime value, and churn rate broken down by cohort — not just monthly revenue. Cohort analysis tells you exactly when customers drop off and where to intervene." },
    ],
  },
]

async function seed() {
  console.log("Starting blog seed...")

  for (const post of posts) {
    try {
      const res = await fetch(`${BACKEND_URL}/custom/blog/posts/seed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(post),
      })
      const data = await res.json()
      if (data.post) {
        console.log(`✅ Created: ${post.title}`)
      } else {
        console.log(`❌ Failed: ${post.title}`, data)
      }
    } catch (err) {
      console.error(`❌ Error: ${post.title}`, err)
    }
  }

  console.log("Seed complete!")
}

seed()