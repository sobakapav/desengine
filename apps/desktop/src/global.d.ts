import type { DesengineDesktopApi } from './preload';

declare global {
  interface Window {
    desengine?: DesengineDesktopApi;
  }
}

export {};
