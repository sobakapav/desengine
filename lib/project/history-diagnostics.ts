import "server-only"

import { readdir, readFile } from "node:fs/promises"
import path from "node:path"

import type { PromptHistoryEntry } from "@/lib/prompt/types"
import type { TaskCheckResult } from "@/lib/task/types"
import {
  getBaseProjectId,
  getScopedTaskRuntimeFilePath,
} from "@/lib/task/project-runtime-scope"
import { getUserTasksRoot, pathExists } from "@/lib/user/server"

type ProjectPromptHistorySignal = {
  taskId: string
  createdAt: string
  levelNumber: number | null
  textPreview: string
  changedFileNames: string[]
  provider: string | null
}

type ProjectCheckResultSignal = {
  taskId: string
  createdAt: string
  levelNumber: number
  kind: TaskCheckResult["kind"]
  passed: boolean
  messagePreview: string
}

type ProjectResetSnapshotSignal = {
  taskId: string
  levelNumber: number
  editableFileCount: number
  capturedFiles: string[]
}

type ProjectRuntimeContextSignal = {
  taskId: string
  runtimeFileCount: number
  runtimeFileNames: string[]
  promptCount: number
  lastPromptAt: string | null
  hasCheckResult: boolean
  resetSnapshotCount: number
  lastActivityAt: string | null
}

type ProjectHistoryDiagnosticsSummary = {
  taskCount: number
  promptCount: number
  checkResultCount: number
  resetSnapshotCount: number
  runtimeFileCount: number
  lastActivityAt: string | null
}

type ProjectHistoryDiagnosticsSnapshot = {
  projectId: string
  prompts: ProjectPromptHistorySignal[]
  checkResults: ProjectCheckResultSignal[]
  resetSnapshots: ProjectResetSnapshotSignal[]
  runtimeContexts: ProjectRuntimeContextSignal[]
  summary: ProjectHistoryDiagnosticsSummary
}

const PROMPT_HISTORY_FILE_NAME = "prompt-history.json"
const CHECK_RESULT_FILE_NAME = "check-result.json"
const RESET_SNAPSHOTS_DIR_NAME = ".level-reset"
const MAX_TEXT_PREVIEW_LENGTH = 140
const MAX_RUNTIME_FILE_PREVIEW = 5
const MAX_CHANGED_FILE_PREVIEW = 3

function clipTextPreview(value: string, maxLength = MAX_TEXT_PREVIEW_LENGTH) {
  const normalized = value.replace(/\s+/g, " ").trim()
  if (!normalized) return "Пустой prompt"
  if (normalized.length <= maxLength) return normalized
  return `${normalized.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`
}

function pickLatestTimestamp(...values: Array<string | null | undefined>) {
  return values
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .sort((left, right) => right.localeCompare(left))[0] ?? null
}

function isPromptHistoryEntry(value: unknown): value is PromptHistoryEntry {
  if (!value || typeof value !== "object") return false

  const entry = value as PromptHistoryEntry
  return typeof entry.text === "string" && typeof entry.createdAt === "string"
}

function isTaskCheckResult(value: unknown): value is TaskCheckResult {
  if (!value || typeof value !== "object") return false

  const result = value as TaskCheckResult
  return (
    typeof result.taskId === "string" &&
    typeof result.levelNumber === "number" &&
    typeof result.kind === "string" &&
    typeof result.passed === "boolean" &&
    typeof result.message === "string" &&
    typeof result.createdAt === "string"
  )
}

async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await readFile(filePath, "utf-8")
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

async function readPromptSignals(taskId: string, projectRuntimeDir: string) {
  const promptHistory = await readJsonFile<unknown[]>(path.join(projectRuntimeDir, PROMPT_HISTORY_FILE_NAME))
  if (!Array.isArray(promptHistory)) {
    return {
      promptCount: 0,
      lastPromptAt: null,
      prompts: [] as ProjectPromptHistorySignal[],
    }
  }

  const prompts = promptHistory
    .filter(isPromptHistoryEntry)
    .map((entry) => ({
      taskId,
      createdAt: entry.createdAt,
      levelNumber: typeof entry.levelNumber === "number" ? entry.levelNumber : null,
      textPreview: clipTextPreview(entry.text),
      changedFileNames: (entry.changedFileNames ?? []).filter((name): name is string => typeof name === "string").slice(0, MAX_CHANGED_FILE_PREVIEW),
      provider: entry.llmCall?.provider ?? null,
    }))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))

  return {
    promptCount: prompts.length,
    lastPromptAt: prompts[0]?.createdAt ?? null,
    prompts,
  }
}

