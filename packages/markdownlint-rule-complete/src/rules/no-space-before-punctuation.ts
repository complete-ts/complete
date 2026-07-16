import type { Rule } from "markdownlint";

export const noSpaceBeforePunctuation: Rule = {
  names: ["no-space-before-punctuation"],
  description: "Accidental space before a period or comma.",
  tags: ["style"],
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

        for (let index = 1; index < child.content.length; index++) {
          const character = child.content[index];
          if (character !== "." && character !== ",") {
            continue;
          }

          const nextCharacter = child.content[index + 1];
          if (nextCharacter !== undefined && !/\s/v.test(nextCharacter)) {
            continue;
          }

          let firstSpaceIndex = index;
          while (child.content[firstSpaceIndex - 1] === " ") {
            firstSpaceIndex--;
          }

          const spacesToDelete = index - firstSpaceIndex;
          if (spacesToDelete === 0) {
            continue;
          }

          const contentBefore = child.content.slice(0, firstSpaceIndex);
          const linesBefore = contentBefore.split("\n");
          const lineOffset = linesBefore.length - 1;
          const { lineNumber: parentLineNumber } = token;
          let { lineNumber } = child;
          if (lineNumber === 0) {
            lineNumber = parentLineNumber;
          }
          lineNumber += lineOffset;

          const line = params.lines[lineNumber - 1];
          if (line === undefined) {
            continue;
          }

          const lastLineInChild = linesBefore[lineOffset];
          if (lastLineInChild === undefined) {
            continue;
          }
          const columnOffset = line.indexOf(lastLineInChild);

          if (columnOffset !== -1) {
            onError({
              lineNumber,
              fixInfo: {
                editColumn: columnOffset + lastLineInChild.length + 1,
                deleteCount: spacesToDelete,
              },
            });
          }
        }
      }
    }
  },
};
