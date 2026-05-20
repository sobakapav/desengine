"use client";

import { type WorkbenchProps } from "./props";
import { useWorkbenchController } from "./useWorkbenchController";
import { WorkbenchView } from "./WorkbenchView";

function Workbench(props: WorkbenchProps) {
    const controller = useWorkbenchController(props);

    return <WorkbenchView controller={controller} props={props} />;
}

export { Workbench }
