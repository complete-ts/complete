import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import { createRule } from "../utils.js";

type Options = [];
type MessageIds = "consistentObjectBraces";

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

  const propertyCount = node.properties.length;
  const needsFix =
    propertyCount === 1
      ? !isMultiline(firstProperty)
        && (openingBrace.loc.end.line !== firstProperty.loc.start.line
          || closingBrace.loc.start.line !== lastProperty.loc.end.line)
      : openingBrace.loc.end.line === firstProperty.loc.start.line
        || closingBrace.loc.start.line === lastProperty.loc.end.line
        || hasTwoPropertiesOnSameLine(node.properties);

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
  if (properties.length === 1) {
    const property = properties[0];
    if (property === undefined || isMultiline(property)) {
      return undefined;
    }

    return `{ ${sourceCode.getText(property)} }`;
  }

  const closingIndent = getLineIndent(sourceCode, openingBrace.loc.start.line);
  const propertyIndent = `${closingIndent}  `;
  const propertyTexts = properties.map((property, i) => {
    const nextProperty = properties.at(i + 1);
    const hasComma =
      nextProperty === undefined
        ? hasCommaAfter(sourceCode, property, closingBrace)
        : hasCommaBetween(sourceCode, property, nextProperty);
    return `${propertyIndent}${sourceCode.getText(property)}${hasComma ? "," : ""}`;
  });

  return `{\n${propertyTexts.join("\n")}\n${closingIndent}}`;
}

function isMultiline(node: TSESTree.Node): boolean {
  return node.loc.start.line !== node.loc.end.line;
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
