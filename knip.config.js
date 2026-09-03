// @ts-check

/** @type {import("knip").KnipConfig} */
const config = {
  eslint: {},
  prettier: {},

  ignoreDependencies: [
    "cspell", // Executed in: scripts/lint.ts
    "cspell-check-unused-words", // Executed in: scripts/lint.ts
    "eslint-plugin-complete", // Executed in: scripts/lint.ts
    "markdownlint-cli2", // Executed in: scripts/lint.ts
    "npm-check-updates", // Needed by the "update" script.
  ],

  workspaces: {
    "packages/complete-cli": {
      ignore: ["file-templates/**"],
    },
    "packages/complete-lint": {
      // Since this is a meta-package, Knip will think all of the dependencies are unused.
      ignoreDependencies: [".+"],
    },
    "packages/complete-node": {
      ignoreDependencies: ["unbuild"], // Used in: scripts/build.ts
    },
    "packages/eslint-plugin-complete": {
      ignore: [
        "eslint-doc-generator.config.mjs",
        "src/template.ts",
        "tests/template.ts",
        "tests/fixtures/file.ts",
      ],
      ignoreDependencies: [
        "prettier", // Used in: eslint-doc-generator.config.mjs
      ],
    },
    "packages/markdownlint-rule-complete": {
      ignoreDependencies: ["unbuild"], // Used in: scripts/build.ts
    },
  },
};

export default config;
