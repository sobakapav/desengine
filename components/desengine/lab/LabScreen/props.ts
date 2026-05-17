import type { LevelOverview } from "@/lib/level/types";
import type { TaskData, TaskListItem } from "@/lib/task/types";
import { BaseProps } from "../../system/Base";
import type { LabScreenState } from "./states";
type LabProps = BaseProps & {
    initLevelOverview: LevelOverview;
    initScreen: LabScreenState;
    initTaskItem: TaskListItem | null;
    initTaskData: TaskData | null;
}
export type { LabProps }
