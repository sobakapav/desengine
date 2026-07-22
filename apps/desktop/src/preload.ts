import { contextBridge, ipcRenderer } from 'electron';

import type { FigmaSelectionPing } from '@desengine/protocol';

export interface DesengineDesktopApi {
  getLastFigmaSelectionPing: () => Promise<FigmaSelectionPing | undefined>;
  onFigmaSelectionPing: (handler: (ping: FigmaSelectionPing) => void) => () => void;
}

const api: DesengineDesktopApi = {
  getLastFigmaSelectionPing() {
    console.log('[desengine:preload] getLastFigmaSelectionPing called');

    return ipcRenderer.invoke('figma-selection-ping:get-last') as Promise<
      FigmaSelectionPing | undefined
    >;
  },
  onFigmaSelectionPing(handler) {
    const listener = (_event: Electron.IpcRendererEvent, ping: FigmaSelectionPing) => {
      console.log('[desengine:preload] figma-selection-ping received', ping);
      handler(ping);
    };

    console.log('[desengine:preload] subscribing to figma-selection-ping');
    ipcRenderer.on('figma-selection-ping', listener);

    return () => {
      console.log('[desengine:preload] unsubscribing from figma-selection-ping');
      ipcRenderer.removeListener('figma-selection-ping', listener);
    };
  },
};

console.log('[desengine:preload] exposing desktop API');
contextBridge.exposeInMainWorld('desengine', api);
