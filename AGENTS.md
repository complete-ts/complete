# `complete` Agent Instructions

- This is an open source Git repository for TypeScript-related tooling.
- If you create or modify a JavaScript/TypeScript file:
  - Use the `mapAsync` helper function instead of `Promise.all`.
  - Run `bunx --bun eslint --fix foo.ts` at the root of the project (not the
    root of the repository) to automatically fix errors.
  - Run `bunx --bun prettier --write foo.ts` at the root of the repository to
    ensure it is formatted.
  - Run `bun run lint` at the root of the project (not the repository) to ensure
    it passes all checks.
- Only write code with normal ASCII characters. Never use emojis in your code.
- Never put pointless comments in your code. You should be writing easy to read
  code, making comments superfluous.
- Do not commit to the repository unless explicitly asked to.
- When making a new lint rule for "eslint-plugin-complete", use the "bun run
  create-rule" script.
