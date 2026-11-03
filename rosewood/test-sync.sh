#!/usr/bin/env bash
# E2E rehearsal in a throwaway clone: real upstream history, simulated fork edits, real merges. Exits non-zero on any failed expectation.
set -euo pipefail

STEPS_BACK="${1:-200}"

repo_root="$(git rev-parse --show-toplevel)"
git -C "$repo_root" fetch --quiet --no-tags https://github.com/pingdotgg/t3code.git +refs/heads/main:refs/remotes/upstream/main
new_upstream="$(git -C "$repo_root" rev-parse refs/remotes/upstream/main)"
old_upstream="$(git -C "$repo_root" rev-parse "refs/remotes/upstream/main~$STEPS_BACK")"

work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
clone="$work/clone"
git clone --quiet --shared --no-checkout "$repo_root" "$clone"
cd "$clone"
git config user.name rehearsal
git config user.email rehearsal@example.invalid
git fetch --quiet origin refs/remotes/upstream/main:refs/remotes/upstream/main

pass() { echo "PASS $1"; }
fail() { echo "FAIL $1"; exit 1; }

# Fork starts at the old upstream with only the tooling on top.
ln -s "$repo_root/node_modules" node_modules
git switch --quiet --detach "$old_upstream"
git checkout --quiet -B main
mkdir -p rosewood
cp -R "$repo_root/rosewood/." rosewood/
git add rosewood
git commit --quiet -m "tooling"

ROSEWOOD_UPSTREAM_REF="$old_upstream" rosewood/sync.sh --merge >/dev/null
first_tree="$(git rev-parse rosewood/upstream^{tree})"

# Same input must give the same tree, or every sync would conflict with itself.
saved_base="$(git rev-parse rosewood/upstream)"
git update-ref -d refs/heads/rosewood/upstream
ROSEWOOD_UPSTREAM_REF="$old_upstream" rosewood/sync.sh >/dev/null
[[ "$(git rev-parse rosewood/upstream^{tree})" == "$first_tree" ]] || fail "rebrand is deterministic"
pass "rebrand is deterministic"
git update-ref refs/heads/rosewood/upstream "$saved_base"

# Pick real files: one upstream rewrites between old and new, one it leaves alone.
changed_upstream="$(git diff --name-only --diff-filter=M "$old_upstream" "$new_upstream" -- 'apps/server/src/*.ts' | awk '!/test/ { print; exit }')"
[[ -n "$changed_upstream" ]] || fail "upstream changed a server file in range"
changed_path="$(node -e '
  const [p] = process.argv.slice(1);
  console.log(p.replace(/t3code/g, "rosewood").replace(/T3/g, "Rosewood").replace(/t3/g, "rosewood"));
' "$changed_upstream")"
[[ -f "$changed_path" ]] || fail "expected renamed path $changed_path"
untouched="packages/shared/package.json"

echo "// rosewood-owned-line-a" >> "$changed_path"
node -e '
  const fs = require("fs");
  const [p] = process.argv.slice(1);
  const json = JSON.parse(fs.readFileSync(p, "utf8"));
  json.rosewoodOwnedField = true;
  fs.writeFileSync(p, JSON.stringify(json, null, 2) + "\n");
' "$untouched"
echo "fork-only file" > rosewood/fork-only.txt
git add -A
git commit --quiet -m "fork edits"

# Clean case: fork edits in separate hunks survive and upstream changes arrive rebranded.
ROSEWOOD_UPSTREAM_REF="$new_upstream" rosewood/sync.sh --merge >/dev/null \
  || fail "merge of $STEPS_BACK upstream commits is clean"
pass "merge of $STEPS_BACK upstream commits is clean"

grep -q "rosewood-owned-line-a" "$changed_path" || fail "fork edit in a file upstream changed survives"
pass "fork edit in a file upstream changed survives"
grep -q "rosewoodOwnedField" "$untouched" || fail "fork edit in another file survives"
pass "fork edit in another file survives"
[[ -f rosewood/fork-only.txt ]] || fail "fork-only file survives"
pass "fork-only file survives"
[[ ! -e .github/workflows/ci.yml && -e .github/upstream-workflows/ci.yml ]] || fail "upstream workflows are inert"
pass "upstream workflows are inert"

base_diff="$(git diff --name-only rosewood/upstream HEAD | grep -v '^rosewood/' | sort | tr '\n' ' ')"
expected_diff="$(printf '%s\n%s\n' "$changed_path" "$untouched" | sort | tr '\n' ' ')"
[[ "$base_diff" == "$expected_diff" ]] || fail "only fork edits differ from the rebranded upstream: $base_diff"
pass "only fork edits differ from the rebranded upstream"

grep -q 't3_write_pty' apps/web/src/terminal/ghostty/runtime.ts || fail "prebuilt WASM imports keep their names"
pass "prebuilt WASM imports keep their names"

if git grep -I -q -E '@t3tools|T3CODE_' -- ':!.repos' ':!patches' ':!rosewood'; then
  fail "no old names after merge"
fi
pass "no old names after merge"

# Conflict case: fork and upstream edit the same line, and only that file conflicts.
git checkout --quiet --detach "$old_upstream"
git checkout --quiet -B conflict-main "$(git log --format=%H --grep='^fork edits$' -1 main)"
git update-ref refs/heads/rosewood/upstream "$saved_base"
line_diff="$(git diff -U0 "$old_upstream" "$new_upstream" -- "$changed_upstream" | awk '/^@@/ { sub(/^@@ -/, ""); sub(/[, ].*/, ""); print; exit }')"
sed -i "${line_diff}s/.*/\/\/ rosewood-conflicting-line/" "$changed_path"
git add -A
git commit --quiet -m "conflicting edit"
if ROSEWOOD_UPSTREAM_REF="$new_upstream" rosewood/sync.sh --merge >/dev/null 2>&1; then
  fail "same-line edit conflicts"
fi
conflicts="$(git diff --name-only --diff-filter=U)"
[[ "$conflicts" == "$changed_path" ]] || fail "only the edited file conflicts: $conflicts"
pass "only the edited file conflicts"
git merge --abort

echo "all rehearsal checks passed ($STEPS_BACK upstream commits)"
