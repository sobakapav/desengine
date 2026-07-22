import {
  DESENGINE_EXPLODED_FRAME_LATEST_ROUTE,
  DESENGINE_PROTOCOL_VERSION,
  DESENGINE_SELECTION_PING_LATEST_ROUTE,
  DESENGINE_VISUAL_SNAPSHOT_LATEST_ROUTE,
  createDevHandoffUrl,
} from '@desengine/protocol';
import type {
  FigmaExplodedFrameSnapshot,
  FigmaSelectionPing,
  FigmaVisualSnapshot,
} from '@desengine/protocol';
import { Image, Radio, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

const latestFigmaPingUrl = createDevHandoffUrl(DESENGINE_SELECTION_PING_LATEST_ROUTE);
const latestVisualSnapshotUrl = createDevHandoffUrl(DESENGINE_VISUAL_SNAPSHOT_LATEST_ROUTE);
const latestExplodedFrameUrl = createDevHandoffUrl(DESENGINE_EXPLODED_FRAME_LATEST_ROUTE);

const readinessItems = [
  {
    title: 'Renderer',
    value: 'React baseline',
  },
  {
    title: 'Protocol',
    value: `v${DESENGINE_PROTOCOL_VERSION}`,
  },
  {
    title: 'Transport',
    value: 'Figma handoff',
  },
];

function getExplodedCellImageClassName(
  cell: FigmaExplodedFrameSnapshot['cells'][number],
) {
  if (cell.stopReason === 'instance') {
    return 'absolute rounded border-2 border-violet-500 bg-transparent shadow-[0_0_0_2px_rgba(139,92,246,0.18)]';
  }

  return 'absolute rounded border border-border bg-transparent shadow-sm';
}

function ExplodedFrameView({ snapshot }: { snapshot: FigmaExplodedFrameSnapshot }) {
  const frameWidth = Math.max(snapshot.frame.width, 1);
  const frameHeight = Math.max(snapshot.frame.height, 1);
  const scale = Math.min(1, 400 / frameWidth, 440 / frameHeight);
  const maxCellRight = Math.max(...snapshot.cells.map((cell) => cell.x + cell.width), frameWidth);
  const maxCellBottom = Math.max(...snapshot.cells.map((cell) => cell.y + cell.height), frameHeight);
  const maxDepth = Math.max(...snapshot.cells.map((cell) => cell.depth), 1);
  const stageWidth = Math.max(260, maxCellRight * scale + maxDepth * 44 + 48);
  const stageHeight = Math.max(260, maxCellBottom * scale + Math.min(snapshot.cells.length * 5, 200) + 48);

  return (
    <div className="grid min-h-max min-w-max gap-6 lg:grid-cols-[360px_auto]">
      <div className="flex h-[440px] w-[360px] items-center justify-center overflow-hidden rounded border border-border bg-background p-4">
        <img
          alt={snapshot.frame.nodeName}
          className="max-h-full max-w-full object-contain"
          src={snapshot.frame.image.dataUrl}
        />
      </div>
      <div className="flex items-start justify-start rounded border border-border bg-background p-4">
        <div
          aria-label="Взрыв-схема frame"
          className="relative"
          style={{
            height: stageHeight,
            width: stageWidth,
          }}
        >
          <div
            className="absolute rounded border border-dashed border-muted-foreground/50"
            style={{
              height: frameHeight * scale,
              left: 12,
              top: 12,
              width: frameWidth * scale,
            }}
          />
          {snapshot.cells.map((cell) => (
            <img
              key={cell.nodeId}
              alt={cell.nodeName}
              className={getExplodedCellImageClassName(cell)}
              src={cell.image.dataUrl}
              style={{
                height: Math.max(cell.height * scale, 1),
                left: 12 + cell.x * scale + cell.depth * 34,
                top: 12 + cell.y * scale + cell.index * 5,
                width: Math.max(cell.width * scale, 1),
                zIndex: cell.index + 1,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function App() {
  const [lastPing, setLastPing] = useState<FigmaSelectionPing | undefined>();
  const [visualSnapshot, setVisualSnapshot] = useState<FigmaVisualSnapshot | undefined>();
  const [explodedFrame, setExplodedFrame] = useState<FigmaExplodedFrameSnapshot | undefined>();
  const [handoffSource, setHandoffSource] = useState<'ожидаю' | 'endpoint' | 'ipc'>('ожидаю');

  useEffect(() => {
    console.log('[desengine:renderer] App mounted', {
      hasDesktopApi: Boolean(window.desengine),
    });

    window.desengine?.getLastFigmaSelectionPing().then((ping) => {
      console.log('[desengine:renderer] last ping from IPC request', ping);

      if (ping) {
        setLastPing(ping);
        setHandoffSource('ipc');
      }
    });

    window.desengine?.getLastFigmaVisualSnapshot().then((snapshot) => {
      console.log('[desengine:renderer] last visual snapshot from IPC request', snapshot);

      if (snapshot) {
        setVisualSnapshot(snapshot);
        setHandoffSource('ipc');
      }
    });

    window.desengine?.getLastFigmaExplodedFrame().then((snapshot) => {
      console.log('[desengine:renderer] last exploded frame from IPC request', {
        hasSnapshot: Boolean(snapshot),
        frameName: snapshot?.frame.nodeName,
      });

      if (snapshot) {
        setExplodedFrame(snapshot);
        setHandoffSource('ipc');
      }
    });

    const unsubscribe = window.desengine?.onFigmaSelectionPing((ping) => {
      console.log('[desengine:renderer] ping received via IPC subscription', ping);
      setLastPing(ping);
      setHandoffSource('ipc');
    });
    const unsubscribeVisualSnapshot = window.desengine?.onFigmaVisualSnapshot((snapshot) => {
      console.log('[desengine:renderer] visual snapshot received via IPC subscription', {
        nodeId: snapshot.nodeId,
        nodeName: snapshot.nodeName,
      });
      setVisualSnapshot(snapshot);
      setHandoffSource('ipc');
    });
    const unsubscribeExplodedFrame = window.desengine?.onFigmaExplodedFrame((snapshot) => {
      console.log('[desengine:renderer] exploded frame received via IPC subscription', {
        frameId: snapshot.frame.nodeId,
        frameName: snapshot.frame.nodeName,
        cellCount: snapshot.cellCount,
      });
      setExplodedFrame(snapshot);
      setHandoffSource('ipc');
    });

    const poll = window.setInterval(() => {
      console.log('[desengine:renderer] polling latest ping', { latestFigmaPingUrl });

      fetch(latestFigmaPingUrl)
        .then((response) => response.json() as Promise<{ ping?: FigmaSelectionPing }>)
        .then((payload) => {
          console.log('[desengine:renderer] polling response', payload);

          if (payload.ping) {
            setLastPing(payload.ping);
            setHandoffSource('endpoint');
          }
        })
        .catch((error) => {
          console.warn('[desengine:renderer] polling failed', error);
        });

      console.log('[desengine:renderer] polling latest visual snapshot', {
        latestVisualSnapshotUrl,
      });

      fetch(latestVisualSnapshotUrl)
        .then((response) => response.json() as Promise<{ snapshot?: FigmaVisualSnapshot }>)
        .then((payload) => {
          console.log('[desengine:renderer] visual snapshot polling response', {
            hasSnapshot: Boolean(payload.snapshot),
            nodeName: payload.snapshot?.nodeName,
          });

          if (payload.snapshot) {
            setVisualSnapshot(payload.snapshot);
            setHandoffSource('endpoint');
          }
        })
        .catch((error) => {
          console.warn('[desengine:renderer] visual snapshot polling failed', error);
        });

      console.log('[desengine:renderer] polling latest exploded frame', {
        latestExplodedFrameUrl,
      });

      fetch(latestExplodedFrameUrl)
        .then((response) => response.json() as Promise<{ snapshot?: FigmaExplodedFrameSnapshot }>)
        .then((payload) => {
          console.log('[desengine:renderer] exploded frame polling response', {
            hasSnapshot: Boolean(payload.snapshot),
            frameName: payload.snapshot?.frame.nodeName,
            cellCount: payload.snapshot?.cellCount,
          });

          if (payload.snapshot) {
            setExplodedFrame(payload.snapshot);
            setHandoffSource('endpoint');
          }
        })
        .catch((error) => {
          console.warn('[desengine:renderer] exploded frame polling failed', error);
        });
    }, 1000);

    return () => {
      console.log('[desengine:renderer] App unmounted');
      unsubscribe?.();
      unsubscribeVisualSnapshot?.();
      unsubscribeExplodedFrame?.();
      window.clearInterval(poll);
    };
  }, []);

  return (
    <main className="h-screen w-screen overflow-hidden bg-background text-foreground">
      <section className="flex h-full w-full flex-col px-6 py-6">
        <header className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <p className="text-sm text-muted-foreground">desktop player</p>
            <h1 className="text-2xl font-semibold tracking-normal">desengine</h1>
          </div>
          <div className="rounded border border-border px-3 py-1 text-sm text-muted-foreground">
            protocol {DESENGINE_PROTOCOL_VERSION}
          </div>
        </header>

        <div className="grid min-h-0 flex-1 gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="min-h-0 overflow-auto rounded border border-border bg-card p-6">
            {explodedFrame ? (
              <ExplodedFrameView snapshot={explodedFrame} />
            ) : visualSnapshot ? (
              <div className="flex min-h-full min-w-full items-center justify-center">
                <img
                  alt={visualSnapshot.nodeName}
                  className="max-h-full max-w-full object-contain"
                  src={visualSnapshot.image.dataUrl}
                />
              </div>
            ) : (
              <div className="grid min-h-full place-items-center gap-3 text-center text-muted-foreground">
                <div className="flex h-16 w-16 items-center justify-center rounded border border-border bg-secondary">
                  <Image aria-hidden="true" className="h-8 w-8" />
                </div>
                <p className="max-w-sm text-sm leading-6">
                  Выберите объект в Figma и отправьте его в desengine, чтобы увидеть визуальный
                  снимок.
                </p>
              </div>
            )}
          </section>

          <aside className="min-h-0 space-y-3 overflow-auto">
            {readinessItems.map((item) => (
              <div key={item.title} className="rounded border border-border bg-card p-4">
                <p className="text-sm text-muted-foreground">{item.title}</p>
                <p className="mt-1 font-medium">{item.value}</p>
              </div>
            ))}
            <div className="rounded border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Radio aria-hidden="true" className="h-4 w-4 text-primary" />
                Figma dev handoff
              </div>
              {explodedFrame ? (
                <div className="mt-2 space-y-2 text-sm text-muted-foreground">
                  <p>{explodedFrame.frame.nodeName}</p>
                  <p>Ячеек: {explodedFrame.cellCount}</p>
                  <p>Источник: {handoffSource}</p>
                </div>
              ) : visualSnapshot ? (
                <div className="mt-2 space-y-2 text-sm text-muted-foreground">
                  <p>{visualSnapshot.nodeName}</p>
                  <p>
                    {Math.round(visualSnapshot.width)} x {Math.round(visualSnapshot.height)}
                  </p>
                  <p>Источник: {handoffSource}</p>
                </div>
              ) : lastPing ? (
                <div className="mt-2 space-y-2 text-sm text-muted-foreground">
                  <p>Получено объектов: {lastPing.selectionCount}</p>
                  <p>Источник: {handoffSource}</p>
                  <p>
                    {lastPing.selectedNodeNames.length > 0
                      ? lastPing.selectedNodeNames.join(', ')
                      : 'Выбор пустой'}
                  </p>
                </div>
              ) : (
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Ожидаю ping от Figma plugin на localhost:37645.
                </p>
              )}
            </div>
            <div className="rounded border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <ShieldCheck aria-hidden="true" className="h-4 w-4 text-primary" />
                Security boundary
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Renderer остаётся без прямого Node-доступа; будущий preload API будет узким и
                типизированным.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
