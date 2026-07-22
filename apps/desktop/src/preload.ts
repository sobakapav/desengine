import { contextBridge, ipcRenderer } from 'electron';

import type { FigmaSelectionPing } from '@desengine/protocol';

export interface DesengineDesktopApi {
  getLastFigmaSelectionPing: () => Promise<FigmaSelectionPing | undefined>;
  onFigmaSelectionPing: (handler: (ping: FigmaSelectionPing) => void) => () => void;
}

const api: DesengineDesktopApi = {
  getLastFigmaSelectionPing() {
    return ipcRenderer.invoke('figma-selection-ping:get-last') as Promise<
      FigmaSelectionPing | undefined
    >;
  },
  onFigmaSelectionPing(handler) {
    const listener = (_event: Electron.IpcRendererEvent, ping: FigmaSelectionPing) => {
      handler(ping);
    };

    ipcRenderer.on('figma-selection-ping', listener);

    return () => {
      ipcRenderer.removeListener('figma-selection-ping', listener);
    };
  },
};

contextBridge.exposeInMainWorld('desengine', api);
