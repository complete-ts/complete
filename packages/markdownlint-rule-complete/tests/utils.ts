import { assertDefined } from "complete-common";
import markdownIt from "markdown-it";
import type { Options, Rule } from "markdownlint";
import { applyFixes } from "markdownlint";
import { lint as sync } from "markdownlint/sync";

// This function should not have an explicit return type since it would violate DRY.
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function testMarkdownlintRule(rule: Rule, input: string) {
  const ruleName = rule.names[0];
  assertDefined(ruleName, "Failed to get the markdownlint rule name.");

  const options: Options = {
    config: {
      default: false,
      [ruleName]: true,
    },

    customRules: [rule],

    /**
     * Needed to avoid errors like:
     *
     * ```txt
     * error: The option 'markdownItFactory' was required (due to the option 'customRules' including
     * a rule requiring the 'markdown-it' parser), but 'markdownItFactory' was not set.
     * ```
     */
    markdownItFactory: () => markdownIt(),

    strings: {
      content: input,
    },
  };

  const result = sync(options);
  const { content: errors } = result;
  assertDefined(errors, 'Failed to get the "content" field from the result.');
  const fixed = applyFixes(input, errors);

  return {
    errors,
    fixed,
  };
}
