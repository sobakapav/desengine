import {
  DESENGINE_PROTOCOL_VERSION,
  DESENGINE_SELECTION_PING_LATEST_ROUTE,
  DESENGINE_VISUAL_SNAPSHOT_LATEST_ROUTE,
  createDevHandoffUrl,
} from '@desengine/protocol';
import type { FigmaSelectionPing, FigmaVisualSnapshot } from '@desengine/protocol';
import { Image, Radio, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

const latestFigmaPingUrl = createDevHandoffUrl(DESENGINE_SELECTION_PING_LATEST_ROUTE);
const latestVisualSnapshotUrl = createDevHandoffUrl(DESENGINE_VISUAL_SNAPSHOT_LATEST_ROUTE);

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
    value: 'ожидает workflow',
  },
];

export function App() {
  const [lastPing, setLastPing] = useState<FigmaSelectionPing | undefined>();
  const [visualSnapshot, setVisualSnapshot] = useState<FigmaVisualSnapshot | undefined>();
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
    }, 1000);

    return () => {
      console.log('[desengine:renderer] App unmounted');
      unsubscribe?.();
      unsubscribeVisualSnapshot?.();
      window.clearInterval(poll);
    };
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-6">
        <header className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <p className="text-sm text-muted-foreground">desktop player</p>
            <h1 className="text-2xl font-semibold tracking-normal">desengine</h1>
          </div>
          <div className="rounded border border-border px-3 py-1 text-sm text-muted-foreground">
            protocol {DESENGINE_PROTOCOL_VERSION}
          </div>
        </header>

        <div className="grid flex-1 gap-6 py-8 lg:grid-cols-[1.5fr_0.5fr]">
          <section className="flex min-h-[520px] items-center justify-center overflow-hidden rounded border border-border bg-card p-6">
            {visualSnapshot ? (
              <img
                alt={visualSnapshot.nodeName}
                className="max-h-full max-w-full object-contain"
                src={visualSnapshot.image.dataUrl}
              />
            ) : (
              <div className="grid place-items-center gap-3 text-center text-muted-foreground">
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

          <aside className="space-y-3">
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
              {visualSnapshot ? (
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
