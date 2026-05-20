import { BaseProps } from "@/components/desengine/system/Base";
import type { Project } from "@/lib/project/runtime";
import type { TaskData } from "@/lib/task/types";

type InOutProps = BaseProps & {
    task: string;
    taskData: TaskData;
    started: boolean;
    reloadKey: number;
    startStatus: "" | "starting";
    project: Project;
}

export { type InOutProps }
