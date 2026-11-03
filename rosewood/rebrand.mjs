#!/usr/bin/env node
// Deterministic: the same upstream tree must always produce the same output, or sync merges conflict.
import * as NodeCrypto from "node:crypto";
import * as NodeFS from "node:fs";
import * as NodePath from "node:path";
import * as NodeURL from "node:url";

const OWNER = "vaporwavie";
const REPO = `${OWNER}/rosewood`;
const REVERSE_DNS = `io.github.${OWNER}`;
const CONTACT_EMAIL = `${OWNER}@users.noreply.github.com`;

const SCRIPT_DIR = NodePath.dirname(NodeURL.fileURLToPath(import.meta.url));
const OVERLAY_DIR = NodePath.join(SCRIPT_DIR, "overlay");

const SKIP_CONTENT = [
  /^\.repos\//,
  /^patches\//,
  /^third-party-licenses\//,
  /^native\/libghostty-vt\//,
  /^apps\/mobile\/deps\//,
  /(^|\/)[Vv]endor\//,
  /(^|\/)(LICENSE|NOTICE|COPYING)[^/]*$/,
];
// Pi registers a public prefix and a hidden canonical one. "rosewood" has no hyphen to normalize, so the two would collide and hide every tool.
const PATH_RULES = [[/^packages\/provider-pi\//, /mcp__t3_code__/g, "mcp__rosewood_mcp__"]];
const SKIP_PATH = [/^\.repos\//, /(^|\/)[Vv]endor\//, /^apps\/mobile\/deps\//];

// Text that must survive verbatim: their other product, legal names, hosts with no Rosewood equivalent, and encoded data.
const MASKS = [
  /Copyright.*$/gm,
  // Branches from before upstream's own rename stay recognizable.
  /t3code(?=\(\?:\[-\/\]\$\{TEMP_WORKTREE_HEX|[-/]deadbeef|\/f4ae4e0e)/g,
  /T3 Tools,? Inc\.?/g,
  /T3 ?Chat|T3_CHAT|T3CHAT|t3[-._]?chat/g,
  /-t3\.\d+/g,
  /[\w.-]*\bt3\.(?:codes|gg|tools)\b[^\s"'`)\]>,]*/g,
  /\bd(?:=|: ?)(?:"[^"]*"|'[^']*')/g,
  /data:[a-z]+\/[^\s"')]+/g,
];
const ENCODED = /[A-Za-z0-9+/]{40,}={0,2}/g;
const MIN_ENCODED_SEGMENT = 32;
const MIN_ENCODED_DIGITS = 3;
// Docs keep working links to upstream's threads; code stays consistent with its own fixtures.
const UPSTREAM_THREAD_LINK =
  /github\.com\/pingdotgg\/t3code\/(?:issues(?!\/new)|pull|commit|discussions)[^\s"'`)\]>]*/g;

const RULES = [
  [/noreply@t3\.codes|hello@t3\.codes/g, CONTACT_EMAIL],
  [/snap-shot@t3\.codes/g, `snap-shot@${REVERSE_DNS}`],
  [/("?owner"?: ?)"pingdotgg"(,\s*"?(?:name|repo)"?: ?"t3code")/g, `$1"${OWNER}"$2`],
  [/"pingdotgg", "t3code"/g, `"${OWNER}", "t3code"`],
  [/pingdotgg\/t3code/gi, (match) => (match === "pingdotgg/t3code" ? REPO : "VaporWavie/Rosewood")],
  [/com\\\.t3tools\\\.t3code/g, `${REVERSE_DNS.replaceAll(".", "\\.")}\\.rosewood`],
  [/com\.t3tools\.t3code/g, `${REVERSE_DNS}.rosewood`],
  [/com\.t3tools\.T3Code/g, `${REVERSE_DNS}.Rosewood`],
  [/com\.t3tools\./g, `${REVERSE_DNS}.`],
  [/(?<![.\w])com\/t3tools\/t3code/g, `io/github/${OWNER}/rosewood`],
  [/@t3tools\b/g, "@rosewood"],
  // String escapes put a letter directly before the name, which defeats the word boundaries below.
  [/(\\[nrt])T3_(?=[A-Z])/g, "$1ROSEWOOD_"],
  [/(\\[nrt])T3(?=[A-Z][a-z])/g, "$1Rosewood"],
  [/(\\[nrt])t3(?=_)/g, "$1rw"],
  [/(\\[nrt])t3(?=[A-Z-]|[a-z]{3,}| )/g, "$1rosewood"],
  [/%3At3%3A/g, "%3Arosewood%3A"],
  // Regex literals that spell the brand with a character class.
  [/[tT]3\[[-_ ]+\]\??[cC]ode/g, "rosewood"],
  [/T3 Tools|T3Tools/g, "Rosewood"],
  [/\bt3tools\b/g, "rosewood"],
  [/T3(?:[ _+-]|%20)?[Cc]ode\b/g, "Rosewood"],
  [/T3_?CODE/g, "ROSEWOOD"],
  [/t3[-_]?code/g, "rosewood"],
  [/(?<![A-Za-z0-9])T3_(?=[A-Z])/g, "ROSEWOOD_"],
  // Lowercase fixtures of reserved environment variables must still normalize onto the real name.
  [/\bt3_(boot_service_unit|service_launcher_context)\b/g, "rosewood_$1"],
  // Upstream's server alias (t3code) and tool prefix (t3_) stay distinct, or parsers strip `rosewood_` off tool names.
  [/(?<![A-Za-z0-9])t3(?=_)/g, "rw"],
  [/(?<![A-Za-z0-9])t3(?=-)/g, "rosewood"],
  [/(?<![A-Za-z0-9])T3(?=-[A-Za-z])/g, "Rosewood"],
  [/(?<![A-Za-z0-9])T3(?=[A-Z][a-z])/g, "Rosewood"],
  [/(?<=[a-z])T3(?=[A-Z][a-z]|[^A-Za-z0-9]|$)/gm, "Rosewood"],
  [/(?<![A-Za-z0-9])t3(?=[A-Z][a-z])/g, "rosewood"],
  [/(?<![A-Za-z0-9])t3(?=[a-z]{3,})/g, "rosewood"],
];

// Sibling tokens like t1/t2/t4 mean t3 is an ordinal, not the brand.
const ORDINAL_LOWER = /\bt[124]\b/;
const ORDINAL_UPPER = /\bT[124]\b/;
const BARE_UPPER = /(?<![A-Za-z0-9])T3(?![A-Za-z0-9])/g;
const BARE_LOWER = /(?<![A-Za-z0-9@])t3(?![A-Za-z0-9])/g;

const OLD_MARK_PATH = /M33\.4509 93V47\.56[^"'`]*/g;
const OLD_MARK_VIEWBOX = "15.5309 37 94.3941 56.96";
const NEW_MARK_VIEWBOX = "38.318 37 48.823 56.96";
const NEW_MARK_PATH =
  "M38.318 37H66.798C77.987 37 85.107 44.12 85.107 55.309C85.107 63.446 80.53 69.549 73.41 72.092L87.141 93.96H71.884L59.678 73.617H51.541V93.96H38.318V37ZM51.541 48.189V62.428H65.781C69.849 62.428 71.884 59.377 71.884 55.309C71.884 51.24 69.849 48.189 65.781 48.189H51.541Z";

const PATCHES = [
  {
    file: "apps/server/src/telemetry/AnalyticsService.ts",
    find: /Config\.withDefault\("phc_[A-Za-z0-9]+"\)/g,
    replace: 'Config.withDefault("")',
    expect: 1,
  },
  {
    file: "apps/server/src/telemetry/AnalyticsService.ts",
    find: /(Config\.Boolean\("ROSEWOOD_TELEMETRY_ENABLED"\)\.pipe\(\s*Config\.withDefault\()true\)/g,
    replace: "$1false)",
    expect: 2,
  },
  // The header is a logo beside a "Code" label, which the name rules can't see. A miss would show "Code" next to the mark again.
  ...[
    [
      "apps/web/src/components/sidebar/SidebarChrome.tsx",
      /(>\s*)Code(\s*<\/span>)/g,
      "$1Rosewood$2",
    ],
    [
      "apps/web/src/components/onboarding/WelcomeWizard.tsx",
      /(>\s*)Code(\s*<\/span>)/g,
      "$1Rosewood$2",
    ],
    ["apps/web/src/components/ui/standalone-page.tsx", /(>\s*)Code(\s*<\/span>)/g, "$1Rosewood$2"],
    [
      "apps/mobile/src/components/CompactBrandTitle.tsx",
      /(>\s*)Code(\s*<\/Text>)/g,
      "$1Rosewood$2",
    ],
  ].map(([file, find, replace]) => ({ file, find, replace, optional: true })),
  // Fixtures below depend on the old name's shape, so they get a Rosewood equivalent. A miss only fails that test.
  ...[
    // Two bytes longer than "t3code", so the boundary path shrinks to stay under the socket limit.
    ["packages/shared/src/desktopAppControl.test.ts", /"x"\.repeat\(56\)/g, '"x".repeat(54)'],
    ["packages/shared/src/paletteSearch.test.ts", /"rosewoodcoed"/g, '"rosewodo"'],
    ["packages/shared/src/paletteSearch.test.ts", /"t3co"/g, '"rosewoodvs"'],
    // The monogram color is a hash of the name.
    [
      "apps/mobile/src/lib/projectIcon.test.ts",
      /\["rosewood", "Rosewood", "teal"\]/g,
      '["rosewood", "RD", "indigo"]',
    ],
    // No space in the path means no quoting in the desktop entry.
    [
      "apps/desktop/src/app/DesktopLinuxUrlHandler.test.ts",
      /Exec="\/opt\/Rosewood\/rosewood"/g,
      "Exec=/opt/Rosewood/rosewood",
    ],
    [
      "apps/desktop/src/app/DesktopPreReadyPlatform.test.ts",
      /Exec="\/opt\/Rosewood\/rosewood"/g,
      "Exec=/opt/Rosewood/rosewood",
    ],
    [
      "packages/source-control-github/src/server/GitHubAppSignIn.test.ts",
      /login: "pingdotgg"/g,
      `login: "${OWNER}"`,
    ],
    // Pins upstream's exact prompt size, which the longer name shifts on every prompt edit.
    [
      "apps/server/src/provider/AgentContextBudget.test.ts",
      /it\.effect\("agent context matches/g,
      'it.effect.skip("agent context matches',
    ],
    [
      "scripts/notify-discord-release.test.ts",
      /\.github\/workflows\/release\.yml/g,
      ".github/upstream-workflows/release.yml",
    ],
  ].map(([file, find, replace]) => ({ file, find, replace, optional: true })),
];

const LEGACY_BRANCH = /t3code(?=\(\?:\[-\/\]\$\{TEMP_WORKTREE_HEX|[-/]deadbeef|\/f4ae4e0e)/g;
const LEAK_CHECK = /t3code|t3-code|T3CODE|@t3tools|com\.t3tools|T3 Code/;

// Prebuilt WebAssembly imports its host functions by name, and a binary can't be renamed, so the JS side keeps those names.
let binarySymbols = null;

function collectBinarySymbols(root, entries) {
  const symbols = new Set();
  for (const entry of entries) {
    if (entry.isDirectory || entry.isSymlink || !entry.path.endsWith(".wasm")) continue;
    if (entry.path.startsWith(".repos/")) continue;
    const binary = NodeFS.readFileSync(NodePath.join(root, entry.path)).toString("latin1");
    for (const [symbol] of binary.matchAll(/(?<![A-Za-z0-9_])t3_[a-z0-9_]+/g)) symbols.add(symbol);
  }
  return symbols.size === 0 ? null : new RegExp([...symbols].sort().join("|"), "g");
}

function rewriteText(input, { keepThreadLinks = false } = {}) {
  const held = [];
  const hold = (match) => {
    held.push(match);
    return `\u0001${held.length - 1}\u0002`;
  };

  let text = input;
  for (const [find, replace] of RULES.slice(0, 2)) text = text.replace(find, replace);
  if (keepThreadLinks) text = text.replace(UPSTREAM_THREAD_LINK, hold);
  if (binarySymbols !== null) text = text.replace(binarySymbols, hold);
  for (const mask of MASKS) text = text.replace(mask, hold);
  // Slash-separated runs of short segments are module paths, not base64.
  text = text.replace(ENCODED, (match) => {
    const digits = match.replace(/[^0-9]/g, "").length;
    const isEncoded =
      digits >= MIN_ENCODED_DIGITS && match.length / match.split("/").length >= MIN_ENCODED_SEGMENT;
    return isEncoded ? hold(match) : match;
  });
  for (const [find, replace] of RULES.slice(2)) text = text.replace(find, replace);

  text = text
    .split("\n")
    .map((line) => {
      let next = line;
      if (!ORDINAL_UPPER.test(line)) next = next.replace(BARE_UPPER, "Rosewood");
      if (!ORDINAL_LOWER.test(line)) {
        next = next.replace(BARE_LOWER, "rosewood");
      }
      return next;
    })
    .join("\n");

  return text.replace(/\u0001(\d+)\u0002/g, (_, index) => held[Number(index)]);
}

function walk(root, relative = "", entries = []) {
  const names = NodeFS.readdirSync(NodePath.join(root, relative)).sort();
  for (const name of names) {
    if (relative === "" && name === ".git") continue;
    const child = relative === "" ? name : `${relative}/${name}`;
    const stat = NodeFS.lstatSync(NodePath.join(root, child));
    entries.push({
      path: child,
      isDirectory: stat.isDirectory(),
      isSymlink: stat.isSymbolicLink(),
    });
    if (stat.isDirectory()) walk(root, child, entries);
  }
  return entries;
}

function isBinary(buffer) {
  return buffer.subarray(0, 8192).includes(0);
}

function rewriteContents(root, entries) {
  for (const entry of entries) {
    if (entry.isDirectory) continue;
    if (SKIP_CONTENT.some((pattern) => pattern.test(entry.path))) continue;
    const absolute = NodePath.join(root, entry.path);
    if (entry.isSymlink) {
      const target = NodeFS.readlinkSync(absolute);
      const next = rewriteText(target);
      if (next !== target) {
        NodeFS.unlinkSync(absolute);
        NodeFS.symlinkSync(next, absolute);
      }
      continue;
    }
    const buffer = NodeFS.readFileSync(absolute);
    if (isBinary(buffer)) continue;
    const text = buffer.toString("utf8");
    let scoped = text;
    for (const [pathPattern, find, replace] of PATH_RULES) {
      if (pathPattern.test(entry.path)) scoped = scoped.replace(find, replace);
    }
    const next = rewriteText(scoped, { keepThreadLinks: entry.path.endsWith(".md") });
    if (next !== text) NodeFS.writeFileSync(absolute, next);
  }
}

function renamePaths(root, entries) {
  const deepestFirst = [...entries].sort(
    (a, b) => b.path.split("/").length - a.path.split("/").length,
  );
  for (const entry of deepestFirst) {
    if (SKIP_PATH.some((pattern) => pattern.test(entry.path))) continue;
    const parent = NodePath.posix.dirname(entry.path);
    const name = NodePath.posix.basename(entry.path);
    const nextName = rewriteText(name);
    if (nextName === name) continue;
    NodeFS.renameSync(NodePath.join(root, parent, name), NodePath.join(root, parent, nextName));
  }
}

function applyPatches(root) {
  for (const { file, find, replace, expect, optional = false } of PATCHES) {
    const absolute = NodePath.join(root, file);
    const text = NodeFS.readFileSync(absolute, "utf8");
    const count = [...text.matchAll(find)].length;
    if (count !== expect && !optional) {
      throw new Error(`patch for ${file} matched ${count}, expected ${expect}: ${find}`);
    }
    NodeFS.writeFileSync(absolute, text.replace(find, replace));
  }
}

function sortLockfileSection(lines, header) {
  // The lockfile is multi-document; the workspace's own document comes last.
  const start = lines.lastIndexOf(header);
  if (start === -1) throw new Error(`lockfile section missing: ${header}`);
  let end = start + 1;
  while (end < lines.length && !/^\S/.test(lines[end])) end += 1;

  const blocks = [];
  for (const line of lines.slice(start + 1, end)) {
    // Keys over 1024 characters use YAML's explicit form: `? key` then `: value`.
    if (/^ {2}[^\s:]/.test(line)) blocks.push([line]);
    else if (blocks.length > 0 && line !== "") blocks.at(-1).push(line);
  }
  const keyOf = ([first]) =>
    first
      .trim()
      .replace(/^\? /, "")
      .replace(/^'/, "")
      .replace(/'?:.*$/, "");
  blocks.sort((a, b) => (keyOf(a) < keyOf(b) ? -1 : keyOf(a) > keyOf(b) ? 1 : 0));
  const body = blocks.flatMap((block) => ["", ...block]);
  lines.splice(start + 1, end - start - 1, ...body, "");
}

// Renamed keys and the edited .pnpmfile.cjs would otherwise dirty the lockfile on every install.
function normalizeLockfile(root) {
  const lockfile = NodePath.join(root, "pnpm-lock.yaml");
  const pnpmfile = NodeFS.readFileSync(NodePath.join(root, ".pnpmfile.cjs"));
  const checksum = NodeCrypto.createHash("sha256").update(pnpmfile).digest("base64");
  const text = NodeFS.readFileSync(lockfile, "utf8").replace(
    /^pnpmfileChecksum: .*$/m,
    `pnpmfileChecksum: sha256-${checksum}`,
  );
  const lines = text.split("\n");
  sortLockfileSection(lines, "packages:");
  sortLockfileSection(lines, "snapshots:");
  NodeFS.writeFileSync(lockfile, lines.join("\n"));
}

// Drawn in the old mark's coordinate space, so every viewBox and icon layout that embeds it keeps working unchanged.
function replaceBrandMark(root) {
  for (const entry of walk(root)) {
    if (entry.isDirectory || entry.isSymlink) continue;
    if (SKIP_CONTENT.some((pattern) => pattern.test(entry.path))) continue;
    const absolute = NodePath.join(root, entry.path);
    const buffer = NodeFS.readFileSync(absolute);
    if (isBinary(buffer)) continue;
    const text = buffer.toString("utf8");
    const next = text
      .replace(OLD_MARK_PATH, NEW_MARK_PATH)
      .replaceAll(OLD_MARK_VIEWBOX, NEW_MARK_VIEWBOX);
    if (next !== text) NodeFS.writeFileSync(absolute, next);
  }
}

function checkForLeaks(root) {
  const leaks = [];
  for (const entry of walk(root)) {
    if (entry.isDirectory || entry.isSymlink) continue;
    if (SKIP_CONTENT.some((pattern) => pattern.test(entry.path))) continue;
    const buffer = NodeFS.readFileSync(NodePath.join(root, entry.path));
    if (isBinary(buffer)) continue;
    const lines = buffer.toString("utf8").split("\n");
    lines.forEach((line, index) => {
      const stripped = line
        .replace(UPSTREAM_THREAD_LINK, "")
        .replace(/Copyright.*$/, "")
        .replace(LEGACY_BRANCH, "");
      if (LEAK_CHECK.test(stripped.replace(ENCODED, ""))) {
        leaks.push(`${entry.path}:${index + 1}: ${line.trim().slice(0, 120)}`);
      }
    });
  }
  if (leaks.length > 0) {
    throw new Error(`${leaks.length} old-name leaks:\n${leaks.slice(0, 40).join("\n")}`);
  }
}

// Workflows outside .github/workflows never run, and the Action's token can push edits to them.
function disableUpstreamWorkflows(root) {
  NodeFS.renameSync(
    NodePath.join(root, ".github/workflows"),
    NodePath.join(root, ".github/upstream-workflows"),
  );
  const knipPath = NodePath.join(root, "knip.jsonc");
  const knip = NodeFS.readFileSync(knipPath, "utf8");
  const next = knip.replace(
    /^( {4}"\.": \{)$/m,
    '$1\n      "github-actions": { "config": [".github/upstream-workflows/*.yml"] },',
  );
  if (next === knip) throw new Error("knip.jsonc root workspace not found");
  NodeFS.writeFileSync(knipPath, next);
}

function main() {
  const [root] = process.argv.slice(2);
  if (!root) throw new Error("usage: rebrand.mjs <upstream-tree-dir>");

  disableUpstreamWorkflows(root);

  const entries = walk(root);
  binarySymbols = collectBinarySymbols(root, entries);
  rewriteContents(root, entries);
  renamePaths(root, entries);
  applyPatches(root);
  replaceBrandMark(root);
  normalizeLockfile(root);
  checkForLeaks(root);
  NodeFS.cpSync(OVERLAY_DIR, root, { recursive: true });
}

main();
