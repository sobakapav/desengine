---
name: meeting-project-manager
description: Analyze work-meeting transcripts and notes and turn them into concise project-management outputs. Use for DOCX, PDF, TXT, pasted transcripts, call notes, or meeting recordings that have already been transcribed when the user asks for a summary, decisions, team tasks, customer actions or feedback, completed tasks from the previous iteration, blockers, risks, open questions, or a customer-facing recap.
---

# Meeting Project Manager

Turn a noisy meeting transcript into an accurate, compact record that a project team can act on.

## Required inputs

Use the meeting transcript or notes as the primary source.

Also use these inputs when provided:

- tasks from the previous meeting;
- project context;
- expected output sections;
- target audience: internal team or customer;
- length or formatting constraints.

Do not ask for information that is already present in the transcript, attached files, conversation, or connected sources.

## Workflow

1. Read the complete source before writing conclusions.
2. Identify the meeting goal, discussed topics, decisions, unresolved questions, commitments, and dependencies.
3. Separate statements into four levels:
   - **Decision**: participants explicitly agreed on it;
   - **Task**: someone committed to perform an action;
   - **Proposal**: discussed but not approved;
   - **Open question**: requires clarification or feedback.
4. Group actions by responsible side: design team, project manager, customer, or another explicitly named role.
5. When previous tasks are provided, compare them with the transcript and classify each as:
   - completed;
   - partially completed;
   - not confirmed;
   - changed or cancelled.
6. Check that every task follows from the source and that no proposal is presented as an agreement.
7. Produce the requested output. Use the default structure from `references/output-formats.md` when the user does not specify one.
8. Run the final quality check from `references/quality-checklist.md`.

## Extraction rules

- Preserve the business meaning rather than the transcript's spoken wording.
- Remove repetitions, filler words, false starts, and unrelated discussion.
- Do not invent owners, deadlines, decisions, reasons, or priorities.
- Name a person as owner only when the commitment is explicit. Otherwise use the responsible side or write `Ответственный не определён` when this matters.
- Use exact dates only when they are stated or can be safely resolved from the meeting date.
- Do not infer participant roles from voice numbers or speaking order.
- Treat phrases such as `можно`, `предлагаю`, `давайте подумаем`, and `кажется` as proposals unless the group clearly approves them.
- Treat phrases such as `договорились`, `берём в работу`, `делаем`, `к следующей встрече`, and explicit confirmation as decisions or tasks.
- When the transcript is ambiguous, state the uncertainty briefly instead of guessing.

## Summary rules

When the user asks for a brief meeting summary:

- keep it within 500 characters unless another limit is given;
- describe the main subject, central decisions, and immediate next step;
- do not list minor interface comments or reproduce the agenda;
- avoid vague phrases such as `обсудили ряд вопросов`.

## Task rules

Write each task as one observable action:

`[Action verb] + [object/result] + [important constraint, if any]`.

Good:

- Подготовить три принципиально разных варианта заполнения новой строки.
- Передать команде тестовую учётную запись.

Avoid:

- Поработать над таблицей.
- Подумать над вариантами.

Merge duplicate tasks. Split a task only when its parts can be completed or accepted independently.

## Customer feedback rules

Put into the customer section only what the team genuinely needs from the customer:

- a decision between alternatives;
- missing data or access;
- validation of business logic;
- confirmation of terminology, priorities, or scope;
- acceptance or rejection of presented concepts.

Do not shift internal design work onto the customer.

## Output modes

### Internal project recap

Include summary, decisions, team tasks, customer actions, blockers, and open questions.

### Customer-facing recap

Use neutral language. Include only confirmed agreements, customer actions, and next steps. Exclude internal doubts, performance judgments, and unnecessary operational detail.

### Previous-iteration review

Evaluate every supplied previous task separately and cite the transcript evidence in plain language. Do not mark a task completed merely because it was discussed.

### Design handoff

Focus on what must be changed in concepts or layouts, what must remain unchanged, and which customer inputs block further design work.

## File and connector handling

- For an attached document, read the full relevant content before summarizing.
- For a Google Drive or Google Docs source, use the connected Drive tools when available.
- For a PDF, inspect relevant pages visually when tables, diagrams, or screenshots affect the conclusions.
- If several meeting files are provided, distinguish meetings by date and do not merge agreements across dates unless the user asks for a combined report.
