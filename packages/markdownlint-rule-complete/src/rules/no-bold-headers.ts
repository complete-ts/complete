import { assertDefined, parseIntSafe } from "complete-common";
import type { Rule } from "markdownlint";

export const noBoldHeaders: Rule = {
  names: ["no-bold-headers"],
  description: "Headers should not contain bolding.",
  tags: ["style"],
  parser: "markdownit",
  function: (params, onError) => {
    for (const [i, token] of params.parsers.markdownit.tokens.entries()) {
      if (token.type !== "heading_open") {
        continue;
      }

      const inlineToken = params.parsers.markdownit.tokens[i + 1];
      if (inlineToken === undefined || inlineToken.type !== "inline") {
        continue;
      }

      const { children } = inlineToken;
      if (children === null) {
        continue;
      }
      if (children.every((child) => child.type !== "strong_open")) {
        continue;
      }

      const levelString = token.tag.slice(1);
      const level = parseIntSafe(levelString);
      assertDefined(level, "Failed to parse the level.");
      const hashes = "#".repeat(level);
      const innerContent = children
        .map((child) => {
          if (child.type === "strong_open" || child.type === "strong_close") {
            return "";
          }
          if (child.type === "text") {
            return child.content;
          }
          if (child.type === "softbreak") {
            return "\n";
          }
          if (child.type === "code_inline") {
            return `${child.markup}${child.content}${child.markup}`;
          }
          return child.markup;
        })
        .join("");

      const line = params.lines[inlineToken.lineNumber - 1];
      if (line !== undefined) {
        onError({
          lineNumber: inlineToken.lineNumber,
          fixInfo: {
            editColumn: 1,
            deleteCount: line.length,
            insertText: `${hashes} ${innerContent.trim()}`,
          },
        });
      }
    }
  },
};

export default noBoldHeaders; // eslint-disable-line import-x/no-default-export
