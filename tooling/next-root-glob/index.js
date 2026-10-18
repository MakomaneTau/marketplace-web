/* eslint-disable @typescript-eslint/no-require-imports -- Next loads this adapter through CommonJS. */
const { statSync } = require("node:fs");
const {
  dirname,
  isAbsolute,
  normalize,
  parse,
  relative,
  resolve,
} = require("node:path");

const { globSync: tinyGlobSync, isDynamicPattern } = require("tinyglobby");

// Next 16.4 only calls globSync(pattern, { onlyDirectories: true }).
// Match fast-glob's literal-directory behavior rather than expanding roots
// recursively, which is tinyglobby's default.
exports.globSync = (patterns, options = {}) => {
  const inputs = Array.isArray(patterns) ? patterns : [patterns];
  const matches = [];
  for (const input of inputs) {
    const pattern =
      process.platform === "win32" ? input.replaceAll("\\", "/") : input;
    if (options.onlyDirectories && !isDynamicPattern(pattern)) {
      try {
        if (
          statSync(resolve(options.cwd || process.cwd(), pattern)).isDirectory()
        )
          matches.push(
            options.absolute
              ? resolve(options.cwd || process.cwd(), pattern)
              : pattern,
          );
      } catch (error) {
        if (!["ENOENT", "ENOTDIR"].includes(error.code)) throw error;
      }
    } else {
      const absolutePattern = isAbsolute(pattern);
      const originalCwd = options.cwd || process.cwd();
      const searchPattern = resolve(originalCwd, pattern).replaceAll("\\", "/");
      // Anchor traversal before dynamic segments, including patterns outside cwd.
      // A temp directory can be on a different Windows drive from the project.
      let cwd = dirname(searchPattern);
      while (isDynamicPattern(cwd)) cwd = dirname(cwd);
      matches.push(
        ...tinyGlobSync(searchPattern, {
          expandDirectories: false,
          ...options,
          cwd,
          absolute: true,
        }).map((match) =>
          (options.absolute ?? absolutePattern)
            ? match
            : relative(originalCwd, match),
        ),
      );
    }
  }
  // tinyglobby includes a trailing slash on directories. fast-glob does not.
  return [
    ...new Set(
      matches.map((match) => {
        const normalized = normalize(match);
        const value = normalized.replaceAll("\\", "/");
        return normalized === parse(normalized).root
          ? value
          : value.replace(/\/$/, "");
      }),
    ),
  ];
};
