<!--
Licensed to the Apache Software Foundation (ASF) under one or more
contributor license agreements. See the NOTICE file distributed with this
work for additional information regarding copyright ownership. The ASF
licenses this file to You under the Apache License, Version 2.0.
-->

# Example Prompts

Copy-paste starting points. Replace example URLs and paths with real values. See
`autopilot.md` for control modes, `workflow.md` for presets, and `intake.md` for
intake fields.

## Autopilot Full Draft

```
$product-launch-studio

Control mode: autopilot
Preset: autopilot-launch-draft
Product URL: https://example.com
Marketing site URL: same
Assets: ./public, ./marketing/assets, auto-discover
Channels: LinkedIn, Product Hunt, demo video
Locale: English
Output intensity: standard

Create a full draft launch package.
Do not publish anything.
Do not mark anything approved-for-publication.
Make conservative assumptions and give me the owner review list at the end.
```

## Autopilot Content Only

```
$product-launch-studio

Control mode: autopilot
Preset: autopilot-content-only
Product URL: https://example.com
Assets: auto-discover
Channels: LinkedIn, Product Hunt, Hacker News
Locale: English

Generate launch copy and manifests only.
Do not render assets.
```

## Ask Mode Foundation

```
$product-launch-studio

Control mode: ask
Mode: foundation
Product URL: https://example.com
Assets: ./marketing/assets

Help me define the product truth, claims, positioning and launch narrative.
Ask before making major decisions.
```

## Checkpoint Render

```
$product-launch-studio

Control mode: checkpoint
Mode: render
Campaign: launch-v1

Render the approved static assets.
Stop before video rendering and ask for confirmation.
```
