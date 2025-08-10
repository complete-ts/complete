import { AST_NODE_TYPES, ESLintUtils } from "@typescript-eslint/utils";
import type ts from "typescript";
import { getRealType, isVoid } from "../typeUtils.js";
import { createRule } from "../utils.js";

export const noVoidReturnType = createRule({
  name: "no-void-return-type",
  meta: {
    type: "problem",
    docs: {
      description: "Disallows `void` return types on non-exported functions",
      recommended: true,
      requiresTypeChecking: true,
    },
    fixable: "code",
    schema: [],
    messages: {
      voidReturnType:
        "Non-exported functions cannot have a `void` return type. Remove the `void` keyword.",
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = ESLintUtils.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    return {
      FunctionDeclaration(node) {
        // Exported functions are exempt from this rule.
        const { parent } = node;
        if (
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          parent !== undefined
          && (parent.type === AST_NODE_TYPES.ExportNamedDeclaration
            || parent.type === AST_NODE_TYPES.ExportDefaultDeclaration)
        ) {
          return;
        }

        const { returnType } = node;
        if (returnType === undefined) {
          return;
        }
        const { typeAnnotation } = returnType;

        const tsNode = parserServices.esTreeNodeToTSNodeMap.get(typeAnnotation);
        const type = checker.getTypeAtLocation(tsNode);

        if (isVoidOrPromiseVoid(parserServices.program, type)) {
          context.report({
            loc: typeAnnotation.loc,
            messageId: "voidReturnType",
            fix(fixer) {
              return fixer.remove(returnType);
            },
          });
        }
      },
    };
  },
});

function isVoidOrPromiseVoid(program: ts.Program, type: ts.Type): boolean {
  const realType = getRealType(program, type);
  return isVoid(realType);
}
