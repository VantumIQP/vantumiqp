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
  collectIds,
  ensureInside,
  exists,
  hasTodo,
  isLocalAssetRoot,
  isSentinelUrl,
  looksLikeUrl,
  parseArgs,
  parseJsonFile,
  parseYamlFile,
  printHelp,
  repoRoot,
  reportAndExit,
} from './lib/marketing-utils.mjs';

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printHelp('validate-workspace.mjs', [
    'Usage: node .agents/skills/product-launch-studio/scripts/validate-workspace.mjs --repo . [--campaign launch-v1] [--require-asset-roots]',
    '',
    'Checks required marketing workspace files, YAML/JSON parsing, product/campaign consistency,',
    'locale consistency, approval gates, unresolved TODO markers, missing assets, and path safety.',
    'When marketing/intake.yaml is present, validates control mode, run preset, product and',
    'marketing-site URL format, output intensity, and asset roots. Missing local asset roots are',
    'warnings by default and become errors with --require-asset-roots (use for render tasks).',
  ]);
  process.exit(0);
}

const repo = repoRoot(args);
const campaignId = String(args.campaign || 'launch-v1');
const requireAssetRoots = Boolean(args['require-asset-roots']);
const marketing = path.join(repo, 'marketing');
const errors = [];
const warnings = [];

const required = [
  'README.md',
  'product.yaml',
  'claims.yaml',
  'audiences.yaml',
  'asset-registry.yaml',
  'voice.md',
  'design.tokens.json',
  'DESIGN.md',
  'fonts-used.md',
  'research/repository-inspection.md',
  'research/evidence-map.md',
  'research/claim-conflicts.md',
  'research/platform-rules.md',
  'research/launch-readiness.md',
  `campaigns/${campaignId}.yaml`,
  'assets/README.md',
  'renderers/README.md',
  'reviews/review-checklist.md',
];

for (const relative of required) {
  const target = path.join(marketing, relative);
  if (!exists(target)) {
    errors.push(`Missing required file: marketing/${relative}`);
  }
}

const productPath = path.join(marketing, 'product.yaml');
const claimsPath = path.join(marketing, 'claims.yaml');
const audiencesPath = path.join(marketing, 'audiences.yaml');
const assetsPath = path.join(marketing, 'asset-registry.yaml');
const campaignPath = path.join(marketing, 'campaigns', `${campaignId}.yaml`);
const tokensPath = path.join(marketing, 'design.tokens.json');

const productResult = exists(productPath) ? parseYamlFile(productPath) : { data: null };
const claimsResult = exists(claimsPath) ? parseYamlFile(claimsPath) : { data: null };
const audiencesResult = exists(audiencesPath) ? parseYamlFile(audiencesPath) : { data: null };
const assetsResult = exists(assetsPath) ? parseYamlFile(assetsPath) : { data: null };
const campaignResult = exists(campaignPath) ? parseYamlFile(campaignPath) : { data: null };
const tokensResult = exists(tokensPath) ? parseJsonFile(tokensPath) : { data: null };

for (const [name, result] of [
  ['product.yaml', productResult],
  ['claims.yaml', claimsResult],
  ['audiences.yaml', audiencesResult],
  [`campaigns/${campaignId}.yaml`, campaignResult],
  ['asset-registry.yaml', assetsResult],
]) {
  if (result.error) {
    errors.push(`Could not parse marketing/${name}: ${result.error.message}`);
  }
}

if (tokensResult.error) {
  errors.push(`Could not parse marketing/design.tokens.json: ${tokensResult.error.message}`);
}

const product = productResult.data || {};
const campaign = campaignResult.data || {};
const claims = claimsResult.data || {};
const audiences = audiencesResult.data || {};
const assets = assetsResult.data || {};

if (!product.product_id) {
  errors.push('product.yaml missing product_id');
}
if (!product.product_name) {
  errors.push('product.yaml missing product_name');
}
if (!campaign.campaign_id) {
  errors.push(`campaigns/${campaignId}.yaml missing campaign_id`);
} else if (campaign.campaign_id !== campaignId) {
  errors.push(`campaign_id ${campaign.campaign_id} does not match requested ${campaignId}`);
}
if (product.product_id && campaign.product_id && product.product_id !== campaign.product_id) {
  errors.push(`Campaign product_id ${campaign.product_id} does not match product_id ${product.product_id}`);
}
if (product.primary_locale && campaign.locale && product.primary_locale !== campaign.locale) {
  warnings.push(`Campaign locale ${campaign.locale} differs from product primary_locale ${product.primary_locale}`);
}

const audienceIds = collectIds(audiences.audiences, 'audience_id');
for (const audienceId of campaign.target_audience_ids || []) {
  if (!audienceIds.has(String(audienceId))) {
    warnings.push(`Campaign references unknown audience_id: ${audienceId}`);
  }
}

