#!/usr/bin/env node
/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements. See the NOTICE file distributed with this
 * work for additional information regarding copyright ownership. The ASF
 * licenses this file to You under the Apache License, Version 2.0.
 */

import path from 'node:path';
import {
  collectIds,
  exists,
  parseArgs,
  parseJsonFile,
  parseYamlFile,
  printHelp,
  repoRoot,
  reportAndExit,
} from './lib/marketing-utils.mjs';

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printHelp('validate-content-manifest.mjs', [
    'Usage: node .agents/skills/product-launch-studio/scripts/validate-content-manifest.mjs --repo . --manifest marketing/manifests/example.json',
    '       node .agents/skills/product-launch-studio/scripts/validate-content-manifest.mjs --repo . --schema-only',
    '',
    'Validates content manifest fields, dimensions, element ordering, locale, claim references, asset references,',
    'approval state, and output variant consistency. --schema-only parses bundled schemas without requiring a manifest.',
  ]);
  process.exit(0);
}

const repo = repoRoot(args);
const errors = [];
const warnings = [];

if (args['schema-only']) {
  for (const relative of [
    'marketing/manifests/content-manifest.schema.json',
    'marketing/manifests/carousel-manifest.schema.json',
    'marketing/manifests/static-asset-manifest.schema.json',
    'marketing/manifests/video-manifest.schema.json',
  ]) {
    const file = path.join(repo, relative);
    if (!exists(file)) {
      errors.push(`Missing schema: ${relative}`);
      continue;
    }
    const result = parseJsonFile(file);
    if (result.error) {
      errors.push(`Schema does not parse: ${relative}: ${result.error.message}`);
    }
  }
  reportAndExit(errors, warnings);
}

const manifestPath = path.resolve(repo, String(args.manifest || ''));
if (!args.manifest || !exists(manifestPath)) {
  errors.push('Provide an existing --manifest path or use --schema-only');
  reportAndExit(errors, warnings);
}

const manifestResult = parseJsonFile(manifestPath);
if (manifestResult.error) {
  errors.push(`Could not parse manifest JSON: ${manifestResult.error.message}`);
  reportAndExit(errors, warnings);
}

const manifest = manifestResult.data || {};
const product = parseYamlFile(path.join(repo, 'marketing', 'product.yaml')).data || {};
const claims = parseYamlFile(path.join(repo, 'marketing', 'claims.yaml')).data || {};
const assets = parseYamlFile(path.join(repo, 'marketing', 'asset-registry.yaml')).data || {};
const claimIds = collectIds(claims.claims, 'claim_id');
const assetIds = collectIds(assets.assets, 'asset_id');

for (const key of ['schema_version', 'manifest_id', 'format', 'locale', 'approval_state', 'dimensions', 'elements']) {
  if (manifest[key] == null) {
    errors.push(`Manifest missing ${key}`);
  }
}

if (product.primary_locale && manifest.locale && product.supported_locales) {
  const supported = Array.isArray(product.supported_locales) ? product.supported_locales : [];
  if (!supported.includes(manifest.locale)) {
    warnings.push(`Manifest locale ${manifest.locale} is not listed in product.supported_locales`);
  }
}

const dimensions = manifest.dimensions || {};
if (!Number.isInteger(dimensions.width) || dimensions.width <= 0) {
  errors.push('dimensions.width must be a positive integer');
}
if (!Number.isInteger(dimensions.height) || dimensions.height <= 0) {
  errors.push('dimensions.height must be a positive integer');
}

const elements = manifest.elements || [];
if (!Array.isArray(elements) || elements.length === 0) {
  errors.push('elements must be a non-empty array');
} else {
  const orders = new Set();
  for (const element of elements) {
    if (!Number.isInteger(element.order)) {
      errors.push(`Element ${element.element_id || '<unknown>'} missing integer order`);
    } else if (orders.has(element.order)) {
      errors.push(`Duplicate element order: ${element.order}`);
    }
    orders.add(element.order);
    for (const claimId of element.claim_ids || []) {
      if (!claimIds.has(String(claimId))) {
        errors.push(`Element ${element.element_id || '<unknown>'} references unknown claim_id ${claimId}`);
      }
    }
    for (const assetId of element.asset_ids || []) {
      if (!assetIds.has(String(assetId))) {
        warnings.push(`Element ${element.element_id || '<unknown>'} references unknown asset_id ${assetId}`);
      }
    }
  }
}

if (manifest.approval_state === 'approved-for-publication' && !manifest.owner_approved) {
  errors.push('approved-for-publication manifest requires owner_approved: true');
}

for (const variant of manifest.output_variants || []) {
  if (!variant.variant_id || !variant.format) {
    errors.push('Each output variant requires variant_id and format');
  }
  if (variant.width && variant.width !== dimensions.width && !variant.allow_dimension_override) {
    warnings.push(`Variant ${variant.variant_id} width differs from manifest dimensions`);
  }
}

reportAndExit(errors, warnings);
