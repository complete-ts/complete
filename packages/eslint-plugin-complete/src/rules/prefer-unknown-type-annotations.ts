import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import { createRule } from "../utils.js";

export type Options = [];
export type MessageIds = "preferTypeAnnotation";

export const preferUnknownTypeAnnotations = createRule<Options, MessageIds>({
  name: "prefer-unknown-type-annotations",
  meta: {
    type: "problem",
    docs: {
      description:
        "Require variable type annotations over as unknown assertions",
      recommended: true,
      requiresTypeChecking: false,
    },
    fixable: "code",
    schema: [],
    messages: {
      preferTypeAnnotation:
        "Use a variable type annotation instead of an `as unknown` assertion.",
    },
  },
  defaultOptions: [],
  create: (context) => ({
    VariableDeclarator(node) {
      const { id, init } = node;
      if (
        id.type !== AST_NODE_TYPES.Identifier
        || id.typeAnnotation !== undefined
        || init?.type !== AST_NODE_TYPES.TSAsExpression
        || init.typeAnnotation.type !== AST_NODE_TYPES.TSUnknownKeyword
      ) {
        return;
      }

      const { sourceCode } = context;

      context.report({
        node: init.typeAnnotation,
        messageId: "preferTypeAnnotation",
        fix: (fixer) => [
          fixer.insertTextAfter(id, ": unknown"),
          fixer.replaceText(init, sourceCode.getText(init.expression)),
        ],
      });
    },
  }),
});
