/** @type {import("eslint-doc-generator").GenerateOptions} */
const config = {
  // Defaults to "desc-parens-prefix-name", but we want to match the format established by ESLint
  // and TSESLint: https://github.com/bmish/eslint-doc-generator/issues/347
  ruleDocTitleFormat: "name",

  // Defaults to "[deprecated, configs, fixableAndHasSuggestions, requiresTypeChecking]".
  ruleDocNotices: ["description"],

  postprocess(content, path) {
    if (!path.includes("rules/") || !path.endsWith(".md")) {
      return content;
    }

    const ruleName = path.split("/").pop().replace(".md", "");

    const resourcesSection = `
## Resources

- [How to use this rule](https://complete-ts.github.io/eslint-plugin-complete)
- [Rule source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/src/rules/${ruleName}.ts)
- [Test source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/tests/rules/${ruleName}.test.ts)
`;

    return content + resourcesSection;
  },
};

export default config;
