---
name: awesome-design
description: Build UI in a specific real brand's visual language — Apple, Stripe, Notion, Linear, Vercel, Figma, Tesla, Nike, Spotify, Claude and 64 others. Use when the user names a brand or product as the look to hit ("make it look like Linear", "Stripe-style pricing page", "Apple landing page"), asks to match an existing product's aesthetic, or wants a design system to build against. 74 brand systems as markdown, MIT, from VoltAgent/awesome-design-md.
---

# awesome-design

74 brand design systems, each a self-contained `DESIGN.md` covering palette, type scale,
spacing, motion, component patterns and voice.

## How to use this

1. Match the user's brand to a folder in the index below.
2. Read **exactly one** file: `design-md/<brand>/DESIGN.md`.
3. Build against it.

**Read one file. Never glob the directory.** Average `DESIGN.md` is ~30 KB, largest is 45 KB
(`mintlify`). All 74 is 2.3 MB — loading even a handful will blow out the context for no gain, since
mixing brand systems produces exactly the templated mush you were trying to avoid.

If the user names no brand, don't pick one. Ask, or use `design-taste-frontend` instead — that skill
is for designing well with no brand to copy. This one is for hitting a *specific* known look. They
compose in one direction only: pick the brand system first, then use taste rules to fill the gaps it
does not cover.

If the brand they want isn't here, say so plainly and offer the closest neighbour rather than
silently substituting.

## Index

Each name is a directory under `design-md/`, containing `DESIGN.md` and a `README.md`.

**Tech / dev tools** — `clickhouse` `composio` `cursor` `expo` `framer` `hashicorp` `lovable`
`mintlify` `mongodb` `ollama` `opencode.ai` `posthog` `raycast` `replicate` `resend` `sanity`
`sentry` `supabase` `vercel` `voltagent` `warp` `webflow` `zapier`

**AI** — `claude` `cohere` `elevenlabs` `minimax` `mistral.ai` `runwayml` `together.ai` `x.ai`

**Product / SaaS** — `airtable` `cal` `clay` `figma` `intercom` `linear.app` `miro` `notion`
`slack` `superhuman`

**Fintech / crypto** — `binance` `coinbase` `kraken` `mastercard` `revolut` `stripe` `wise`

**Consumer / marketplace** — `airbnb` `pinterest` `shopify` `spotify` `starbucks` `uber`

**Automotive** — `bmw` `bmw-m` `bugatti` `ferrari` `lamborghini` `renault` `tesla`

**Big tech / hardware** — `apple` `hp` `ibm` `meta` `nvidia` `playstation` `spacex`

**Editorial / brand** — `nike` `theverge` `vodafone` `wired`

**Retro** — `dell-1996` `nintendo-2001`

## Source

`VoltAgent/awesome-design-md`, MIT. Vendored at 2026-09-26, upstream `f696123`. `.git` stripped —
to update, re-clone rather than pull.
