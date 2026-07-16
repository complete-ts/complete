import type { MarkdownItBaseToken, Rule } from "markdownlint";

export const noRedundantLinks: Rule = {
  names: ["no-redundant-links"],
  description:
    "Redundant links should be avoided (link text is the same as the URL)",
  tags: ["links"],
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
      for (const [i, child] of children.entries()) {
        if (child.type !== "link_open") {
          continue;
        }

        const href = getAttr(child, "href");
        const textToken = children[i + 1];
        if (
          textToken !== undefined
          && textToken.type === "text"
          && textToken.content === href
        ) {
          onError({
            lineNumber: getLineNumber(child, token.lineNumber),
            detail: `Redundant link: [${href}](${href})`,
          });
        }
      }
    }
  },
};

function getAttr(token: MarkdownItBaseToken, name: string): string | undefined {
  const attrs = token.attrs ?? [];
  for (const attr of attrs) {
    const key = attr[0];
    const value = attr[1];
    if (key === name) {
      return value;
    }
  }
  return undefined;
}

function getLineNumber(token: object, fallback: number): number {
  if ("lineNumber" in token && typeof token.lineNumber === "number") {
    return token.lineNumber;
  }
  return fallback;
}
