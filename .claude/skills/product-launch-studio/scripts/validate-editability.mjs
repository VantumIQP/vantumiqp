#!/usr/bin/env node
/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements. See the NOTICE file distributed with this
 * work for additional information regarding copyright ownership. The ASF
 * licenses this file to You under the Apache License, Version 2.0.
 */

import path from 'node:path';
import {
  exists,
  parseArgs,
  parseJsonFile,
  printHelp,
  repoRoot,
  reportAndExit,
} from './lib/marketing-utils.mjs';

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printHelp('validate-editability.mjs', [
    'Usage: node .agents/skills/product-launch-studio/scripts/validate-editability.mjs --repo . [--manifest marketing/manifests/carousel.json]',
    '',
    'Checks editable SVG/PPTX/PDF/PNG counts where a manifest exists, fonts-used.md, editability report,',
    'source screenshot availability, reference consistency, and external import-test claims.',
  ]);
  process.exit(0);
}

const repo = repoRoot(args);
const errors = [];
const warnings = [];

const fonts = path.join(repo, 'marketing', 'fonts-used.md');
const report = path.join(repo, 'marketing', 'reviews', 'editability-report.md');
if (!exists(fonts)) {
  errors.push('Missing marketing/fonts-used.md');
}
if (!exists(report)) {
  errors.push('Missing marketing/reviews/editability-report.md');
}

if (!args.manifest) {
  warnings.push('No --manifest supplied; checked workspace-level editability files only');
  reportAndExit(errors, warnings);
}

const manifestPath = path.resolve(repo, String(args.manifest));
if (!exists(manifestPath)) {
  errors.push(`Manifest not found: ${args.manifest}`);
  reportAndExit(errors, warnings);
}

const result = parseJsonFile(manifestPath);
if (result.error) {
  errors.push(`Could not parse manifest JSON: ${result.error.message}`);
  reportAndExit(errors, warnings);
}

const manifest = result.data || {};
const slides = manifest.slides || manifest.pages || [];
if (!Array.isArray(slides) || slides.length === 0) {
  warnings.push('Manifest has no slides/pages; no asset-count checks performed');
  reportAndExit(errors, warnings);
}

for (const slide of slides) {
  for (const [key, label] of [
    ['editable_svg', 'editable SVG'],
    ['pptx', 'PPTX'],
  ]) {
    if (!slide[key]) {
      errors.push(`Slide ${slide.slide_id || slide.page_id || '<unknown>'} missing ${label}`);
      continue;
    }
    const file = path.join(repo, String(slide[key]));
    if (!exists(file)) {
      errors.push(`Slide ${slide.slide_id || slide.page_id || '<unknown>'} ${label} file missing: ${slide[key]}`);
    }
  }
  for (const key of ['png_preview', 'pdf_derivative', 'source_screenshot']) {
    if (slide[key]) {
      const file = path.join(repo, String(slide[key]));
      if (!exists(file)) {
        warnings.push(`Slide ${slide.slide_id || slide.page_id || '<unknown>'} references missing ${key}: ${slide[key]}`);
      }
    }
  }
}

if (manifest.externally_import_tested === true && !manifest.external_import_evidence) {
  errors.push('Manifest claims external import testing without evidence');
}

reportAndExit(errors, warnings);
