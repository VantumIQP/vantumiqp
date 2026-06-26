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
  collectFlagValues,
  ensureInside,
  exists,
  listFiles,
  parseArgs,
  printHelp,
  readText,
  repoRoot,
  writeText,
} from './lib/marketing-utils.mjs';

const argv = process.argv.slice(2);
const args = parseArgs(argv);

if (args.help) {
  printHelp('inspect-assets.mjs', [
    'Usage: node .agents/skills/product-launch-studio/scripts/inspect-assets.mjs --repo . \\',
    '         [--asset-root <path> ...] [--auto-discover] [--out marketing/research/asset-inventory.md] [--dry-run]',
    '',
    'Scans asset roots (or auto-discovers common locations), classifies files by type and',
    'vector/raster form, reads basic SVG/PNG dimensions where practical, and writes a draft',
    'asset inventory report. Repeat --asset-root for multiple roots. Roots outside the repo',
    'are allowed and reported as external. Never modifies original assets and never calls an LLM.',
    '',
    '--dry-run prints the summary without writing the report.',
  ]);
  process.exit(0);
}

const repo = repoRoot(args);
const dryRun = Boolean(args['dry-run']);
const outRelative = String(args.out || 'marketing/research/asset-inventory.md');
const explicitRoots = collectFlagValues(argv, 'asset-root');

const AUTO_DISCOVER_DIRS = [
  'public',
  'static',
  'assets',
  'app/assets',
  'src/assets',
  'marketing-site/public',
  'landing-page/public',
  'marketing/assets',
];

const VECTOR_EXT = new Set(['.svg', '.ai', '.eps']);
const RASTER_EXT = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.tif', '.tiff', '.ico', '.avif']);
const VIDEO_EXT = new Set(['.mp4', '.webm', '.mov', '.m4v', '.avi', '.mkv']);
const AUDIO_EXT = new Set(['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac']);
const DOC_EXT = new Set(['.pdf', '.pptx', '.ppt', '.key', '.pages', '.doc', '.docx']);
const SOURCE_EXT = new Set(['.sketch', '.fig', '.xd', '.psd', '.afdesign', '.afphoto']);
const FONT_EXT = new Set(['.ttf', '.otf', '.woff', '.woff2']);

const IGNORE_DIR = /(^|[/\\])(node_modules|\.git|dist|build|coverage|\.next|out|\.cache)([/\\]|$)/;

function classify(ext) {
  if (VECTOR_EXT.has(ext)) return { type: 'vector', vector: true };
  if (RASTER_EXT.has(ext)) return { type: 'raster', vector: false };
  if (VIDEO_EXT.has(ext)) return { type: 'video', vector: false };
  if (AUDIO_EXT.has(ext)) return { type: 'audio', vector: false };
  if (ext === '.pdf') return { type: 'document', vector: true };
  if (DOC_EXT.has(ext)) return { type: 'document', vector: false };
  if (SOURCE_EXT.has(ext)) return { type: 'design-source', vector: true };
  if (FONT_EXT.has(ext)) return { type: 'font', vector: true };
  return { type: 'other', vector: false };
}

function formLabel(asset) {
  if (asset.type === 'vector' || asset.type === 'design-source') return 'vector';
  if (asset.type === 'raster') return 'raster';
  if (asset.type === 'document') return asset.ext === '.pdf' ? 'vector/pdf' : 'document';
  return asset.type;
}

function likelyRole(relPath) {
  const lower = relPath.toLowerCase();
  if (/logo|wordmark|brandmark/.test(lower)) return 'logo';
  if (/favicon|app-?icon|(^|[/\\])icon/.test(lower)) return 'icon';
  if (/screenshot|screen-?grab|capture/.test(lower)) return 'screenshot';
  if (/recording|screencast/.test(lower)) return 'recording';
  if (/brand|style-?guide|guidelines/.test(lower)) return 'brand-guide';
  if (/og-?image|social|banner|hero/.test(lower)) return 'social-or-hero';
  return 'unknown';
}

function svgDimensions(file) {
  try {
    const text = readText(file);
    const width = text.match(/\bwidth\s*=\s*"([^"]+)"/i);
    const height = text.match(/\bheight\s*=\s*"([^"]+)"/i);
    if (width && height) {
      return `${width[1]} x ${height[1]}`;
    }
    const viewBox = text.match(/viewBox\s*=\s*"([^"]+)"/i);
    if (viewBox) {
      const parts = viewBox[1].trim().split(/[\s,]+/);
      if (parts.length === 4) {
        return `${parts[2]} x ${parts[3]} (viewBox)`;
      }
    }
  } catch {
    return null;
  }
  return null;
}

function pngDimensions(file) {
  try {
    const fd = fs.openSync(file, 'r');
    const buffer = Buffer.alloc(24);
    fs.readSync(fd, buffer, 0, 24, 0);
    fs.closeSync(fd);
    if (buffer.toString('hex', 0, 8) !== '89504e470d0a1a0a') {
      return null;
    }
    return `${buffer.readUInt32BE(16)} x ${buffer.readUInt32BE(20)}`;
  } catch {
    return null;
  }
}

