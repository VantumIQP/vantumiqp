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
  parseYamlFile,
  printHelp,
  repoRoot,
  reportAndExit,
} from './lib/marketing-utils.mjs';

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printHelp('validate-claims.mjs', [
    'Usage: node .agents/skills/product-launch-studio/scripts/validate-claims.mjs --repo . [--campaign launch-v1]',
    '',
    'Validates referenced claim IDs, allowed statuses, locale compatibility, channel permissions,',
    'deprecated/prohibited claims, and campaign use of final-publication claims.',
  ]);
  process.exit(0);
}

const repo = repoRoot(args);
const campaignId = String(args.campaign || 'launch-v1');
const errors = [];
const warnings = [];
const claimsPath = path.join(repo, 'marketing', 'claims.yaml');
const campaignPath = path.join(repo, 'marketing', 'campaigns', `${campaignId}.yaml`);

if (!exists(claimsPath)) {
  errors.push('Missing marketing/claims.yaml');
}
if (!exists(campaignPath)) {
  errors.push(`Missing marketing/campaigns/${campaignId}.yaml`);
}
if (errors.length > 0) {
  reportAndExit(errors, warnings);
}

const claimsResult = parseYamlFile(claimsPath);
const campaignResult = parseYamlFile(campaignPath);
if (claimsResult.error) {
  errors.push(`Could not parse claims.yaml: ${claimsResult.error.message}`);
}
if (campaignResult.error) {
  errors.push(`Could not parse campaign: ${campaignResult.error.message}`);
}
if (errors.length > 0) {
  reportAndExit(errors, warnings);
}

const claims = claimsResult.data.claims || [];
const campaign = campaignResult.data || {};
const byId = new Map();
const allowedFinalStatuses = new Set(['verified', 'owner-approved']);
const provisionalAllowed = Boolean(campaign.allow_provisional_claims);

for (const claim of claims) {
  if (!claim.claim_id) {
    errors.push('Claim missing claim_id');
    continue;
  }
  if (byId.has(claim.claim_id)) {
    errors.push(`Duplicate claim_id ${claim.claim_id}`);
  }
  byId.set(String(claim.claim_id), claim);
  if (!claim.status) {
    errors.push(`Claim ${claim.claim_id} missing status`);
  }
  if (claim.status === 'verified' && !claim.supporting_evidence) {
    errors.push(`Claim ${claim.claim_id} is verified without supporting_evidence`);
  }
  if (claim.status === 'prohibited' && claim.exact_approved_wording) {
    warnings.push(`Prohibited claim ${claim.claim_id} should not have publication wording`);
  }
}

for (const claimId of campaign.approved_claim_ids || []) {
  const claim = byId.get(String(claimId));
  if (!claim) {
    errors.push(`Campaign references unknown claim ${claimId}`);
    continue;
  }
  if (claim.status === 'deprecated' || claim.status === 'prohibited') {
    errors.push(`Campaign references ${claim.status} claim ${claimId}`);
  }
  if (
    campaign.status === 'approved-for-publication' &&
    !allowedFinalStatuses.has(claim.status) &&
    !(provisionalAllowed && claim.status === 'provisional')
  ) {
    errors.push(`Final publication campaign cannot use claim ${claimId} with status ${claim.status}`);
  }
  if (campaign.locale && claim.locale && claim.locale !== campaign.locale) {
    errors.push(`Claim ${claimId} locale ${claim.locale} differs from campaign locale ${campaign.locale}`);
  }
  for (const channel of campaign.selected_channels || []) {
    const allowed = claim.allowed_channels || [];
    if (allowed.length > 0 && !allowed.includes(channel)) {
      errors.push(`Claim ${claimId} is not allowed for channel ${channel}`);
    }
  }
  if (claim.qualifications && !campaign.claim_qualification_policy) {
    warnings.push(`Claim ${claimId} has qualifications; campaign should preserve them explicitly`);
  }
}

for (const prohibitedId of campaign.prohibited_claims || []) {
  if (!byId.has(String(prohibitedId))) {
    warnings.push(`Campaign lists unknown prohibited claim ${prohibitedId}`);
  }
}

reportAndExit(errors, warnings);
