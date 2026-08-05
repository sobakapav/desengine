# Output format

Use this default structure unless the user requests another format.

## Overall summary

### Scope and limitations

State what was reviewed and what could not be verified.

### What works well

List the most important strengths that should be preserved.

### Main problem areas

Summarize repeated or cross-screen issues rather than repeating every card.

### Priority order

Give a practical sequence of work:

1. task blockers and high-risk errors;
2. cross-screen logic and consistency issues;
3. clarity, efficiency, and missing states;
4. lower-impact refinements.

Include counts by color and severity only when the reviewed scope is sufficiently complete for the counts to be meaningful.

## Audit cards

Group cards by screen, block, or scenario step.

### 🔴 [Exact location]

**Problem**  
Describe one concrete issue and its likely or confirmed consequence.

**Recommendation**  
Explain in detail what to change, how it should work, and which uncertainty or risk the change removes.

**Severity:** Critical / High / Medium  
**Category:** [Relevant audit category]  
**Basis:** Direct observation / reasoned risk / supplied analytics / research / customer comment / requirement / established practice / competitor example.

### 🟡 [Exact location]

**Attention point**  
Describe the non-critical friction, ambiguity, inconsistency, or scaling risk.

**Recommendation**  
Give a detailed improvement with expected behavior and relevant states.

**Severity:** Medium / Low  
**Category:** [Relevant audit category]  
**Basis:** [Evidence level and concise explanation].

### 🟢 [Exact location]

**What works well**  
Explain how the solution helps the user or supports the business task.

**Preserve or extend**  
State what should remain unchanged during redesign or where the same principle could be reused.

**Category:** [Relevant audit category]  
**Basis:** Direct observation or supplied evidence.

## Style rules

- Keep the location precise enough to place a callout on the screen.
- Use plain language; avoid naming an abstract heuristic instead of explaining the problem.
- Keep one primary finding per card.
- Do not use `плохо`, `неудобно`, or `непонятно` without explaining for whom, in what situation, and with what consequence.
- Do not make the recommendation shorter than the problem when implementation detail is needed.
- When evidence is incomplete, use risk language explicitly.
