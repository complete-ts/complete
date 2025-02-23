// @ts-check

/** @type {import("knip").KnipConfig} */
const config = {
  // Ignore all dependencies in the root. (This is checked by the `lintMonorepoPackageJSONs` helper
  // function.)
  ignoreDependencies: [".+"],

  workspaces: {
    "packages/*": {},
    "packages/complete-cli": {
      ignore: ["file-templates/**"],
    },
    "packages/docs": {
      ignore: [
        "docusaurus.config.ts",
        "sidebars.ts",
        "static/js/hotkey.js",
        "src/components/HomepageFeatures/index.tsx",
        "src/pages/index.tsx",
        "typedoc.config.base.mjs",
      ],
    },
    "packages/eslint-config-complete": {
      ignore: ["scripts/extract-comments.d.ts"],
      ignoreDependencies: ["eslint-import-resolver-typescript"],
    },
    "packages/eslint-plugin-complete": {
      ignore: [
        "src/template.ts",
        "tests/template.ts",
        "tests/fixtures/file.ts",
      ],
    },
  },
};

export default config;
