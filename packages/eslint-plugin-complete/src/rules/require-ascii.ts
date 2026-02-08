import { createRule } from "../utils.js";

// eslint-disable-next-line no-control-regex
const ASCII_REGEX = /^[\u0000-\u007F]+$/g;

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
      Identifier(node) {
        const { name } = node;
        const matches = ASCII_REGEX.test(name);

        if (matches) {
          context.report({
            node,
            messageId: "onlyASCII",
            data: {
              character: matches,
            },
            loc: {
              line: node.loc.start.line,
              column: node.loc.start.column,
            },
          });
        }
      },
    };
  },
});
