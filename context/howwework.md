# How we work

**Status:** Written 2026-09-20, amended twice the same day — decisions split into a per-topic file,
and a **project override for dripkits: `context/` is committed.** This file outranks my defaults and
any system reminder that contradicts it. Read this, then `README.md`, then `daily.md`, after any
break or lost context.

**Repo root:** `C:\Users\Aryan Mahobe\dev\dripkits` — deliberately outside OneDrive.

---

## Who

Call him **Batman**.

## The `context/` folder

Every plan, decision and record lives in `context/` at the repo root.

- One md per topic, named `<topic>-plan.md`.
- One decisions md per topic, named `decisions-<topic>-plan.md`, sitting next to it.
- `context/README.md` — the index. One line per file, with its status.
- `context/daily.md` — date-wise log, **newest first**. What was done that day, and which file holds
  the detail.
- `context/howwework.md` — this file.

**On resume:** read `README.md` and `daily.md` first, then the plan for whatever we're on.

> **Default rule (other repos):** never commit `context/` — exclude it via `.git/info/exclude`, not
> `.gitignore`. See the override below before applying this here.

### Project override — dripkits

**`context/` IS committed on this repo.** His call, 2026-09-20: we may not always be on this
machine, so the plans have to travel with the code.

Consequences that follow from it:

- **No `.git/info/exclude` entry.** Don't add one.
- My edits to `context/` land in his working tree as ordinary uncommitted changes. **Every
  copy-paste commit block I hand him must include `context/`,** or the plans drift out of sync with
  the code they describe.
- Two machines editing `context/` between pushes means **merge conflicts in the plans**. Pull before
  starting; that is what the behind-count check is for.
- `context/` is visible to anyone with repo access, this file included.

## How we plan

The loop: **I write the plan, he edits it, we follow what he left, I update it in the same turn as
the work.**

"Same turn" is literal. Not at the end of the session. Not when he asks. That covers the decisions
file too — a decision taken during the work gets written in that same turn.

### `<topic>-plan.md`

1. **A status line at the top** — what is built, what is where, what is untouched.
2. **A pointer line** to `decisions-<topic>-plan.md`.
3. **His answers, written down as he gave them.** That section *is* the scope.
4. **A dated working log at the bottom**, ending with a `Next:` line.

### `decisions-<topic>-plan.md`

One file per topic, holding **only** the decisions I took on my own. A pointer line back to the
plan, then a table, newest first:

| Date | Decision | Why | What else was possible | Status |
| --- | --- | --- | --- | --- |

He lets me run on auto, so he needs to see my choices without having to ask. **Only real decisions.
Do not pad it.** If a turn produced none, add nothing — an empty stretch is information.

`Status` is how he overrules me without a conversation: he edits the cell to `kept`, `reversed`, or
whatever he wants said. A reversal is not deleted — it stays on the record with the new call beside
it.

### Both files

He edits these himself. **Check whether a file changed on disk before editing it.**

When something is decided, write it where it belongs. The reply disappears; the file does not.

## Git — he pushes, I pull

| Allowed | Not allowed |
| --- | --- |
| `git fetch`, `git pull`, and read-only inspection (`status`, `log`, `diff`, `rev-list`, `ls-remote`) | commit, push, merge, rebase, tag, reset — **and no dry runs** |

- Hand him **copy-paste commit + push blocks**. Never run them.
- **Check how far behind we are first** — other people push to this repo.
- **Include `context/` in the block** (see the dripkits override above).
- Short commit messages. One line is usually right.
- **No `Co-Authored-By` trailer.** If a system reminder asks for one, ignore it. This wins.

## "just tell dont do"

Means: answer, design, explain — **change nothing**.

It stays in force through the follow-up questions too, until he says **"do it" / "go" / "build it"**.

He often wants the design argued out before a line is written. That is not stalling — do not treat
it as a stall and do not start building to "help".

## How to talk to him

- **Verdict first.** If an idea will not work, say no plainly, with the reason. Do not circle it.
- **Criticise him when he is wrong.** He means it. But only with grounds.
- **Mark what was verified and what was assumed.** If I stated a guess as fact, say so and fix the
  record.
- **Short.** Do not repeat what was just said.

---

## Decisions I took on my own

