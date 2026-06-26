#!/usr/bin/env node
/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements. See the NOTICE file distributed with this
 * work for additional information regarding copyright ownership. The ASF
 * licenses this file to You under the Apache License, Version 2.0.
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {
  makeTempRepo,
  parseArgs,
  printHelp,
  removeDirSafe,
  skillRootFromScript,
  writeText,
} from './lib/marketing-utils.mjs';

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printHelp('smoke-test.mjs', [
    'Usage: node .agents/skills/product-launch-studio/scripts/smoke-test.mjs',
    '',
    'Creates a temporary fixture repository, exercises initialization, workspace validation,',
    'claims validation, content manifest validation, SVG validation, editability validation,',
    'and expected failure cases. It does not modify the real product repository.',
  ]);
  process.exit(0);
}

const skillRoot = skillRootFromScript(import.meta.url);
const scripts = path.join(skillRoot, 'scripts');
const tempRoot = makeTempRepo('product-launch-studio-');

function run(script, scriptArgs) {
  return execFileSync(process.execPath, [path.join(scripts, script), ...scriptArgs], {
    cwd: tempRoot,
    encoding: 'utf8',
    stdio: 'pipe',
  });
}

function expectFailure(script, scriptArgs) {
  try {
    run(script, scriptArgs);
  } catch (error) {
    return String(error.stderr || error.stdout || error.message);
  }
  throw new Error(`${script} unexpectedly succeeded`);
}

try {
  run('init-workspace.mjs', ['--repo', tempRoot]);

  writeText(
    path.join(tempRoot, 'marketing', 'claims.yaml'),
    `# Licensed to the Apache Software Foundation (ASF) under one or more contributor license agreements.
schema_version: 1
claims:
  - claim_id: "C-001"
    exact_approved_wording: "Fixture product supports deterministic launch QA."
    locale: "en"
    status: "verified"
    claim_type: "capability"
    intended_audience: "solo-engineer"
    allowed_channels: ["linkedin", "product-hunt"]
    supporting_evidence: "tests/fixture.test.ts"
    evidence_strength: "source-and-test"
    scope: "fixture"
    qualifications: "Smoke fixture only."
    owner_approval_status: "approved"
    prohibited_stronger_variants: []
`,
  );

  writeText(
    path.join(tempRoot, 'marketing', 'campaigns', 'launch-v1.yaml'),
    `# Licensed to the Apache Software Foundation (ASF) under one or more contributor license agreements.
schema_version: 1
campaign_id: "launch-v1"
status: "draft"
campaign_type: "launch"
product_id: "product-todo"
locale: "en"
target_audience_ids: []
primary_audience_id: null
goal: "Smoke test deterministic validation."
launch_angle: "QA"
launch_narrative: "Fixture narrative."
primary_cta: "Review"
secondary_cta: "Inspect"
selected_channels: ["linkedin"]
selected_asset_types: ["static"]
approved_claim_ids: ["C-001"]
prohibited_claims: []
approved_assets: []
visual_direction: "Fixture"
target_aspect_ratios: ["1:1"]
target_durations: []
platform_assumptions: []
current_platform_rule_verification_status: "unverified"
owner_approvals:
  product_truth: false
  claims: false
  visuals: false
  platform_rules: false
open_questions: []
review_history: []
claim_qualification_policy: "Preserve qualifications verbatim."
`,
  );

  const manifest = {
    schema_version: 1,
    manifest_id: 'fixture-static',
    format: 'static-image',
    locale: 'en',
    approval_state: 'draft',
    owner_approved: false,
    dimensions: { width: 1080, height: 1080 },
    elements: [
      {
        element_id: 'headline',
        type: 'text',
        order: 1,
        text: 'Fixture product supports deterministic launch QA.',
        claim_ids: ['C-001'],
        asset_ids: [],
      },
    ],
    output_variants: [{ variant_id: 'square', format: 'svg', width: 1080, height: 1080 }],
  };
  const manifestPath = path.join(tempRoot, 'marketing', 'manifests', 'fixture-static.json');
  writeText(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  const svgPath = path.join(tempRoot, 'marketing', 'assets', 'vectors', 'fixture-slide.svg');
  writeText(
    svgPath,
    `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080"><g id="bg"><rect width="1080" height="1080" fill="#fff"/></g><g id="content"><text x="80" y="120">Fixture product supports deterministic launch QA.</text></g><g id="cta"><text x="80" y="980">Review</text></g></svg>\n`,
  );

  const carouselManifest = {
    schema_version: 1,
    manifest_id: 'fixture-carousel',
    slides: [
      {
        slide_id: 'slide-01',
        editable_svg: 'marketing/assets/vectors/fixture-slide.svg',
        pptx: 'marketing/assets/vectors/fixture-carousel.pptx',
      },
    ],
    externally_import_tested: false,
  };
  writeText(
    path.join(tempRoot, 'marketing', 'assets', 'vectors', 'fixture-carousel.pptx'),
    'fixture pptx placeholder for editability validation\n',
  );
  const carouselPath = path.join(tempRoot, 'marketing', 'manifests', 'fixture-carousel.json');
  writeText(carouselPath, `${JSON.stringify(carouselManifest, null, 2)}\n`);

  run('validate-workspace.mjs', ['--repo', tempRoot]);
  run('validate-claims.mjs', ['--repo', tempRoot, '--campaign', 'launch-v1']);
  run('validate-content-manifest.mjs', ['--repo', tempRoot, '--manifest', manifestPath]);
  run('validate-svg.mjs', ['--svg', svgPath, '--width', '1080', '--height', '1080', '--groups', 'bg,content,cta']);
  run('validate-editability.mjs', ['--repo', tempRoot, '--manifest', carouselPath]);

  run('inspect-intake.mjs', ['--repo', tempRoot]);
  run('inspect-intake.mjs', ['--help']);
  run('inspect-assets.mjs', ['--repo', tempRoot, '--auto-discover', '--dry-run']);
  run('inspect-assets.mjs', ['--help']);

  const badManifestPath = path.join(tempRoot, 'marketing', 'manifests', 'bad.json');
  writeText(badManifestPath, '{"schema_version":1}\n');
  expectFailure('validate-content-manifest.mjs', ['--repo', tempRoot, '--manifest', badManifestPath]);

  const badSvgPath = path.join(tempRoot, 'marketing', 'assets', 'vectors', 'Bad Slide.svg');
  writeText(badSvgPath, '<svg><script>alert(1)</script></svg>\n');
  expectFailure('validate-svg.mjs', ['--svg', badSvgPath]);

  writeText(
    path.join(tempRoot, 'marketing', 'intake.yaml'),
    `# Licensed to the Apache Software Foundation (ASF) under one or more contributor license agreements.
schema_version: 1
control_mode: "warp-speed"
run_preset: "not-a-preset"
product_url: "none"
marketing_site_url: "none"
asset_roots:
  - "auto-discover"
output_intensity: "standard"
`,
  );
  expectFailure('validate-workspace.mjs', ['--repo', tempRoot]);

  console.log('[ok] smoke test passed');
} finally {
  removeDirSafe(tempRoot, path.dirname(tempRoot));
}
