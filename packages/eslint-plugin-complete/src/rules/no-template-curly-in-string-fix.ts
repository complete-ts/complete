/**
 * This rule is slightly modified from the original ESLint version:
 * https://github.com/eslint/eslint/blob/main/lib/rules/no-template-curly-in-string.js
 */

import { createRule } from "../utils.js";

const ERRONEOUS_TEMPLATE_STRING_REGEX = /\$\{[^\}]+\}/v;

export const noTemplateCurlyInStringFix = createRule({
  name: "no-template-curly-in-string-fix",
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallows template literal placeholder syntax in regular strings (and automatically fixes)",
      recommended: true,
      requiresTypeChecking: false,
    },
    fixable: "code",
    schema: [],
    messages: {
      unexpectedTemplateExpression: "Unexpected template string expression.",
    },
  },
  defaultOptions: [],
  create: (context) => ({
    Literal(node) {
      if (
        typeof node.value === "string"
        && ERRONEOUS_TEMPLATE_STRING_REGEX.test(node.value)
      ) {
        context.report({
          node,
          messageId: "unexpectedTemplateExpression",
          fix: (fixer) => fixer.replaceText(node, `\`${node.value}\``),
        });
      }
    },
  }),
});
