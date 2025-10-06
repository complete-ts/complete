import path from "node:path";

/** @type {import("eslint-doc-generator").GenerateOptions} */
const config = {
  // Defaults to "desc-parens-prefix-name", but we want to match the format established by ESLint
  // and TSESLint: https://github.com/bmish/eslint-doc-generator/issues/347
  ruleDocTitleFormat: "name",

  // Defaults to "[deprecated, configs, fixableAndHasSuggestions, requiresTypeChecking]".
  ruleDocNotices: ["description"],

  ruleDocSectionExclude: [],

  // Add a "Resources" section as the final section.
  postprocess(content, pathToFile) {
    if (
      !pathToFile.includes(`${path.sep}rules${path.sep}`)
      || !pathToFile.endsWith(".md")
    ) {
      return content;
    }

    const ruleName = pathToFile.split(path.sep).pop().replace(".md", "");

    const resourcesSection = `## Resources

- [How to use this rule](https://complete-ts.github.io/eslint-plugin-complete)
- [Rule source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/src/rules/${ruleName}.ts)
- [Test source](https://github.com/complete-ts/complete/blob/main/packages/eslint-plugin-complete/tests/rules/${ruleName}.test.ts)
`;

    const resourcesIndex = content.indexOf("## Resources");
    if (resourcesIndex !== -1) {
      content = content.slice(0, resourcesIndex);
    }

    return `${content.trim()}\n\n${resourcesSection}`;
  },
};

export default config;
