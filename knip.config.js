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
  ],

  workspaces: {
    "packages/complete-cli": {
      ignore: ["file-templates/**"],
    },
    "packages/complete-common": {
      ignoreDependencies: ["unbuild"], // Used in: scripts/build.ts
    },
    "packages/complete-lint": {
      // Since this is a meta-package, Knip will think all of the dependencies are unused.
      ignoreDependencies: [".+"],
    },
    "packages/complete-node": {
      ignoreDependencies: ["unbuild"], // Used in: scripts/build.ts
    },
    "packages/docs": {
      ignore: [
        "typedoc.config.base.mjs", // Imported by Typedoc configs in other libraries.
        "static/js/hotkey.js", // https://github.com/webpro-nl/knip/issues/1617
      ],
      ignoreDependencies: [
        "@docusaurus/faster", // https://github.com/webpro-nl/knip/issues/1612
      ],
    },
    "packages/eslint-config-complete": {
      ignore: ["scripts/extract-comments.d.ts"],
    },
    "packages/eslint-plugin-complete": {
      ignore: [
        "eslint-doc-generator.config.mjs",
        "src/template.ts",
        "tests/template.ts",
        "tests/fixtures/file.ts",
      ],
    },
  },
};

export default config;
