import { $, lintMonorepoPackageJSONs, lintScript } from "complete-node";

// This script lints the monorepo. It does not run the lint scripts for each individual package. For
// that, use the "lintAll.ts" script.
await lintScript(async () => {
  const promises = [
    // Use TypeScript to type-check the code.
    $`tsc --noEmit`,

    // Use ESLint to lint the TypeScript code.
    // - "--max-warnings 0" makes warnings fail, since we set all ESLint errors to warnings.
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
    /// $`isaacscript check-ts`, // TODO

    // Check to see if the child "package.json" files are up to date.
    lintMonorepoPackageJSONs(),
  ];

  await Promise.all(promises);
});
