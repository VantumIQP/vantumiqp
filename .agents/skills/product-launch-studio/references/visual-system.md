<!--
Licensed to the Apache Software Foundation (ASF) under one or more
contributor license agreements. See the NOTICE file distributed with this
work for additional information regarding copyright ownership. The ASF
licenses this file to You under the Apache License, Version 2.0.
-->

# Visual System

Extract design signals from CSS variables, theme files, Tailwind or other
styling config, fonts, icons, logos, screenshots, and owner-approved assets.

## Rules

- Store product-specific visual tokens in `marketing/design.tokens.json`.
- Mark tokens inferred until owner-approved.
- Document fonts and fallbacks in `marketing/fonts-used.md`.
- Do not commit font binaries unless explicitly approved.
- Keep screenshots replaceable and separate from vector overlays.
- Do not claim Canva or Figma compatibility unless actually tested.
- Check text overflow, safe margins, contrast, hierarchy, and provenance.
