import { strictEqual } from "node:assert";
import { describe, test } from "node:test";
import { getTruncatedText } from "./getTruncatedText.js";

describe("getTruncatedText", () => {
  test("no markers", () => {
    const templateText = `
line 1
line 2
line 3
`.trim();

    const { text } = getTruncatedText(
      "test",
      templateText,
      new Set(),
      new Set(),
    );
    strictEqual(text, templateText);
  });

  test("customization marker", () => {
    const templateText = `
line 1
@template-customization-start
line 2
@template-customization-end
line 3
  `.trim();

    const expectedTemplateText = `
line 1
line 3
  `.trim();

    const { text } = getTruncatedText(
      "test",
      templateText,
      new Set(),
      new Set(),
    );
    strictEqual(text, expectedTemplateText);
  });

  test("ignore block marker part 1", () => {
    const templateText = `
line 1
@template-ignore-block-start
// line 2
@template-ignore-block-end
line 3
  `.trim();

    const parsedTemplateText = `
line 1
line 3
  `.trim();

    const { text, ignoreLines } = getTruncatedText(
      "test",
      templateText,
      new Set(),
      new Set(),
    );
    strictEqual(text, parsedTemplateText);
    strictEqual(ignoreLines.size, 1);
    strictEqual([...ignoreLines][0], "line 2");
  });

  test("ignore block marker part 2", () => {
    const templateText = `
line 1
line 2
line 3
  `.trim();

    const expectedTemplateText = `
line 1
line 3
  `.trim();

    const { text } = getTruncatedText(
      "test",
      templateText,
      new Set(["line 2"]),
      new Set(),
    );
    strictEqual(text, expectedTemplateText);
  });

  test("ignore next line part 1", () => {
    const templateText = `
line 1
@template-ignore-next-line
line 2
line 3
  `.trim();

    const expectedTemplateText = `
line 1
line 3
  `.trim();

    const { text, linesBeforeIgnore } = getTruncatedText(
      "test",
      templateText,
      new Set(),
      new Set(),
    );
    strictEqual(linesBeforeIgnore.size, 1);
    strictEqual([...linesBeforeIgnore][0], "line 1");
    strictEqual(text, expectedTemplateText);
  });

  test("ignore next line part 2", () => {
    const templateText = `
line 1
line 2
line 3
  `.trim();

    const expectedTemplateText = `
line 1
line 3
  `.trim();

    const { text } = getTruncatedText(
      "test",
      templateText,
      new Set(),
      new Set(["line 1"]),
    );
    strictEqual(text, expectedTemplateText);
  });

  test("ignore extraneous new lines", () => {
    const templateText = `
# Compiled output
dist

# Package manager lock files
package-lock.json
yarn.lock
pnpm-lock.yaml
bun.lock

# Minified files
*.min.js
*.min.css

# @template-customization-start

# Rules copied from ESLint
packages/eslint-plugin-complete/src/rules/eqeqeq-fix.ts
packages/eslint-plugin-complete/src/rules/no-useless-return.ts
packages/eslint-plugin-complete/src/rules/prefer-const.ts

# @template-customization-end
  `.trim();

    const expectedTemplateText = `
# Compiled output
dist

# Package manager lock files
package-lock.json
yarn.lock
pnpm-lock.yaml
bun.lock

# Minified files
*.min.js
*.min.css
  `.trim();

    const { text } = getTruncatedText(
      "test",
      templateText,
      new Set(),
      new Set(["line 1"]),
    );
    strictEqual(text, expectedTemplateText);
  });
});
