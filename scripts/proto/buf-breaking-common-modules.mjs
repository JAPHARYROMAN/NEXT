#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const args = new Map();
for (let i = 2; i < process.argv.length; i += 1) {
  const arg = process.argv[i];
  if (arg.startsWith("--")) {
    args.set(arg.slice(2), process.argv[i + 1]);
    i += 1;
  }
}

const against = args.get("against");
const againstRef = args.get("against-ref") ?? "origin/main";

if (!against) {
  console.error("usage: buf-breaking-common-modules.mjs --against <buf-source> [--against-ref <git-ref>]");
  process.exit(2);
}

function parseModulePaths(bufYaml) {
  return bufYaml
    .split(/\r?\n/)
    .map((line) => line.match(/^\s*-\s+path:\s*["']?([^"'\s]+)["']?\s*$/)?.[1])
    .filter(Boolean);
}

function gitShow(refPath) {
  const result = spawnSync("git", ["show", refPath], { encoding: "utf8" });
  if (result.status !== 0) {
    process.stderr.write(result.stderr);
    process.exit(result.status ?? 1);
  }
  return result.stdout;
}

function normalizeOutput(output) {
  return output.replaceAll("\\", "/").trim();
}

const allowedPhase13BreakingLine =
  'packages/events/schemas/auth/v1/user_registered.proto:8:1:File option "go_package" changed from "github.com/next-ecosystem/next/gen/go/auth/v1;authv1" to "github.com/next-ecosystem/next/gen/go/next/events/auth/v1;autheventsv1".';

function isAllowedPhase13Breaking(modulePath, output) {
  const lines = normalizeOutput(output)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    modulePath === "packages/events/schemas" &&
    lines.length === 1 &&
    lines[0] === allowedPhase13BreakingLine
  );
}

const currentModules = parseModulePaths(readFileSync("buf.yaml", "utf8"));
const againstModules = parseModulePaths(gitShow(`${againstRef}:buf.yaml`));
const againstModuleSet = new Set(againstModules);
const currentModuleSet = new Set(currentModules);

const commonModules = currentModules.filter((modulePath) => againstModuleSet.has(modulePath));
const addedModules = currentModules.filter((modulePath) => !againstModuleSet.has(modulePath));
const removedModules = againstModules.filter((modulePath) => !currentModuleSet.has(modulePath));

console.log(`buf breaking policy: ${commonModules.length} common modules, ${addedModules.length} added modules`);

if (addedModules.length > 0) {
  console.log("new modules are linted/generated; breaking baseline begins after merge:");
  for (const modulePath of addedModules) {
    console.log(`  + ${modulePath}`);
  }
}

if (removedModules.length > 0) {
  console.error("modules removed relative to breaking baseline:");
  for (const modulePath of removedModules) {
    console.error(`  - ${modulePath}`);
  }
  process.exit(1);
}

const failures = [];
for (const modulePath of commonModules) {
  const moduleAgainst = `${against},subdir=${modulePath}`;
  const result = spawnSync("buf", ["breaking", modulePath, "--against", moduleAgainst], {
    encoding: "utf8",
  });
  const output = `${result.stdout}${result.stderr}`;

  if (result.status === 0) {
    console.log(`PASS ${modulePath}`);
    continue;
  }

  if (isAllowedPhase13Breaking(modulePath, output)) {
    console.log(`ALLOW ${modulePath}: ADR 0042 pre-MVP go_package correction`);
    continue;
  }

  failures.push({ modulePath, output });
}

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`FAIL ${failure.modulePath}`);
    process.stderr.write(failure.output);
  }
  process.exit(1);
}

console.log("buf breaking policy passed for common modules.");
