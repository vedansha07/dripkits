# Daily log

Newest first.

---

## 2026-09-20

- Set up `context/`: `README.md` (index), `daily.md` (this), `howwework.md` (the agreement).
- Captured the working agreement — Batman, the `context/` convention, the plan format, the git rules
  (he pushes, I only fetch/pull), "just tell dont do", the tone rules. Detail: `howwework.md`.
- **Amendment 1:** decisions no longer live inside the plan md. Each topic gets a second file,
  `decisions-<topic>-plan.md` — my own calls only, dated, newest first, with a `Status` column he
  edits to overrule.
- **Amendment 2, his call:** `context/` **is committed** on dripkits, because we may not always be
  on this machine. Default for other repos is unchanged. Detail: `howwework.md` → *Project override*.
  Follow-ons: no `.git/info/exclude`; every commit block I hand him now includes `context/`; two
  machines editing plans between pushes can conflict, so pull first.
- **Moved off OneDrive (his call: option A).** Before: OneDrive running, sync root
  `C:\Users\Aryan Mahobe\OneDrive`, Desktop redirected via Known Folder Move, project folder
  carried a Files On-Demand reparse point — so his "no onedrive sync for this folder" did not hold.
  After: `C:\Users\Aryan Mahobe\dev\dripkits` shows attributes `Directory` only, no reparse point.
  Verified both ends. All three context files moved byte-intact (md5 compared).
  `mv` on the folder itself failed — "Device or resource busy", the harness pins the shell cwd there
  — so the contents were moved instead. `...\OneDrive\Desktop\free` is now **empty** and is his to
  delete after reopening the workspace.
- Copied my project memory from the old path key to `c--Users-Aryan-Mahobe-dev-dripkits`; the move
  would otherwise have orphaned it.
- **Repo:** `https://github.com/vedansha07/dripkits.git` exists and is **empty** (zero refs via
  `git ls-remote`). No `git init` run — his side of the line. Block handed over.
- **Open:** commit identity is `Vedansha Srivastava <vedansha.srivastava@assesshub.com>`, a work
  address that will be stamped on every dripkits commit. Flagged, undecided. → **resolved later the
  same day, below.**
- No project work started, and **no `dripkits-plan.md` opened** — still do not know what dripkits is.
  Opening the pair on a name alone would be padding.
- **Repo initialised and first commit pushed — he ran it.** `80aa566` on `main`, `main...origin/main`
  in sync, `context/` included as the override requires.
- **Commit identity — decided, his call.** Cause verified: **no local `user.*` in this repo**, so it
  fell through to global and stamped `Vedansha Srivastava <vedansha.srivastava@assesshub.com>`.
  Two calls: identity gets set **local to this repo only**, global left alone; and `80aa566` gets
  **rewritten** (amend + force-push) so the work address leaves the repo entirely. Safe here — one
  commit, no collaborators, nothing behind it. **Address itself still pending** — he chose "a
  different address" without naming it.
- `OneDrive\Desktop\free` re-checked: still present, still empty. His to delete.

**Next:** he gives me the exact name + email → I hand the local-identity + amend + force-push block;
he deletes the empty `free` folder; then tells me what dripkits is → open `dripkits-plan.md` +
`decisions-dripkits-plan.md`.
