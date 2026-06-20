<!--
Licensed to the Apache Software Foundation (ASF) under one or more
contributor license agreements. See the NOTICE file distributed with this
work for additional information regarding copyright ownership. The ASF
licenses this file to You under the Apache License, Version 2.0.
-->

# Remotion Workflow

Use `$remotion-best-practices` for Remotion implementation details. This skill
owns video purpose, campaign data, claim IDs, storyboard, shot list, capture
plan, composition manifest, aspect ratios, CTA, and QA.

## Implementation Boundary

Before implementing video rendering, inspect package manifests, lockfiles,
Node compatibility, existing media tooling, existing scripts, and whether a
separate workspace package is appropriate. Do not install Remotion runtime
dependencies during bootstrap. Install only for an explicit render
implementation task.

Remotion compositions must consume approved structured video manifests. Do
not hard-code campaign copy, claims, file paths, dimensions, durations, or
scene order independently across React components.
