import type { Rule } from "markdownlint";
import extendedAscii from "./rules/extended-ascii.js";
import noBoldHeaders from "./rules/no-bold-headers.js";
import noCodeBlockNewlines from "./rules/no-code-block-newlines.js";
import noCspellWords from "./rules/no-cspell-words.js";
import noHorizontalRules from "./rules/no-horizontal-rules.js";
import noImageAltText from "./rules/no-image-alt-text.js";
import noRedundantLinks from "./rules/no-redundant-links.js";
import noSpaceBeforePunctuation from "./rules/no-space-before-punctuation.js";
import noUnconventionalCodeBlocks from "./rules/no-unconventional-code-blocks.js";

const rules: Rule[] = [
  extendedAscii,
  noBoldHeaders,
  noCodeBlockNewlines,
  noCspellWords,
  noHorizontalRules,
  noImageAltText,
  noRedundantLinks,
  noSpaceBeforePunctuation,
  noUnconventionalCodeBlocks,
];
export default rules;
