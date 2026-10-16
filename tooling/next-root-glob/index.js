/* eslint-disable @typescript-eslint/no-require-imports -- Next loads this adapter through CommonJS. */
const { statSync } = require("node:fs");
const { resolve } = require("node:path");

const { globSync: tinyGlobSync, isDynamicPattern } = require("tinyglobby");

// Next 16.4 only calls globSync(pattern, { onlyDirectories: true }).
// Match fast-glob's literal-directory behavior rather than expanding roots
// recursively, which is tinyglobby's default.
exports.globSync = (patterns, options = {}) => {
  const inputs = Array.isArray(patterns) ? patterns : [patterns];
  const literals = [];
  const globs = [];
  for (const pattern of inputs) {
    if (options.onlyDirectories && !isDynamicPattern(pattern)) {
      try {
        if (
          statSync(resolve(options.cwd || process.cwd(), pattern)).isDirectory()
        )
          literals.push(pattern);
      } catch (error) {
        if (!["ENOENT", "ENOTDIR"].includes(error.code)) throw error;
      }
    } else {
      globs.push(
        process.platform === "win32" ? pattern.replaceAll("\\", "/") : pattern,
      );
    }
  }
  const matched = globs.length
    ? tinyGlobSync(globs, { expandDirectories: false, ...options })
    : [];
  return [...new Set([...literals, ...matched])];
};
