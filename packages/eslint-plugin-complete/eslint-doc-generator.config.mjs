import path from "node:path";
import { format, resolveConfig } from "prettier";

/** @type {import("eslint-doc-generator").GenerateOptions} */
const config = {
  // Defaults to "README.md".
  pathRuleList: "website-root.md",

  // Defaults to "[deprecated, configs, fixableAndHasSuggestions, requiresTypeChecking]".
  ruleDocNotices: ["description"],

  // Defaults to true. See: https://github.com/bmish/eslint-doc-generator/issues/806
  ruleDocSectionOptions: false,

  // Defaults to "desc-parens-prefix-name", but we want to match the format established by ESLint
  // and TSESLint: https://github.com/bmish/eslint-doc-generator/issues/347
  ruleDocTitleFormat: "name",

  async postprocess(content, pathToFile) {
    const newContent = getNewContent(content, pathToFile);
    const cwd = process.cwd();
    const prettierConfig = await resolveConfig(cwd);

    return await format(newContent, {
      parser: "markdown",
      ...prettierConfig,
    });
  },
};

export default config;

function getNewContent(content, pathToFile) {
  if (pathToFile.includes(`${path.sep}website-root.md`)) {
    return getContentWithFixedDocusaurusLinks(content);
  }

  return getContentWithResourcesSection(content, pathToFile);
}

/**
 * Replace e.g. "docs/rules/complete-sentences-jsdoc.md" with
 * "eslint-plugin-complete/rules/complete-sentences-jsdoc".
 *
 * @param content {string}
 * @returns {string}
 */
function getContentWithFixedDocusaurusLinks(content) {
  return content.replaceAll(
    /docs\/(rules\/[^)]+)\.md/g,
    "eslint-plugin-complete/$1",
  );
}

/**
 * Add a "Resources" section as the final section.
 *
 * @param content {string}
 * @param pathToFile {string}
 * @returns {string}
 */
function getContentWithResourcesSection(content, pathToFile) {
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
}
