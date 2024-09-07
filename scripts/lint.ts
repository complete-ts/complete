import { lintCommands, lintMonorepoPackageJSONs } from "complete-node";

await lintCommands([
  // Use Prettier to check formatting.
  // - "--log-level=warn" makes it only output errors.
  "prettier --log-level=warn --check .",

  // Type-check the code using the TypeScript compiler.
  "tsc --noEmit",

  // Use ESLint to lint the TypeScript.
  // - "--max-warnings 0" makes warnings fail, since we set all ESLint errors to warnings.
  "eslint --max-warnings 0 scripts *.mjs", // We have to exclude the packages directory.

  // Check for unused files, dependencies, and exports.
  // TODO: https://discord.com/channels/1143209786612125696/1281699259988574251/1281699259988574251
  "knip --no-progress",

  // Spell check every file using CSpell.
  // - "--no-progress" and "--no-summary" make it only output errors.
  "cspell --no-progress --no-summary .",

  // Check for unused CSpell words.
  "cspell-check-unused-words",

  // Check for template updates.
  // TODO

  // Check to see if the child "package.json" files are up to date.
  lintMonorepoPackageJSONs(),
]);
