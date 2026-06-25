"use client"

import { useEffect, useState } from "react"

import type { TaskProjectBinding } from "@/lib/task/assignment"

type ProjectTaskBindingsState = {
  status: "loading" | "ready" | "error"
  bindings: TaskProjectBinding[]
}

const initialProjectTaskBindingsState: ProjectTaskBindingsState = {
  status: "loading",
  bindings: [],
}

function useProjectTaskBindings(projectId: string) {
  const [state, setState] = useState<ProjectTaskBindingsState>(initialProjectTaskBindingsState)

  useEffect(() => {
    let cancelled = false

    async function loadBindings() {
      const response = await fetch(`/tasks/assignments?projectId=${encodeURIComponent(projectId)}`, {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`task_project_bindings_${response.status}`)
      }

      const payload = await response.json() as { bindings?: TaskProjectBinding[] }

      if (!cancelled) {
        setState({
          status: "ready",
          bindings: Array.isArray(payload.bindings) ? payload.bindings : [],
        })
      }
    }

    loadBindings().catch(() => {
      if (!cancelled) {
        setState({ status: "error", bindings: [] })
      }
    })

    return () => {
      cancelled = true
    }
  }, [projectId])

  return state
}

export { useProjectTaskBindings }
