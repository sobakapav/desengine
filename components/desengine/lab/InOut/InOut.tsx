import dynamic from "next/dynamic";

import { OutRender } from "./OutRender";
import { InOutProps } from "./props";

const InPicture = dynamic(
    () => import("./InPicture").then((module) => module.InPicture),
    {
        loading: () => (
            <div className="min-h-[180px] rounded-md border bg-white p-4 text-sm text-neutral-500">
                Загружаем изображение…
            </div>
        ),
    },
);

function InOut({ task, taskData, started, reloadKey, startStatus, project }: InOutProps) {
    return (
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <InPicture task={task} taskData={taskData} />
            <OutRender
              task={task}
              started={started}
              reloadKey={reloadKey}
              startStatus={startStatus}
              project={project}
            />
        </div>
    );
}

export {
    InOut,
}
