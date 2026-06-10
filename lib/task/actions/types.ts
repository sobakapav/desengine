import type { TaskData, TaskListItem } from "@/lib/task/types"
import type { TaskTransition } from "@/lib/task/types"

export type TaskFileUpdate = {
  fileId: string
  content: string
}

export type IterateNoopReason = "unchanged_files" | "allowlist_filtered" | "cleanup_enforced"

export type IterateTaskSuccessBody = {
  ok: true
  resultKind: "applied" | "noop"
  message: string
  taskData: TaskData
  taskItem: TaskListItem | null
  transition: TaskTransition | null
  noopReason?: IterateNoopReason
}

export type TaskActionHttpResult = {
  status?: number
  body: unknown
}

export type FilesPayload = Record<string, string>
export type NullableFilesPayload = Record<string, string | null>

export type OutputFile = {
  id: string
  fileName: string
}

export type SaveTaskFilesResult =
  | {
      kind: "saved"
      written: number
    }
  | {
      kind: "not_found"
      error: string
    }
  | {
      kind: "write_failed"
      written: number
      errors: Array<{ fileId: string; error: string }>
    }

export type ResetTaskRuntimeResult =
  | {
      kind: "reset"
      taskItem: TaskListItem | null
      taskData: TaskData | null
      started: false
    }
  | {
      kind: "not_found"
      error: string
    }

export type ResetCurrentTaskLevelRuntimeResult =
  | {
      kind: "level_reset"
      taskItem: TaskListItem | null
      taskData: TaskData | null
      started: boolean
    }
  | {
      kind: "not_found"
      error: string
    }
  | {
      kind: "snapshot_missing"
      error: string
    }

export type ProjectUiKitMigrationRuntimeResult =
  | {
      kind: "project_migration"
      taskItem: TaskListItem | null
      taskData: TaskData | null
      started: boolean
      invalidationScope: "current-level"
    }
  | {
      kind: "not_found"
      error: string
    }
  | {
      kind: "snapshot_missing"
      error: string
    }
  | {
      kind: "invalid_request"
      error: string
    }
