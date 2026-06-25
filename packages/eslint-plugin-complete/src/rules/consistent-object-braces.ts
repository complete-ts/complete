import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import { createRule } from "../utils.js";

type Options = [];
type MessageIds = "consistentObjectBraces";

const PRETTIER_DEFAULT_PRINT_WIDTH = 80;

export const consistentObjectBraces = createRule<Options, MessageIds>({
  name: "consistent-object-braces",
  meta: {
    type: "problem",
    docs: {
      description: "Requires object brace spacing to match the property count",
      recommended: true,
      requiresTypeChecking: false,
    },
    fixable: "code",
    schema: [],
    messages: {
      consistentObjectBraces:
        "Object braces must be single-line for one property and multiline for multiple properties.",
    },
  },
  defaultOptions: [],
  create(context) {
    const { sourceCode } = context;

    return {
      ObjectExpression(node) {
        checkObjectNode(context, sourceCode, node);
      },
    };
  },
});

function checkObjectNode(
  context: Readonly<TSESLint.RuleContext<MessageIds, Options>>,
  sourceCode: TSESLint.SourceCode,
  node: TSESTree.ObjectExpression,
) {
  const firstProperty = node.properties.at(0);
  const lastProperty = node.properties.at(-1);
  if (firstProperty === undefined || lastProperty === undefined) {
    return;
  }

  const openingBrace = sourceCode.getFirstToken(node);
  const closingBrace = sourceCode.getLastToken(node);
  if (openingBrace === null || closingBrace === null) {
    return;
  }

  const needsFix = getNeedsFix(sourceCode, node, openingBrace, closingBrace);

  if (!needsFix) {
    return;
  }

  context.report({
    node,
    messageId: "consistentObjectBraces",
    *fix(fixer) {
      const replacement = getReplacementText(
        sourceCode,
        node,
        openingBrace,
        closingBrace,
      );
      if (replacement === undefined) {
        return;
      }

      yield fixer.replaceText(node, replacement);
    },
  });
}

function getNeedsFix(
  sourceCode: TSESLint.SourceCode,
  node: TSESTree.ObjectExpression,
  openingBrace: TSESTree.Token,
  closingBrace: TSESTree.Token,
): boolean {
  const firstProperty = node.properties.at(0);
  const lastProperty = node.properties.at(-1);
  if (firstProperty === undefined || lastProperty === undefined) {
    return false;
  }

  if (getShouldUseMultilineBraces(node)) {
    return (
      openingBrace.loc.end.line === firstProperty.loc.start.line
      || closingBrace.loc.start.line === lastProperty.loc.end.line
      || hasTwoPropertiesOnSameLine(node.properties)
    );
  }

  if (node.properties.length === 1) {
    return (
      !isMultiline(firstProperty)
      && canUseSingleLineBraces(sourceCode, node)
      && (openingBrace.loc.end.line !== firstProperty.loc.start.line
        || closingBrace.loc.start.line !== lastProperty.loc.end.line)
    );
  }

  return (
    openingBrace.loc.end.line === firstProperty.loc.start.line
    || closingBrace.loc.start.line === lastProperty.loc.end.line
    || hasTwoPropertiesOnSameLine(node.properties)
  );
}

function hasTwoPropertiesOnSameLine(
  properties: readonly TSESTree.ObjectLiteralElement[],
): boolean {
  return properties.some((property, i) => {
    const nextProperty = properties.at(i + 1);
    return (
      nextProperty !== undefined
      && property.loc.end.line === nextProperty.loc.start.line
    );
  });
}

function getReplacementText(
  sourceCode: TSESLint.SourceCode,
  node: TSESTree.ObjectExpression,
  openingBrace: TSESTree.Token,
  closingBrace: TSESTree.Token,
): string | undefined {
  const range: TSESTree.Range = [openingBrace.range[1], closingBrace.range[0]];
  if (hasCommentInRange(sourceCode, range)) {
    return undefined;
  }

  const { properties } = node;
  if (!getShouldUseMultilineBraces(node)) {
    const property = properties[0];
    if (property === undefined || isMultiline(property)) {
      return undefined;
    }

    const replacementText = `{ ${sourceCode.getText(property)} }`;
    if (!canUseSingleLineBraces(sourceCode, node, replacementText)) {
      return undefined;
    }

    return replacementText;
  }

  return getMultilineReplacementText(
    sourceCode,
    properties,
    openingBrace,
    closingBrace,
  );
}

