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
