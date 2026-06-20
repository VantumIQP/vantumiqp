/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements. See the NOTICE file distributed with this
 * work for additional information regarding copyright ownership. The ASF
 * licenses this file to You under the Apache License, Version 2.0.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) {
      args._ = [...(args._ || []), token];
      continue;
    }
    const eq = token.indexOf('=');
    if (eq !== -1) {
      args[token.slice(2, eq)] = token.slice(eq + 1);
      continue;
    }
    const key = token.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith('--')) {
      args[key] = true;
    } else {
      args[key] = next;
      index += 1;
    }
  }
  return args;
}

export function printHelp(title, lines) {
  console.log(title);
  console.log('');
  for (const line of lines) {
    console.log(line);
  }
}

export function repoRoot(args) {
  return path.resolve(String(args.repo || process.cwd()));
}

export function skillRootFromScript(importMetaUrl) {
  return path.resolve(path.dirname(fileURLToPath(importMetaUrl)), '..');
}

export function readText(file) {
  return fs.readFileSync(file, 'utf8');
}

export function writeText(file, data, dryRun = false) {
  if (dryRun) {
    return;
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, data, 'utf8');
}

export function exists(file) {
  return fs.existsSync(file);
}

export function listFiles(root, predicate = () => true) {
  if (!exists(root)) {
    return [];
  }
  const out = [];
  const stack = [root];
  while (stack.length > 0) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
      } else if (predicate(fullPath)) {
        out.push(fullPath);
      }
    }
  }
  return out.sort();
}

export function ensureInside(base, target) {
  const resolvedBase = path.resolve(base);
  const resolvedTarget = path.resolve(target);
  const relative = path.relative(resolvedBase, resolvedTarget);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

export function parseJsonFile(file) {
  try {
    return { data: JSON.parse(readText(file)), error: null };
  } catch (error) {
    return { data: null, error };
  }
}

function cleanYamlLine(raw) {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.startsWith('#')) {
    return null;
  }
  return raw.replace(/\r$/, '');
}

function countIndent(line) {
  return line.match(/^ */)[0].length;
}

function parseScalar(value) {
  const trimmed = value.trim();
  if (trimmed === '') {
    return '';
  }
  if (trimmed === 'null' || trimmed === '~') {
    return null;
  }
  if (trimmed === 'true') {
    return true;
  }
  if (trimmed === 'false') {
    return false;
  }
  if (trimmed === '[]') {
    return [];
  }
  if (trimmed === '{}') {
    return {};
  }
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    const body = trimmed.slice(1, -1).trim();
    if (!body) {
      return [];
    }
    return body.split(',').map(item => parseScalar(item.trim()));
  }
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return Number(trimmed);
  }
  return trimmed;
}

function splitKeyValue(text) {
  const index = text.indexOf(':');
  if (index === -1) {
    return [text.trim(), null];
  }
  return [text.slice(0, index).trim(), text.slice(index + 1).trim()];
}

function mergeObject(target, source) {
  if (source && typeof source === 'object' && !Array.isArray(source)) {
    Object.assign(target, source);
  }
}

function parseBlock(lines, start, indent) {
  if (start >= lines.length || lines[start].indent < indent) {
    return [null, start];
  }
  const isArray = lines[start].text.startsWith('- ');
  if (isArray) {
    const arr = [];
    let index = start;
    while (
      index < lines.length &&
      lines[index].indent === indent &&
      lines[index].text.startsWith('- ')
    ) {
      const content = lines[index].text.slice(2).trim();
      if (!content) {
        const [child, next] = parseBlock(lines, index + 1, indent + 2);
        arr.push(child);
        index = next;
        continue;
      }
      if (content.includes(':')) {
        const obj = {};
        const [key, rawValue] = splitKeyValue(content);
        if (rawValue === null || rawValue === '') {
          const [child, next] = parseBlock(lines, index + 1, indent + 2);
          obj[key] = child;
          index = next;
        } else {
          obj[key] = parseScalar(rawValue);
          index += 1;
        }
        if (index < lines.length && lines[index].indent === indent + 2) {
          const [more, next] = parseBlock(lines, index, indent + 2);
          mergeObject(obj, more);
          index = next;
        }
        arr.push(obj);
      } else {
        arr.push(parseScalar(content));
        index += 1;
      }
    }
    return [arr, index];
  }

  const obj = {};
  let index = start;
  while (
    index < lines.length &&
    lines[index].indent === indent &&
    !lines[index].text.startsWith('- ')
  ) {
    const [key, rawValue] = splitKeyValue(lines[index].text);
    if (rawValue === null) {
      obj[key] = true;
      index += 1;
      continue;
    }
    if (rawValue === '') {
      const [child, next] = parseBlock(lines, index + 1, indent + 2);
      obj[key] = child;
      index = next;
    } else {
      obj[key] = parseScalar(rawValue);
      index += 1;
    }
  }
  return [obj, index];
}

export function parseYaml(text) {
  const lines = text
    .split('\n')
    .map(cleanYamlLine)
    .filter(Boolean)
    .map(line => ({ indent: countIndent(line), text: line.trim() }));
  if (lines.length === 0) {
    return {};
  }
  const [data] = parseBlock(lines, 0, lines[0].indent);
  return data || {};
}

export function parseYamlFile(file) {
  try {
    return { data: parseYaml(readText(file)), error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export function hasTodo(value) {
  if (value == null) {
    return false;
  }
  if (typeof value === 'string') {
    return /TODO|TBD|REQUIRES_OWNER_REVIEW/i.test(value);
  }
  if (Array.isArray(value)) {
    return value.some(hasTodo);
  }
  if (typeof value === 'object') {
    return Object.values(value).some(hasTodo);
  }
  return false;
}

export function collectIds(items, key) {
  const ids = new Set();
  if (!Array.isArray(items)) {
    return ids;
  }
  for (const item of items) {
    if (item && item[key]) {
      ids.add(String(item[key]));
    }
  }
  return ids;
}

export function reportAndExit(errors, warnings = []) {
  for (const warning of warnings) {
    console.warn(`[warn] ${warning}`);
  }
  if (errors.length > 0) {
    for (const error of errors) {
      console.error(`[error] ${error}`);
    }
    process.exit(1);
  }
  console.log('[ok] validation passed');
  process.exit(0);
}

export function makeTempRepo(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

export function removeDirSafe(target, requiredPrefix) {
  const resolved = path.resolve(target);
  const allowed = path.resolve(requiredPrefix);
  if (!ensureInside(allowed, resolved)) {
    throw new Error(`Refusing to remove outside ${allowed}: ${resolved}`);
  }
  fs.rmSync(resolved, { recursive: true, force: true });
}
