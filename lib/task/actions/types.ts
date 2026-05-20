import type { TaskData, TaskListItem } from "@/lib/task/types"

export type TaskFileUpdate = {
  fileId: string
  content: string
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
