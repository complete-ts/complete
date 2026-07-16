import type { Rule } from "markdownlint";

const noHorizontalRules: Rule = {
  names: ["no-horizontal-rules"],
  description: "Horizontal rules are not allowed",
  tags: ["style"],
  parser: "markdownit",
  function: (params, onError) => {
    for (const token of params.parsers.markdownit.tokens) {
      if (token.type === "hr") {
        onError({
          lineNumber: token.lineNumber,
          fixInfo: {
            deleteCount: -1,
          },
        });
      }
    }
  },
};

export default noHorizontalRules;
