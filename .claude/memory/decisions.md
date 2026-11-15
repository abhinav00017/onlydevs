---
name: decisions
description: Every product and tech decision for the onlydevs company site, dated. Append, never rewrite.
metadata:
  type: project
---

# Decisions

## 2026-11-15 (carried over from the demo hub chat)

- Domain onlydevs.co.in (GoDaddy). One domain, separate projects: this site gets the main domain; the demo hub moves to demos.onlydevs.co.in. DNS is set up later; the site comes first. Exact records are in the demo hub's .claude/memory/hosting.md.
- References: wajo.ai, learnwithzero.com, manishkr.xyz, craft.gustavofior.com, lusion.co/about, oryzo.ai for look and feel; software studios that build for clients (Codewave, rtCamp, Ideas2IT, Wednesday) and ticketing platforms (Ticket Tailor, Eventbrite, KonfHub) for content. Inspiration only; the site is original. Wix Studio is not a reference.
- Direction: "Stress to stress-free" in real 3D, with Ogi as the guide and a "Build your kit" builder. Spec: docs/storyboard.html.
- Many verticals equally. "Business CRM", never tile showrooms. WhatsApp only as one reminder channel.
- The founders speak as "the founders"; the note is in the storyboard, approved.
- Contact: onlydevs2002@gmail.com only. No phone, no city. Pricing: price on call.
- The ticketing product is "our ticketing platform"; ShowSalsa is only the demo's name.
- Repo: github.com/abhinav00017/onlydevs, created by Abhinav, cloned to ~/passion-projects/onlydevs.

## 2026-11-15 (build defaults, set by the main session; Abhinav can change them)

- Stack: Next.js 16.4.2, React 19.3, Tailwind v4, React Three Fiber + drei + three, motion, Zod, Vitest. Same versions as the demo hub where they overlap.
- "Book a free call" form: until an email-sending key exists for this project, the form opens the visitor's email app with a prefilled message to onlydevs2002@gmail.com. A server email sender comes later.
- Ogi on this site in v1: the 3D/plush mascot and a "Try Ogi live" link to the clinic demo. A live company-mode chat comes later (it needs the Ogi engine from the demo hub).
- Demo links point to https://od-demo-lyart.vercel.app until demos.onlydevs.co.in is live. One constant in lib/site.ts.

## 2026-11-15 (Ogi's role, from Abhinav via the main session)

- Ogi is not the site's guide and is not central. It appears only as one of our two products: on the home page Products section and on /products, as "an AI assistant for your website", shown with a mock chat card, not the mascot. "Try Ogi live" links to the clinic demo. No Ogi in the hero, fix scenes, stress-free frame, vertical cards, kit builder, end frame, header or bottom bar. Pages do not use Ogi3D or Ogi3DFallback. This overrides the storyboard's "Ogi as the guide".

## 2026-11-15 (Abhinav, during the build, main session log)

- Ogi is NOT the guide and NOT central on the company site, and there is NO 3D Ogi. Abhinav finds the plush Ogi's shape odd (its round shapes can read as a body). The 3D stars are the everyday clutter and the service objects only. Ogi appears only as one of our two products (an AI assistant for your website), shown as a chat-preview UI, not the mascot. No rounded paired shapes in any 3D that could read as a body. Whether to redesign Ogi's look is open.
- 15 Nov 2026: the code-built 3D looked unnatural (toy-like primitives, flat materials, no real lighting) and its runtime is about 243 KB gzip. Abhinav chose "Real photos + floating UI": real photos of business moments (cafe counter, clinic desk, site visit, event crowd, sales desk) with our actual app screens floating over them in soft depth as you scroll. No WebGL; CSS depth and motion only. The 3D branch (7115a1a) is not merged; only reusable ideas (reduced-motion handling, kit block logic) may be kept.
- 15 Nov 2026: the audience is global, not India-only. Photos and copy must look premium ("posh") and suit foreign clients too. Never fix anything to India.
- 15 Nov 2026 (main session default): photos are free-licence stock (Unsplash), loaded from Unsplash's image service (no files downloaded into the repo), shown to Abhinav for approval before going live.
