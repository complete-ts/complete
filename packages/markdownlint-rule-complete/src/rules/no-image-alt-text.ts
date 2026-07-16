import type { MicromarkToken, Rule } from "markdownlint";

const noImageAltText: Rule = {
  names: ["no-image-alt-text"],
  description: "Images links must not have alt text",
  tags: ["accessibility"],
  // "micromark" is used over "markdownit" because it has more granular tokens.
  parser: "micromark",
  function: (params, onError) => {
    const images: MicromarkToken[] = [];
    traverse(params.parsers.micromark.tokens, "image", images);

    for (const image of images) {
      const labelTextTokens: MicromarkToken[] = [];
      traverse(image.children, "labelText", labelTextTokens);

      for (const labelText of labelTextTokens) {
        if (labelText.text !== "") {
          onError({
            lineNumber: labelText.startLine,
            fixInfo: {
              editColumn: labelText.startColumn,
              deleteCount: labelText.endColumn - labelText.startColumn,
            },
          });
        }
      }
    }
  },
};

export default noImageAltText;

function traverse(
  tokens: readonly MicromarkToken[],
  type: string,
  // eslint-disable-next-line complete/prefer-readonly-parameter-types
  matches: MicromarkToken[],
) {
  for (const token of tokens) {
    if (token.type === type) {
      matches.push(token);
    }
    traverse(token.children, type, matches);
  }
}
