import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import { createRule } from "../utils.js";

export const preferPathResolve = createRule({
  name: "prefer-path-resolve",
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallows the path.join method with a parent directory segment",
      recommended: true,
      requiresTypeChecking: false,
    },
    fixable: "code",
    schema: [],
    messages: {
      usePathResolve: 'Change "path.join" to "path.resolve".',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        // Check for "path.join".
        const { callee } = node;
        if (callee.type !== AST_NODE_TYPES.MemberExpression) {
          return;
        }

        const { object } = callee;
        if (
          object.type !== AST_NODE_TYPES.Identifier
          || object.name !== "path"
        ) {
          return;
        }

        const { property } = callee;
        if (
          property.type !== AST_NODE_TYPES.Identifier
          || property.name !== "join"
        ) {
          return;
        }

        // Check if any argument is "..".
        const hasParentDirectorySegment = node.arguments.some(
          (arg) => arg.type === AST_NODE_TYPES.Literal && arg.value === "..",
        );

        if (hasParentDirectorySegment) {
          context.report({
            node: callee.property,
            messageId: "usePathResolve",
            fix(fixer) {
              return fixer.replaceText(property, "resolve");
            },
          });
        }
      },
    };
  },
});
