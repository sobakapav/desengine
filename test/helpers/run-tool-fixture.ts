export class ExitSignal extends Error {
  code: number | undefined

  constructor(code: number | undefined) {
    super(`process.exit(${code})`)
    this.code = code
  }
}

type RunToolArgs = {
  cwd: string
  argv?: string[]
  runner: (argv?: string[]) => void
  env?: Record<string, string | undefined>
}

type RunToolResult = {
  exitCode: number | undefined
  stdout: string
  stderr: string
  thrown: unknown
}

export function runToolInFixture(args: RunToolArgs): RunToolResult {
  const stdout: string[] = []
  const stderr: string[] = []
  const originalCwd = process.cwd()
  const originalLog = console.log
  const originalError = console.error
  const originalExit = process.exit
  const originalEnv = { ...process.env }
  let exitCode: number | undefined
  let thrown: unknown

  console.log = (...values: unknown[]) => {
    stdout.push(values.map(String).join(" "))
  }
  console.error = (...values: unknown[]) => {
    stderr.push(values.map(String).join(" "))
  }
  process.exit = ((code?: number) => {
    throw new ExitSignal(code)
  }) as typeof process.exit

  if (args.env) {
    for (const [key, value] of Object.entries(args.env)) {
      if (value === undefined) {
        delete process.env[key]
      } else {
        process.env[key] = value
      }
    }
  }

  try {
    process.chdir(args.cwd)
    args.runner(args.argv)
  } catch (error) {
    if (error instanceof ExitSignal) {
      exitCode = error.code
    } else {
      thrown = error
    }
  } finally {
    process.chdir(originalCwd)
    console.log = originalLog
    console.error = originalError
    process.exit = originalExit

    for (const key of Object.keys(process.env)) {
      if (!(key in originalEnv)) {
        delete process.env[key]
      }
    }
    for (const [key, value] of Object.entries(originalEnv)) {
      process.env[key] = value
    }
  }

  return {
    exitCode,
    stdout: stdout.join("\n"),
    stderr: stderr.join("\n"),
    thrown,
  }
}
