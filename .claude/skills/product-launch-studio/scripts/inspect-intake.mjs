#!/usr/bin/env node
/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements. See the NOTICE file distributed with this
 * work for additional information regarding copyright ownership. The ASF
 * licenses this file to You under the Apache License, Version 2.0.
 */

import path from 'node:path';
import {
  CONTROL_MODES,
  OUTPUT_INTENSITIES,
  RUN_PRESETS,
  exists,
  isLocalAssetRoot,
  isSentinelUrl,
  looksLikeUrl,
  parseArgs,
  parseYamlFile,
  printHelp,
  repoRoot,
} from './lib/marketing-utils.mjs';

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printHelp('inspect-intake.mjs', [
    'Usage: node .agents/skills/product-launch-studio/scripts/inspect-intake.mjs --repo .',
    '',
    'Reads marketing/intake.yaml and reports present fields, missing fields, inferred defaults,',
    'validity notes, and the existence of local asset roots. Read-only: never modifies files.',
  ]);
  process.exit(0);
}

const repo = repoRoot(args);
const intakePath = path.join(repo, 'marketing', 'intake.yaml');

const DEFAULTS = {
  control_mode: 'checkpoint',
  run_preset: null,
  product_url: 'none',
  marketing_site_url: 'none',
  asset_roots: ['auto-discover'],
  auto_discover: true,
  primary_goal: 'feedback',
  target_channels: ['default'],
  locale: 'infer',
  output_intensity: 'standard',
};

function isEmptyValue(value) {
  if (value == null) {
    return true;
  }
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  if (typeof value === 'string') {
    return value.trim() === '';
  }
  return false;
}

if (!exists(intakePath)) {
  console.log('intake_file: marketing/intake.yaml');
  console.log('status: missing');
  console.log('hint: run init-workspace.mjs or copy assets/templates/intake.template.yaml');
  console.log('inferred_defaults:');
  for (const [key, value] of Object.entries(DEFAULTS)) {
    console.log(`  ${key}: ${JSON.stringify(value)}`);
  }
  process.exit(0);
}

const result = parseYamlFile(intakePath);
if (result.error) {
  console.error(`[error] could not parse marketing/intake.yaml: ${result.error.message}`);
  process.exit(1);
}

const intake = result.data || {};
const present = [];
const missing = [];
for (const key of Object.keys(DEFAULTS)) {
  if (isEmptyValue(intake[key])) {
    missing.push(key);
  } else {
    present.push(key);
  }
}

console.log('intake_file: marketing/intake.yaml');
console.log('status: present');

console.log('present_fields:');
for (const key of present) {
  console.log(`  ${key}: ${JSON.stringify(intake[key])}`);
}

console.log('missing_fields:');
if (missing.length === 0) {
  console.log('  (none)');
}
for (const key of missing) {
  console.log(`  ${key}: (default ${JSON.stringify(DEFAULTS[key])})`);
}

const notes = [];
if (intake.control_mode != null && !CONTROL_MODES.has(String(intake.control_mode))) {
  notes.push(`control_mode '${intake.control_mode}' is not one of autopilot, checkpoint, ask`);
}
if (intake.run_preset != null && intake.run_preset !== '' && !RUN_PRESETS.has(String(intake.run_preset))) {
  notes.push(`run_preset '${intake.run_preset}' is not a known preset`);
}
if (intake.output_intensity != null && !OUTPUT_INTENSITIES.has(String(intake.output_intensity))) {
  notes.push(`output_intensity '${intake.output_intensity}' is not one of minimal, standard, full`);
}
for (const [field, value] of [
  ['product_url', intake.product_url],
  ['marketing_site_url', intake.marketing_site_url],
]) {
  if (!isSentinelUrl(value) && !looksLikeUrl(value)) {
    notes.push(`${field} '${value}' does not look like an http(s) URL`);
  }
}

console.log('asset_roots:');
const roots = Array.isArray(intake.asset_roots) ? intake.asset_roots : [];
if (roots.length === 0) {
  console.log('  (none listed)');
}
for (const root of roots) {
  if (!isLocalAssetRoot(root)) {
    console.log(`  ${root}: (non-local, skipped)`);
    continue;
  }
  const resolved = path.resolve(repo, String(root));
  console.log(`  ${root}: ${exists(resolved) ? 'exists' : 'missing'}`);
}

console.log('notes:');
if (notes.length === 0) {
  console.log('  (none)');
}
for (const note of notes) {
  console.log(`  - ${note}`);
}

process.exit(0);
