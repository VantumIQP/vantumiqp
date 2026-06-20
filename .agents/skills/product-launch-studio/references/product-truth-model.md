<!--
Licensed to the Apache Software Foundation (ASF) under one or more
contributor license agreements. See the NOTICE file distributed with this
work for additional information regarding copyright ownership. The ASF
licenses this file to You under the Apache License, Version 2.0.
-->

# Product Truth Model

`marketing/product.yaml` is the product truth source for launch work. It must
record evidence status and owner approval separately from the text itself.

## Required Fields

Include schema version, product ID, product name, category, status, target
market, primary locale, supported locales, canonical URL, one-line
description, primary problem, desired outcome, target audiences, jobs to be
done, alternatives, differentiators, supported workflows, notable
capabilities, limitations, deployment assumptions, pricing facts, primary CTA,
secondary CTA, evidence references, owner approval status, and last reviewed
date.

## Rules

- Do not silently translate claims between languages.
- Treat each language variant as content requiring review.
- Do not upgrade inferred facts to verified because they appear in code or docs.
- Preserve missing and conflicting fields for owner review.
- Keep limitations visible so launch copy does not overpromise.
