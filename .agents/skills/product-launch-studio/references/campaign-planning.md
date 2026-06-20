<!--
Licensed to the Apache Software Foundation (ASF) under one or more
contributor license agreements. See the NOTICE file distributed with this
work for additional information regarding copyright ownership. The ASF
licenses this file to You under the Apache License, Version 2.0.
-->

# Campaign Planning

Campaign files live in `marketing/campaigns/<campaign-id>.yaml`.

## Required Campaign Fields

Include schema version, campaign ID, status, type, product ID, locale, target
audience IDs, primary audience ID, goal, launch angle, narrative, CTAs,
selected channels, selected asset types, approved claim IDs, prohibited
claims, approved assets, visual direction, aspect ratios, durations, platform
assumptions, platform-rule verification status, owner approvals, open
questions, due-date information, and review history.

## Plan Mode Output

Produce campaign goal, audience, launch angle, launch narrative, channel
selection, asset plan, content matrix, carousel outline, gallery outline,
video storyboard, shot list, deterministic capture plan, editability plan,
publication plan, launch-readiness gaps, and review checkpoints.

Do not mark `approved-for-publication` without explicit owner approval.
