<!--
Licensed to the Apache Software Foundation (ASF) under one or more
contributor license agreements. See the NOTICE file distributed with this
work for additional information regarding copyright ownership. The ASF
licenses this file to You under the Apache License, Version 2.0.
-->

# Evidence Map

Status: draft

| Claim ID | Status | Evidence | Notes |
| --- | --- | --- | --- |
| CLAIM-001 | verified | `README.md`, `superset/config.py`, `docs/src/pages/index.tsx` | Product name appears in config and public copy. |
| CLAIM-002 | verified | `superset-frontend/src/views/routes.tsx` | Route inventory supports conservative surface claims. |
| CLAIM-003 | verified | `superset/config.py`, app image assets | Brand logo and loader are configured. |
| CLAIM-004 | verified | `superset-frontend/playwright.config.ts`, `superset-frontend/playwright/tests/` | Test setup exists; tests not run during bootstrap. |
| CLAIM-005 | unverified | `README.md`, `docs/src/pages/index.tsx` | Database-support copy needs owner or official verification. |
| CLAIM-006 | unverified | `docs/src/pages/index.tsx` | Visualization count not independently counted. |
| CLAIM-007 | unverified | `README.md` | Enterprise-ready needs stronger proof. |
| CLAIM-008 | conflicting | `docs/src/pages/index.tsx` | Likely inherited Superset social proof; blocked for launch. |
| CLAIM-009 | verified | `LICENSE.txt`, package metadata | Asset provenance still separate. |

## Evidence Rules

- Source copy is evidence that a claim exists, not proof that the claim is true.
- Live product behavior remains unverified until the dev environment is reachable.
- Owner approval is still required before any publication-ready content.
