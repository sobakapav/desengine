import { BaseProps } from "@/components/desengine/system/Base";
import type { TaskData } from "@/lib/task/types";

type InOutProps = BaseProps & {
    task: string;
    taskData: TaskData;
    started: boolean;
    reloadKey: number;
    startStatus: "" | "starting";
}

export { type InOutProps }
