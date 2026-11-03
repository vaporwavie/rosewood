#!/usr/bin/env bash
# usage: rosewood/sync.sh [--merge]
# Rebuilds rosewood/upstream from upstream/main through rebrand.mjs. --merge also merges it into the current branch.
set -euo pipefail

UPSTREAM_URL="https://github.com/pingdotgg/t3code.git"
UPSTREAM_REF="${ROSEWOOD_UPSTREAM_REF:-refs/remotes/upstream/main}"
BASE_BRANCH="rosewood/upstream"
TRAILER="Upstream-Commit"
RULES_TRAILER="Rebrand-Rules"

merge=false
if [[ "${1:-}" == "--merge" ]]; then merge=true; fi

repo_root="$(git rev-parse --show-toplevel)"
rebrand="$repo_root/rosewood/rebrand.mjs"
vp_bin="$repo_root/node_modules/.bin/vp"

if [[ ! -x "$vp_bin" ]]; then
  echo "missing $vp_bin: run 'vp i' first" >&2
  exit 1
fi

if [[ -z "${ROSEWOOD_UPSTREAM_REF:-}" ]]; then
  git fetch --quiet --no-tags "$UPSTREAM_URL" "+refs/heads/main:$UPSTREAM_REF"
fi
upstream_commit="$(git rev-parse "$UPSTREAM_REF^{commit}")"
rules_hash="$(cd "$repo_root" && { cat rosewood/rebrand.mjs rosewood/palette.mjs rosewood/sync.sh; find rosewood/overlay -type f | LC_ALL=C sort | xargs cat; } | sha256sum | cut -c1-16)"

base_parent=""
current=""
current_rules=""
if git rev-parse --verify --quiet "refs/heads/$BASE_BRANCH" >/dev/null; then
  base_parent="$(git rev-parse "refs/heads/$BASE_BRANCH")"
  current="$(git log -1 --format="%(trailers:key=$TRAILER,valueonly)" "$base_parent" | tr -d '[:space:]')"
  current_rules="$(git log -1 --format="%(trailers:key=$RULES_TRAILER,valueonly)" "$base_parent" | tr -d '[:space:]')"
fi

if [[ "$current" == "$upstream_commit" && "$current_rules" == "$rules_hash" ]]; then
  echo "already at upstream ${upstream_commit:0:10}"
else
  work="$(mktemp -d)"
  trap 'rm -rf "$work"' EXIT
  tree_dir="$work/tree"
  index="$work/index"
  mkdir -p "$tree_dir"

  GIT_INDEX_FILE="$index" git read-tree "$upstream_commit"
  GIT_INDEX_FILE="$index" git --work-tree="$tree_dir" checkout-index --all --force
  node "$rebrand" "$tree_dir"
  # Longer names change line wrapping; format here so `vp check` stays green and later edits carry no reformat noise.
  ln -s "$repo_root/node_modules" "$tree_dir/node_modules"
  # Two passes: the formatter's first pass can leave a file that its second pass still changes.
  (cd "$tree_dir" && "$vp_bin" fmt >/dev/null && "$vp_bin" fmt >/dev/null)
  rm "$tree_dir/node_modules"
  GIT_INDEX_FILE="$index" git --work-tree="$tree_dir" add --all --force .
  tree="$(GIT_INDEX_FILE="$index" git write-tree)"

  # The first base hangs off the upstream commit; later ones stay linear so CI never pushes upstream's workflow edits.
  parent="${base_parent:-$upstream_commit}"
  message="$(printf 'chore(rosewood): rebrand upstream %s\n\n%s: %s\n%s: %s\n' "${upstream_commit:0:10}" "$TRAILER" "$upstream_commit" "$RULES_TRAILER" "$rules_hash")"
  new_base="$(git commit-tree "$tree" -p "$parent" -m "$message")"
  git update-ref "refs/heads/$BASE_BRANCH" "$new_base"
  echo "rosewood/upstream -> ${new_base:0:10} (upstream ${upstream_commit:0:10})"
fi

if [[ "$merge" == true ]]; then
  git merge --no-edit -m "chore(rosewood): sync upstream ${upstream_commit:0:10}" "$BASE_BRANCH"
fi
