---
name: product-launch-studio
description: "Product launch preparation for an existing software repository: product truth, evidence-grounded positioning, messaging, launch strategy, LinkedIn founder/company posts, LinkedIn PDF carousels, editable SVG/PPTX marketing graphics, Product Hunt copy/assets, Reddit and Hacker News launch preparation, demo-video storyboards, Remotion product videos, website launch copy, brand launch visuals, marketing workspace initialization, structured content manifests, and marketing QA. Use for product launch, positioning, launch content, launch visuals, carousel assets, Product Hunt assets, Reddit/HN launch planning, demo video planning, Remotion campaign video work, and repository-scoped marketing foundations. Do not use for paid-ad management, generic sales operations, automatic social publishing, unrelated frontend work, unrelated video editing, generic graphic design without product-launch context, CRM implementation, or lead-management systems."
---

# Product Launch Studio

<!--
Licensed to the Apache Software Foundation (ASF) under one or more
contributor license agreements. See the NOTICE file distributed with this
work for additional information regarding copyright ownership. The ASF
licenses this file to You under the Apache License, Version 2.0.
-->

Use this skill to turn a working product repository into a reviewable,
editable, evidence-grounded launch content package. Treat Codex as the AI
orchestration layer. Deterministic scripts in this skill must never call an
LLM or publish content.

## Mode Selection

If the user does not name a mode, infer the smallest mode that satisfies the
request and state the mode before acting.

- **inspect**: inspect the repository and produce factual reports. Read
  `references/repository-inspection.md`, `references/product-truth-model.md`,
  `references/evidence-and-claims.md`, and `references/visual-system.md`.
- **initialize**: create missing `marketing/` files non-destructively. Read
  `references/workflow.md`, then run `scripts/init-workspace.mjs`.
- **foundation**: prepare product truth, evidence, audiences, claims,
  positioning, voice, and visual foundations. Read
  `references/product-truth-model.md`, `references/evidence-and-claims.md`,
  `references/messaging-framework.md`, and `references/visual-system.md`.
- **plan**: produce the launch strategy, content matrix, capture plan,
  editability plan, and review checkpoints. Read
  `references/campaign-planning.md`, `references/channel-playbooks.md`,
  `references/demo-video.md`, and `references/deterministic-rendering.md`.
- **generate**: create structured manifests and draft content from approved
  truth, approved claim IDs, approved audiences, approved voice, and approved
  design tokens. Read `references/campaign-planning.md`,
  `references/channel-playbooks.md`, `references/linkedin-carousel.md`,
  `references/product-hunt.md`, `references/reddit.md`, and
  `references/hacker-news.md`.
- **capture**: plan and perform deterministic product capture when the repo
  safely supports it. Read `references/demo-video.md`,
  `references/deterministic-rendering.md`, and `references/qa-rubric.md`.
- **render**: render approved manifests with deterministic code. Read
  `references/deterministic-rendering.md`, `references/editable-vector-assets.md`,
  `references/linkedin-carousel.md`, and, for videos,
  `references/remotion-workflow.md`.
- **qa**: run workspace, evidence, claims, manifest, editability, platform,
  privacy, visual, and rendering checks. Read `references/qa-rubric.md` and
  run the validation scripts that match the assets being reviewed.
- **revise**: apply explicit owner feedback while preserving approved facts,
  approved claims, qualifications, review history, and traceability. Read
  `references/workflow.md`, `references/evidence-and-claims.md`, and
  `references/qa-rubric.md`.

Do not execute later modes unless the user asks for them or they are necessary
to complete the requested mode.

## Core Contract

Keep these layers separate:

1. Product truth
2. Evidence and approved claims
3. Messaging strategy
4. Structured content manifests
5. Deterministic editable rendering
6. Publication derivatives
7. QA and human approval

Reusable skill files stay product-agnostic. Product-specific facts, campaigns,
tokens, assets, manifests, renderers, outputs, and reviews live under
`marketing/` in the target repository.

Classify every extracted fact as exactly one of: `verified`,
`owner-approved`, `inferred`, `unverified`, `missing`, `conflicting`, or
`outdated`. Do not treat README text, source comments, landing pages, old slide
decks, or generated drafts as verified by default.

Only final publication-ready content may use verified or owner-approved claims
unless the campaign explicitly permits provisional claims. Every meaningful
factual statement in final marketing content must trace to claim IDs.

## Boundaries

Do not publish content, log in to platforms, automate comments, votes, likes,
upvotes, or engagement, fabricate community participation, invent metrics,
users, customers, testimonials, awards, partnerships, capabilities, urgency, or
founder experience, scrape private data, capture credentials, call external AI
APIs from deterministic scripts, add Vercel AI SDK for core orchestration, add
database/auth/billing/hosted services, or overwrite approved marketing inputs.

For video implementation tasks, invoke both `$product-launch-studio` and
`$remotion-best-practices`. This skill decides the campaign purpose, evidence,
storyboard, shot list, manifests, claims QA, and review gates. The Remotion
skill owns composition architecture, frame-based animation, sequencing,
transitions, font loading, media handling, performance, and render debugging.
If `$remotion-best-practices` is not discoverable, report that clearly and do
not duplicate it here.

## Scripts

Run scripts from the repository root with Node.js:

- `scripts/init-workspace.mjs --repo . [--dry-run]`
- `scripts/validate-workspace.mjs --repo . [--campaign launch-v1]`
- `scripts/validate-content-manifest.mjs --repo . --manifest <file>`
- `scripts/validate-claims.mjs --repo . --campaign launch-v1`
- `scripts/validate-svg.mjs --svg <file>`
- `scripts/validate-editability.mjs --repo . --manifest <file>`
- `scripts/smoke-test.mjs`

Every script supports `--help`, avoids destructive writes, and exits non-zero
on validation failure.

## Outputs

Use `marketing/` for all repository-specific outputs:

- source truth and evidence: `product.yaml`, `claims.yaml`, `audiences.yaml`,
  `research/`
- campaigns: `campaigns/<campaign-id>.yaml`
- assets: `assets/raw`, `assets/approved`, `assets/screenshots`,
  `assets/recordings`, `assets/vectors`, `assets/audio`,
  `assets/fonts-not-included`
- structured manifests: `manifests/`
- deterministic rendering source: `renderers/static`, `renderers/video`
- publication derivatives: `out/`
- QA and owner review: `reviews/`

Do not add font binaries. Do not commit large generated binaries
automatically. Keep PPTX and editable SVG as carousel source artifacts; treat
PDF, PNG, MP4, and WebM as derivatives unless the user explicitly says
otherwise.

## Required QA Before Completion

Before claiming completion, verify:

- front matter parses and the skill name is `product-launch-studio`
- referenced files exist
- templates and schemas parse
- all scripts show useful `--help`
- smoke test passes
- trigger behavior has been reviewed with `references/trigger-behavior.md`
- no reusable skill file contains product-specific copy, colors, screenshots,
  claims, or campaign decisions
- no final asset is marked approved without explicit owner approval
- no content was published or engagement automated
- unresolved owner questions are compact and actionable
