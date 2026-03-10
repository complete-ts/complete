import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import { createRule } from "../utils.js";

export const preferIsArray = createRule({
  name: "prefer-is-array",
  meta: {
    type: "problem",
    docs: {
      description:
        "Requires using the complete-common isArray helper instead of Array.isArray",
      recommended: true,
      requiresTypeChecking: false,
    },
    fixable: "code",
    schema: [],
    messages: {
      useIsArray:
        'Use the "isArray" helper from "complete-common" instead of "Array.isArray".',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      MemberExpression(node) {
        if (
          node.object.type === AST_NODE_TYPES.Identifier
          && node.object.name === "Array"
          && node.property.type === AST_NODE_TYPES.Identifier
          && node.property.name === "isArray"
          && !node.computed
        ) {
          context.report({
            node,
            messageId: "useIsArray",
            fix: (fixer) => fixer.replaceText(node, "isArray"),
          });
        }
      },
    };
  },
});
