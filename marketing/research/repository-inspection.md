<!--
Licensed to the Apache Software Foundation (ASF) under one or more
contributor license agreements. See the NOTICE file distributed with this
work for additional information regarding copyright ownership. The ASF
licenses this file to You under the Apache License, Version 2.0.
-->

# Repository Inspection

Status: draft

Inspection date: 2026-06-19
Live app status: health checked only. `localhost:8088/health` returned `OK`;
`localhost:8888/health` was still unreachable during bootstrap. No rendered app
screenshots or recordings were inspected.

## Architecture Summary

- Verified: Superset-derived Flask/Python backend in `superset/`.
- Verified: React/TypeScript frontend in `superset-frontend/`.
- Verified: Docusaurus docs site in `docs/`.
- Verified: additional packages include `superset-websocket/`,
  `superset-embedded-sdk/`, `superset-core/`, and extension tooling.
- Verified: frontend package uses npm with `package-lock.json`; docs uses Yarn
  with `docs/yarn.lock`; websocket and embedded SDK use npm lockfiles.
- Verified: Node version is `v22.22.0` in package-local `.nvmrc` files.
- Verified: `superset-frontend/package.json` has build, lint, type, Jest,
  Playwright, Storybook, and production build scripts.
- Verified: no root `package.json` was found.

## Product Surface Inventory

- Verified routes include welcome, login, register, dashboard list, dashboard
  view, chart creation, chart list, dataset list, database list, saved query
  list, SQL Lab, query history, alerts/reports, row-level security, themes,
  users, roles, groups, and extensions when enabled.
- Verified docs homepage contains product overview, docs sections, feature
  cards, supported database section, GitHub buttons, and Get Started CTA.
- Inferred primary user workflows: connect data, run SQL, create datasets,
  build charts, publish dashboards, and administer access.

## Product Copy Inventory

- Verified README headline: `VantumIQP`.
- Verified README one-line positioning: "A modern, enterprise-ready business
  intelligence web application."
- Verified docs homepage describes VantumIQP as a modern data exploration and
  visualization platform.
- Verified primary docs CTA: `Get Started` linking to `/docs/intro`.
- Verified secondary docs CTAs include User Guide, Administrator Guide,
  Developer Guide, and Community.
- Conflicting/unverified: README and docs still link heavily to Apache
  Superset URLs and inherited community resources.
- Unverified: "thousands of companies" social-proof copy in docs homepage.
- Missing: pricing copy, canonical VantumIQP public URL, and owner-approved
  founder story.

## Design-System Inventory

- Verified app theme config sets `colorPrimary` and `colorLink` to `#2893B3`.
- Verified docs CSS sets `--ifm-color-primary` to `#20a7c9`.
- Conflicting: docs CSS includes malformed `--ifm-color-primary-darker: #t;`.
- Verified docs CSS declares Roboto font faces and `--ifm-font-family-base`.
- Verified docs buttons use a blue/cyan gradient.
- Missing: owner-approved launch palette and font licensing confirmation.

## Asset Inventory

- Verified configured app logo: `superset-frontend/src/assets/images/vantumiqp_logo.png`.
- Verified configured app loader: `superset-frontend/src/assets/images/vantumiqp_loader.svg`.
- Verified root copies exist in `vantumiqp_brand_assets/`.
- Verified docs assets include `docs/static/img/vantumiqp-logo.png`,
  `vantumiqp-favicon.png`, `hero-screenshot.jpg`, and `grid-background.jpg`.
- Unverified: provenance and public launch approval for existing visual assets.

## Evidence Inventory

- `superset/config.py`: brand name, logo, spinner, CTA text, theme tokens.
- `README.md`: product name, overview, features, docs links, supported
  database copy.
- `docs/src/pages/index.tsx`: docs landing copy, CTAs, feature claims, social
  proof, video source, docs sections.
- `superset-frontend/src/views/routes.tsx`: core application routes.
- `superset-frontend/playwright.config.ts`: Playwright setup and base URL.
- `.gitattributes`: SVG is marked binary; no Git LFS policy was found.

## Likely Product Claims

- Verified: product is named VantumIQP.
- Verified: app route inventory includes dashboards, charts, datasets,
  databases, SQL Lab, alerts/reports, and administrative surfaces.
- Verified: repository configures VantumIQP logo and loader.
- Verified: repository has Playwright tests and config.
- Unverified: broad database support claims.
- Unverified: "40+ pre-installed visualization types."
- Unverified: "enterprise-ready."
- Conflicting: inherited social-proof claims about thousands of companies.

## Demo Readiness

- Verified: Playwright is present and configured.
- Verified: Playwright auth setup expects admin credentials from env or
  defaults to `admin` / `general`.
- Blocked: live app was not reachable during bootstrap.
- Missing: owner-approved demo account, seed data choice, deterministic demo
  path, and approved screenshots.

## Render Tooling Report

- Verified: no Remotion setup was found.
- Verified: frontend dependencies include `dom-to-image-more` and `dom-to-pdf`,
  but no product-launch renderer was added.
- Verified: no static carousel renderer was installed during bootstrap.
- Required for future video implementation: invoke `$remotion-best-practices`
  and inspect package compatibility before installing Remotion.

## Missing Information

- Canonical public URL.
- Launch audience priority.
- Approved claims and prohibited wording.
- Pricing facts.
- Brand asset provenance and public usage approval.
- Platform-rule verification.
- Live screenshots and recordings.
- Final product limitations.
