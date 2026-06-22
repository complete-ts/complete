import type { TSESTree } from "@typescript-eslint/utils";
import { AST_NODE_TYPES, ESLintUtils } from "@typescript-eslint/utils";
import type ts from "typescript";
import { createRule } from "../utils.js";

const JSDOC_DEFAULT_TAGS: ReadonlySet<string> = new Set([
  "default",
  "defaultValue",
]);

type ComparableDefaultValue = boolean | null | number | string;

export const noRedundantJSDocDefault = createRule({
  name: "no-redundant-jsdoc-default",
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallows setting object properties to their JSDoc default values",
      recommended: true,
      requiresTypeChecking: true,
    },
    schema: [],
    messages: {
      redundantDefault:
        "Omit this property because it is already set to its JSDoc default value of {{ defaultValue }}.",
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = ESLintUtils.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    return {
      Property(node) {
        if (
          node.kind !== "init"
          || node.method
          || node.shorthand
          || node.computed
          || node.parent.type !== AST_NODE_TYPES.ObjectExpression
        ) {
          return;
        }

        const propertyName = getPropertyName(node.key);
        if (propertyName === undefined) {
          return;
        }

        const propertyValue = getComparableValue(node.value);
        if (propertyValue === undefined) {
          return;
        }

        const tsObjectExpression = parserServices.esTreeNodeToTSNodeMap.get(
          node.parent,
        );
        const contextualType = checker.getContextualType(tsObjectExpression);
        if (contextualType === undefined) {
          return;
        }

        const propertySymbol = getPropertySymbol(
          checker,
          contextualType,
          propertyName,
        );
        if (propertySymbol === undefined) {
          return;
        }

        const jsDocDefaultValue = getJSDocDefaultValue(checker, propertySymbol);
        if (jsDocDefaultValue === undefined) {
          return;
        }

        if (
          !areComparableDefaultValuesEqual(propertyValue, jsDocDefaultValue)
        ) {
          return;
        }

        context.report({
          node: node.value,
          messageId: "redundantDefault",
          data: {
            defaultValue: getPrintableDefaultValue(jsDocDefaultValue),
          },
        });
      },
    };
  },
});

function areComparableDefaultValuesEqual(
  propertyValue: ComparableDefaultValue,
  jsDocDefaultValue: ComparableDefaultValue,
): boolean {
  return Object.is(propertyValue, jsDocDefaultValue);
}

function getComparableValue(
  node: TSESTree.Node,
): ComparableDefaultValue | undefined {
  switch (node.type) {
    case AST_NODE_TYPES.Literal: {
      return getComparableLiteralValue(node.value);
    }

    case AST_NODE_TYPES.TemplateLiteral: {
      return getTemplateLiteralValue(node);
    }

    case AST_NODE_TYPES.UnaryExpression: {
      return getUnaryExpressionValue(node);
    }

    default: {
      return undefined;
    }
  }
}

function getComparableLiteralValue(
  value: bigint | boolean | null | number | RegExp | string,
): ComparableDefaultValue | undefined {
  if (
    typeof value === "boolean"
    || typeof value === "number"
    || typeof value === "string"
    || value === null
  ) {
    return value;
  }

  return undefined;
}

function getJSDocDefaultValue(
  checker: ts.TypeChecker,
  symbol: ts.Symbol,
): ComparableDefaultValue | undefined {
  const jsDocTagInfo = symbol
    .getJsDocTags(checker)
    .find((tagInfo) => JSDOC_DEFAULT_TAGS.has(tagInfo.name));
  if (jsDocTagInfo === undefined) {
    return undefined;
  }

  const tagText = jsDocTagInfo.text
    ?.map((displayPart) => displayPart.text)
    .join("")
    .trim();
  if (tagText === undefined || tagText === "") {
    return undefined;
  }

  return parseDefaultValue(tagText);
}

function getPrintableDefaultValue(value: ComparableDefaultValue): string {
  return typeof value === "string" ? JSON.stringify(value) : String(value);
}

function getPropertyName(node: TSESTree.PropertyName): string | undefined {
  switch (node.type) {
    case AST_NODE_TYPES.Identifier: {
      return node.name;
    }

    case AST_NODE_TYPES.Literal: {
      return typeof node.value === "number" || typeof node.value === "string"
        ? String(node.value)
        : undefined;
    }

    default: {
      return undefined;
    }
  }
}

function getPropertySymbol(
  checker: ts.TypeChecker,
  type: ts.Type,
  propertyName: string,
): ts.Symbol | undefined {
  const apparentType = checker.getApparentType(type);
  return checker.getPropertyOfType(apparentType, propertyName);
}

function getTemplateLiteralValue(
  node: TSESTree.TemplateLiteral,
): string | undefined {
  if (node.expressions.length > 0) {
    return undefined;
  }

  const firstQuasi = node.quasis[0];
  return firstQuasi?.value.cooked ?? undefined;
}

function getUnaryExpressionValue(
  node: TSESTree.UnaryExpression,
): number | undefined {
  if (
    node.operator !== "-"
    || node.argument.type !== AST_NODE_TYPES.Literal
    || typeof node.argument.value !== "number"
  ) {
    return undefined;
  }

  return -node.argument.value;
}

function parseDefaultValue(
  defaultValue: string,
): ComparableDefaultValue | undefined {
  const normalizedDefaultValue = normalizeDefaultValue(defaultValue);

  switch (normalizedDefaultValue) {
    case "false": {
      return false;
    }

    case "null": {
      // eslint-disable-next-line unicorn/no-null
      return null;
    }

    case "true": {
      return true;
    }

    default: {
      return parseDefaultValueStringOrNumber(normalizedDefaultValue);
    }
  }
}

function parseDefaultValueStringOrNumber(
  defaultValue: string,
): number | string | undefined {
  const numberValue = Number(defaultValue);
  if (
    defaultValue !== ""
    && Number.isFinite(numberValue)
    && String(numberValue) === defaultValue
  ) {
    return numberValue;
  }

  if (!defaultValue.startsWith('"') || !defaultValue.endsWith('"')) {
    return undefined;
  }

  return parseJSONString(defaultValue);
}

function parseJSONString(defaultValue: string): string | undefined {
  let parsedDefaultValue: unknown;

  try {
    parsedDefaultValue = JSON.parse(defaultValue);
  } catch {
    return undefined;
  }

  return typeof parsedDefaultValue === "string"
    ? parsedDefaultValue
    : undefined;
}

function normalizeDefaultValue(defaultValue: string): string {
  let normalizedDefaultValue = defaultValue.trim();

  if (
    normalizedDefaultValue.startsWith("`")
    && normalizedDefaultValue.endsWith("`")
  ) {
    normalizedDefaultValue = normalizedDefaultValue.slice(1, -1);
  }

  return normalizedDefaultValue;
}
