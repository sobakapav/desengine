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
        <div className="flex-1">
            {authState === "expired" && (
              <p className="mt-4 tool-notice-warning">
                Обычно мы просим вводить email раз в сутки. Пора.
              </p>
            )}

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <Input
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(event) => onEmailChange(event.target.value)}
                  disabled={isPending || !configured}
                  className="w-full !text-2xl p-4 h-12"
                />

              {error && (
                <p className="tool-notice-error">{error}</p>
              )}

              {!configured && (
                <p className="tool-notice-warning">
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