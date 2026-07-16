import type { Rule } from "markdownlint";

const EMOJI_WHITELIST: ReadonlySet<string> = new Set(["\u{2705}", "\u{274C}"]);

/**
 * Based on:
 * https://github.com/DavidAnson/markdownlint-rule-extended-ascii/blob/main/extended-ascii.cjs
 */
const extendedAscii: Rule = {
  names: ["extended-ascii"],
  description: "Only extended ASCII characters are allowed",
  tags: ["accessibility"],
  parser: "markdownit",
  function: (params, onError) => {
    for (const token of params.parsers.markdownit.tokens) {
      if (token.type !== "inline") {
        continue;
      }

      const { children } = token;
      if (children === null) {
        continue;
      }

      for (const child of children) {
        if (child.type !== "text") {
          continue;
        }

        let characterIndex = 0;
        for (const character of child.content) {
          if (EMOJI_WHITELIST.has(character)) {
            characterIndex += character.length;
            continue;
          }

          const codePoint = character.codePointAt(0);
          if (
            codePoint !== undefined
            && codePoint >= 0x20
            && codePoint <= 0x7e
          ) {
            characterIndex += character.length;
            continue;
          }

          const lineOffset = (
            child.content.slice(0, characterIndex).match(/\n/gv) ?? []
          ).length;
          const lineNumber = child.lineNumber + lineOffset;

          // Note: range might be tricky here if there are newlines, but for inline tokens it's
          // usually fine.
          onError({
            lineNumber,
            detail: `Blocked character: '${character}'`,
          });

          characterIndex += character.length;
        }
      }
    }
  },
};

export default extendedAscii;
