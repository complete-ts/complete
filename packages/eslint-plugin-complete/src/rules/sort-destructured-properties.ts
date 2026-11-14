import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import { AST_NODE_TYPES, ESLintUtils } from "@typescript-eslint/utils";
import type ts from "typescript";
import { createRule } from "../utils.js";

type Options = [];
type MessageIds = "incorrectOrder";

type Replacement = [range: TSESTree.Range, replacementText: string];

interface DeclaredProperty {
  readonly name: string;
  readonly declaringTypeIndex: number;
  readonly position: number;
}

interface SortableProperty {
  readonly order: number;
  readonly property: TSESTree.Property;
}

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
    fixable: "code",
    schema: [],
    messages: {
      incorrectOrder:
        "Destructured property `{{ earlierName }}` must be before `{{ laterName }}` to match the declared type order.",
    },
  },
  create(context) {
    const parserServices = ESLintUtils.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();
    const { sourceCode } = context;

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

          if (highestSeenName !== undefined && order < highestSeenOrder) {
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
  node: TSESTree.ObjectPattern,
  propertyOrder: ReadonlyMap<string, number>,
): Replacement | undefined {
  const sortableProperties: SortableProperty[] = [];

  for (const property of node.properties) {
    if (property.type === AST_NODE_TYPES.RestElement) {
      continue;
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

  const replacementText = sortableProperties
    .toSorted((a, b) => a.order - b.order)
    .map(({ property }) => sourceCode.getText(property))
    .join(", ");

  return [range, replacementText];
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

/**
 * The checker lists the properties of a mapped type such as `Pick` in the order of its key union,
 * and the order of a union depends on which files the checker loaded first. Thus, we sort the
 * properties of each declaring type by their position in the source code, and keep the declaring
 * types in the order that the checker lists them.
 */
function getPropertyOrder(type: ts.Type): ReadonlyMap<string, number> {
  const declaringTypeIndexes = new Map<ts.Node, number>();
  const declaredProperties: DeclaredProperty[] = [];

  for (const property of type.getProperties()) {
    const declaration = property.getDeclarations()?.[0];
    if (declaration === undefined) {
      continue;
    }

    let declaringTypeIndex = declaringTypeIndexes.get(declaration.parent);
    if (declaringTypeIndex === undefined) {
      declaringTypeIndex = declaringTypeIndexes.size;
      declaringTypeIndexes.set(declaration.parent, declaringTypeIndex);
    }

    declaredProperties.push({
      name: property.getName(),
      declaringTypeIndex,
      position: declaration.pos,
    });
  }

  const sortedProperties = declaredProperties.toSorted((a, b) =>
    a.declaringTypeIndex === b.declaringTypeIndex
      ? a.position - b.position
      : a.declaringTypeIndex - b.declaringTypeIndex,
  );

  return new Map(sortedProperties.map(({ name }, i) => [name, i]));
}
