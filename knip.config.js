// @ts-check

/** @type {import("knip").KnipConfig} */
const config = {
  // Ignore all dependencies in the root.
  // https://github.com/webpro-nl/knip/issues/778
  ignoreDependencies: [".+"],

  workspaces: {
    "packages/*": {},
    "packages/complete-common": {
      ignoreDependencies: ["complete-node"],
    },
    "packages/complete-node": {
      ignoreDependencies: ["npm-check-updates"],
    },
    "packages/docs": {
      ignore: ["docusaurus.config.ts", "sidebars.ts", "static/js/hotkey.js"],
    },
    "packages/eslint-config-complete": {
      ignore: ["scripts/extract-comments.d.ts"],
      ignoreDependencies: [
        "complete-node",
        "eslint-import-resolver-typescript",
      ],
    },
    "packages/eslint-plugin-complete": {
      ignore: [
        "src/template.ts",
        "tests/template.ts",
        "tests/fixtures/file.ts",
      ],
      ignoreDependencies: ["complete-common", "complete-node"],
    },
  },
};

export default config;
