import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import vm from "node:vm";

import ts from "typescript";

// Exercise server and pure TypeScript modules with Node's built-in test runner.
// Each load gets isolated module state and a controlled fetch implementation.
export function loadTypeScript(entry, overrides = {}) {
  const cache = new Map();
  const root = resolve(import.meta.dirname, "..");
  const globals = {
    fetch,
    Headers,
    Request,
    Response,
    FormData,
    AbortSignal,
    URL,
    TextEncoder,
    TextDecoder,
    Event,
    console,
    process: { env: { NODE_ENV: "test" } },
    ...overrides,
  };
  function load(file) {
    if (cache.has(file)) return cache.get(file).exports;
    const moduleRecord = { exports: {} };
    cache.set(file, moduleRecord);
    const nativeRequire = createRequire(file);
    const require = (specifier) => {
      if (specifier.startsWith("@/"))
        return load(resolve(root, "src", specifier.slice(2) + ".ts"));
      if (specifier.startsWith("."))
        return load(resolve(dirname(file), specifier + ".ts"));
      return nativeRequire(specifier);
    };
    const source = ts.transpileModule(readFileSync(file, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
      fileName: file,
    }).outputText;
    vm.runInNewContext(
      source,
      {
        ...globals,
        require,
        module: moduleRecord,
        exports: moduleRecord.exports,
      },
      { filename: file },
    );
    return moduleRecord.exports;
  }
  return load(resolve(root, entry));
}