const claimIds = collectIds(claims.claims, 'claim_id');
for (const claimId of campaign.approved_claim_ids || []) {
  if (!claimIds.has(String(claimId))) {
    errors.push(`Campaign references unknown approved claim_id: ${claimId}`);
  }
}

const UNSAFE_PUBLICATION = new Set(['unsafe', 'private', 'customer-data', 'credential-risk']);

for (const asset of assets.assets || []) {
  const label = asset.asset_id || asset.path || '(unknown asset)';
  if (asset.final_allowed === true) {
    if (asset.provenance_status == null || ['unknown', 'missing'].includes(String(asset.provenance_status))) {
      warnings.push(`Asset ${label} is final_allowed but provenance_status is ${asset.provenance_status || 'unset'}`);
    }
    if (UNSAFE_PUBLICATION.has(String(asset.publication_safety))) {
      warnings.push(`Asset ${label} is final_allowed but publication_safety is ${asset.publication_safety}`);
    }
    if (asset.contains_sensitive_info === true || String(asset.contains_sensitive_info).toLowerCase() === 'yes') {
      warnings.push(`Asset ${label} is final_allowed but marked contains_sensitive_info`);
    }
  }
  if (!asset.path) {
    continue;
  }
  const assetPath = path.join(repo, String(asset.path));
  if (!ensureInside(repo, assetPath)) {
    errors.push(`Asset path escapes repository: ${asset.path}`);
  }
  if (asset.status === 'approved' && !exists(assetPath)) {
    errors.push(`Approved asset is missing: ${asset.path}`);
  }
}

if (['approved-for-publication', 'published'].includes(campaign.status)) {
  const approvals = campaign.owner_approvals || {};
  if (!approvals.product_truth || !approvals.claims || !approvals.visuals || !approvals.platform_rules) {
    errors.push(`Campaign status ${campaign.status} requires explicit owner approvals`);
  }
}

for (const [name, data] of [
  ['product.yaml', product],
  ['claims.yaml', claims],
  ['audiences.yaml', audiences],
  [`campaigns/${campaignId}.yaml`, campaign],
]) {
  if (hasTodo(data)) {
    warnings.push(`Unresolved TODO or owner-review marker in ${name}`);
  }
}

function checkControlMode(source, value) {
  if (value != null && !CONTROL_MODES.has(String(value))) {
    errors.push(`${source} has invalid control_mode '${value}' (expected autopilot, checkpoint, or ask)`);
  }
}

function checkRunPreset(source, value) {
  if (value != null && value !== '' && !RUN_PRESETS.has(String(value))) {
    errors.push(`${source} has invalid run_preset '${value}'`);
  }
}

function checkUrl(source, field, value) {
  if (isSentinelUrl(value)) {
    return;
  }
  if (!looksLikeUrl(value)) {
    warnings.push(`${source} ${field} '${value}' does not look like an http(s) URL`);
  }
}

function checkOutputIntensity(source, value) {
  if (value != null && !OUTPUT_INTENSITIES.has(String(value))) {
    warnings.push(`${source} output_intensity '${value}' is not one of minimal, standard, full`);
  }
}

function checkAssetRoots(source, roots) {
  if (!Array.isArray(roots)) {
    return;
  }
  for (const root of roots) {
    if (!isLocalAssetRoot(root)) {
      continue;
    }
    const resolved = path.resolve(repo, String(root));
    if (!exists(resolved)) {
      const message = `${source} asset_root does not exist: ${root}`;
      if (requireAssetRoots) {
        errors.push(message);
      } else {
        warnings.push(message);
      }
    }
  }
}

// Optional control/intake fields carried on the campaign.
checkControlMode(`campaigns/${campaignId}.yaml`, campaign.control_mode);
checkRunPreset(`campaigns/${campaignId}.yaml`, campaign.run_preset);
checkUrl(`campaigns/${campaignId}.yaml`, 'product_url', campaign.product_url);
checkUrl(`campaigns/${campaignId}.yaml`, 'marketing_site_url', campaign.marketing_site_url);
checkOutputIntensity(`campaigns/${campaignId}.yaml`, campaign.output_intensity);
checkAssetRoots(`campaigns/${campaignId}.yaml`, campaign.asset_roots);

// Optional initial intake (marketing/intake.yaml). Validated only when present.
const intakePath = path.join(marketing, 'intake.yaml');
if (exists(intakePath)) {
  const intakeResult = parseYamlFile(intakePath);
  if (intakeResult.error) {
    errors.push(`Could not parse marketing/intake.yaml: ${intakeResult.error.message}`);
  } else {
    const intake = intakeResult.data || {};
    checkControlMode('intake.yaml', intake.control_mode);
    checkRunPreset('intake.yaml', intake.run_preset);
    checkUrl('intake.yaml', 'product_url', intake.product_url);
    checkUrl('intake.yaml', 'marketing_site_url', intake.marketing_site_url);
    checkOutputIntensity('intake.yaml', intake.output_intensity);
    checkAssetRoots('intake.yaml', intake.asset_roots);
  }
}

reportAndExit(errors, warnings);
