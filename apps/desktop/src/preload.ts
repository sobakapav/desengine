import { contextBridge, ipcRenderer } from 'electron';

import type { FigmaSelectionPing } from '@desengine/protocol';

export interface DesengineDesktopApi {
  onFigmaSelectionPing: (handler: (ping: FigmaSelectionPing) => void) => () => void;
}

const api: DesengineDesktopApi = {
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
