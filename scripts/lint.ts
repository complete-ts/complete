// @template-customization-start

// This script lints the monorepo. It does not run the lint scripts for each individual package. For
// that, use the "lintAll.ts" script.

// @template-customization-end

import { $, lintMonorepoPackageJSONs, lintScript } from "complete-node";

await lintScript(async () => {
  await Promise.all([
    // Use TypeScript to type-check the code.
    $`tsc --noEmit`,
    // @template-ignore-next-line
    /// $`tsc --noEmit --project ./scripts/tsconfig.json`,

    // Use ESLint to lint the TypeScript code.
    // - "--max-warnings 0" makes warnings fail, since we set all ESLint errors to warnings.
    // @template-ignore-next-line
    $`eslint --max-warnings 0 scripts *.mjs`, // We have to exclude the packages directory.

    // Use Prettier to check formatting.
    // - "--log-level=warn" makes it only output errors.
    $`prettier --log-level=warn --check .`,

    // Use Knip to check for unused files, exports, and dependencies.
    $`knip --no-progress`,

    // Use CSpell to spell check every file.
    // - "--no-progress" and "--no-summary" make it only output errors.
    $`cspell --no-progress --no-summary .`,

    // Check for unused words in the CSpell configuration file.
    $`cspell-check-unused-words`,

    // Check for template updates.
    // @template-ignore-next-line
    $`complete-cli check --ignore build.ts,ci.yml,eslint.config.mjs,knip.config.js,LICENSE,tsconfig.json`,

    // @template-customization-start

    // Check to see if the child "package.json" files are up to date.
    lintMonorepoPackageJSONs(),

    // @template-customization-end
  ]);
});
