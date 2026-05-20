import { BaseProps } from "@/components/desengine/system/Base";
import type { Project } from "@/lib/project/runtime";

type OutRenderProps = BaseProps & {
    task: string;
    started: boolean;
    reloadKey: number;
    startStatus: "" | "starting";
    project?: Project;
}

export { type OutRenderProps }
