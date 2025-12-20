"use client";

import { useMemo, useState } from "react";

type CompileSuccess = {
  type: "compile_success";
  success: true;
  modules: Array<{ name: string; bytecode_base64: string }>;
  package_metadata_bcs: string | null;
  compiler_stdout: string;
  metadata?: { module_count?: number; has_metadata?: boolean };
};

type CompileFailure = {
  type: "compile_failed";
  success: false;
  error_count: number;
  errors: Array<{
    message: string;
    file?: string;
    line?: number;
    column?: number;
    source_line?: string;
    type?: string;
  }>;
};

type CompileResponse = CompileSuccess | CompileFailure;

const DEFAULT_CODE = `module hello::hello {
  use std::signer;

  public entry fun hello_world(_account: &signer) {
    // TODO
  }
}
`;

export default function Home() {
  const [code, setCode] = useState<string>(DEFAULT_CODE);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<CompileResponse | null>(null);
  const [rawError, setRawError] = useState<string | null>(null);

  const canCompile = useMemo(() => code.trim().length > 0 && !loading, [code, loading]);

  async function onCompile() {
    setLoading(true);
    setRawError(null);
    setResponse(null);

    try {
      const res = await fetch("/api/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = (await res.json()) as CompileResponse;
      setResponse(data);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setRawError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Move Compiler</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Paste Move code, compile via the backend, and inspect bytecode + metadata.
          </p>
        </header>

        <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-medium">Source</div>
            <button
              onClick={onCompile}
              disabled={!canCompile}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-black"
            >
              {loading ? "Compiling…" : "Compile"}
            </button>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className="mt-3 h-[320px] w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 p-3 font-mono text-sm leading-6 outline-none focus:ring-2 focus:ring-zinc-300 dark:border-zinc-800 dark:bg-black dark:focus:ring-zinc-700"
          />

          <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            Calls <span className="font-mono">POST /api/compile</span> (proxied to the backend container).
          </div>
        </section>

        {(rawError || response) && (
          <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="text-sm font-medium">Result</div>

            {rawError && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
                {rawError}
              </div>
            )}

            {response?.success === true && (
              <div className="mt-3 flex flex-col gap-4">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
                  Compilation succeeded. Modules: {response.modules.length}. Metadata: {String(Boolean(response.package_metadata_bcs))}.
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
                    <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Modules</div>
                    <div className="mt-2 flex flex-col gap-3">
                      {response.modules.length === 0 ? (
                        <div className="text-sm text-zinc-600 dark:text-zinc-400">No .mv modules found.</div>
                      ) : (
                        response.modules.map((m) => (
                          <div key={m.name} className="rounded-lg border border-zinc-200 p-2 dark:border-zinc-800">
                            <div className="text-sm font-medium">{m.name}</div>
                            <div className="mt-1 break-all font-mono text-xs text-zinc-600 dark:text-zinc-400">
                              {m.bytecode_base64.slice(0, 200)}{m.bytecode_base64.length > 200 ? "…" : ""}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
                    <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Package metadata (.bcs)</div>
                    <div className="mt-2 break-all font-mono text-xs text-zinc-600 dark:text-zinc-400">
                      {response.package_metadata_bcs
                        ? `${response.package_metadata_bcs.slice(0, 400)}${response.package_metadata_bcs.length > 400 ? "…" : ""}`
                        : "No metadata generated."}
                    </div>
                  </div>
                </div>

                {response.compiler_stdout?.trim() && (
                  <div className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
                    <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Compiler stdout</div>
                    <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap break-words font-mono text-xs text-zinc-700 dark:text-zinc-300">
                      {response.compiler_stdout}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {response?.success === false && (
              <div className="mt-3">
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
                  Compilation failed. Errors: {response.error_count}.
                </div>

                <div className="mt-3 flex flex-col gap-3">
                  {response.errors.map((err, idx) => (
                    <div key={idx} className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
                      <div className="text-sm font-medium">{err.message}</div>
                      {(err.file || err.line || err.column) && (
                        <div className="mt-1 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                          {err.file ?? ""}
                          {typeof err.line === "number" ? `:${err.line}` : ""}
                          {typeof err.column === "number" ? `:${err.column}` : ""}
                        </div>
                      )}
                      {err.source_line && (
                        <pre className="mt-2 overflow-auto rounded-lg bg-zinc-50 p-2 font-mono text-xs text-zinc-700 dark:bg-black dark:text-zinc-300">
                          {err.source_line}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
