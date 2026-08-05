---
name: ux-audit-analyzer
description: Conduct an independent UX audit of interfaces from screenshots, screen sequences, working websites, customer comments, product requirements, and analytics. Use when the user asks to find usability problems, strengths, missing states, inconsistencies, business-logic risks, accessibility issues, or improvement opportunities in a product interface. Produce traffic-light audit cards with a precise location, problem or positive observation, detailed recommendation, severity, and evidence basis, plus an overall summary and prioritized next steps. Search competitors only when the user explicitly requests competitor research or comparison.
---

# UX Audit Analyzer

Conduct an evidence-based UX audit that is practical enough to transfer into a Figma audit board or project report.

## Supported inputs

Use any combination of:

- screenshots of individual screens;
- a sequence of screens or a described user scenario;
- a working public or accessible website;
- customer comments and stakeholder feedback;
- product requirements and business rules;
- analytics, research findings, support requests, or other behavioral evidence.

Do not require every input type. Audit the material that is actually available and state important limitations.

## Workflow

1. Establish the audit scope.
   - Identify the supplied screens, scenario, user goal, platform, and business objective when available.
   - Separate confirmed context from assumptions.
   - If the scope is partial, avoid implying that the whole product was reviewed.

2. Inspect the material completely before writing findings.
   - For screenshots, inspect layout, hierarchy, labels, controls, states, and visible relationships.
   - For scenarios, inspect continuity between steps, user choices, system feedback, errors, recovery, and completion.
   - For a working site, inspect the accessible interaction rather than judging only the first screen.
   - For analytics or research, connect the finding only to data that actually supports it.

3. Review the interface using the categories in `references/audit-method.md`.

4. Classify every finding using the traffic-light and severity models in `references/severity-model.md`.

5. Write each finding as a compact text card using `references/output-format.md`.
   - Lead with the exact location.
   - Describe one problem or one positive observation per card.
   - Give a detailed, actionable recommendation.
   - State the basis for the finding without overstating certainty.

6. Consolidate the audit.
   - Merge duplicate findings.
   - Identify repeated or cross-screen problems.
   - Separate local fixes from systemic issues.
   - Prioritize changes by user impact, business impact, frequency, and recovery cost.

7. Produce the overall audit summary and priority order.

8. Run the final check from `references/quality-checklist.md`.

## Evidence rules

Distinguish these evidence levels:

- **Direct observation**: visible in the interface or interaction.
- **Reasoned risk**: a likely user difficulty inferred from the interface; phrase it as a risk, not a measured fact.
- **Confirmed problem**: supported by analytics, research, support data, customer comments, or requirements.
- **Established practice**: supported by a relevant interaction principle, accessibility standard, or mature design convention.
- **Competitor evidence**: a verified example from another product. Use only when the user explicitly asks for competitor research or comparison.

Never write claims such as `users do not notice this` or `conversion decreases` unless the supplied evidence supports them. Prefer formulations such as `пользователь может не заметить` or `это создаёт риск` when evidence is inferential.

Customer comments and requirements are context, not automatically proof. When they conflict with the visible interface, identify the conflict.

## Audit categories

Audit only relevant categories; do not force a finding into every category:

- navigation and information structure;
- scenario clarity and continuity;
- errors, prevention, recovery, and feedback;
- tables, filters, sorting, and search;
- visual hierarchy;
- interface consistency;
- interface text, labels, and naming;
- accessibility;
- alignment with business logic and requirements;
- missing states and edge cases.

Read `references/audit-method.md` for detailed checks.

## Traffic-light rules

- **Red**: a material usability problem, task obstacle, serious ambiguity, error risk, loss-of-data risk, or conflict with key business logic.
- **Yellow**: the scenario remains usable, but the interface creates avoidable uncertainty, friction, inconsistency, extra effort, or a non-critical risk worth addressing.
- **Green**: the interface supports the user well. Record strengths that should be preserved during redesign or applied elsewhere.

Color and severity are related but not identical. Do not use green severity. Do not use color merely to make the audit visually balanced.

## Recommendation rules

Write detailed recommendations by default.

A recommendation must explain:

- what to change;
- where the change applies;
- how the behavior or content should work;
- what should happen in important states;
- what user uncertainty or risk the change removes.

Avoid vague recommendations such as `сделать понятнее`, `улучшить визуал`, or `переработать блок` without specifying the intended behavior.

Do not redesign beyond the evidence. When several valid solutions exist, describe the required outcome and offer options rather than presenting one arbitrary layout as the only answer.

## Competitor and practice research

- Do not search competitors by default.
- Search competitors only when the user explicitly asks for examples, comparison, market practice, or evidence from other products.
- When searching, use current public sources, prefer official product pages and documentation, verify links, and cite every external example.
- Treat competitor patterns as evidence that an approach exists, not proof that it is correct for the audited product.
- General UX and accessibility practices may be used without a competitor search, but name the principle when it materially supports a finding.

## Output behavior

Use concise text cards suitable for copying into Figma. Keep the card focused, but make the recommendation detailed enough to act on.

Start with an overall summary containing:

- scope and limitations;
- what works well;
- main problem areas;
- highest-severity findings;
- recommended order of work.

Then present cards, preferably grouped by screen or scenario. Within a group, order red findings before yellow findings and green strengths.

When the user requests only a quick review, return fewer high-value cards rather than pretending to provide a complete audit.

## Common request patterns

- `Проведи UX-аудит этих экранов и подготовь карточки для Figma.`
- `Проверь этот сценарий, требования и комментарии заказчика.`
- `Найди проблемы на сайте и расставь критичность.`
- `Сравни решение с конкурентами и подкрепи замечания примерами.`
- `Отметь красным проблемы, жёлтым спорные места, зелёным удачные решения.`
