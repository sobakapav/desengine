"use client";

import { type KeyboardEvent as ReactKeyboardEvent, useEffect, useMemo, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import { Textarea } from "@/components/ui/textarea";
import { isEditorSaveHotkey } from "@/lib/lab/editor";

type MonacoInstance = {
  languages: {
    typescript: {
      typescriptDefaults: {
        setDiagnosticsOptions(options: {
          noSemanticValidation?: boolean;
          noSuggestionDiagnostics?: boolean;
          noSyntaxValidation?: boolean;
        }): void;
      };
      javascriptDefaults: {
        setDiagnosticsOptions(options: {
          noSemanticValidation?: boolean;
          noSuggestionDiagnostics?: boolean;
          noSyntaxValidation?: boolean;
        }): void;
      };
    };
  };
};

type MonacoEditorProps = {
  fileId: string;
  fileName: string;
  value: string;
  onChange: (nextValue: string) => void;
  onSaveShortcut?: () => void;
};

type MonacoReactEditorProps = {
  beforeMount?: (monaco: MonacoInstance) => void;
  defaultLanguage?: string;
  height?: string;
  loading?: ReactNode;
  onMount?: (editor: MonacoEditorInstance, monaco: MonacoGlobalInstance) => void;
  onChange?: (value: string | undefined) => void;
  options?: Record<string, unknown>;
  path?: string;
  theme?: string;
  value?: string;
};

type MonacoEditorInstance = {
  addCommand: (keybinding: number, handler: () => void) => void;
}

type MonacoGlobalInstance = MonacoInstance & {
  KeyMod: {
    CtrlCmd: number;
  };
  KeyCode: {
    KeyS: number;
  };
}

const editorOptions = {
  automaticLayout: true,
  bracketPairColorization: { enabled: false },
  fontSize: 14,
  guides: {
    bracketPairs: false,
    indentation: true,
  },
  lineNumbers: "on",
  minimap: { enabled: false },
  padding: { top: 12, bottom: 12 },
  renderLineHighlight: "line",
  roundedSelection: false,
  scrollBeyondLastLine: false,
  smoothScrolling: true,
  tabSize: 2,
  wordWrap: "on",
} satisfies Record<string, unknown>;

type MonacoCancellationLike = {
  message?: unknown;
  name?: unknown;
  stack?: unknown;
};

function getEditorLanguage(fileName: string) {
  if (fileName.endsWith(".json")) {
    return "json";
  }

  if (fileName.endsWith(".tsx")) {
    return "typescript";
  }

  if (fileName.endsWith(".ts")) {
    return "typescript";
  }

  if (fileName.endsWith(".js")) {
    return "javascript";
  }

  if (fileName.endsWith(".css")) {
    return "css";
  }

  return "plaintext";
}

function FallbackCodeEditor({ fileId, value, onChange, onSaveShortcut }: MonacoEditorProps) {
  function handleKeyDown(event: ReactKeyboardEvent<HTMLTextAreaElement>) {
    const isSaveHotkey = isEditorSaveHotkey(event);

    if (!isSaveHotkey) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    onSaveShortcut?.();
  }

  return (
    <Textarea
      id={fileId}
      placeholder={fileId}
      className="h-full w-full rounded-none border-0 bg-transparent p-3 font-mono text-sm text-black shadow-none focus-visible:ring-0"
      value={value}
      onKeyDown={handleKeyDown}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function configureLabDiagnostics(monaco: MonacoInstance) {
  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: true,
    noSuggestionDiagnostics: true,
    noSyntaxValidation: false,
  });

  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: true,
    noSuggestionDiagnostics: true,
    noSyntaxValidation: false,
  });
}

function toErrorString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function isMonacoCancellationNoise(reason: unknown) {
  if (typeof reason !== "object" || reason === null) {
    return false;
  }

  const { message, name, stack } = reason as MonacoCancellationLike;
  const errorName = toErrorString(name);
  const errorMessage = toErrorString(message);
  const errorStack = toErrorString(stack)?.toLowerCase() ?? "";
  const isCanceledError = errorName === "Canceled" && errorMessage === "Canceled";
  const isMonacoStack =
    errorStack.includes("monaco-editor") ||
    errorStack.includes("@monaco-editor") ||
    errorStack.includes("vs/base/common/cancellation");

  return isCanceledError && isMonacoStack;
}

function EditorFallback(props: MonacoEditorProps) {
  return <FallbackCodeEditor {...props} />;
}

function MonacoCodeEditor({ fileId, fileName, value, onChange, onSaveShortcut }: MonacoEditorProps) {
  const [Editor, setEditor] = useState<ComponentType<MonacoReactEditorProps> | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void import("@monaco-editor/react")
      .then((module) => {
        if (!cancelled) {
          setEditor(() => module.default);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadFailed(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (loadFailed) {
      return;
    }

    function handleUnhandledRejection(event: PromiseRejectionEvent) {
      if (!isMonacoCancellationNoise(event.reason)) {
        return;
      }

      event.preventDefault();
    }

    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, [loadFailed]);

  const language = useMemo(() => getEditorLanguage(fileName), [fileName]);
  const fallback = (
    <EditorFallback
      fileId={fileId}
      fileName={fileName}
      value={value}
      onChange={onChange}
      onSaveShortcut={onSaveShortcut}
    />
  );

  if (loadFailed || Editor === null) {
    return fallback;
  }

  return (
    <Editor
      path={fileName}
      beforeMount={configureLabDiagnostics}
      defaultLanguage={language}
      height="100%"
      theme="light"
      value={value}
      loading={fallback}
      onMount={(editor, monaco) => {
        if (!onSaveShortcut) {
          return;
        }

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
          onSaveShortcut();
        });
      }}
      onChange={(nextValue) => onChange(nextValue ?? "")}
      options={editorOptions}
    />
  );
}

export { MonacoCodeEditor, isMonacoCancellationNoise };
