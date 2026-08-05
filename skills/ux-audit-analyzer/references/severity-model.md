# Traffic-light and severity model

## Traffic-light color

### Red — problem

Use red when the interface creates a material obstacle or risk, for example:

- the user may fail to complete a key task;
- the user can make a serious error or lose data;
- the next step or consequence is materially unclear;
- business logic is contradicted or hidden;
- recovery is unavailable or very costly;
- an important accessibility barrier is evident.

### Yellow — attention needed

Use yellow when the task remains possible but the interface causes avoidable friction, for example:

- extra effort or repeated input;
- inconsistent behavior or terminology;
- weak hierarchy or discoverability;
- uncertainty with a reversible or limited consequence;
- a missing secondary state;
- a design choice that may not scale.

### Green — strength

Use green when a solution clearly supports the task and should be preserved or reused, for example:

- the user can estimate price or consequences before committing;
- the next step is clear and appropriately emphasized;
- complex information is explained at the point of decision;
- the interface prevents errors or preserves context well.

Do not assign severity to green findings.

## Severity

Severity applies to red and yellow findings.

### Critical

A key task cannot be completed safely or at all; there is a high risk of irreversible harm, data loss, legal/compliance impact, or severe business failure. Use rarely and only with strong evidence.

### High

A major task is blocked, frequently fails, produces a serious wrong decision, or creates a costly recovery path. The problem should be addressed before or immediately after release.

### Medium

The task remains possible, but confusion, friction, mistakes, or repeated support needs are likely. The issue materially affects efficiency, confidence, or completion quality.

### Low

The issue causes limited friction, inconsistency, or polish debt without substantially changing task success. Address when working on the relevant area.

## Prioritization factors

Assess severity using the available evidence:

- impact on the user's goal;
- frequency or reach;
- reversibility and recovery cost;
- business impact;
- accessibility impact;
- confidence in the evidence.

Do not inflate severity because an element looks visually unusual. Do not reduce severity merely because the fix appears difficult.
