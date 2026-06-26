<!--
Licensed to the Apache Software Foundation (ASF) under one or more
contributor license agreements. See the NOTICE file distributed with this
work for additional information regarding copyright ownership. The ASF
licenses this file to You under the Apache License, Version 2.0.
-->

# Control Modes And Autopilot

Control mode is separate from operating mode (`inspect`, `initialize`,
`foundation`, `plan`, `generate`, `capture`, `render`, `qa`, `revise`).
Operating mode decides **what** to do; control mode decides **how much to
interrupt** the owner. Read `intake.md` for the inputs that set control mode.

## Inferring Control Mode

- Use the explicit `control_mode` from the prompt or `marketing/intake.yaml`.
- If none is given: use **checkpoint** for launch and positioning tasks, and
  **autopilot** only for mechanical inspection, initialization, and QA.
- Always state the inferred control mode before acting.

## autopilot

Optimized for a solo founder/engineer who wants conservative decisions and few
interruptions.

- Ask at most one initial intake question set if critical inputs are missing.
- After intake, do not stop for approval unless there is a safety, privacy,
  destructive-change, credential, legal, or publication risk.
- Make conservative assumptions and record every assumption clearly.
- Prefer existing repository evidence and supplied marketing assets.
- Use existing marketing-site copy as **source material**, never as verified
  merely because it exists.
- Classify uncertain facts as `inferred` or `unverified`; never present them as
  `verified`.
- Never invent metrics, testimonials, customers, benchmarks, awards,
  partnerships, integrations, capabilities, or founder experience.
- Never publish, never automate engagement, never mark content
  `approved-for-publication`.
- Use `ready-for-owner-review` as the final status.
- Still generate useful drafts, manifests, editable assets, and QA reports.
- When something is missing, use a clear placeholder or conservative fallback
  and continue.
- Produce a compact **owner review list** at the end instead of interrupting
  throughout the run.

Autopilot may complete a full **draft** launch package when asked. The owner can
later run `revise` or `qa`.

### Autopilot may continue when

The decision is reversible, low-risk, and traceable: choosing draft wording,
layout, ordering, default channels, conservative claim qualifications, file
naming, scaffolding renderers, creating missing directories, running QA.

### Autopilot must stop and ask when

There is a safety, privacy, destructive-change, credential, legal, or
publication risk. Specifically:

- publishing, logging in, or automating engagement of any kind;
- marking anything `approved-for-publication`;
- capturing or exposing credentials, secrets, or private customer data;
- scraping private or authenticated pages;
- installing new dependencies (e.g. adding Remotion) when not already approved;
- deleting or overwriting owner-approved inputs;
- making legal/compliance claims, or using assets with unclear license rights in
  final outputs.

## checkpoint

Balanced default when the owner wants control but not constant questions.

- Work independently inside each phase.
- Stop only at major approval gates: after foundation, after the campaign plan,
  before final rendering, and before anything is marked publication-ready.
- Batch questions instead of asking one by one.
- Do not interrupt for minor copy, layout, or wording decisions.
- Record assumptions and proposed defaults.

Use checkpoint as the default when no control mode is specified and the task
could materially affect launch positioning or claims.

## ask

High-control mode.

- Ask before important positioning decisions, before approving claims, before
  selecting the audience, before selecting the launch angle, before using assets
  with unclear provenance, before rendering final files, and before changing
  existing marketing configuration.
- Batch questions whenever possible; never more than 10 at once; prefer multiple
  choice with a recommended default.
- Still avoid interruptions for purely mechanical tasks (parsing files,
  validating schemas, creating directories, running QA).

## Final Statuses

| Mode | Final status it may set | Forbidden |
|------|-------------------------|-----------|
| autopilot | `ready-for-owner-review` | `approved-for-publication`, `published` |
| checkpoint | up to owner-approved gate it reached | publishing without explicit owner approval |
| ask | up to the decisions the owner approved | publishing without explicit owner approval |

No control mode may publish, automate engagement, or mark final content
`approved-for-publication` without explicit owner approval.

## Owner Review List

At the end of an autopilot run, produce a compact list in
`marketing/reviews/` covering:

- key assumptions made (and what would change if wrong);
- claims classified `inferred`/`unverified` that need owner verification;
- assets with unknown provenance used only in drafts;
- URLs not inspected (network unavailable, skipped, or none supplied);
- decisions the owner should confirm before any publication;
- exact next commands to render or revise.
