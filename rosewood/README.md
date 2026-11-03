# Fork maintenance

Rosewood tracks `pingdotgg/t3code` without carrying the rename as a hand-maintained diff. Upstream lands too many commits a day for that to merge cleanly.

```
upstream/main ──(rebrand.mjs)──> rosewood/upstream ──(merge)──> main ──> your branches
```

- `rosewood/upstream` is generated. Each commit is upstream's tree after `rebrand.mjs`, with an `Upstream-Commit` trailer. Never commit to it by hand.
- `main` is yours. Work there or on branches off it. Merges only conflict where you and upstream edited the same lines.
- `rosewood-sync.yml` runs daily and pushes the merge to `main`. On a conflict it leaves `main` alone and fails the run, so GitHub emails you. The run summary lists the files.

## Commands

```bash
rosewood/sync.sh --merge
```

Syncs the current branch now. Needs `vp i` to have run. Resolve any conflicts as usual; `rerere` remembers them if enabled.

```bash
rosewood/test-sync.sh 200
```

Rehearses a merge of the last 200 upstream commits in a throwaway clone. Run it after changing the rules.

## Changing names

Edit the rules in `rebrand.mjs`, then run `rosewood/sync.sh --merge`. The script hash is part of the trailer, so a rule change rebuilds even when upstream has not moved. Files in `overlay/` replace upstream's copies outright, which is how `README.md` avoids conflicts.

## Icons

`rosewood/generate-icons.sh` draws the placeholder desktop and web icons into `overlay/`. Edit its colors or mark, rerun it, then sync. The mark used in the UI is `NEW_MARK_PATH` in `rebrand.mjs`. Mobile launcher PNGs in `apps/mobile/assets` still show the old mark.

## Names that stay

Some `t3` spellings are deliberate:

- `T3 Tools Inc.` in license and copyright text, which the MIT license requires.
- `T3 Chat` and `t3.chat`, their separate product.
- `t3.codes` and `t3.tools` hosts, which Rosewood has no replacement for.
- `t3_write_pty`, a name compiled into the prebuilt terminal WASM. `rebrand.mjs` reads these out of `.wasm` files automatically.
- `-t3.N` in `apps/mobile/deps`, the version of upstream's patched tarballs.

MCP tools are `rw_*` rather than `rosewood_*`, because parsers strip a `rosewood_` server prefix and would mangle them.

## Do not

- Click **Sync fork** on GitHub. It merges upstream's raw tree into `main`, and **Discard commits** would delete the fork.
- Run `git merge upstream/main`. Same problem.

## Failure modes

| Failure                               | What happens                                                                                                       |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Upstream adds a new name shape        | The leak check in `rebrand.mjs` fails the sync; `main` is untouched                                                |
| Upstream moves the telemetry defaults | The patch match count fails the sync; `main` is untouched                                                          |
| You and upstream edit the same line   | The workflow fails and its summary lists the files                                                                 |
| Upstream edits a workflow             | The rebrand moves them to `.github/upstream-workflows/`, where they never run and the Action's token can push them |
| A clean merge still breaks the build  | Not caught automatically, so run `vp run typecheck` before rebuilding your install                                 |
