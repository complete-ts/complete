import type { Rule } from "markdownlint";

export const noCodeBlockNewlines: Rule = {
  names: ["no-code-block-newlines"],
  description:
    "Code blocks must not have leading or trailing blank lines inside the fences.",
  tags: ["style", "spacing"],
  parser: "markdownit",
  function: (params, onError) => {
    for (const token of params.parsers.markdownit.tokens) {
      if (token.type !== "fence") {
        continue;
      }

      // eslint-disable-next-line complete/prefer-is-array
      if (!Array.isArray(token.map)) {
        continue;
      }

      const startLine = token.map[0];
      const endLine = token.map[1];
      if (startLine === undefined || endLine === undefined) {
        continue;
      }

      const firstContentLine = startLine + 1;
      const closingFenceLine = endLine - 1;

      if (firstContentLine < closingFenceLine) {
        const line = params.lines[firstContentLine];
        if (line !== undefined && line.trim() === "") {
          onError({
            lineNumber: firstContentLine + 1,
            fixInfo: {
              deleteCount: -1,
            },
          });
        }
      }

      const lastContentLine = closingFenceLine - 1;
      if (
        lastContentLine > startLine
        && lastContentLine >= firstContentLine
        && lastContentLine !== firstContentLine
      ) {
        const line = params.lines[lastContentLine];
        if (line !== undefined && line.trim() === "") {
          onError({
            lineNumber: lastContentLine + 1,
            fixInfo: {
              deleteCount: -1,
            },
          });
        }
      }
    }
  },
};
