<!--
Licensed to the Apache Software Foundation (ASF) under one or more
contributor license agreements. See the NOTICE file distributed with this
work for additional information regarding copyright ownership. The ASF
licenses this file to You under the Apache License, Version 2.0.
-->

# Design Notes

Status: draft

## Extracted Signals

- App primary color: `#2893B3` from `superset/config.py`.
- Docs primary color: `#20a7c9` from `docs/src/styles/custom.css`.
- Docs dark footer/background color: `#173036`.
- Docs font: Roboto, declared in `docs/src/styles/custom.css`.
- Logo sources: `superset-frontend/src/assets/images/vantumiqp_logo.png` and
  `docs/static/img/vantumiqp-logo.png`.

## Review Notes

- The app and docs use different primary blues; choose one launch palette.
- `docs/src/styles/custom.css` includes malformed `#t`; do not use that token.
- Font files are referenced in docs; do not add or move font binaries during
  launch asset work without owner approval.
- Keep screenshot layers replaceable in SVG/PPTX sources.
- Do not claim Canva or Figma compatibility until import testing is performed.
