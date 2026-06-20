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
  ensureInside,
  exists,
  hasTodo,
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
    'Usage: node .agents/skills/product-launch-studio/scripts/validate-workspace.mjs --repo . [--campaign launch-v1]',
    '',
    'Checks required marketing workspace files, YAML/JSON parsing, product/campaign consistency,',
    'locale consistency, approval gates, unresolved TODO markers, missing assets, and path safety.',
  ]);
  process.exit(0);
}

const repo = repoRoot(args);
const campaignId = String(args.campaign || 'launch-v1');
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

for (const asset of assets.assets || []) {
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

reportAndExit(errors, warnings);
