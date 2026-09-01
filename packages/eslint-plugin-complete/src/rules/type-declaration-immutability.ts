import type { TSESTree } from "@typescript-eslint/utils";
import { AST_NODE_TYPES, ESLintUtils } from "@typescript-eslint/utils";
import type { ImmutabilityCache } from "is-immutable-type";
import { getDefaultOverrides, isImmutableType } from "is-immutable-type";
import type ts from "typescript";
import { createRule } from "../utils.js";

type Options = [];
type MessageIds = "mustBeImmutable";

export const typeDeclarationImmutability = createRule<Options, MessageIds>({
  name: "type-declaration-immutability",
  meta: {
    type: "problem",
    docs: {
      description: "Enforces that type aliases and interfaces are immutable",
      recommended: true,
      requiresTypeChecking: true,
    },
    schema: [],
    messages: {
      mustBeImmutable: "Type declarations must be immutable.",
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = ESLintUtils.getParserServices(context);
    const { program } = parserServices;
    const checker = program.getTypeChecker();
    const immutabilityCache: ImmutabilityCache = new WeakMap();
    const immutabilityOverrides = getDefaultOverrides();

    function checkTypeDeclaration(
      node: TSESTree.TSInterfaceDeclaration | TSESTree.TSTypeAliasDeclaration,
    ) {
      const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
      const typeOrTypeNode =
        node.type === AST_NODE_TYPES.TSTypeAliasDeclaration
          ? (tsNode as ts.TypeAliasDeclaration).type
          : checker.getTypeAtLocation(tsNode);

      if (
        !isImmutableType(
          program,
          typeOrTypeNode,
          immutabilityOverrides,
          immutabilityCache,
        )
      ) {
        context.report({
          node: node.id,
          messageId: "mustBeImmutable",
        });
      }
    }

    return {
      TSInterfaceDeclaration: checkTypeDeclaration,
      TSTypeAliasDeclaration: checkTypeDeclaration,
    };
  },
});
