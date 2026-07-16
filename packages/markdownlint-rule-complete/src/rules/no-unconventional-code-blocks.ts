import type { Rule } from "markdownlint";

const UNCONVENTIONAL_LANGUAGES: ReadonlyMap<string, string> = new Map([
  ["bash", "sh"],
  ["console", "powershell"],
  ["text", "txt"],
]);

export const noUnconventionalCodeBlocks: Rule = {
  names: ["no-unconventional-code-blocks"],
  description:
    "Unconventional code block language identifiers are not allowed.",
  tags: ["style"],
  parser: "markdownit",
  function: (params, onError) => {
    for (const token of params.parsers.markdownit.tokens) {
      if (token.type !== "fence") {
        continue;
      }

      const info = token.info.trim();
      const replacement = UNCONVENTIONAL_LANGUAGES.get(info);

      if (replacement !== undefined) {
        const line = params.lines[token.lineNumber - 1];
        if (line === undefined) {
          continue;
        }

        const markupIndex = line.indexOf(token.markup);
        const infoIndex = line.indexOf(info, markupIndex + token.markup.length);

        if (infoIndex !== -1) {
          onError({
            lineNumber: token.lineNumber,
            fixInfo: {
              editColumn: infoIndex + 1,
              deleteCount: info.length,
              insertText: replacement,
            },
          });
        }
      }
    }
  },
};

export default noUnconventionalCodeBlocks; // eslint-disable-line import-x/no-default-export
