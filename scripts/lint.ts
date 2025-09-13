// This script lints the monorepo. It does not run the lint scripts for each individual package. For
// that, use the "lint-all.ts" script.

import { $, lintMonorepoPackageJSONs, lintScript } from "complete-node";

await lintScript(import.meta.dirname, async (packageRoot) => {
  await Promise.all([
    // Use TypeScript to type-check the code.
    $`tsc --noEmit`,

    // Use ESLint to lint the TypeScript code.
    // - "--max-warnings 0" makes warnings fail, since we set all ESLint errors to warnings.
    $`eslint --max-warnings 0 scripts *.js *.mjs`, // We have to exclude the packages directory.

    // Use Prettier to check formatting.
    // - "--log-level=warn" makes it only output errors.
    $`prettier --log-level=warn --check .`,

    // Use Knip to check for unused files, exports, and dependencies.
    // - "--no-progress" - Don’t show dynamic progress updates. Progress is automatically disabled
    //   in CI environments.
    // - "--treat-config-hints-as-errors" - Exit with non-zero code (1) if there are any
    //   configuration hints.
    $`knip --no-progress --treat-config-hints-as-errors`,

    // Use CSpell to spell check every file.
    // - "--no-progress" and "--no-summary" make it only output errors.
    $`cspell --no-progress --no-summary`,

    // Check for unused words in the CSpell configuration file.
    $`cspell-check-unused-words`,

    // Check for template updates.
    $`tsx ./packages/complete-cli/src/main.ts check --ignore build.ts,ci.yml,eslint.config.mjs,knip.config.js,lint.ts,tsconfig.json`,

    // Check to see if the child "package.json" files are up to date.
    lintMonorepoPackageJSONs(packageRoot),

    $`markdownlint .`,
  ]);
});
