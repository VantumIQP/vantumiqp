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

## Two Dimensions: Operating Mode And Control Mode

- **Operating mode** decides *what* to do: `inspect`, `initialize`,
  `foundation`, `plan`, `generate`, `capture`, `render`, `qa`, `revise`.
- **Control mode** decides *how much to interrupt* the owner: `autopilot`,
  `checkpoint`, `ask`. See `autopilot.md` for the full rules and `intake.md`
  for the inputs that set control mode.

If no control mode is specified, default to **checkpoint** for launch and
positioning tasks, and **autopilot** for mechanical inspection, initialization,
and QA. State the inferred control mode before acting.

## Recommended Sequence

0. Intake: read or gather `marketing/intake.yaml` (see `intake.md`); record
   control mode, URLs, asset roots, goal, channels, locale, and intensity.
1. Inspect repository surfaces and existing public copy (see
   `url-inspection.md`, `asset-intake.md`).
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

- **checkpoint** stops at: after foundation, after the campaign plan, before
  final rendering, and before anything is marked publication-ready.
- **autopilot** does not stop at these gates; it records assumptions and uses
  `ready-for-owner-review` as the final status.
- **ask** stops before important positioning, claim, audience, angle, asset, and
  final-render decisions.

## Fast-Run Presets

Presets are shortcuts combining operating modes and a control mode. They are not
new operating modes. Every autopilot preset must not publish and must not mark
content `approved-for-publication`.

### autopilot-launch-draft

Create a complete draft launch package with minimal interruption.

- control mode: autopilot
- initialize if needed → inspect → foundation → plan → generate
- render static assets where tooling exists or can be safely scaffolded
- prepare video storyboard and manifest
- render video only if Remotion is already present or explicit permission is
  given to add it
- run QA → produce owner review checklist

### autopilot-content-only

Generate launch copy and manifests without rendering.

- control mode: autopilot
- initialize if needed → inspect → foundation → plan → generate
- claims QA → content QA

### autopilot-static-assets

Render editable SVG/PPTX/PDF/PNG static assets from approved or autopilot-
generated manifests.

- control mode: autopilot
- render static assets → editability QA → claims QA → visual QA

### autopilot-video-plan

Prepare video storyboard, shot list, capture plan, and Remotion manifest.

- control mode: autopilot
- use product-launch-studio for campaign/video intent
- invoke `$remotion-best-practices` before Remotion implementation guidance
- do not implement or render video unless explicitly requested

### autopilot-video-render

Render the demo video using Remotion.

- control mode: autopilot
- invoke `$remotion-best-practices` before any Remotion code
- use existing Remotion setup if present
- request permission only if new dependencies must be installed or sensitive
  capture is required
- render preview and publication derivative → run video QA
