import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import { AST_NODE_TYPES, ESLintUtils } from "@typescript-eslint/utils";
import type ts from "typescript";
import { createRule } from "../utils.js";

type Options = [];
type MessageIds = "incorrectOrder";

type Replacement = [range: TSESTree.Range, replacementText: string];

interface SortableProperty {
  readonly order: number;
  readonly property: TSESTree.Property;
}

export const sortObjects = createRule<Options, MessageIds>({
  name: "sort-objects",
  meta: {
    type: "problem",
    docs: {
      description:
        "Requires object properties to match the declared type order",
      recommended: true,
      requiresTypeChecking: true,
    },
    fixable: "code",
    schema: [],
    messages: {
      incorrectOrder:
        "Object property `{{ earlierName }}` must be before `{{ laterName }}` to match the declared type order.",
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = ESLintUtils.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();
    const { sourceCode } = context;

    return {
      ObjectExpression(node) {
        const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
        const type = getObjectType(checker, tsNode);
        const propertyOrder = getPropertyOrder(type);

        if (propertyOrder.size === 0) {
          return;
        }

        let highestSeenOrder = -1;
        let highestSeenName: string | undefined;

        for (const property of node.properties) {
          if (property.type === AST_NODE_TYPES.SpreadElement) {
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
            const replacement = getReplacementText(
              sourceCode,
              node,
              propertyOrder,
            );

            context.report({
              node: property.key,
              messageId: "incorrectOrder",
              data: {
                earlierName: propertyName,
                laterName: highestSeenName,
              },
              ...(replacement !== undefined && {
                fix(fixer) {
                  const [range, replacementText] = replacement;
                  return fixer.replaceTextRange(range, replacementText);
                },
              }),
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

function getReplacementText(
  sourceCode: TSESLint.SourceCode,
  node: TSESTree.ObjectExpression,
  propertyOrder: ReadonlyMap<string, number>,
): Replacement | undefined {
  const sortableProperties: SortableProperty[] = [];

  for (const property of node.properties) {
    if (property.type === AST_NODE_TYPES.SpreadElement) {
      return undefined;
    }

    const propertyName = getPropertyName(property);
    const order =
      propertyName === undefined ? undefined : propertyOrder.get(propertyName);
    if (order === undefined) {
      return undefined;
    }

    sortableProperties.push({
      order,
      property,
    });
  }

  const firstProperty = sortableProperties.at(0)?.property;
  const lastProperty = sortableProperties.at(-1)?.property;
  if (firstProperty === undefined || lastProperty === undefined) {
    return undefined;
  }

  const range: TSESTree.Range = [firstProperty.range[0], lastProperty.range[1]];

  if (hasCommentInRange(sourceCode, range)) {
    return undefined;
  }

  const separator = getSeparator(sourceCode, firstProperty, lastProperty);
  const replacementText = sortableProperties
    .toSorted((a, b) => a.order - b.order)
    .map(({ property }) => sourceCode.getText(property))
    .join(separator);

  return [range, replacementText];
}

function getSeparator(
  sourceCode: TSESLint.SourceCode,
  firstProperty: TSESTree.Property,
  lastProperty: TSESTree.Property,
): string {
  const firstLocation = sourceCode.getLocFromIndex(firstProperty.range[0]);
  const lastLocation = sourceCode.getLocFromIndex(lastProperty.range[0]);

  if (firstLocation.line === lastLocation.line) {
    return ", ";
  }

  return `,\n${" ".repeat(firstLocation.column)}`;
}

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

function hasCommentInRange(
  sourceCode: TSESLint.SourceCode,
  range: TSESTree.Range,
): boolean {
  return sourceCode
    .getAllComments()
    .some(
      (comment) => comment.range[0] >= range[0] && comment.range[1] <= range[1],
    );
}

function getObjectType(checker: ts.TypeChecker, node: ts.Expression): ts.Type {
  return checker.getContextualType(node) ?? checker.getTypeAtLocation(node);
}

function getPropertyOrder(type: ts.Type): ReadonlyMap<string, number> {
  const propertyOrder = new Map<string, number>();

  for (const [i, property] of type.getProperties().entries()) {
    propertyOrder.set(property.getName(), i);
  }

  return propertyOrder;
}
