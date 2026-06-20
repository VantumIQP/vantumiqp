<!--
Licensed to the Apache Software Foundation (ASF) under one or more
contributor license agreements. See the NOTICE file distributed with this
work for additional information regarding copyright ownership. The ASF
licenses this file to You under the Apache License, Version 2.0.
-->

# Launch Readiness

Status: draft

## Blocking For Publication

- Owner approval is missing for product truth, claims, audience, campaign
  angle, visuals, and platform rules.
- Canonical public URL is missing.
- Pricing facts are missing.
- Live app screenshots and recordings are missing.
- Platform rules are unverified.
- Social-proof and broad product claims are unverified or conflicting.
- Brand asset provenance and public launch usage approval are missing.

## Blocking For Rendering

- Approved screenshot/capture sources are missing.
- `localhost:8888/health` was unreachable during bootstrap; `localhost:8088`
  health responded, but no rendered browser capture was reviewed.
- Editable carousel manifest is not created.
- Static renderer is not implemented.
- Remotion runtime and video renderer are not installed or implemented.
- Launch visual palette is not owner-approved.

## Not Blocking Bootstrap

- Final social posts were intentionally not generated.
- Product Hunt listing copy was intentionally not generated.
- Hacker News launch copy was intentionally not generated.
- No assets were rendered.
- No content was published.

## Next Review Checkpoint

Owner should approve or reject each proposed claim in `marketing/claims.yaml`,
choose the launch audience and URL, decide how to handle upstream Superset
references, and provide or approve screenshots for visual work.
