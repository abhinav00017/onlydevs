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

## 2026-11-15 (build of "Real photos + floating UI", awaiting Abhinav's photo approval)

- WebGL removed: components/three, three, @react-three/fiber, @react-three/drei and @types/three are gone. The scenes are now components/visuals (HeroScene, FixScene, CalmScene, KitBlocks), in HTML and CSS with motion.
- Eight Unsplash photos, all checked as "Unsplash License" (no Unsplash+), listed in lib/photos.ts. Loaded through next/image from images.unsplash.com only, at one fixed source size. No image files in the repo.
- The hero photo uses next/image `preload` (Next 16 renamed `priority` to `preload`). No other photo preloads.
- 15 Nov 2026: Abhinav: the photo version is good but not exciting. He chose ONE "wow" moment at the top of the home page: a real-looking 3D device (generic phone and laptop, not an iPhone) with our app running live on its screen (orders, bookings, leads arriving), turning as you scroll and switching verticals, plus a changing headline. 3D is allowed only for this hero device, loaded after the text; phones and reduce-motion get a flat device with the same living UI. Everything else stays photos plus floating UI.

## 2026-11-15 (Abhinav, via the main session, during the hero device build)

- The 3D must look natural, like a real product photo or render, never toy-like: realistic proportions, tight bevels, physical materials (clearcoat glass, satin metal, dark glass bezel), ACES or AgX tone mapping, a soft grounded contact shadow, calm eased motion. If it still reads as a toy, say so honestly instead of shipping it.
- Quality bar: oryzo.ai, lusion.co/about, the learnwithzero.com hero. Product-photography light, a subtle surface under the devices with a soft shadow and a hint of reflection. If procedural geometry cannot reach that bar, say so and recommend a licensed CC0/CC-BY device model, to be asked of Abhinav before any download.
- The hero is full-bleed: edge to edge, the whole first screen (100vw by 100svh), no side gutters, no rounded box. The 3D scene (the flat device on phones) is the stage; the headline, subline and two buttons sit over it, with a soft wash behind the words.
- The header sits on top of the hero: see-through at the top of the page, solid once you scroll.
- The photo sections below are full-width too: photos run to the screen edges, with the floating UI cards and the words over or beside them. Text columns keep a readable width.

## 2026-11-15 (hero device build notes)

- components/hero (no 3D): the headline turns, the live screens (PhoneUI, LaptopUI), the cycle (cafe, clinic, Business CRM, events), the flat CSS device and the capability check. components/hero3d (three, fiber, drei): the canvas, the procedural devices and the light. Only components/hero/HeroStage.tsx loads it, through next/dynamic with ssr: false. tests/visuals.test.tsx enforces this.
- The live UI is real DOM on the screens (drei Html, transform, occlude "blending"), with a reflection-only glass layer over it.
- HeroScene (the chaos photo) and ChaosStage are no longer on the home page. HeroScene and the hero photo stay in components/visuals and lib/photos.ts for now.
