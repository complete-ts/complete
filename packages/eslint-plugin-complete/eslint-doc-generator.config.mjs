import { format, resolveConfig } from "prettier";

/** @type {import("eslint-doc-generator").GenerateOptions} */
const config = {
  // Defaults to "README.md".
  pathRuleList: "website-root.md",

  async postprocess(content, pathToFile) {
    const updatedContent = pathToFile.endsWith("website-root.md")
      ? addRecommendedConfigIndicators(content)
      : content;
    const prettierConfig = await resolveConfig(pathToFile);

    return await format(updatedContent, {
      parser: "markdown",
      ...prettierConfig,
    });
  },

  // Defaults to "[configs, deprecated, fixableAndHasSuggestions, requiresTypeChecking]". We want to
  // enable every option except for "type", since that contains superfluous information.
  ruleDocNotices: [
    "configs",
    "deprecated",
    "description",
    "fixableAndHasSuggestions",
    "options",
    "requiresTypeChecking",
  ],

  ruleDocSectionInclude: ["Resources"],

  // Defaults to true. See: https://github.com/bmish/eslint-doc-generator/issues/806
  ruleDocSectionOptions: false,

  // Hide the "configsOff" column, since it would be superfluous. (We enable every rule in the
  // recommended config and do not disable any rules.)
  ruleListColumns: [
    "name",
    "description",
    "configsError",
    "configsWarn",
    "fixable",
    "hasSuggestions",
    "requiresTypeChecking",
    "deprecated",
  ],

  urlRuleDoc: "/eslint-plugin-complete/rules/{name}",
};

export default config;

/** Mark rules that the recommended config enables generally but disables for JavaScript files. */
function addRecommendedConfigIndicators(content) {
  const javaScriptOnlyRuleNames = [
    "no-let-any",
    "no-object-any",
    "require-capital-const-assertions",
    "require-capital-read-only",
  ];
  const enabledConfigIndicator = String.fromCodePoint(0x27_05);
  let updatedContent = content;

  for (const ruleName of javaScriptOnlyRuleNames) {
    const rulePattern = new RegExp(
      String.raw`(\| \[${ruleName}\][^|]+\| [^|]+\|)(\s+)(\|)`,
      "g",
    );

    updatedContent = updatedContent.replace(
      rulePattern,
      `$1 ${enabledConfigIndicator}  $3`,
    );
  }

  return updatedContent;
}
