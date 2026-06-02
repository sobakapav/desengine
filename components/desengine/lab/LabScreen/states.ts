import type {
    TaskTransition,
    TaskCheckResult,
    TaskData,
    TaskListItem,
} from "@/lib/task/types"

// ? Возможно, это машина состояний задачи, а не состояния экрана?
export type LabScreenState =
  | { type: "level" }
  | { type: "task"; screen: string }
  | { type: "transition"; transition: TaskTransition }
  | { type: "done"; transition: TaskTransition }
  | {
      type: "check";
      result: TaskCheckResult;
      transition: TaskTransition | null;
      nextTaskItem: TaskListItem | null;
      nextTaskData: TaskData | null;
    }
