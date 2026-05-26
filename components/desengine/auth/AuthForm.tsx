import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormEvent } from "react"

type AuthFormProps = {
    authState: string
    email: string
    error: string
    isPending: boolean
    configured: boolean
    onEmailChange: (email: string) => void
    handleSubmit: (event: FormEvent<HTMLFormElement>) => void
}

/**
 * @example
 * ```tsx
 * <AuthForm authState="missing" configured email="" error="" isPending={false} onEmailChange={() => {}} handleSubmit={() => {}} />
 * ```
 */
export default function AuthForm({
    authState,
    email,
    configured,
    isPending,
    error,
    handleSubmit,
    onEmailChange,
} : AuthFormProps) {
    return (
  <div className="flex-1 max-w-xl">
     <div className="mb-6">
      <h2 className="text-5xl font-bold leading-tight text-slate-900">
    Добро пожаловать!
     </h2>

      <h3 className="mt-4 text-2xl font-bold text-slate-900">
   Введите email
      </h3>

  <p className="mt-1 text-sm leading-relaxed text-slate-500">
    Введите email, чтобы открыть защищённую часть лаборатории.
  </p>
</div>

    {authState === "expired" && (
      <p className="mt-4 tool-notice-warning">
        Обычно мы просим вводить email раз в сутки. Пора.
      </p>
    )}

    <form className="space-y-4" onSubmit={handleSubmit}>
      <Input
        type="email"
        autoComplete="email"
        inputMode="email"
        placeholder="name@example.com"
        value={email}
        onChange={(event) => onEmailChange(event.target.value)}
        disabled={isPending || !configured}
        className="w-full !text-xl p-4 h-12"
      />

      {error && (
        <p>{error}</p>
      )}

      {!configured && (
        <p>
          Проверка доступа пока не настроена. Сначала администратор должен задать
          `ALLOWLIST_BASE_URL` и `ALLOWLIST_SALT` в `desengine.config.txt`.
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={isPending || !configured}
        className="h-11"
      >
        {isPending ? "Проверяем доступ…" : "Открыть защищённую лабораторию"}
      </Button>
    </form>
  </div>
)
}
