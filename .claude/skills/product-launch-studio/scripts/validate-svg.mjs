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
  printHelp,
  readText,
  reportAndExit,
} from './lib/marketing-utils.mjs';

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printHelp('validate-svg.mjs', [
    'Usage: node .agents/skills/product-launch-studio/scripts/validate-svg.mjs --svg marketing/assets/vectors/slide-01.svg [--width 1080 --height 1080] [--groups bg,content,cta]',
    '',
    'Checks SVG parsing basics, viewBox, dimensions/aspect ratio, named groups, live text, foreignObject/script,',
    'unresolved external references, raster-only full-slide composition, and deterministic file naming.',
  ]);
  process.exit(0);
}

const errors = [];
const warnings = [];
const svgPath = args.svg ? path.resolve(String(args.svg)) : '';

if (!svgPath || !exists(svgPath)) {
  errors.push('Provide an existing --svg file');
  reportAndExit(errors, warnings);
}

const name = path.basename(svgPath);
if (!/^[a-z0-9][a-z0-9-]*\.svg$/.test(name)) {
  errors.push(`SVG filename is not deterministic kebab-case: ${name}`);
}

const text = readText(svgPath);
if (!/<svg[\s>]/.test(text) || !/<\/svg>/.test(text)) {
  errors.push('File does not look like complete SVG XML');
}
if (/<script[\s>]/i.test(text)) {
  errors.push('SVG contains script element');
}
if (/<foreignObject[\s>]/i.test(text)) {
  errors.push('SVG contains foreignObject element');
}
if (/\s(?:href|xlink:href)=["'](?:https?:|file:|data:(?!image\/(?:png|jpeg|webp)))/i.test(text)) {
  errors.push('SVG contains unresolved or unsafe external asset reference');
}
if (!/<text[\s>]/i.test(text)) {
  errors.push('Editable SVG must retain live text nodes');
}

const viewBox = text.match(/\sviewBox=["']([^"']+)["']/i);
if (!viewBox) {
  errors.push('SVG missing viewBox');
} else {
  const parts = viewBox[1].trim().split(/\s+/).map(Number);
  if (parts.length !== 4 || parts.some(Number.isNaN) || parts[2] <= 0 || parts[3] <= 0) {
    errors.push('SVG viewBox must have four numeric values with positive width and height');
  }
}

const expectedWidth = args.width ? Number(args.width) : null;
const expectedHeight = args.height ? Number(args.height) : null;
const width = text.match(/\swidth=["']([^"']+)["']/i);
const height = text.match(/\sheight=["']([^"']+)["']/i);
if (expectedWidth && (!width || Number.parseFloat(width[1]) !== expectedWidth)) {
  errors.push(`SVG width does not match expected ${expectedWidth}`);
}
if (expectedHeight && (!height || Number.parseFloat(height[1]) !== expectedHeight)) {
  errors.push(`SVG height does not match expected ${expectedHeight}`);
}

if (args.groups) {
  for (const group of String(args.groups).split(',').map(item => item.trim()).filter(Boolean)) {
    const escaped = group.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`<g[^>]+id=["']${escaped}["']`, 'i');
    if (!pattern.test(text)) {
      errors.push(`SVG missing named group: ${group}`);
    }
  }
}

const imageTags = [...text.matchAll(/<image\b[^>]*>/gi)];
if (imageTags.length > 0 && !/<text[\s>]/i.test(text)) {
  errors.push('SVG appears to be a raster-only composition without live text');
}
if (imageTags.length > 0) {
  warnings.push('SVG contains raster image references; confirm screenshots remain separately replaceable');
}

reportAndExit(errors, warnings);
