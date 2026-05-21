import { assertEventEnvelope, type EventEnvelope } from "@/lib/system/events"

export type ProjectEventLogSink = {
  recordEvent(envelope: EventEnvelope): Promise<void> | void
}

export type RecordEventOptions = {
  sink?: ProjectEventLogSink
}

const noopProjectEventLogSink: ProjectEventLogSink = {
  async recordEvent() {},
}

export async function recordEvent(envelope: EventEnvelope, options: RecordEventOptions = {}): Promise<void> {
  let validatedEnvelope: EventEnvelope

  try {
    validatedEnvelope = assertEventEnvelope(envelope)
  } catch {
    throw new Error("recordEvent принимает только валидный EventEnvelope.")
  }

  await (options.sink ?? noopProjectEventLogSink).recordEvent(validatedEnvelope)
}

export {
  noopProjectEventLogSink,
}
