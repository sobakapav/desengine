import { BaseProps } from "../../system/Base";
import type { TaskCheckResult, TaskData, TaskListItem, TaskTransition } from "@/lib/task/types";
import type { LabTaskScreenEvent, LabTaskScreenEventInput } from "../LabScreen/screen-event";

type WorkbenchProps = BaseProps & {
    taskItem: TaskListItem;
    taskData: TaskData;
    onTaskItemChange: (next: TaskListItem | null) => void;
    onTaskDataChange: (next: TaskData) => void;
    onBackToLevelList: () => void;
    onCheckResult: (result: TaskCheckResult, transition: TaskTransition | null, nextTaskItem: TaskListItem | null, nextTaskData: TaskData) => void;
    onTransition: (transition: TaskTransition | null) => void;
    screenEvent: LabTaskScreenEvent;
    onScreenEventChange: (next: LabTaskScreenEventInput) => void;
}

export { type WorkbenchProps }
