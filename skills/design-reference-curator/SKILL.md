---
name: design-reference-curator
description: Find, verify, and explain real visual references for interface and product-design tasks. Use when the user asks for UI/UX examples, inspiration, existing interface patterns, alternative ways to solve an interaction, dashboard or page references, component examples, or real screenshots rather than text-only ideas. Accept free-form requests, screenshots, customer comments, and optional platform constraints. Search public sources, prioritize distinct solution approaches over cosmetic variations, show images before explanations, include clickable source attribution, and explain what can be reused, what differs, and which directions best fit the request.
---

# Design Reference Curator

Find real interface examples that help make a design decision, not merely a moodboard of visually similar screens.

## Core behavior

- Accept a request in free form. Do not require the user to define a page type, industry, or full product context when those details are not necessary.
- Use supplied screenshots, comments, exclusions, platform constraints, and existing references as optional search signals.
- Search the public web whenever the user asks for real or current references.
- Show the strongest images first. Put explanations and source details below the images.
- Prefer several meaningfully different ways to solve the task rather than many screens with the same structure and different styling.
- Include source attribution for every recommended reference.
- Do not invent product names, capabilities, or source links.

## Workflow

1. Interpret the actual design question.
   - Extract the object, interaction, information, or visual pattern the user wants to examine.
   - Treat full product context as optional.
   - Record explicit exclusions such as `не стандартный дашборд`, `без модального окна`, or `нужен вариант с глобусом`.

2. Decide what must vary across the references.
   - Vary the way the interface solves the task: placement, sequence, hierarchy, interaction, density, disclosure, or relationship between elements.
   - Do not count color, typography, illustration style, or dark mode alone as a distinct approach.
   - Read `references/search-strategy.md` for examples and source priorities.

3. Search broadly, then verify narrowly.
   - Use image search to discover visual candidates.
   - Open source pages or product documentation to verify the product, context, and current link.
   - Prefer screenshots that clearly expose the relevant interaction or composition.
   - Reject near-duplicates, unattributed images, inaccessible sources, and examples whose useful detail cannot be seen.

4. Build a compact set.
   - Aim for 6–10 references when enough strong examples exist.
   - Return fewer rather than padding the set with weak or repetitive examples.
   - Ensure the set contains multiple distinct solution approaches.

5. Present the result.
   - Place the best available images before the explanations.
   - Use the structure from `references/output-format.md` unless the user asks for another format.
   - Explain each example in plain language.
   - End with 2–3 directions that are most useful for the request.
   - Add a ready-to-use customer-facing formulation when it would help.

6. Run the final check from `references/quality-checklist.md`.

## Distinguishing solution approaches

Treat references as different approaches when they change how the user understands or performs the task.

Examples:

- Adding a table row inline, in a side panel, in a modal, through a step-by-step flow, or through bulk import.
- Presenting analytics as a metric-led overview, an object profile, a chronological report, a comparison workspace, or an event feed.
- Selecting a language through a compact menu, a searchable list, a country/language matrix, a first-run screen, or profile settings.

Do not present five card-grid dashboards as five different approaches merely because their colors and chart styles differ.

## Source rules

- Prefer real products, official product pages, official documentation, public design systems, and credible case studies.
- Use curated galleries such as Mobbin, Behance, Dribbble, and Awwwards as secondary sources.
- Use Pinterest only for discovery. Trace the image to an original or more reliable source whenever possible.
- When a source requires login or hides the useful screen, include it only if the visible preview is sufficient and say that access is limited.
- Avoid stock illustrations and generic concept shots when the request concerns actual interface structure or behavior.
- Keep links specific: link to the product screen, case study, documentation page, or exact gallery item rather than a generic homepage when possible.

## Image rules

- Put images before explanatory text.
- Prioritize legible screenshots over decorative thumbnails.
- Do not show duplicate or near-duplicate images.
- Do not substitute generated mockups when the user asks for real references.
- When only some references can be shown visually in the interface, show the strongest images first and include the remaining references as clearly attributed source items below.

## Explanation rules

For each reference, explain only what is useful for the user's task:

- **Approach**: how the solution is organized or behaves.
- **What to take**: a transferable idea, not a request to copy the screen.
- **Limitation**: when the example may not fit.
- **Source**: a clickable citation or link to the original page.

Avoid long product descriptions and generic praise such as `современно`, `стильно`, or `удобно` without explaining why.

## Customer-facing formulation

When useful, add one short paragraph written as a customer explaining what they like about the selected direction. Use plain language and avoid design jargon. Describe the effect, organization, and expected benefit rather than colors or trends alone.

## Internal Figma references

- When the user supplies Figma exports, screenshots, PDFs, or accessible frame links, inspect those materials before searching the web.
- When a Figma connector or indexed internal library is available, search it first and then supplement with public references.
- Never claim to have searched the user's Figma workspace without actual access.
- If direct Figma search is unavailable, state this briefly and continue with the supplied files and public web sources.
- Do not create or populate a Figma board unless the user explicitly asks for that deliverable.

## Common request patterns

- `Покажи реальные примеры выбора языка с иконкой глобуса.`
- `Найди разные варианты заполнения новой строки в таблице.`
- `Нужны нестандартные главные страницы с аналитическими данными.`
- `Покажи не визуальные стили, а разные способы расположить эту информацию.`
- `Вот экран и комментарий заказчика. Найди референсы, которые помогут предложить другие решения.`
