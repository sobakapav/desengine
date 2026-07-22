import { contextBridge, ipcRenderer } from 'electron';

import type { FigmaSelectionPing, FigmaVisualSnapshot } from '@desengine/protocol';

export interface DesengineDesktopApi {
  getLastFigmaSelectionPing: () => Promise<FigmaSelectionPing | undefined>;
  getLastFigmaVisualSnapshot: () => Promise<FigmaVisualSnapshot | undefined>;
  onFigmaSelectionPing: (handler: (ping: FigmaSelectionPing) => void) => () => void;
  onFigmaVisualSnapshot: (handler: (snapshot: FigmaVisualSnapshot) => void) => () => void;
}

const api: DesengineDesktopApi = {
  getLastFigmaSelectionPing() {
    console.log('[desengine:preload] getLastFigmaSelectionPing called');

    return ipcRenderer.invoke('figma-selection-ping:get-last') as Promise<
      FigmaSelectionPing | undefined
    >;
  },
  getLastFigmaVisualSnapshot() {
    console.log('[desengine:preload] getLastFigmaVisualSnapshot called');

    return ipcRenderer.invoke('figma-visual-snapshot:get-last') as Promise<
      FigmaVisualSnapshot | undefined
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
  onFigmaVisualSnapshot(handler) {
    const listener = (_event: Electron.IpcRendererEvent, snapshot: FigmaVisualSnapshot) => {
      console.log('[desengine:preload] figma-visual-snapshot received', {
        nodeId: snapshot.nodeId,
        nodeName: snapshot.nodeName,
      });
      handler(snapshot);
    };

    console.log('[desengine:preload] subscribing to figma-visual-snapshot');
    ipcRenderer.on('figma-visual-snapshot', listener);

    return () => {
      console.log('[desengine:preload] unsubscribing from figma-visual-snapshot');
      ipcRenderer.removeListener('figma-visual-snapshot', listener);
    };
  },
};

console.log('[desengine:preload] exposing desktop API');
contextBridge.exposeInMainWorld('desengine', api);
