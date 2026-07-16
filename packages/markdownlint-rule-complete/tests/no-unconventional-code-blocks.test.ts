import { expect, test } from "bun:test";
import noUnconventionalCodeBlocks from "../src/rules/no-unconventional-code-blocks.js";
import { testMarkdownlintRule } from "./utils.js";

test("no-unconventional-code-blocks", () => {
  const input = `
\`\`\`bash
ls
\`\`\`
`;
  const output = `
\`\`\`sh
ls
\`\`\`
`;
  const { errors, fixed } = testMarkdownlintRule(
    noUnconventionalCodeBlocks,
    input,
  );
  expect(errors).toHaveLength(1);
  expect(fixed).toBe(output);
});
