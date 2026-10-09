import { createRule } from "../utils.js";

export const noPrivateIdentifiers = createRule({
  name: "no-private-identifiers",
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallows # private members in favor of the TypeScript private modifier",
      recommended: true,
      requiresTypeChecking: false,
    },
    schema: [],
    messages: {
      noPrivateIdentifiers:
        "Use the TypeScript private modifier instead of # private members.",
    },
  },
  defaultOptions: [],
  create: (context) => ({
    PrivateIdentifier(node) {
      context.report({
        node,
        messageId: "noPrivateIdentifiers",
      });
    },
  }),
});
