<!--
Licensed to the Apache Software Foundation (ASF) under one or more
contributor license agreements. See the NOTICE file distributed with this
work for additional information regarding copyright ownership. The ASF
licenses this file to You under the Apache License, Version 2.0.
-->

# Repository Inspection

Inspect before creating product-specific drafts. Capture evidence paths and
classify each extracted fact as `verified`, `owner-approved`, `inferred`,
`unverified`, `missing`, `conflicting`, or `outdated`.

## Minimum Inventory

- package manager, lockfiles, workspaces, framework, build tooling, and Node
  version
- AGENTS.md and AGENTS.override.md instructions
- README files, product documentation, docs site copy, landing copy, pricing
  copy, onboarding, signup, demo, or request-access flows
- application routes, navigation, UI components, CTAs, and supported locales
- CSS variables, themes, design tokens, fonts, icons, logos, screenshots,
  recordings, audio, and licensing/provenance
- tests, fixtures, seeded data, Playwright/Cypress setup, Remotion setup, SVG,
  PDF, PPTX, or image tooling
- existing product claims and every place they appear
- Git LFS or binary-file policy

## Report Sections

Produce: architecture summary, product-surface inventory, copy inventory,
design-system inventory, asset inventory, evidence inventory, likely claims,
claim conflicts, unsupported claims, demo-readiness report, render-tooling
report, and missing-information report.

Do not generate final launch copy in inspect mode.
