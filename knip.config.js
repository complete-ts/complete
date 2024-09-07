/** @type {import("knip").KnipConfig} */
const config = {
  workspaces: {
    "packages/*": {},
    "packages/complete-node": {
      ignoreDependencies: ["npm-check-updates"],
    },
    "packages/eslint-config-complete": {
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
