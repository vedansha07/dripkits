# skills — plan

**Status:** Four skills installed, all project-local under `.claude/skills/`, all verified registered.
`@playwright/cli` 0.1.21 installed globally as a tool. `.gitignore` now exists and is correct.
Nothing skills-related is committed yet — the open question is whether 2.4 MB of vendored brand
markdown belongs in this repo's history.

Decisions I took on my own: `decisions-skills-plan.md`.

---

## His answers — the scope

Given 2026-09-26, in his words:

- "i have downloaded 2 skills for you and this above is the 3rd one"
- "i want you to look the folder structure for skills and rearrange them properly so that you can use
  the skills properly"
- "also install this 3rd one only for this project (**local to this project only**)"
- Third repo named later, when the pasted URL turned out to be incomplete: "awesome-design-md"
- "install this skill as well" — the Playwright CLI skill

**The project-local rule is standing.** He stated it once for the third skill and I am applying it to
every skill unless he says otherwise. It is why the Playwright install dropped his `-g`.

---

## How skill discovery actually works

Claude Code scans exactly two places:

| Path | Scope |
| --- | --- |
| `<repo>/.claude/skills/<name>/SKILL.md` | this project only |
| `~/.claude/skills/<name>/SKILL.md` | every project |

`.agents/skills/` is the cross-agent convention (the agents.md ecosystem) and Claude Code **does not
read it**. Each skill must be its own folder with `SKILL.md` at that folder's root, frontmatter
carrying `name` and `description`.

Confirmed live: every skill added this session registered mid-session, no reload needed.

## Current state

```
dripkits/
+-- .gitignore                     .playwright-cli/ .playwright/ .claude/settings.local.json
+-- .playwright/                   empty, runtime output dir, gitignored
+-- .claude/skills/
|   +-- awesome-design/            2.4 MB - VoltAgent/awesome-design-md @ f696123 - MIT
|   |   +-- SKILL.md               written by me, upstream has none
|   |   +-- design-md/<74 brands>/DESIGN.md
|   +-- design-taste-frontend/     1206 lines - Leonxlnx/taste-skill
|   +-- playwright-cli/             92 KB - @playwright/cli 0.1.21 - SKILL.md + 10 references
|   +-- web-design-guidelines/       39 lines - vercel-labs/agent-skills
+-- skills-lock.json               installer manifest, covers the first two only - STALE
```

Global, outside the repo: `@playwright/cli@0.1.21` via npm, providing the `playwright-cli` binary.

### Tool scope vs skill scope

These are different things and only one of them is project-local:

- The **tool** (`playwright-cli` binary) is global, like git. It has to be on PATH for the skill to
  invoke it.
- The **skill** (the markdown teaching me to use it) is project-local, per his rule.

### How the four relate

- `web-design-guidelines` — audits existing UI against accessibility/UX rules. Review, not build.
- `design-taste-frontend` — how to design well when there is **no** brand to copy.
- `awesome-design` — how to hit a **specific** known brand's look. Pick the brand system first, then
  let taste rules fill what it does not cover.
- `playwright-cli` — drives a real browser: automation, test generation, tracing, mocking. This is
  the one that lets me *check* the UI the other three produce, rather than assuming it works.

## Open

1. **Commit or not — 2.4 MB.** `.claude/` and `skills-lock.json` are untracked. Committing follows
   the same logic as `context/` (it travels between machines) but puts 74 brands of third-party
   markdown into dripkits' history permanently. Alternative: gitignore
   `.claude/skills/awesome-design/` and re-clone per machine. **His call, not taken.**
2. **`skills-lock.json` is stale** — lists two skills, knows nothing about `awesome-design` or
   `playwright-cli`. Whatever installer wrote it will not manage or update either.
3. **Installer drift.** That installer put one skill in `.agents/skills/` and the other in
   `.claude/skills/`. Re-running it may recreate `.agents/` and undo the move.
4. **Updating `awesome-design`** means re-cloning — `.git` was stripped, so there is no `pull` path.
   Updating `playwright-cli` means re-running `playwright-cli install --skills`.
5. **No browsers installed.** The installer found system Chrome and set it as default. Fine for now;
   if we need Firefox/WebKit or a pinned Chromium, that is a separate ~500 MB download.
6. **`playwright-cli`'s SKILL.md declares `allowed-tools: Bash(playwright-cli:*) Bash(npx:*)
   Bash(npm:*)`** — i.e. invoking it pre-authorises me to run npm and npx. Flagged, not changed.

---

## Working log

### 2026-09-26

- Mapped the install. `web-design-guidelines` was already live in `.claude/skills/`;
  `design-taste-frontend` was in `.agents/skills/` and **invisible to Claude Code** — 1206 lines
  sitting unused since install. Moved it, removed the emptied `.agents/`. Both then registered.
- His third-skill command could not run: the URL was a bare `https://github.com` with no owner/repo.
  Did not guess. He supplied the name `awesome-design-md`; found and verified the owner read-only
  before touching disk: `VoltAgent/awesome-design-md`, `main`, HEAD `f696123`, 118k stars, MIT.
- **Found the real problem with the third skill:** no `SKILL.md` anywhere in its tree — checked the
  full recursive tree, not just the root. It is a reference collection, not a Claude Code skill.
  Cloned as instructed it would have sat there inert. Wrote a `SKILL.md` router; index verified
  74/74 against disk. Sized it first: average `DESIGN.md` ~30 KB, largest 45 KB, all 74 is 2.3 MB —
  so the router hard-rules one file per use.
- **Fourth skill (Playwright).** His pasted commands were wrong twice over: `-g` installs globally,
  contradicting his own project-local rule, and `playwright-cli install --skills Claude Code layout`
  is not valid syntax — `--skills` takes `claude` (default) or `agents`. Also the bare
  `playwright-cli` npm package is **deprecated** in favour of `@playwright/cli`. Verified the docs
  and the registry, installed `@playwright/cli@0.1.21` globally, then ran
  `playwright-cli install --skills` with no `-g` from the repo root.
- **Found a bug in that installer:** it writes `.playwright-cli/` to `.gitignore` but creates
  `.playwright/`. The pattern does not match what it made. Harmless only while the directory is
  empty — the installer's own comment says the contents "may contain credentials", and storage-state
  files hold auth cookies. Rewrote `.gitignore` to cover `.playwright/` as well, and added
  `.claude/settings.local.json`. Verified both patterns bite using throwaway probe files.

**Next:** he decides whether `.claude/skills/` gets committed (2.4 MB) or gitignored. Then tells me
what dripkits is → open `dripkits-plan.md` + `decisions-dripkits-plan.md`.
