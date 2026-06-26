#!/usr/bin/env node
/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements. See the NOTICE file distributed with this
 * work for additional information regarding copyright ownership. The ASF
 * licenses this file to You under the Apache License, Version 2.0.
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  exists,
  parseArgs,
  printHelp,
  repoRoot,
  skillRootFromScript,
  writeText,
} from './lib/marketing-utils.mjs';

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printHelp('init-workspace.mjs', [
    'Usage: node .agents/skills/product-launch-studio/scripts/init-workspace.mjs --repo . [--dry-run]',
    '',
    'Creates missing marketing/ files and directories from product-agnostic templates.',
    'Never overwrites existing files. Reports created, skipped, and conflicting paths.',
  ]);
  process.exit(0);
}

const repo = repoRoot(args);
const dryRun = Boolean(args['dry-run']);
const skillRoot = skillRootFromScript(import.meta.url);
const templatesRoot = path.join(skillRoot, 'assets', 'templates');
const marketingRoot = path.join(repo, 'marketing');

const directories = [
  'research',
  'campaigns',
  'assets/raw',
  'assets/approved',
  'assets/screenshots',
  'assets/recordings',
  'assets/vectors',
  'assets/audio',
  'assets/fonts-not-included',
  'manifests',
  'renderers/static',
  'renderers/video',
  'out',
  'reviews',
];

const builtIns = new Map([
  [
    'README.md',
    `<!--
Licensed to the Apache Software Foundation (ASF) under one or more
contributor license agreements. See the NOTICE file distributed with this
work for additional information regarding copyright ownership. The ASF
licenses this file to You under the Apache License, Version 2.0.
-->

# Marketing Workspace

This directory contains product-launch source material, evidence, draft
campaigns, deterministic rendering inputs, derivatives, and review reports.

Do not publish from this directory automatically. Treat generated social copy,
visuals, videos, and listings as drafts until the repository owner explicitly
approves the relevant product truth, claims, campaign, visuals, and platform
rules.
`,
  ],
  [
    'voice.md',
    `<!--
Licensed to the Apache Software Foundation (ASF) under one or more
contributor license agreements. See the NOTICE file distributed with this
work for additional information regarding copyright ownership. The ASF
licenses this file to You under the Apache License, Version 2.0.
-->

# Voice

Status: draft

- Default voice: practical, technically credible, specific, and restrained.
- Avoid: fake urgency, inflated comparisons, unsupported social proof, and
  claims that are stronger than approved claim wording.
- Owner review required: confirm founder voice, taboo language, and preferred
  level of technical depth per channel.
`,
  ],
  [
    'DESIGN.md',
    `<!--
Licensed to the Apache Software Foundation (ASF) under one or more
contributor license agreements. See the NOTICE file distributed with this
work for additional information regarding copyright ownership. The ASF
licenses this file to You under the Apache License, Version 2.0.
-->

# Design Notes

Status: draft

Use design.tokens.json as the source for draft marketing visuals. Treat all
tokens as inferred until owner-approved. Keep screenshots replaceable and keep
editable SVG/PPTX source files separate from PNG/PDF derivatives.
`,
  ],
  [
    'research/repository-inspection.md',
    `<!--
Licensed to the Apache Software Foundation (ASF) under one or more
contributor license agreements. See the NOTICE file distributed with this
work for additional information regarding copyright ownership. The ASF
licenses this file to You under the Apache License, Version 2.0.
-->

# Repository Inspection

Status: draft

Run inspect mode to replace this placeholder with a factual repository report.
`,
  ],
  [
    'research/evidence-map.md',
    `<!--
Licensed to the Apache Software Foundation (ASF) under one or more
contributor license agreements. See the NOTICE file distributed with this
work for additional information regarding copyright ownership. The ASF
licenses this file to You under the Apache License, Version 2.0.
-->

# Evidence Map

Status: draft

Map each factual statement to source files, routes, tests, screenshots,
recordings, documentation, owner statements, or official third-party sources.
`,
  ],
  [
    'research/claim-conflicts.md',
    `<!--
Licensed to the Apache Software Foundation (ASF) under one or more
contributor license agreements. See the NOTICE file distributed with this
work for additional information regarding copyright ownership. The ASF
licenses this file to You under the Apache License, Version 2.0.
-->

# Claim Conflicts

Status: draft

Preserve conflicting, outdated, or unsupported claims here for owner review.
`,
  ],
  [
    'research/platform-rules.md',
    `<!--
Licensed to the Apache Software Foundation (ASF) under one or more
contributor license agreements. See the NOTICE file distributed with this
work for additional information regarding copyright ownership. The ASF
licenses this file to You under the Apache License, Version 2.0.
-->

# Platform Rules

Status: unverified

Verify current official platform rules before finalizing channel-specific
launch content or rendered assets.
`,
  ],
  [
    'research/launch-readiness.md',
    `<!--
Licensed to the Apache Software Foundation (ASF) under one or more
contributor license agreements. See the NOTICE file distributed with this
work for additional information regarding copyright ownership. The ASF
licenses this file to You under the Apache License, Version 2.0.
-->

# Launch Readiness

Status: draft

Use QA mode to replace this placeholder with blocking errors, warnings, and
owner-review items.
`,
  ],
  [
    'assets/README.md',
    `<!--
Licensed to the Apache Software Foundation (ASF) under one or more
contributor license agreements. See the NOTICE file distributed with this
work for additional information regarding copyright ownership. The ASF
licenses this file to You under the Apache License, Version 2.0.
-->

# Marketing Assets

- raw: owner-supplied originals and unedited captures
- approved: owner-approved reusable assets
- screenshots: product screenshots
- recordings: product screen recordings
- vectors: editable SVG source assets
- audio: narration, music, or effects references
- fonts-not-included: notes for fonts that must not be committed

Do not add font binaries or large generated derivatives without explicit
approval.
`,
  ],
  [
    'renderers/README.md',
    `<!--
Licensed to the Apache Software Foundation (ASF) under one or more
contributor license agreements. See the NOTICE file distributed with this
work for additional information regarding copyright ownership. The ASF
licenses this file to You under the Apache License, Version 2.0.
-->

# Renderers

Static renderers should produce editable-first SVG and PPTX source artifacts
plus derivative previews. Video renderers should use Remotion for branded
composition when video implementation is requested.
`,
  ],
]);

