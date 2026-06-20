<!--
Licensed to the Apache Software Foundation (ASF) under one or more
contributor license agreements. See the NOTICE file distributed with this
work for additional information regarding copyright ownership. The ASF
licenses this file to You under the Apache License, Version 2.0.
-->

# Workflow

## Operating Principles

- Work from repository evidence, owner-approved facts, and explicitly supplied
  campaign configuration.
- Keep reusable skill files product-agnostic.
- Put all product-specific files under `marketing/`.
- Preserve conflicts and unknowns instead of resolving them by invention.
- Do not overwrite existing marketing files. Inspect existing files and produce
  a proposed patch or draft when content conflicts.
- Do not publish, log in, vote, comment, or automate engagement.

## Layered Flow

1. Inspect repository surfaces and existing public copy.
2. Create or update product truth and evidence maps.
3. Propose claims and classify each claim by evidence status.
4. Define audiences, positioning, objections, CTA hierarchy, and voice.
5. Plan channels, manifests, assets, capture paths, rendering, and review gates.
6. Generate manifests before human-readable channel drafts.
7. Render only approved manifests with deterministic code.
8. QA factual accuracy, privacy, editability, visual quality, rendering, and
   platform readiness.
9. Apply explicit owner feedback and preserve review history.

## Approval Gates

Do not mark content `approved-for-publication` unless the owner explicitly
approves product truth, claims, campaign angle, channel copy, visuals, platform
rules, and any rendered derivatives. Treat TODO fields as review work, not as
implicit permission to publish.
