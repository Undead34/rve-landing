---
description: Create safe, logically-separated conventional commits for all current changes
---

Create multiple high-quality, logically-separated git commits for all current project changes.

Follow this workflow exactly:

1. Inspect the worktree before staging anything:
   - Run `git status --short`
   - Run `git diff --stat`
   - Run `git diff`
   - Run `git log --oneline -10`

2. Review all changed and untracked files:
   - Do not commit secrets or sensitive files such as `.env`, credentials, private keys, tokens, local databases, or generated logs.
   - If suspicious files are present, stop and ask before committing.
   - Do not revert or modify unrelated user changes.

3. Group changes into logical commits:
   - Analyze the diff and separate changes by concern (e.g., `feat(nav)`, `fix(table)`, `style(palette)`, `refactor(tokens)`).
   - Each commit should represent one logical unit. Do not mix unrelated changes in a single commit.
   - If a file contains changes for multiple concerns, use `git add -p` to stage only the relevant hunks.

4. Choose a Conventional Commit message per group:
   - Format: `&lt;type&gt;(&lt;scope&gt;): &lt;subject&gt;`
   - Use imperative English.
   - Keep the subject concise.
   - Prefer these types: `feat`, `fix`, `refactor`, `style`, `chore`, `docs`, `test`.
   - Prefer these scopes for this project: `shell`, `table`, `palette`, `theme`, `a11y`, `tokens`, `nav`, `prefs`, `vt`, `data`, `deps`, `config`, `arch`.

5. Verify before committing:
   - Run `bun run lint`
   - Run `bun run build`
   - If either fails, fix the issue first, then rerun verification.

6. Stage and commit each group separately:
   - Stage one logical group at a time (`git add &lt;files&gt;` or `git add -p`).
   - Commit that group with its specific Conventional Commit message.
   - Repeat for every logical group until the working tree is clean.
   - Do not amend.
   - Do not push.
   - Do not use destructive git commands.

7. Report the result:
   - Show all commit hashes created.
   - Show `git status --short` after the last commit.
   - Summarize what each commit contained and what verification passed.

Current git status:
!`git status --short`

Current diff stat:
!`git diff --stat`

Recent commit style:
!`git log --oneline -10`