async function readCheckResultSignal(taskId: string, projectRuntimeDir: string) {
  const checkResult = await readJsonFile<unknown>(path.join(projectRuntimeDir, CHECK_RESULT_FILE_NAME))
  if (!isTaskCheckResult(checkResult)) {
    return null
  }

  return {
    taskId,
    createdAt: checkResult.createdAt,
    levelNumber: checkResult.levelNumber,
    kind: checkResult.kind,
    passed: checkResult.passed,
    messagePreview: clipTextPreview(checkResult.message, 100),
  } satisfies ProjectCheckResultSignal
}

async function readResetSnapshotSignals(taskId: string, projectRuntimeDir: string) {
  const resetDir = path.join(projectRuntimeDir, RESET_SNAPSHOTS_DIR_NAME)
  if (!(await pathExists(resetDir))) {
    return [] as ProjectResetSnapshotSignal[]
  }

  const entries = await readdir(resetDir, { withFileTypes: true }).catch(() => [])

  const snapshots = await Promise.all(entries
    .filter((entry) => entry.isFile() && /^level-\d+\.json$/.test(entry.name))
    .map(async (entry) => {
      const levelNumber = Number(entry.name.match(/^level-(\d+)\.json$/)?.[1])
      const snapshot = await readJsonFile<{
        editableFileIds?: unknown
        contentByFileId?: unknown
      }>(path.join(resetDir, entry.name))

      if (!Number.isFinite(levelNumber) || !snapshot || typeof snapshot !== "object") {
        return null
      }

      const editableFileIds = Array.isArray(snapshot.editableFileIds)
        ? snapshot.editableFileIds.filter((item): item is string => typeof item === "string")
        : []
      const capturedFiles = snapshot.contentByFileId && typeof snapshot.contentByFileId === "object"
        ? Object.keys(snapshot.contentByFileId as Record<string, unknown>).filter((fileId) => typeof fileId === "string")
        : []

      return {
        taskId,
        levelNumber,
        editableFileCount: editableFileIds.length,
        capturedFiles,
      } satisfies ProjectResetSnapshotSignal
    }))

  return snapshots
    .filter((snapshot): snapshot is ProjectResetSnapshotSignal => snapshot !== null)
    .sort((left, right) => right.levelNumber - left.levelNumber)
}

async function listRuntimeFiles(projectRuntimeDir: string) {
  async function walk(currentDir: string, prefix = ""): Promise<string[]> {
    const entries = await readdir(currentDir, { withFileTypes: true }).catch(() => [])
    const nested = await Promise.all(entries.map(async (entry) => {
      if (entry.name === RESET_SNAPSHOTS_DIR_NAME) {
        return [] as string[]
      }

      const nextPrefix = prefix ? path.posix.join(prefix, entry.name) : entry.name
      const entryPath = path.join(currentDir, entry.name)

      if (entry.isDirectory()) {
        return walk(entryPath, nextPrefix)
      }

      if (entry.name === PROMPT_HISTORY_FILE_NAME || entry.name === CHECK_RESULT_FILE_NAME || entry.name.startsWith(".")) {
        return [] as string[]
      }

      return [nextPrefix]
    }))

    return nested.flat()
  }

  return walk(projectRuntimeDir)
}

async function readTaskRuntimeSignals(taskId: string, projectId: string) {
  const projectScopesDir = path.dirname(path.dirname(
    getScopedTaskRuntimeFilePath(taskId, projectId, PROMPT_HISTORY_FILE_NAME),
  ))
  const scopeEntries = await readdir(projectScopesDir, { withFileTypes: true }).catch(() => [])
  const matchingRuntimeDirs = scopeEntries
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({
      scopeProjectId: decodeURIComponent(entry.name),
      runtimeDir: path.join(projectScopesDir, entry.name),
    }))
    .filter((entry) => getBaseProjectId(entry.scopeProjectId) === projectId)

  if (matchingRuntimeDirs.length === 0) {
    return null
  }

  const scopeSignals = await Promise.all(matchingRuntimeDirs.map(async (runtimeEntry) => {
    const [promptState, checkResult, resetSnapshots, runtimeFiles] = await Promise.all([
      readPromptSignals(taskId, runtimeEntry.runtimeDir),
      readCheckResultSignal(taskId, runtimeEntry.runtimeDir),
      readResetSnapshotSignals(taskId, runtimeEntry.runtimeDir),
      listRuntimeFiles(runtimeEntry.runtimeDir),
    ])

    return {
      promptState,
      checkResult,
      resetSnapshots,
      runtimeFiles,
    }
  }))

  const prompts = scopeSignals.flatMap((entry) => entry.promptState.prompts)
  const checkResults = scopeSignals.flatMap((entry) => entry.checkResult ? [entry.checkResult] : [])
  const resetSnapshots = scopeSignals.flatMap((entry) => entry.resetSnapshots)
  const runtimeFiles = scopeSignals.flatMap((entry) => entry.runtimeFiles)

  return {
    prompts,
    checkResults,
    resetSnapshots,
    runtimeContext: {
      taskId,
      runtimeFileCount: runtimeFiles.length,
      runtimeFileNames: runtimeFiles.slice(0, MAX_RUNTIME_FILE_PREVIEW),
      promptCount: prompts.length,
      lastPromptAt: pickLatestTimestamp(...scopeSignals.map((entry) => entry.promptState.lastPromptAt)),
      hasCheckResult: checkResults.length > 0,
      resetSnapshotCount: resetSnapshots.length,
      lastActivityAt: pickLatestTimestamp(
        ...scopeSignals.map((entry) => entry.promptState.lastPromptAt),
        ...scopeSignals.map((entry) => entry.checkResult?.createdAt),
      ),
    } satisfies ProjectRuntimeContextSignal,
  }
}

