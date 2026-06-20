<!--
Licensed to the Apache Software Foundation (ASF) under one or more
contributor license agreements. See the NOTICE file distributed with this
work for additional information regarding copyright ownership. The ASF
licenses this file to You under the Apache License, Version 2.0.
-->

# QA Report

Status: bootstrap validation complete

## Blocking Errors

- No blocking errors were found in the reusable skill or initialized marketing
  workspace validators.
- Publication remains blocked until owner approval, canonical URL, approved
  claims, platform-rule verification, and approved visual sources are supplied.
- `pre-commit run --all-files` could not run because `pre-commit` is not
  available in PATH, and `py -3.12 -m pre_commit run --all-files` reported
  `No module named pre_commit`.

## Warnings

- `localhost:8088/health` returned `OK`; `localhost:8888/health` was not
  reachable during bootstrap.
- No rendered browser screenshots, social posts, carousel assets, or videos were
  produced or visually reviewed.
- Editability validation was workspace-level only because no content manifest or
  rendered asset manifest exists yet.

## Owner Review Items

- Approve or reject each claim in `marketing/claims.yaml`.
- Decide canonical public URL, pricing language, and launch CTA.
- Approve brand palette, logo usage, and screenshot capture sources.
- Decide whether inherited Superset public copy and social proof should be
  rewritten, removed, or supported with evidence.

## Commands Run

- `python C:\Users\adnan\.codex\skills\.system\skill-creator\scripts\quick_validate.py .agents\skills\product-launch-studio` -> passed.
- `node --check` over all `.agents/skills/product-launch-studio/scripts/*.mjs` -> passed.
- `node .agents\skills\product-launch-studio\scripts\validate-workspace.mjs --repo . --campaign launch-v1` -> passed.
- `node .agents\skills\product-launch-studio\scripts\validate-claims.mjs --repo . --campaign launch-v1` -> passed.
- `node .agents\skills\product-launch-studio\scripts\validate-content-manifest.mjs --repo . --schema-only` -> passed.
- `node .agents\skills\product-launch-studio\scripts\validate-editability.mjs --repo .` -> passed with workspace-level warning.
- `node .agents\skills\product-launch-studio\scripts\smoke-test.mjs` -> passed.
- `git diff --check` -> passed.
- No-index whitespace checks for `.agents` and `marketing` -> passed after
  filtering Git line-ending conversion warnings.
- `rg` product-specific leak check in `.agents/skills/product-launch-studio` ->
  no matches.