const templateCopies = new Map([
  ['intake.yaml', 'intake.template.yaml'],
  ['product.yaml', 'product.template.yaml'],
  ['claims.yaml', 'claims.template.yaml'],
  ['audiences.yaml', 'audiences.template.yaml'],
  ['campaigns/launch-v1.yaml', 'campaign.template.yaml'],
  ['research/platform-rules.yaml', 'platform-rules.template.yaml'],
  ['asset-registry.yaml', 'asset-registry.template.yaml'],
  ['design.tokens.json', 'design-tokens.template.json'],
  ['manifests/content-manifest.schema.json', 'content-manifest.schema.json'],
  ['manifests/carousel-manifest.schema.json', 'carousel-manifest.schema.json'],
  ['manifests/static-asset-manifest.schema.json', 'static-asset-manifest.schema.json'],
  ['manifests/video-manifest.schema.json', 'video-manifest.schema.json'],
  ['manifests/storyboard.template.yaml', 'storyboard.template.yaml'],
  ['fonts-used.md', 'fonts-used.template.md'],
  ['reviews/editability-report.md', 'editability-report.template.md'],
  ['reviews/qa-report.md', 'qa-report.template.md'],
  ['reviews/review-checklist.md', 'review-checklist.template.md'],
]);

const created = [];
const skipped = [];
const conflicts = [];

for (const directory of directories) {
  const target = path.join(marketingRoot, directory);
  if (exists(target)) {
    skipped.push(path.relative(repo, target));
  } else {
    if (!dryRun) {
      fs.mkdirSync(target, { recursive: true });
    }
    created.push(path.relative(repo, target));
  }
}

for (const [relativePath, contents] of builtIns) {
  const target = path.join(marketingRoot, relativePath);
  if (exists(target)) {
    skipped.push(path.relative(repo, target));
  } else {
    writeText(target, contents, dryRun);
    created.push(path.relative(repo, target));
  }
}

for (const [relativePath, templateName] of templateCopies) {
  const target = path.join(marketingRoot, relativePath);
  const source = path.join(templatesRoot, templateName);
  if (!exists(source)) {
    conflicts.push(`${relativePath}: missing template ${templateName}`);
    continue;
  }
  if (exists(target)) {
    skipped.push(path.relative(repo, target));
  } else {
    writeText(target, fs.readFileSync(source, 'utf8'), dryRun);
    created.push(path.relative(repo, target));
  }
}

console.log(`repo: ${repo}`);
console.log(`dry_run: ${dryRun}`);
console.log('created:');
for (const item of created.sort()) {
  console.log(`  - ${item}`);
}
console.log('skipped:');
for (const item of skipped.sort()) {
  console.log(`  - ${item}`);
}
console.log('conflicting:');
for (const item of conflicts.sort()) {
  console.log(`  - ${item}`);
}

process.exit(conflicts.length > 0 ? 1 : 0);
