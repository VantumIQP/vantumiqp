<!--
Licensed to the Apache Software Foundation (ASF) under one or more
contributor license agreements. See the NOTICE file distributed with this
work for additional information regarding copyright ownership. The ASF
licenses this file to You under the Apache License, Version 2.0.
-->

# URL Inspection

Handle the product URL and marketing-site URL supplied in
`marketing/intake.yaml`. Extracted copy is **source material**, not verified
fact. See `evidence-and-claims.md` for claim classification and `intake.md` for
intake fields.

## Recording URLs

When a product URL or marketing-site URL is supplied:

- record it in `marketing/intake.yaml`;
- record it in `marketing/product.yaml` (`canonical_url`, CTA destinations) when
  appropriate;
- prefer first-party/product-owned URLs.

## Inspecting

Inspect a URL only when network/browser access is available. When inspecting:

- extract candidate public copy, CTAs, screenshots, metadata, and claims;
- classify extracted copy as **source copy**, not automatically verified;
- create or update `marketing/research/website-copy-inventory.md`;
- create or update `marketing/research/evidence-map.md`;
- note the inspection date;
- note whether inspection was performed `live`, `skipped`, or `unavailable` in
  `intake.yaml` under `inspection`.

## When Network Access Is Unavailable

Do not fail the whole workflow. Record that URL inspection was not performed and
continue using repository files and supplied assets. Note the gap in the owner
review list.

## Safety

Do not scrape private or authenticated pages unless the owner explicitly
provides a safe local/staging environment and confirms it contains no sensitive
data. Never capture credentials, tokens, session data, or private customer
information.

## Evidence Classification

A claim is not verified merely because it appears on a landing page, in README
text, in source comments, in an old deck, or in generated copy. Map website copy
to claims in `evidence-map.md`, classify each as `verified`, `owner-approved`,
`inferred`, `unverified`, `missing`, `conflicting`, or `outdated`, and keep
source copy traceable to its URL and inspection date.
