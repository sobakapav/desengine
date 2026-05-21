import type { TaskData } from "@/lib/task/types";
import { BaseProps } from "@/components/desengine/system/Base";
import type { LabTaskScreenEvent, LabTaskScreenEventInput } from "../LabScreen/screen-event";

type CodeProps = BaseProps & {
    taskData: TaskData;
    onTaskDataChange?: (next: TaskData) => void;
    onFileChange?: (fileId: string, nextValue: string) => void;
    onSaveShortcut?: () => void;
    screenEvent: LabTaskScreenEvent;
    onScreenEventChange?: (next: LabTaskScreenEventInput) => void;
    dirtyFileIds?: string[];
}

export { type CodeProps }
