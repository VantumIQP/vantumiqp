<!--
Licensed to the Apache Software Foundation (ASF) under one or more
contributor license agreements. See the NOTICE file distributed with this
work for additional information regarding copyright ownership. The ASF
licenses this file to You under the Apache License, Version 2.0.
-->

# Claim Conflicts

Status: draft

## Inherited Superset Links

README and docs copy still reference Apache Superset GitHub, Superset docs,
Superset release notes, Superset Slack, and Superset-hosted media. These may be
appropriate for an upstream-derived product, but they are not automatically
VantumIQP launch claims.

Decision needed: keep upstream references, replace with VantumIQP URLs, or
explain the relationship explicitly.

## Social Proof

Docs copy says: "Join thousands of companies using VantumIQP to explore and
visualize their data."

Status: conflicting. The evidence appears inherited from Superset community
materials and does not prove VantumIQP usage. Do not use this in launch copy
unless the owner supplies proof.

## Design Tokens

The app theme primary color is `#2893B3`; the docs primary color is `#20a7c9`.
Docs CSS also contains malformed `#t` for `--ifm-color-primary-darker`.

Decision needed: choose the launch palette and fix or ignore the malformed docs
token before using docs CSS as a design source.

## Database And Visualization Breadth

README and docs include broad database support and visualization-count claims.
These may be true for the Superset-derived codebase, but this bootstrap did not
verify the exact VantumIQP distribution or count installed visualizations.