function buildEmptyProjectHistoryDiagnostics(projectId: string): ProjectHistoryDiagnosticsSnapshot {
  return {
    projectId,
    prompts: [],
    checkResults: [],
    resetSnapshots: [],
    runtimeContexts: [],
    summary: {
      taskCount: 0,
      promptCount: 0,
      checkResultCount: 0,
      resetSnapshotCount: 0,
      runtimeFileCount: 0,
      lastActivityAt: null,
    },
  }
}

function buildProjectHistoryDiagnosticsSummary(args: {
  runtimeContexts: ProjectRuntimeContextSignal[]
  prompts: ProjectPromptHistorySignal[]
  checkResults: ProjectCheckResultSignal[]
  resetSnapshots: ProjectResetSnapshotSignal[]
}): ProjectHistoryDiagnosticsSummary {
  return {
    taskCount: args.runtimeContexts.length,
    promptCount: args.prompts.length,
    checkResultCount: args.checkResults.length,
    resetSnapshotCount: args.resetSnapshots.length,
    runtimeFileCount: args.runtimeContexts.reduce((total, context) => total + context.runtimeFileCount, 0),
    lastActivityAt: pickLatestTimestamp(...args.runtimeContexts.map((context) => context.lastActivityAt)),
  }
}

async function readProjectHistoryDiagnostics(projectId: string): Promise<ProjectHistoryDiagnosticsSnapshot> {
  const tasksRoot = getUserTasksRoot()
  if (!(await pathExists(tasksRoot))) {
    return buildEmptyProjectHistoryDiagnostics(projectId)
  }

  const taskEntries = await readdir(tasksRoot, { withFileTypes: true }).catch(() => [])
  const signals = await Promise.all(taskEntries
    .filter((entry) => entry.isDirectory())
    .map((entry) => readTaskRuntimeSignals(entry.name, projectId)))

  const runtimeSignals = signals.filter((signal) => signal !== null)
  const prompts = runtimeSignals
    .flatMap((signal) => signal.prompts)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
  const checkResults = runtimeSignals
    .flatMap((signal) => signal.checkResults)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
  const resetSnapshots = runtimeSignals
    .flatMap((signal) => signal.resetSnapshots)
    .sort((left, right) => right.levelNumber - left.levelNumber)
  const runtimeContexts = runtimeSignals
    .map((signal) => signal.runtimeContext)
    .sort((left, right) => {
      const latestComparison = (right.lastActivityAt ?? "").localeCompare(left.lastActivityAt ?? "")
      if (latestComparison !== 0) return latestComparison
      return left.taskId.localeCompare(right.taskId)
    })

  return {
    projectId,
    prompts,
    checkResults,
    resetSnapshots,
    runtimeContexts,
    summary: buildProjectHistoryDiagnosticsSummary({
      runtimeContexts,
      prompts,
      checkResults,
      resetSnapshots,
    }),
  }
}

export {
  buildProjectHistoryDiagnosticsSummary,
  clipTextPreview,
  readProjectHistoryDiagnostics,
}

export type {
  ProjectCheckResultSignal,
  ProjectHistoryDiagnosticsSnapshot,
  ProjectHistoryDiagnosticsSummary,
  ProjectPromptHistorySignal,
  ProjectResetSnapshotSignal,
  ProjectRuntimeContextSignal,
}
