<!--
Licensed to the Apache Software Foundation (ASF) under one or more
contributor license agreements. See the NOTICE file distributed with this
work for additional information regarding copyright ownership. The ASF
licenses this file to You under the Apache License, Version 2.0.
-->

# Deterministic Rendering

Rendering code should consume approved manifests and produce reproducible
source artifacts plus derivatives.

## Static Assets

Create editable-first SVG and PPTX sources. Generate PNG and PDF only as
derivatives. Validate dimensions, live text, named groups, fonts, screenshot
references, and output counts.

## Video

Use Remotion as the branded composition system. FFmpeg may support probing,
trimming, normalization, transcoding, thumbnails, and compatibility checks,
but not replace the branded composition layer.

Do not render assets in generate mode unless explicitly requested.
