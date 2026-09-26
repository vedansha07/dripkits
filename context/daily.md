# Daily log

Newest first.

---

## 2026-09-26

- **Six-day gap.** The 2026-09-20 session ended mid-tool-call. Resumed today on his question "are we
  all updated on github".
- **Answer: no.** Verified read-only — `git fetch` then `rev-list --left-right`: local `main` and
  `origin/main` both at `c7416f9`, **behind=0 ahead=0**, nothing to pull. But the commit block
  queued on 2026-09-20 was **never run**, so four things are local-only: `.gitattributes`
  (untracked) and modifications to all three `context/` files. Re-handed the block.
- Identity re-verified intact: `--local` is `vedansha07 <vedanshasrivastava29@gmail.com>`, global
  still `vedansha.srivastava@assesshub.com`, and `c7416f9` is authored with the personal address.
  `core.autocrlf` on this machine is `true`, matching what `.gitattributes` assumes.
- **Memory relocation confirmed.** The `cp` of the memory directory to the new project key was the
  call the session died on — outcome was unknown. Verified today: it landed. Memory now loads from
  `c--Users-Aryan-Mahobe-dev-dripkits`, so the move out of OneDrive cost nothing.
- `OneDrive\Desktop\free` re-checked: still present, 0 entries. His to delete.
- Still do not know what dripkits is. No `dripkits-plan.md`.
- **Skills sorted out.** He had installed two and asked me to fix the layout. Found one of them dead:
  `web-design-guidelines` was in `.claude/skills/` and live, but `design-taste-frontend` (1206 lines)
  sat in `.agents/skills/`, which Claude Code does not scan — it had never been available to me.
  Moved it into `.claude/skills/`, removed the emptied `.agents/`. Both verified. Detail:
  `skills-plan.md`.
- **Third skill installed — but not the way he wrote it.** His clone command had a bare
  `https://github.com` with no owner/repo, so it could not run; he then named the repo
  `awesome-design-md`. Found and verified the owner read-only before touching disk:
  `VoltAgent/awesome-design-md`, `main`, HEAD `f696123`, 118k stars, MIT. Then found the real
  problem — **the repo has no `SKILL.md` anywhere in its tree**, so cloning it into
  `.claude/skills/` would have installed 2.4 MB that Claude Code scans and skips. Wrote the missing
  `SKILL.md` router myself; 74/74 brand index verified against disk. Detail: `skills-plan.md`.
- Skills are **project-local** as he asked: `.claude/skills/` in this repo, not `~/.claude/skills/`.
  All three verified registered — the two new ones loaded mid-session with no reload.
- Nothing skills-related is committed yet — `.claude/`, `.gitignore` and `skills-lock.json` are all
  untracked.
- **Fourth skill: Playwright CLI.** His pasted commands were wrong twice over — `-g` installs to
  `~/.claude/skills` and would have broken the project-local rule he set one message earlier, and
  `playwright-cli install --skills Claude Code layout` is not valid syntax (`--skills` takes `claude`
  or `agents`). The bare `playwright-cli` npm package is also **deprecated** in favour of
  `@playwright/cli`. Checked the docs and the registry, installed `@playwright/cli@0.1.21` globally
  as a tool, then ran `playwright-cli install --skills` with **no `-g`** from the repo root.
  Result: `.claude/skills/playwright-cli/`, 92 KB, SKILL.md + 10 reference files. It found system
  Chrome, so no browser download.
- **Bug in that installer, fixed.** It writes `.playwright-cli/` to `.gitignore` but creates
  `.playwright/` — the pattern misses the directory it made. Harmless only while empty; the
  installer's own comment says the contents "may contain credentials" and Playwright storage-state
  files hold session cookies. Rewrote `.gitignore` to cover `.playwright/`, and added
  `.claude/settings.local.json` while there. Verified both patterns with throwaway probe files
  rather than trusting them by eye.
- Four skills now, all project-local, all registered: `awesome-design`, `design-taste-frontend`,
  `playwright-cli`, `web-design-guidelines`. `skills-lock.json` is **stale** — it knows about two.

**Next:** he runs the commit block, and decides whether 2.4 MB of vendored brand markdown belongs in
dripkits' history or gets gitignored and re-cloned per machine. He deletes the empty `free` folder.
Then tells me what dripkits is → open `dripkits-plan.md` + `decisions-dripkits-plan.md`.

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
  commit, no collaborators, nothing behind it.
- **Identity settled and applied — he ran the block.** `vedansha07 <vedanshasrivastava29@gmail.com>`,
  set `--local` only. Verified after: author **and** committer both rewritten, `80aa566` → **`c7416f9`**,
  `main...origin/main` back in sync, working tree clean, all three context files in the tree, and
  global still `vedansha.srivastava@assesshub.com` — untouched. The work address is gone from the repo.
- **Which config layer — his call: option A.** Global stays the work address, dripkits carries the
  `--local` override. His reason: dripkits is his only personal repo. I argued for `includeIf`
  (option C, identity picked by directory) and he declined — the known cost is that the *next*
  personal repo he starts will default to assesshub.com until he sets `--local` there too.
- Pre-flight both cleared by him before running: "Keep my email addresses private" is **off** (so no
  `GH007` rejection) and the gmail is **verified** on the `vedansha07` account (so the commit links
  with avatar and contribution credit).
- `OneDrive\Desktop\free` re-checked: still present, still empty. His to delete.

- **Added `.gitattributes` at the repo root** (`* text=auto`), his call. Reason: `context/` is
  committed so it travels between machines, and without pinning the stored form a machine with a
  different `core.autocrlf` would show every context file as wholly rewritten and conflict on every
  pull. Verified harmless here — index and worktree were already LF (`i/lf w/lf`), so the attribute
  matches what is committed and no renormalize was needed. `core.autocrlf` on this machine is `true`.

**Next:** `.gitattributes` and this turn's `context/` edits are uncommitted — he runs the commit
block. He deletes the empty `free` folder. Then he tells me what dripkits is → open
`dripkits-plan.md` + `decisions-dripkits-plan.md`.
