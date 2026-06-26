<!--
Licensed to the Apache Software Foundation (ASF) under one or more
contributor license agreements. See the NOTICE file distributed with this
work for additional information regarding copyright ownership. The ASF
licenses this file to You under the Apache License, Version 2.0.
-->

# Asset Intake

Scan supplied or discovered asset folders, classify what is found, and record
results in `marketing/asset-registry.yaml` and a draft inventory at
`marketing/research/asset-inventory.md`. Asset roots come from
`marketing/intake.yaml` (`asset_roots`). See `intake.md` for intake fields.

## Scanning Rules

- Scan supplied roots recursively unless the owner says otherwise.
- Support multiple asset roots, including paths outside the repository, e.g.
  `./marketing-site/public`, `./public`, `./assets`, `./app/assets`,
  `./marketing/assets/raw`, `./marketing/assets/approved`, `../brand-assets`,
  `../landing-page/public`.
- Do not modify original assets. Do not move assets unless explicitly requested.
- Classify assets by type; detect likely logos, screenshots, recordings, icons,
  SVGs, PDFs, PPTX files, brand guides, and previous marketing exports.
- Classify vector vs raster. Preserve vector source files when present.
- Prefer approved assets over raw assets, and product-owned logos, screenshots,
  and recordings over third-party material.

## Auto-Discover

When the owner says `auto-discover`:

- search common project asset locations and `public/` directories;
- inspect `app/` and `src/` asset imports;
- inspect README links;
- inspect package/framework conventions;
- inspect existing `marketing/` assets;
- produce a discovered asset report and record `discovered_from` per asset.

Use `scripts/inspect-assets.mjs --repo . --auto-discover` (or one or more
`--asset-root <path>`) to produce the draft inventory deterministically. The
script never modifies originals and never calls an LLM.

## Provenance And Safety

- Do not assume license rights for external stock assets.
- Mark `provenance_status` as `unknown` when unclear.
- Mark `publication_safety` honestly; flag anything sensitive.
- Never use assets marked `unsafe`, `private`, `customer-data`,
  `credential-risk`, or unknown-provenance-for-final **without warning**.

In **autopilot**, assets with unknown provenance may be used **only in drafts**
and must be clearly flagged in QA. They must not flow into final outputs.

## Asset Inventory Report

`marketing/research/asset-inventory.md` should show, per file: path; inferred
type; dimensions or duration when practical; vector or raster; likely usage;
approval status; provenance status; publication safety; and notes.

## Registry Fields

Transfer inventory results into `marketing/asset-registry.yaml`
(template: `assets/templates/asset-registry.template.yaml`). Each asset records:
`discovered_from`, `asset_root`, `provenance_status`, `publication_safety`,
`draft_allowed`, `final_allowed`, `contains_sensitive_info`, `vector_editable`,
plus the existing `path`, `asset_type`, `status`, `license`,
`owner_approval_status`, and `notes`. `validate-workspace.mjs` warns when an
asset is `final_allowed` but has unknown provenance, unsafe publication status,
or sensitive content.