function measure(file, ext) {
  if (ext === '.svg') return svgDimensions(file);
  if (ext === '.png') return pngDimensions(file);
  return null;
}

function dimensionsDisplay(asset) {
  if (asset.dimensions) return asset.dimensions;
  if (asset.type === 'video' || asset.type === 'audio') return 'duration-not-computed';
  if (asset.type === 'raster' || asset.type === 'vector') return 'not-computed';
  return '-';
}

function humanBytes(value) {
  if (value == null) return '?';
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function scanRoot(rootInput) {
  const resolved = path.resolve(repo, String(rootInput));
  const inside = ensureInside(repo, resolved);
  const files = listFiles(resolved, candidate => !IGNORE_DIR.test(candidate));
  return files.map(file => {
    const ext = path.extname(file).toLowerCase();
    const meta = classify(ext);
    const displayPath = inside ? path.relative(repo, file) : file;
    let bytes = null;
    try {
      bytes = fs.statSync(file).size;
    } catch {
      bytes = null;
    }
    return {
      root: String(rootInput),
      path: displayPath,
      absPath: file,
      inside,
      ext: ext || '(none)',
      type: meta.type,
      vector: meta.vector,
      role: likelyRole(displayPath),
      dimensions: measure(file, ext),
      bytes,
    };
  });
}

let effectiveAuto = Boolean(args['auto-discover']);
const cleanedExplicit = [];
for (const root of explicitRoots) {
  const lower = String(root).toLowerCase();
  if (lower === 'auto-discover') {
    effectiveAuto = true;
  } else if (lower !== 'none') {
    cleanedExplicit.push(root);
  }
}
if (cleanedExplicit.length === 0 && explicitRoots.length === 0 && !effectiveAuto) {
  effectiveAuto = true;
}

const roots = [...cleanedExplicit];
if (effectiveAuto) {
  for (const dir of AUTO_DISCOVER_DIRS) {
    if (exists(path.resolve(repo, dir))) {
      roots.push(dir);
    }
  }
}

const seen = new Set();
const assets = [];
const scannedRoots = [];
for (const root of roots) {
  if (scannedRoots.includes(root)) {
    continue;
  }
  scannedRoots.push(root);
  for (const entry of scanRoot(root)) {
    if (seen.has(entry.absPath)) {
      continue;
    }
    seen.add(entry.absPath);
    assets.push(entry);
  }
}

const lines = [];
lines.push('<!--');
lines.push('Licensed to the Apache Software Foundation (ASF) under one or more');
lines.push('contributor license agreements. See the NOTICE file distributed with this');
lines.push('work for additional information regarding copyright ownership. The ASF');
lines.push('licenses this file to You under the Apache License, Version 2.0.');
lines.push('-->');
lines.push('');
lines.push('# Asset Inventory (draft)');
lines.push('');
lines.push('Generated by scripts/inspect-assets.mjs. This is a deterministic draft, not an');
lines.push('approval. Set provenance, license, publication safety, and approval in');
lines.push('marketing/asset-registry.yaml. See references/asset-intake.md.');
lines.push('');
lines.push(`- roots scanned: ${scannedRoots.length ? scannedRoots.join(', ') : '(none found)'}`);
lines.push(`- assets found: ${assets.length}`);
lines.push('');
if (assets.length === 0) {
  lines.push('No assets found. Supply --asset-root <path> or add files to common asset folders.');
} else {
  lines.push('| File | Type | Form | Dimensions/Duration | Likely usage | Approval | Provenance | Publication-safe | Notes |');
  lines.push('|------|------|------|---------------------|--------------|----------|------------|------------------|-------|');
  for (const asset of assets) {
    const note = `${asset.inside ? 'in-repo' : 'external'}; root ${asset.root}; ${asset.ext}; ${humanBytes(asset.bytes)}`;
    lines.push(
      `| ${asset.path} | ${asset.type} | ${formLabel(asset)} | ${dimensionsDisplay(asset)} | ${asset.role} | unreviewed | unknown | review-required | ${note} |`,
    );
  }
}
lines.push('');
const report = `${lines.join('\n')}\n`;

const outPath = path.join(repo, outRelative);
if (!ensureInside(repo, outPath)) {
  console.error(`[error] --out must stay inside the repo: ${outRelative}`);
  process.exit(1);
}
if (!dryRun) {
  writeText(outPath, report);
}

const byType = {};
for (const asset of assets) {
  byType[asset.type] = (byType[asset.type] || 0) + 1;
}

console.log(`repo: ${repo}`);
console.log(`auto_discover: ${effectiveAuto}`);
console.log(`roots_scanned: ${scannedRoots.join(', ') || '(none)'}`);
console.log(`assets_found: ${assets.length}`);
console.log('by_type:');
for (const [type, count] of Object.entries(byType).sort()) {
  console.log(`  ${type}: ${count}`);
}
console.log(`report: ${outRelative}`);
console.log(`report_written: ${dryRun ? 'skipped (dry-run)' : 'yes'}`);

process.exit(0);
