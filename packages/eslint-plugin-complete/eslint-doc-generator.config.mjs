/** @type {import('eslint-doc-generator').GenerateOptions} */
const config = {
  // Defaults to "desc-parens-prefix-name", but we want to match the format established by ESLint
  // and TSESLint: https://github.com/bmish/eslint-doc-generator/issues/347
  ruleDocTitleFormat: "name",

  // Defaults to "[deprecated, configs, fixableAndHasSuggestions, requiresTypeChecking]".
  ruleDocNotices: ["description"],
};

export default config;
