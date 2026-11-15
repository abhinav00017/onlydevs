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
- 15 Nov 2026: Abhinav likes the current photo hero too (the first screen of the home page). The 3D device hero is being tried on a separate branch; if he prefers the photo hero, it stays. Show him the 3D hero side by side before choosing.
- 15 Nov 2026: Abhinav: the hero 3D must look natural, like real product photography (realistic proportions, glass and metal, reflections, soft shadow, calm eased motion). If it still reads as a toy, it does not ship.
- 15 Nov 2026: Abhinav: like the reference sites, the site goes edge to edge. The hero fills the whole first screen (full width and height, no side gutters or rounded box), with the text over it and a header that starts transparent. Photo sections below also run full width to the screen edges. Paragraph text keeps a readable width.
- 15 Nov 2026: Vercel project "onlydevs" created (team abhinav00017s-projects). Main (1d6a545, the photo version) was deployed to https://onlydevs-swart.vercel.app just before Abhinav said "deploy after my walk". It is a test address only: onlydevs.co.in is NOT moved and DNS is untouched until he is back. Vercel could not connect the GitHub repo (the Vercel GitHub app is not installed), so pushes do not deploy; deploy with the CLI.
- 15 Nov 2026 (decision while Abhinav was on a walk): the 3D hero (branch worktree-agent-a08900b480a1e690c, 3b19a14) is not merged yet. Main-session review found two bugs: device screens go blank once the stage turns on scroll, and the transparent header overlaps the hero text on scroll. Sent back for fixes. Main stays on the photo version until the 3D hero is fixed and Abhinav picks between them.
- 15 Nov 2026 (walk decisions): the 3D hero branch was fixed and re-checked (dac4086: screens never blank on scroll, header solid on scroll and after a mid-page reload, no empty hero on slow loads, flat device fallback after 8 s). It stays unmerged until Abhinav compares it with the photo hero: photo version (main) on localhost:3480, 3D version (branch) on localhost:3481. The 3D branch also makes the photo sections full width.
- 15 Nov 2026: Abhinav reviewed the 3D hero on a wide screen: the content (logo, headline, devices, buttons) sat in a centred column with big empty sides. Edge to edge means the content too: header, hero and bottom bar go full width with small fluid side padding, the devices fill most of the hero and may bleed off the right edge. Abhinav has not yet chosen between the photo hero and the 3D hero; do not treat earlier clicks as a choice.
- 15 Nov 2026: Abhinav doesn't like the photo captions ("A cafe counter", "A clinic front desk", and so on). Removed from every photo, in both the photo and 3D versions. Photos carry no name labels.
- 15 Nov 2026: Abhinav: the 3D hero's scroll animation was not visible because the hero scrolled away. The hero becomes a pinned scroll scene on desktop and tablet (about 3 screens of scroll, one vertical per quarter, headline in sync, then it releases). Phones and reduce-motion: no pin.
- 15 Nov 2026: Abhinav: scrolling the pinned hero showed too little visible change. Each step becomes a clear cinematic moment: camera swings per step (phone hero for Clinic, push-in on the laptop for CRM, low angle and ticket-scan turn for Events, pull back on release), screens swipe instead of fading, a huge soft vertical word behind the devices per step, and a subtle colour glow shift. The headline order now starts with "Paper orders → online orders." to match Cafe first.
- 15 Nov 2026: Abhinav: we deploy the 3D hero version (after the cinematic scroll update and his look). Ogi goes on the company site as a working chat in company mode (answers about onlydevs, its services, verticals, products and how pricing works; helps book a free call). Shown as a chat button and chat panel, never the octopus. It reuses the Ogi engine and its locks from the demo hub, with an onlydevs profile.

## 2026-11-15 (Ogi on the company site, build defaults set by the build agent; Abhinav can change them)

- The engine is ported from the demo hub into lib/ogi (one model connector, profiles as data, page allow-list ["onlydevs"], visitor role only, deny-by-default tools, strict Zod request, 20 s model limit, plain text, reply check, redacted logs, per-IP rate limit, "Ogi is resting" with no key). No emergency check: that is a clinic rule.
- Tools: site_info(topic), suggest_kit(kind), book_call(kind, blocks?). The visitor's kind of business is a field named `kind`, so no tool field is called business, page or role. book_call only builds a /book link with lib/kit.ts; it creates nothing.
- The reply check blocks other companies' and demo businesses' names, any phone number, any money or currency, any email but onlydevs2002@gmail.com, links outside the site and the demo hub, made-up numbers ("50+", "99%") and timelines in numbers. ShowSalsa and Google are allowed (our demo's name, and the "Google profile" service).
- The chat copy lives in lib/content.ts as PRODUCTS.ogi.chat. The button is a purple circle with a white chat icon, 1rem above the bottom bar; the panel opens above the button and its code loads only on first open (or hover). Hidden on /book.
- 15 Nov 2026: Abhinav saw the hero load as a flat phone first, then swap to the 3D laptop and phone. Desktop now shows a still poster of the same 3D scene (our own render) first and fades the live 3D over it; the flat device stays only for phones, reduce-motion and no WebGL.

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

## 2026-11-15 (Abhinav, via the main session: the pinned hero)

- The hero is a pinned scroll scene on desktops and tablets (360svh tall, sticky stage). Phones and "reduce motion" are not pinned.
- Each business is a clear, cinematic shot, eased like a product film, no bounce: Cafe (front three-quarter), Clinic (camera swings right, the phone is the hero, the laptop steps back into shadow), Business CRM (camera swings left and pushes in on the laptop's screen), Events (a lower angle, the phone turned to the viewer like a ticket), then a calm wide shot as the pin releases.
- Screens change with a directional swipe; a huge, soft word per business sits behind the devices; a soft purple glow shifts per business.
- Headline turns, in order with the businesses: Paper orders, Forgotten visits, Lost leads, Missed calls.
- No shape change while loading: desktops and tablets show a poster of our own 3D scene at step 0, lined up with the canvas, and the live 3D fades in over it. If the 3D cannot run or fails, the poster stays. The flat CSS device is only for phones, "reduce motion" and no WebGL. Regenerate the poster with `npm run hero:poster` whenever the scene or its first shot changes.
- 15 Nov 2026: deployed ca9b964 (cinematic 3D hero + Ogi company chat) to Vercel project onlydevs, live at https://onlydevs-swart.vercel.app. Clean-copy gates: tsc, eslint, 161 tests, build. GEMINI_API_KEY added to production (sensitive, copied from the demo hub key, never printed). Live checks: all 14 routes 200; Ogi awake and answering in 1-2 s (what we do, price on call, real estate booking with the suggested kit).
- 15 Nov 2026: onlydevs.co.in and www.onlydevs.co.in moved to project onlydevs (vercel domains add --force); demos.onlydevs.co.in stays on od-demo. All three wait for DNS: the domain still uses the .in registry's default nameservers. Easiest: set the nameservers at GoDaddy to ns1.vercel-dns.com and ns2.vercel-dns.com. Or records: A @ 216.198.79.1 and 64.29.17.1; CNAME www -> b618f2e78bf1e665.vercel-dns-017.com.; CNAME demos -> 921ee978371cc53c.vercel-dns-017.com.
