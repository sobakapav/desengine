import { DESENGINE_PROTOCOL_VERSION } from '@desengine/protocol';
import { GitBranch, Play, ShieldCheck } from 'lucide-react';

import { Button } from './components/ui/button';

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

        <div className="grid flex-1 gap-6 py-8 lg:grid-cols-[1.3fr_0.7fr]">
          <section className="flex flex-col justify-between rounded border border-border bg-card p-6">
            <div className="space-y-5">
              <div className="flex h-12 w-12 items-center justify-center rounded border border-border bg-secondary text-secondary-foreground">
                <Play aria-hidden="true" className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold tracking-normal">
                  Минимальная основа renderer готовится к player-слою
                </h2>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                  Этот экран проверяет, что Electron renderer уже работает как React-приложение
                  и получает версию общего протокола из workspace-пакета.
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button type="button">
                <Play aria-hidden="true" className="h-4 w-4" />
                Player baseline
              </Button>
              <Button type="button" variant="secondary">
                <GitBranch aria-hidden="true" className="h-4 w-4" />
                Схема позже
              </Button>
            </div>
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
