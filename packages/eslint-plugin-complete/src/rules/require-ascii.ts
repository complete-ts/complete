import { createRule } from "../utils.js";

export type Options = [
  {
    whitelist?: string[];
  },
];

export type MessageIds = "onlyASCII";

export const requireAscii = createRule<Options, MessageIds>({
  name: "require-ascii",
  meta: {
    type: "problem",
    docs: {
      description: "Require code and comments to only contain ASCII characters",
      recommended: true,
      requiresTypeChecking: false,
    },
    schema: [
      {
        type: "object",
        properties: {
          whitelist: {
            type: "array",
            items: {
              type: "string",
            },
            description: "An array of allowed non-ASCII characters.",
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      onlyASCII: "Non-ASCII character of {{ character }} is forbidden.",
    },
  },
  defaultOptions: [
    {
      whitelist: [],
    },
  ],
  create(context, [options]) {
    const { whitelist = [] } = options;
    const whitelistSet = new Set(whitelist);

    return {
      Program(node) {
        const text = context.sourceCode.getText();
        // eslint-disable-next-line no-control-regex
        const nonAsciiRegex = /[^\u0000-\u007F]/gu;
        let match: RegExpExecArray | null;

        while ((match = nonAsciiRegex.exec(text)) !== null) {
          const character = match[0];
          if (whitelistSet.has(character)) {
            continue;
          }

          context.report({
            node,
            messageId: "onlyASCII",
            data: {
              character,
            },
            loc: context.sourceCode.getLocFromIndex(match.index),
          });
        }
      },
    };
  },
});
