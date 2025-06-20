import type { TSESTree } from "@typescript-eslint/utils";
import { ESLintUtils } from "@typescript-eslint/utils";
import type ts from "typescript";
import { getRealType, getTypeName, unionTypeParts } from "../typeUtils.js";
import { createRule } from "../utils.js";

type Options = [];
type MessageIds = "mutableArray" | "mutableMap" | "mutableSet";

export const noMutableReturn = createRule<Options, MessageIds>({
  name: "no-mutable-return",
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallows returning mutable arrays, maps, and sets from functions",
      recommended: true,
      requiresTypeChecking: true,
    },
    schema: [],
    messages: {
      mutableArray:
        "Arrays that are returned from functions must be read-only. (Use the `readonly` keyword prefix or the `Readonly` utility type.)",
      mutableMap:
        "Maps that are returned from functions must be read-only. (Annotate the function using the `ReadonlyMap` type.)",
      mutableSet:
        "Sets that are returned from functions must be read-only. (Annotate the function using the `ReadonlySet` type.)",
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = ESLintUtils.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    function checkReturnType(
      node: TSESTree.FunctionDeclaration | TSESTree.FunctionExpression,
    ) {
      const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
      const type = checker.getTypeAtLocation(tsNode);
      const signatures = type.getCallSignatures();
      for (const signature of signatures) {
        const returnType = signature.getReturnType();
        const realReturnType = getRealType(parserServices.program, returnType);

        for (const t of unionTypeParts(realReturnType)) {
          const messageId = getErrorMessageId(t);
          if (messageId !== undefined) {
            context.report({
              loc: node.loc,
              messageId,
            });
          }
        }
      }
    }

    // We explicitly do not include `TSESTree.ArrowFunctionExpression` because arrow functions are
    // commonly used inside of other functions, which compartmentalize the mutations.
    return {
      FunctionDeclaration: checkReturnType,
      FunctionExpression: checkReturnType,
    };
  },
});

function getErrorMessageId(type: ts.Type): MessageIds | undefined {
  const typeName = getTypeName(type);
  if (typeName === undefined) {
    return undefined;
  }

  // This would be "ReadonlyMap" if it was the read-only version.
  if (typeName === "Map") {
    return "mutableMap";
  }

  // This would be "ReadonlySet" if it was the read-only version.
  if (typeName === "Set") {
    return "mutableSet";
  }

  // This would be "ReadonlyArray" if it was the read-only version.
  if (typeName === "Array") {
    return "mutableArray";
  }

  return undefined;
}
