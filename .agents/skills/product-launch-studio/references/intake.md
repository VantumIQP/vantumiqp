<!--
Licensed to the Apache Software Foundation (ASF) under one or more
contributor license agreements. See the NOTICE file distributed with this
work for additional information regarding copyright ownership. The ASF
licenses this file to You under the Apache License, Version 2.0.
-->

# Initial Intake

Gather a small set of inputs once and store them in `marketing/intake.yaml`. The
skill reads this file, fills gaps with recorded assumptions, and asks only for
missing critical fields. See `autopilot.md` for how autopilot consumes intake,
`asset-intake.md` for asset roots, `url-inspection.md` for URLs, and
`workflow.md` for where intake sits in the operating-mode sequence.

## When To Ask

Ask the compact intake question set when key inputs are missing **and** the task
could materially affect launch positioning or claims. Do not ask for purely
mechanical tasks (parsing files, validating schemas, creating directories,
running QA) — proceed with defaults for those.

If `marketing/intake.yaml` already exists: read it, preserve it, and ask only
for missing critical fields. Never overwrite it silently. Use
`scripts/inspect-intake.mjs --repo .` to list what is missing first.

## The Compact Intake Prompt

> Before I run the launch workflow, choose a control mode:
>
> 1. autopilot — I make conservative decisions and give you a review list at the end.
> 2. checkpoint — I work in phases and ask at major approval gates.
> 3. ask — I ask before important decisions.
>
> Also send:
> - product URL or 'none';
> - marketing site URL or 'same';
> - assets folder path or 'auto-discover';
> - target channels or 'default';
> - language/locale or 'infer';
> - output intensity: minimal, standard, or full.

Ask this as a single compact batch. In ask mode, prefer multiple-choice options
with a recommended default and never ask more than 10 questions at once.

## Fields

Stored in `marketing/intake.yaml` (template:
`assets/templates/intake.template.yaml`):

| Field | Allowed values |
|-------|----------------|
| `control_mode` | `autopilot`, `checkpoint`, `ask` |
| `run_preset` | a preset name from `workflow.md`, or `null` |
| `product_url` | a URL, `none`, or `none yet` |
| `marketing_site_url` | a URL, `same`, or `none` |
| `asset_roots` | one or more local paths, or `auto-discover` |
| `auto_discover` | `true` / `false` |
| `primary_goal` | `demo-requests`, `waitlist-signups`, `product-hunt-traffic`, `beta-users`, `feedback`, `first-paid-customers`, `credibility-content`, `other` |
| `target_channels` | `linkedin`, `product-hunt`, `hacker-news`, `reddit`, `website`, `demo-video`, or `default` |
| `locale` | `en`, `sr`, `both`, `infer` |
| `output_intensity` | `minimal`, `standard`, `full` |
| `assumptions` | list of recorded assumptions |
| `inspection` | skill-maintained URL inspection status |

## Behavior When Fields Are Missing

- **autopilot**: ask one compact batch with recommended defaults, accept short
  answers, then proceed without further questions. If the owner also says
  `auto-discover`, skip further intake questions, discover likely URLs and asset
  folders from the repository, use conservative defaults, and document
  assumptions in `intake.yaml` and the campaign.
- **checkpoint** (default for launch/positioning): batch missing critical
  questions at the next approval gate; record proposed defaults meanwhile.
- **ask**: ask before important decisions; batch questions; never more than 10
  at once; prefer multiple choice with a recommended default.
- **No control mode given**: use checkpoint for launch/positioning work and
  autopilot only for mechanical inspection, initialization, and QA. State the
  inferred control mode before acting.

## Conservative Defaults

When a field is missing and you must proceed, apply: `control_mode=checkpoint`,
`product_url=none`, `marketing_site_url=none`, `asset_roots=[auto-discover]`,
`primary_goal=feedback`, `target_channels=default`, `locale=infer`,
`output_intensity=standard`. Record each applied default as an assumption.

## Scripts

- `scripts/inspect-intake.mjs --repo .` — prints present/missing fields, inferred
  defaults, and validates local asset-root paths. Read-only.
- `scripts/validate-workspace.mjs --repo .` — validates intake fields when the
  file is present (valid control mode, valid run preset, URL format, asset
  roots).