function getMultilineReplacementText(
  sourceCode: TSESLint.SourceCode,
  properties: readonly TSESTree.ObjectLiteralElement[],
  openingBrace: TSESTree.Token,
  closingBrace: TSESTree.Token,
  closingIndent = getLineIndent(sourceCode, openingBrace.loc.start.line),
): string {
  const propertyIndent = `${closingIndent}  `;
  const propertyTexts = properties.map((property, i) => {
    const nextProperty = properties.at(i + 1);
    const hasComma =
      nextProperty === undefined
        ? hasCommaAfter(sourceCode, property, closingBrace)
        : hasCommaBetween(sourceCode, property, nextProperty);
    const propertyText = getPropertyText(sourceCode, property, propertyIndent);
    return `${propertyIndent}${propertyText}${hasComma ? "," : ""}`;
  });

  return `{\n${propertyTexts.join("\n")}\n${closingIndent}}`;
}

function getPropertyText(
  sourceCode: TSESLint.SourceCode,
  property: TSESTree.ObjectLiteralElement,
  propertyIndent: string,
): string {
  if (
    property.type !== AST_NODE_TYPES.Property
    || property.value.type !== AST_NODE_TYPES.ObjectExpression
    || !getShouldUseMultilineBraces(property.value)
  ) {
    return sourceCode.getText(property);
  }

  const openingBrace = sourceCode.getFirstToken(property.value);
  const closingBrace = sourceCode.getLastToken(property.value);
  if (openingBrace === null || closingBrace === null) {
    return sourceCode.getText(property);
  }

  const range: TSESTree.Range = [openingBrace.range[1], closingBrace.range[0]];
  if (hasCommentInRange(sourceCode, range)) {
    return sourceCode.getText(property);
  }

  const prefix = sourceCode.text.slice(
    property.range[0],
    property.value.range[0],
  );
  return `${prefix}${getMultilineReplacementText(
    sourceCode,
    property.value.properties,
    openingBrace,
    closingBrace,
    propertyIndent,
  )}`;
}

function hasObjectValue(property: TSESTree.ObjectLiteralElement): boolean {
  return (
    property.type === AST_NODE_TYPES.Property
    && property.value.type === AST_NODE_TYPES.ObjectExpression
  );
}

function getShouldUseMultilineBraces(node: TSESTree.ObjectExpression): boolean {
  const firstProperty = node.properties.at(0);
  return (
    node.properties.length >= 2
    || isObjectPropertyValue(node)
    || (firstProperty !== undefined && hasObjectValue(firstProperty))
  );
}

function isObjectPropertyValue(node: TSESTree.ObjectExpression): boolean {
  const { parent } = node;
  return parent.type === AST_NODE_TYPES.Property && parent.value === node;
}

function isMultiline(node: TSESTree.Node): boolean {
  return node.loc.start.line !== node.loc.end.line;
}

function canUseSingleLineBraces(
  sourceCode: TSESLint.SourceCode,
  node: TSESTree.ObjectExpression,
  replacementText = sourceCode.getText(node),
): boolean {
  const line = sourceCode.lines[node.loc.start.line - 1];
  if (line === undefined) {
    return false;
  }

  const prefix = line.slice(0, node.loc.start.column);
  const suffix = line.slice(node.loc.end.column);
  return (
    prefix.length + replacementText.length + suffix.length
    <= PRETTIER_DEFAULT_PRINT_WIDTH
  );
}

function hasCommaAfter(
  sourceCode: TSESLint.SourceCode,
  property: TSESTree.ObjectLiteralElement,
  closingBrace: TSESTree.Token,
): boolean {
  const token = sourceCode.getTokenAfter(property);
  return (
    token !== null
    && token.value === ","
    && token.range[0] < closingBrace.range[0]
  );
}

function hasCommaBetween(
  sourceCode: TSESLint.SourceCode,
  property: TSESTree.ObjectLiteralElement,
  nextProperty: TSESTree.ObjectLiteralElement,
): boolean {
  const token = sourceCode.getTokenAfter(property);
  return (
    token !== null
    && token.value === ","
    && token.range[0] < nextProperty.range[0]
  );
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

function getLineIndent(
  sourceCode: TSESLint.SourceCode,
  lineNumber: number,
): string {
  const line = sourceCode.lines[lineNumber - 1] ?? "";
  return /^\s*/v.exec(line)?.[0] ?? "";
}
