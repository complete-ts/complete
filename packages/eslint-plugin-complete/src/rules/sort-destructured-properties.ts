import type { TSESTree } from "@typescript-eslint/utils";
import { AST_NODE_TYPES, ESLintUtils } from "@typescript-eslint/utils";
import type ts from "typescript";
import { createRule } from "../utils.js";

type Options = [];
type MessageIds = "incorrectOrder";

export const sortDestructuredProperties = createRule<Options, MessageIds>({
  name: "sort-destructured-properties",
  meta: {
    type: "problem",
    docs: {
      description:
        "Requires destructured object properties to match the declared type order",
      recommended: true,
      requiresTypeChecking: true,
    },
    schema: [],
    messages: {
      incorrectOrder:
        "Destructured property `{{ earlierName }}` must be before `{{ laterName }}` to match the declared type order.",
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = ESLintUtils.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    return {
      ObjectPattern(node) {
        const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
        const type = checker.getTypeAtLocation(tsNode);
        const propertyOrder = getPropertyOrder(type);

        if (propertyOrder.size === 0) {
          return;
        }

        let highestSeenOrder = -1;
        let highestSeenName: string | undefined;

        for (const property of node.properties) {
          if (property.type === AST_NODE_TYPES.RestElement) {
            continue;
          }

          const propertyName = getPropertyName(property);
          if (propertyName === undefined) {
            continue;
          }

          const order = propertyOrder.get(propertyName);
          if (order === undefined) {
            continue;
          }

          if (order < highestSeenOrder && highestSeenName !== undefined) {
            context.report({
              node: property.key,
              messageId: "incorrectOrder",
              data: {
                earlierName: propertyName,
                laterName: highestSeenName,
              },
            });
            return;
          }

          highestSeenOrder = order;
          highestSeenName = propertyName;
        }
      },
    };
  },
});

function getPropertyName(property: TSESTree.Property): string | undefined {
  if (property.computed) {
    return undefined;
  }

  const { key } = property;
  switch (key.type) {
    case AST_NODE_TYPES.Identifier: {
      return key.name;
    }

    case AST_NODE_TYPES.Literal: {
      return typeof key.value === "string" ? key.value : undefined;
    }
  }
}

function getPropertyOrder(type: ts.Type): ReadonlyMap<string, number> {
  const propertyOrder = new Map<string, number>();

  for (const [i, property] of type.getProperties().entries()) {
    propertyOrder.set(property.getName(), i);
  }

  return propertyOrder;
}
