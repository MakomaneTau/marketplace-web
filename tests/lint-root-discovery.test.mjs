import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { test } from "node:test";

const require = createRequire(import.meta.url);
const { getRootDirs } = require(
  join(
    dirname(require.resolve("@next/eslint-plugin-next")),
    "utils/get-root-dirs.js",
  ),
);
const normalize = (value) => value.replaceAll("\\", "/");

test("Next lint keeps the current directory when no custom root is configured", () => {
  const cwd = process.cwd();
  assert.deepEqual(getRootDirs({ cwd, settings: {} }), [cwd]);
});

test("Next lint discovers directory roots without including files or nested source folders", (t) => {
  const tempRoot = resolve(tmpdir());
  const directory = mkdtempSync(join(tempRoot, "marketplace-lint-roots-"));
  t.after(() => {
    const within = relative(tempRoot, resolve(directory));
    assert.ok(within && !within.startsWith("..") && !isAbsolute(within));
    rmSync(directory, { recursive: true, force: true });
  });
  const buyer = join(directory, "apps", "buyer");
  const seller = join(directory, "apps", "seller");
  mkdirSync(join(buyer, "src"), { recursive: true });
  mkdirSync(join(seller, "src"), { recursive: true });
  writeFileSync(join(directory, "apps", "README.md"), "fixture");
  const roots = (rootDir) =>
    getRootDirs({ cwd: process.cwd(), settings: { next: { rootDir } } })
      .map(normalize)
      .sort();
  const expected = [buyer, seller].map(normalize).sort();

  assert.deepEqual(roots(buyer), [normalize(buyer)]);
  assert.deepEqual(roots(join(directory, "apps", "*")), expected);
  assert.deepEqual(roots(join(directory, "apps", "{buyer,seller}")), expected);
  assert.deepEqual(roots([buyer, seller]), expected);
});
