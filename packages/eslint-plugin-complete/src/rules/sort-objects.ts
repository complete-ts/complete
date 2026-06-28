import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import { AST_NODE_TYPES, ESLintUtils } from "@typescript-eslint/utils";
import ts from "typescript";
import { isFlagSet, unionTypeParts } from "../typeUtils.js";
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
        "Requires object properties to match the declared type order or alphabetical order",
      recommended: true,
      requiresTypeChecking: true,
    },
    fixable: "code",
    schema: [],
    messages: {
      incorrectOrder:
        "Object property `{{ earlierName }}` must be before `{{ laterName }}` to match the required order.",
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
        const propertyOrder = getPropertyOrder(checker, tsNode, node);

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

function getPropertyOrder(
  checker: ts.TypeChecker,
  tsNode: ts.Expression,
  node: TSESTree.ObjectExpression,
): ReadonlyMap<string, number> {
  const contextualType = checker.getContextualType(tsNode);
  const declaredPropertyOrder =
    contextualType === undefined
      ? new Map<string, number>()
      : getDeclaredPropertyOrder(checker, contextualType, tsNode, node);

  if (declaredPropertyOrder.size > 0) {
    return declaredPropertyOrder;
  }

  return getAlphabeticalPropertyOrder(node);
}

function getDeclaredPropertyOrder(
  checker: ts.TypeChecker,
  type: ts.Type,
  tsNode: ts.Expression,
  node: TSESTree.ObjectExpression,
): ReadonlyMap<string, number> {
  const typeWithDeclaredProperties = getTypeWithDeclaredProperties(
    checker,
    type,
    tsNode,
    node,
  );
  if (typeWithDeclaredProperties === undefined) {
    return new Map<string, number>();
  }

  return (
    getDeclarationPropertyOrder(typeWithDeclaredProperties, node)
    ?? getTypePropertyOrder(typeWithDeclaredProperties)
  );
}

function getTypePropertyOrder(type: ts.Type): ReadonlyMap<string, number> {
  const propertyOrder = new Map<string, number>();

  for (const [i, property] of type.getProperties().entries()) {
    propertyOrder.set(property.getName(), i);
  }

  return propertyOrder;
}

function getTypeWithDeclaredProperties(
  checker: ts.TypeChecker,
  type: ts.Type,
  tsNode: ts.Expression,
  node: TSESTree.ObjectExpression,
): ts.Type | undefined {
  const objectTypes = unionTypeParts(type).filter(isObjectTypeWithProperties);
  if (objectTypes.length === 1) {
    return objectTypes[0];
  }

  const matchingObjectTypes = objectTypes.filter((objectType) =>
    hasAllObjectExpressionProperties(objectType, node),
  );

  if (matchingObjectTypes.length === 1) {
    return matchingObjectTypes[0];
  }

  const actualType = checker.getTypeAtLocation(tsNode);
  const assignableObjectTypes = matchingObjectTypes.filter((objectType) =>
    checker.isTypeAssignableTo(actualType, objectType),
  );

  return assignableObjectTypes.length === 1
    ? assignableObjectTypes[0]
    : undefined;
}

function isObjectTypeWithProperties(type: ts.Type): boolean {
  return (
    isFlagSet(type.flags, ts.TypeFlags.Object | ts.TypeFlags.Intersection)
    && type.getProperties().length > 0
  );
}

function hasAllObjectExpressionProperties(
  type: ts.Type,
  node: TSESTree.ObjectExpression,
): boolean {
  for (const property of node.properties) {
    if (property.type === AST_NODE_TYPES.SpreadElement) {
      continue;
    }

    const propertyName = getPropertyName(property);
    if (propertyName === undefined) {
      continue;
    }

    if (type.getProperty(propertyName) === undefined) {
      return false;
    }
  }

  return true;
}

interface PropertyDeclarationPosition {
  readonly declarationPosition: {
    readonly containerEnd: number;
    readonly containerStart: number;
    readonly fileName: string;
    readonly start: number;
  };
  readonly propertyName: string;
}

function getDeclarationPropertyOrder(
  type: ts.Type,
  node: TSESTree.ObjectExpression,
): ReadonlyMap<string, number> | undefined {
  const propertyDeclarationPositions: PropertyDeclarationPosition[] = [];

  for (const propertyName of getObjectExpressionPropertyNames(node)) {
    const property = type.getProperty(propertyName);
    const declarationPosition =
      property === undefined
        ? undefined
        : getPropertyDeclarationPosition(property);

    if (declarationPosition === undefined) {
      return undefined;
    }

    propertyDeclarationPositions.push({
      declarationPosition,
      propertyName,
    });
  }

  const firstFileName =
    propertyDeclarationPositions.at(0)?.declarationPosition.fileName;
  const firstContainerStart =
    propertyDeclarationPositions.at(0)?.declarationPosition.containerStart;
  const firstContainerEnd =
    propertyDeclarationPositions.at(0)?.declarationPosition.containerEnd;

  if (
    firstFileName === undefined
    || firstContainerStart === undefined
    || firstContainerEnd === undefined
    || propertyDeclarationPositions.some(
      ({ declarationPosition }) =>
        declarationPosition.fileName !== firstFileName
        || declarationPosition.containerStart !== firstContainerStart
        || declarationPosition.containerEnd !== firstContainerEnd,
    )
  ) {
    return undefined;
  }

  const propertyOrder = new Map<string, number>();
  const sortedPropertyDeclarationPositions =
    propertyDeclarationPositions.toSorted(
      (a, b) => a.declarationPosition.start - b.declarationPosition.start,
    );

  for (const [
    i,
    { propertyName },
  ] of sortedPropertyDeclarationPositions.entries()) {
    propertyOrder.set(propertyName, i);
  }

  return propertyOrder;
}

function getPropertyDeclarationPosition(
  property: ts.Symbol,
): PropertyDeclarationPosition["declarationPosition"] | undefined {
  if (property.declarations?.length !== 1) {
    return undefined;
  }

  const declaration = property.declarations[0];
  if (declaration === undefined) {
    return undefined;
  }

  return {
    containerEnd: declaration.parent.getEnd(),
    containerStart: declaration.parent.getStart(),
    fileName: declaration.getSourceFile().fileName,
    start: declaration.getStart(),
  };
}

function getObjectExpressionPropertyNames(
  node: TSESTree.ObjectExpression,
): readonly string[] {
  return node.properties
    .filter((property) => property.type !== AST_NODE_TYPES.SpreadElement)
    .map((property) => getPropertyName(property))
    .filter((propertyName) => propertyName !== undefined);
}

function getAlphabeticalPropertyOrder(
  node: TSESTree.ObjectExpression,
): ReadonlyMap<string, number> {
  const propertyNames = getObjectExpressionPropertyNames(node).toSorted(
    (a, b) => a.localeCompare(b),
  );

  const propertyOrder = new Map<string, number>();

  for (const [i, propertyName] of propertyNames.entries()) {
    propertyOrder.set(propertyName, i);
  }

  return propertyOrder;
}
