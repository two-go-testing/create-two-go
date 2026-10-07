// End-to-end tests for the create-two-go CLI: run it in a temp directory and
// inspect the generated project.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, existsSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const CLI = join(dirname(fileURLToPath(import.meta.url)), "..", "index.js");

function run(cwd, ...args) {
  return spawnSync(process.execPath, [CLI, ...args], { cwd, encoding: "utf8" });
}

function workspace(t) {
  const dir = mkdtempSync(join(tmpdir(), "create-two-go-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}

test("scaffolds a project with the given name", (t) => {
  const cwd = workspace(t);
  const result = run(cwd, "my-api-tests");
  assert.equal(result.status, 0, result.stderr);

  const project = join(cwd, "my-api-tests");
  const pkg = JSON.parse(readFileSync(join(project, "package.json"), "utf8"));
  assert.equal(pkg.name, "my-api-tests");
  assert.match(pkg.dependencies["two-go"], /^\^2\./);
  assert.ok(existsSync(join(project, "api.test.mjs")));
  assert.ok(existsSync(join(project, ".gitignore")));
  assert.ok(!existsSync(join(project, "_gitignore")));
});

test("defaults to two-go-app", (t) => {
  const cwd = workspace(t);
  assert.equal(run(cwd).status, 0);
  const pkg = JSON.parse(readFileSync(join(cwd, "two-go-app", "package.json"), "utf8"));
  assert.equal(pkg.name, "two-go-app");
});

test("uses the last path segment as the package name", (t) => {
  const cwd = workspace(t);
  assert.equal(run(cwd, "nested/dir/service-tests").status, 0);
  const pkg = JSON.parse(readFileSync(join(cwd, "nested/dir/service-tests/package.json"), "utf8"));
  assert.equal(pkg.name, "service-tests");
});

test("rejects names that are not valid npm package names", (t) => {
  const cwd = workspace(t);
  for (const name of ["My App", "UPPER", ".hidden", "_private"]) {
    const result = run(cwd, name);
    assert.equal(result.status, 1, name);
    assert.match(result.stderr, /project name/);
    assert.ok(!existsSync(join(cwd, name)), `${name} should not be created`);
  }
});

test("refuses a non-empty target directory", (t) => {
  const cwd = workspace(t);
  mkdirSync(join(cwd, "taken"));
  writeFileSync(join(cwd, "taken", "file.txt"), "x");
  const result = run(cwd, "taken");
  assert.equal(result.status, 1);
  assert.match(result.stderr, /not empty/);
});

test("accepts an existing empty directory", (t) => {
  const cwd = workspace(t);
  mkdirSync(join(cwd, "empty"));
  assert.equal(run(cwd, "empty").status, 0);
});

test("--help prints usage without creating anything", (t) => {
  const cwd = workspace(t);
  const result = run(cwd, "--help");
  assert.equal(result.status, 0);
  assert.match(result.stdout, /Usage: npm create two-go/);
  assert.ok(!existsSync(join(cwd, "--help")));
});
