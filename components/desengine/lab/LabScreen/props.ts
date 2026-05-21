import type { LevelOverview } from "@/lib/level/types";
import type { TaskData, TaskListItem } from "@/lib/task/types";
import { BaseProps } from "../../system/Base";
import type { LabScreenState } from "./states";
import type { LabTaskScreenEventInput } from "./screen-event";
type LabProps = BaseProps & {
    initLevelOverview: LevelOverview;
    initScreen: LabScreenState;
    initTaskItem: TaskListItem | null;
    initTaskData: TaskData | null;
    initTaskScreenEventInput?: LabTaskScreenEventInput;
}
export type { LabProps }
