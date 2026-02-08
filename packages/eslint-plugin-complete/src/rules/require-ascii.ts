import { createRule } from "../utils.js";

export const requireAscii = createRule({
  name: "require-ascii",
  meta: {
    type: "problem",
    docs: {
      description: "Require code and comments to only contain ASCII characters",
      recommended: true,
      requiresTypeChecking: false,
    },
    schema: [],
    messages: {
      onlyASCII: "Non-ASCII character of {{ character }} is forbidden.",
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      Program(node) {
        const text = context.sourceCode.getText();
        // eslint-disable-next-line no-control-regex
        const nonAsciiRegex = /[^\u0000-\u007F]/gu;
        let match: RegExpExecArray | null;

        while ((match = nonAsciiRegex.exec(text)) !== null) {
          context.report({
            node,
            messageId: "onlyASCII",
            data: {
              character: match[0],
            },
            loc: context.sourceCode.getLocFromIndex(match.index),
          });
        }
      },
    };
  },
});
