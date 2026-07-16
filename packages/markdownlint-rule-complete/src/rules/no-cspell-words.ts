import type { Rule } from "markdownlint";

const CSPELL_WORDS_DIRECTIVE = /cspell:\s*words/giv;

export const noCspellWords: Rule = {
  names: ["no-cspell-words"],
  description: "CSpell words directives are not allowed.",
  tags: ["style"],
  parser: "micromark",
  function: (params, onError) => {
    for (const token of params.parsers.micromark.tokens) {
      for (const match of token.text.matchAll(CSPELL_WORDS_DIRECTIVE)) {
        const contentBefore = token.text.slice(0, match.index);
        const lineOffset = (contentBefore.match(/\n/gv) ?? []).length;

        onError({
          lineNumber: token.startLine + lineOffset,
          detail:
            "If these words are truly spelled correctly, whitelist them in the CSpell configuration file instead.",
        });
      }
    }
  },
};

export default noCspellWords;