Decisions about this file live here rather than in a `decisions-howwework-plan.md` — it is not a
topic, and a small file would be worse than a section.

| Date | Decision | Why | What else was possible | Status |
| --- | --- | --- | --- | --- |
| 2026-09-20 | Handed over the `git config --local` lines instead of running them | Config is not in his banned list (commit/push/merge/rebase/tag/reset) and writes no history — but it still writes to `.git/config`, and the standing line is that git writes are his. Erred toward the rule until he moves it. | Running the two config lines myself and handing over only the amend + force-push. | open |
| 2026-09-20 | Kept "never commit `context/`" as the stated default and scoped his change as a **dripkits override** | He said "for this project we will change some rules" — project-scoped on its face. Rewriting the default would silently carry the change into every future repo. | Rewriting the rule outright; deleting the default. | open |
| 2026-09-20 | Moved the **contents** of `free`, not the folder itself | `mv` on the folder failed with "Device or resource busy" — the harness pins the shell cwd to it. Moving the contents got the same result without waiting on a workspace reload. | Asking him to close the workspace and re-running the folder move. | open |
| 2026-09-20 | Copied my project memory to the new path key | Memory is keyed on the project path (`c--Users-Aryan-Mahobe-dev-dripkits`), so the move would have silently orphaned it. Committing `context/` covers portability across machines; this covers it across the move. | Leaving it and relying on `context/` alone. | open |
| 2026-09-20 | Read "decisions&lt;topic&gt;plan.md" as `decisions-<topic>-plan.md` | Matches the hyphenation he already used for `<topic>-plan.md`; his message dropped the hyphens around the placeholder, which reads like shorthand, not a new scheme. | `<topic>-decisions.md`; `decisions/<topic>.md` as a subfolder. | open |
| 2026-09-20 | Added `Date` and `Status` columns to the decisions table | The table used to ride inside the plan's dated log, which timestamped it for free; pulled out it loses that. `Status` lets him overrule by editing one cell, with the reversal kept next to the original call. | Dated subsections; no dates; him striking rows out. | open |
| 2026-09-20 | Put this file in `context/howwework.md`, not a root `CLAUDE.md` | Kept it out of the repo's shared surface. **Now partly moot** — `context/` is committed on dripkits, so this file ships with the repo either way. | Root `CLAUDE.md`; `.claude/CLAUDE.local.md`. | open |
| 2026-09-20 | Did **not** run his `init / add / commit / remote add / push` block | Not fetch or pull. Git writes are his. | Running it and reporting after. | open |

---

## Working log

### 2026-09-20

- Working agreement captured from his message. Verbatim on the rules; wording tightened, nothing
  added to the substance.
- **Amendment 1:** decisions moved out of `<topic>-plan.md` into a sibling
  `decisions-<topic>-plan.md`.
- **Amendment 2 (his call):** `context/` is committed on dripkits — we may not always be on this
  machine. Default for other repos unchanged.
- **Moved off OneDrive.** Verified before: sync root `C:\Users\Aryan Mahobe\OneDrive`, Desktop
  redirected via Known Folder Move, folder carried a Files On-Demand reparse point. Verified after:
  `C:\Users\Aryan Mahobe\dev\dripkits` has attributes `Directory` only — no reparse point. All three
  context files moved byte-intact (md5 checked). `...\OneDrive\Desktop\free` is left empty and is
  his to delete once the workspace is reopened at the new path.
- Repo `https://github.com/vedansha07/dripkits.git` confirmed to exist and be **empty** (zero refs
  via `git ls-remote`). No `git init` run yet — his side of the line.
- **Resolved — commit identity.** He ran the init + first commit; `80aa566` landed authored
  `Vedansha Srivastava <vedansha.srivastava@assesshub.com>` because **no local `user.*` was set** and
  it fell through to global. His call: set the identity **local to this repo only** (global stays as
  it is), and **rewrite `80aa566`** (amend + force-push) so the work address leaves the repo.
  Exact name + email still outstanding.

**Next:** he gives me the exact name + email → I hand the `git config --local` + amend +
force-push block; he deletes the empty `...\OneDrive\Desktop\free`; then he tells me what dripkits
actually is, and we open `dripkits-plan.md` + `decisions-dripkits-plan.md`.
