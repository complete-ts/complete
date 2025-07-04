import confusingBrowserGlobals from "confusing-browser-globals";
import tseslint from "typescript-eslint";

/**
 * @see https://eslint.org/docs/latest/rules/#possible-problems
 * @type {Record<string, import("@typescript-eslint/utils").TSESLint.SharedConfig.RuleEntry>}
 */
const POSSIBLE_PROBLEMS = {
  /** The `checkForEach` option is enabled to make the rule stricter. */
  "array-callback-return": [
    "warn",
    {
      checkForEach: true,
    },
  ],

  "constructor-super": "off", // @typescript-eslint/eslint-recommended
  "for-direction": "warn",
  "getter-return": "off", // @typescript-eslint/eslint-recommended
  "no-async-promise-executor": "warn",
  "no-await-in-loop": "warn",
  "no-class-assign": "warn",
  "no-compare-neg-zero": "warn",
  "no-cond-assign": "warn",
  "no-const-assign": "off", // @typescript-eslint/eslint-recommended
  "no-constant-binary-expression": "warn",
  "no-constant-condition": "warn",
  "no-constructor-return": "warn",
  "no-control-regex": "warn",
  "no-debugger": "warn",
  "no-dupe-args": "off", // @typescript-eslint/eslint-recommended
  "no-dupe-class-members": "off", // @typescript-eslint/eslint-recommended
  "no-dupe-else-if": "warn",
  "no-dupe-keys": "off", // @typescript-eslint/eslint-recommended
  "no-duplicate-case": "warn",

  /** Superseded by the `import-x/no-duplicates` rule. */
  "no-duplicate-imports": "off",

  "no-empty-character-class": "warn",
  "no-empty-pattern": "warn",
  "no-ex-assign": "warn",
  "no-fallthrough": "warn",
  "no-func-assign": "off", // @typescript-eslint/eslint-recommended
  "no-import-assign": "off", // @typescript-eslint/eslint-recommended
  "no-inner-declarations": "warn",
  "no-invalid-regexp": "warn",
  "no-irregular-whitespace": "warn",

  /** Superseded by the `@typescript-eslint/no-loss-of-precision` rule. */
  "no-loss-of-precision": "off",

  "no-misleading-character-class": "warn",
  "no-new-native-nonconstructor": "warn",
  "no-obj-calls": "off", // @typescript-eslint/eslint-recommended`
  "no-promise-executor-return": "warn",
  "no-prototype-builtins": "warn",
  "no-self-assign": "warn",
  "no-self-compare": "warn",
  "no-setter-return": "off", // @typescript-eslint/eslint-recommended
  "no-sparse-arrays": "warn",
  "no-template-curly-in-string": "warn",
  "no-this-before-super": "off", // @typescript-eslint/eslint-recommended`
  "no-unassigned-vars": "warn",
  "no-undef": "off", // @typescript-eslint/eslint-recommended
  "no-unexpected-multiline": "off", // eslint-config-prettier
  "no-unmodified-loop-condition": "warn",
  "no-unreachable": "off", // @typescript-eslint/eslint-recommended
  "no-unreachable-loop": "warn",
  "no-unsafe-finally": "warn",
  "no-unsafe-negation": "off", // @typescript-eslint/eslint-recommended
  "no-unsafe-optional-chaining": "warn",
  "no-unused-private-class-members": "warn",

  /** Superseded by the `@typescript-eslint/no-unused-vars` rule. */
  "no-unused-vars": "off",

  /** Superseded by the `@typescript-eslint/no-use-before-define` rule. */
  "no-use-before-define": "off",

  "no-useless-backreference": "warn",

  /**
   * Disabled since [Airbnb reports that the rule is "very
   * buggy"](https://github.com/airbnb/javascript/blob/master/packages/eslint-config-airbnb-base/rules/errors.js).
   */
  "require-atomic-updates": "off",

  "use-isnan": "warn",
  "valid-typeof": "warn",
};

/**
 * @see https://eslint.org/docs/latest/rules/#suggestions
 * @type {Record<string, import("@typescript-eslint/utils").TSESLint.SharedConfig.RuleEntry>}
 */
const SUGGESTIONS = {
  "accessor-pairs": "warn",
  "arrow-body-style": "warn",
  "block-scoped-var": "warn",

  /**
   * Superseded by the `@typescript-eslint/naming-convention` rule. (`camelcase` is used to enforce
   * naming conventions.)
   */
  camelcase: "off",

  /**
   * Superseded by the `complete/complete-sentences-jsdoc` and
   * `complete/complete-sentences-line-comments` rules.
   */
  "capitalized-comments": "off",

  /** Superseded by the `@typescript-eslint/class-methods-use-this` rule. */
  "class-methods-use-this": "off",

  /**
   * Disabled since cyclomatic complexity is not a good enough general indicator of code complexity
   * and leads to too many false positives.
   */
  complexity: "off",

  /** Superseded by the `@typescript-eslint/consistent-return` rule. */
  "consistent-return": "off",

  "consistent-this": "warn",

  /**
   * Always requiring curly braces can partially ward against [Apple-style if statement
   * bugs](https://www.imperialviolet.org/2014/02/22/applebug.html). Additionally, this rule needs
   * to be set to "all" to [work properly with
   * `eslint-prettier-config`](https://github.com/prettier/eslint-config-prettier#curly).
   */
  curly: ["warn", "all"],

  /**
   * Disabled since it would cause the `@typescript-eslint/switch-exhaustiveness-check` rule to not
   * work properly.
   */
  "default-case": "off",

  "default-case-last": "warn",

  /** Superseded by the `@typescript-eslint/default-param-last` rule. */
  "default-param-last": "off",

  /** Superseded by the `@typescript-eslint/dot-notation` rule. */
  "dot-notation": "off",

  /** Superseded by the `complete/eqeqeq-fix` rule. */
  eqeqeq: "off",

  "func-name-matching": "warn",
  "func-names": "warn",

  /**
   * Disabled since it is common in the TypeScript ecosystem to use both function forms, depending
   * on the situation.
   */
  "func-style": "off",

  "grouped-accessor-pairs": "warn",

  /** Superseded by the `complete/no-for-in` rule. */
  "guard-for-in": "off",

  /** Disabled since it is expected to be configured with project-specific keywords. */
  "id-denylist": "off",

  /** Disabled because short variable names are understandable in many contexts. */
  "id-length": "off",

  /**
   * Superseded by the `@typescript-eslint/naming-convention` rule. (`id-match` is used to enforce
   * naming conventions.)
   */
  "id-match": "off",

  /** Superseded by the `@typescript-eslint/init-declarations` rule. */
  "init-declarations": "off",

  /** The `enforceForIfStatements` option is enabled to make the rule stricter. */
  "logical-assignment-operators": [
    "warn",
    "always",
    {
      enforceForIfStatements: true,
    },
  ],

  "max-classes-per-file": "warn",

  /** Disabled since this rule is too prescriptive for general-purpose use. */
  "max-depth": "off",

  /**
   * Disabled because enforcing an arbitrary line threshold for every file in a project does not
   * provide much value.
   */
  "max-lines": "off",

  /**
   * Disabled because enforcing an arbitrary line threshold for every function in a project does not
   * provide much value.
   */
  "max-lines-per-function": "off",

  "max-nested-callbacks": "warn",

  /** Superseded by the `@typescript-eslint/max-params` rule. */
  "max-params": "off",

  /**
   * Disabled because enforcing an arbitrary statement threshold for every function in a project
   * does not provide much value.
   */
  "max-statements": "off",

  "new-cap": "warn",
  "no-alert": "warn",

  /** Superseded by the `@typescript-eslint/no-array-constructor` rule. */
  "no-array-constructor": "off",

  "no-bitwise": "warn",
  "no-caller": "warn",
  "no-case-declarations": "warn",

  /**
   * Disabled because command-line programs written in TypeScript commonly write to standard out and
   * standard error.
   */
  "no-console": "off",

  /**
   * Disabled because proper use of continues can reduce indentation for long blocks of code in the
   * same way as the [early return
   * pattern](https://medium.com/swlh/return-early-pattern-3d18a41bba8).
   */
  "no-continue": "off",

  "no-delete-var": "warn",

  /** Disabled since it is incompatible with the `unicorn/better-regex` rule. */
  "no-div-regex": "off",

  /** The `allowElseIf` option is disabled to make the rule stricter. */
  "no-else-return": [
    "warn",
    {
      allowElseIf: false,
    },
  ],

  "no-empty": "warn",

  /** Superseded by the `@typescript-eslint/no-empty-function` rule. */
  "no-empty-function": "off",

  "no-empty-static-block": "warn",
  "no-eq-null": "warn",
  "no-eval": "warn",
  "no-extend-native": "warn",
  "no-extra-bind": "warn",
  "no-extra-boolean-cast": "warn",
  "no-extra-label": "warn",
  "no-global-assign": "warn",
  "no-implicit-coercion": "warn",
  "no-implicit-globals": "warn",

  /** Superseded by the `@typescript-eslint/no-implied-eval` rule. */
  "no-implied-eval": "off",

  /** Disabled because inline comments are common in the TypeScript ecosystem. */
  "no-inline-comments": "off",

  /** Superseded by the `@typescript-eslint/no-invalid-this` rule. */
  "no-invalid-this": "off",

  "no-iterator": "warn",
  "no-label-var": "warn",
  "no-labels": "warn",
  "no-lone-blocks": "warn",
  "no-lonely-if": "warn",

  /** Superseded by the `@typescript-eslint/no-loop-func` rule. */
  "no-loop-func": "off",

  /** Superseded by the `@typescript-eslint/no-magic-numbers` rule. */
  "no-magic-numbers": "off",

  "no-multi-assign": "warn",
  "no-multi-str": "warn",

  /** Superseded by the `unicorn/no-negated-condition` rule. */
  "no-negated-condition": "off",

  /**
   * `unicorn/no-nested-ternary` is a modified version of this rule but that version is less strict.
   */
  "no-nested-ternary": "warn",

  "no-new": "warn",
  "no-new-func": "warn",
  "no-new-wrappers": "warn",
  "no-nonoctal-decimal-escape": "warn",
  "no-object-constructor": "warn",
  "no-octal": "warn",
  "no-octal-escape": "warn",

  /**
   * The options are [copied from
   * Airbnb](https://github.com/airbnb/javascript/blob/master/packages/eslint-config-airbnb-base/rules/best-practices.js).
   */
  "no-param-reassign": [
    "warn",
    {
      props: true,
      ignorePropertyModificationsFor: [
        "acc", // for reduce accumulators
        "accumulator", // for reduce accumulators
        "e", // for e.returnvalue
        "ctx", // for Koa routing
        "context", // for Koa routing
        "req", // for Express requests
        "request", // for Express requests
        "res", // for Express responses
        "response", // for Express responses
        "$scope", // for Angular 1 scopes
        "staticContext", // for ReactRouter context
      ],
    },
  ],

  /**
   * Disabled because the rule is unnecessary when using Prettier. (Unary operators can lead to
   * errors with minified code, but Prettier adds semicolons automatically.)
   */
  "no-plusplus": "off",

  "no-proto": "warn",

  /** Superseded by the `@typescript-eslint/block-spacing` rule. */
  "no-redeclare": "off",

  "no-regex-spaces": "warn",

  /**
   * The options are [copied from
   * Airbnb](https://github.com/airbnb/javascript/blob/master/packages/eslint-config-airbnb-base/rules/es6.js).
   */
  "no-restricted-exports": [
    "warn",
    {
      restrictedNamedExports: [
        "default", // use `export default` to provide a default export
        "then", // this will cause tons of confusion when your module is dynamically `import()`ed, and will break in most node ESM versions
      ],
    },
  ],

  /**
   * The options are [copied from
   * Airbnb](https://github.com/airbnb/javascript/blob/master/packages/eslint-config-airbnb-base/rules/variables.js).
   */
  "no-restricted-globals": [
    "warn",
    {
      name: "isFinite",
      message:
        "Use Number.isFinite instead: https://github.com/airbnb/javascript#standard-library--isfinite",
    },
    {
      name: "isNaN",
      message:
        "Use Number.isNaN instead: https://github.com/airbnb/javascript#standard-library--isnan",
    },
    ...confusingBrowserGlobals,
  ],

  /** Superseded by the `@typescript-eslint/no-restricted-imports` rule. */
  "no-restricted-imports": "off",

  /**
   * The options are [copied from
   * Airbnb](https://github.com/airbnb/javascript/blob/master/packages/eslint-config-airbnb-base/rules/best-practices.js).
   */
  "no-restricted-properties": [
    "warn",
    {
      object: "arguments",
      property: "callee",
      message: "arguments.callee is deprecated",
    },
    {
      object: "global",
      property: "isFinite",
      message: "Please use Number.isFinite instead",
    },
    {
      object: "self",
      property: "isFinite",
      message: "Please use Number.isFinite instead",
    },
    {
      object: "window",
      property: "isFinite",
      message: "Please use Number.isFinite instead",
    },
    {
      object: "global",
      property: "isNaN",
      message: "Please use Number.isNaN instead",
    },
    {
      object: "self",
      property: "isNaN",
      message: "Please use Number.isNaN instead",
    },
    {
      object: "window",
      property: "isNaN",
      message: "Please use Number.isNaN instead",
    },
    {
      property: "__defineGetter__",
      message: "Please use Object.defineProperty instead.",
    },
    {
      property: "__defineSetter__",
      message: "Please use Object.defineProperty instead.",
    },
    {
      object: "Math",
      property: "pow",
      message: "Use the exponentiation operator (**) instead.",
    },
  ],

  /** Disabled because it is intended for disallowing specific language features per-project. */
  "no-restricted-syntax": "off",

  /** The `always` option is provided to make the rule stricter. */
  "no-return-assign": ["warn", "always"],

  "no-script-url": "warn",

  /**
   * Disabled because [it can conflict with
   * Prettier](https://github.com/prettier/eslint-config-prettier/tree/main#no-sequences).
   */
  "no-sequences": "off",

  /** Superseded by the `@typescript-eslint/no-shadow` rule. */
  "no-shadow": "off",

  "no-shadow-restricted-names": "warn",

  /**
   * Disabled because ternaries are common in the TypeScript ecosystem and can often lead to concise
   * code that is easy to read.
   */
  "no-ternary": "off",

  /** Superseded by the `@typescript-eslint/no-throw-literal` rule. */
  "no-throw-literal": "off",

  "no-undef-init": "warn",

  /**
   * Disabled because in TypeScript, it is common to explicitly check for undefined for the purposes
   * of type narrowing.
   */
  "no-undefined": "off",

  /**
   * Disabled since it is a common pattern to use underscores to temporarily allow unused variables
   * during development.
   */
  "no-underscore-dangle": "off",

  /** The `defaultAssignment` option is disabled to make the rule stricter. */
  "no-unneeded-ternary": [
    "warn",
    {
      defaultAssignment: false,
    },
  ],

  /** Superseded by the `@typescript-eslint/no-unused-expressions` rule. */
  "no-unused-expressions": "off",

  "no-unused-labels": "warn",
  "no-useless-assignment": "warn",
  "no-useless-call": "warn",
  "no-useless-catch": "warn",

  /** The `enforceForClassMembers` option is enabled to make the rule stricter. */
  "no-useless-computed-key": [
    "warn",
    {
      enforceForClassMembers: true,
    },
  ],

  "no-useless-concat": "warn",

  /** Superseded by the `@typescript-eslint/no-useless-constructor` rule. */
  "no-useless-constructor": "off",

  "no-useless-escape": "warn",
  "no-useless-rename": "warn",

  /**
   * Superseded by the `complete/no-useless-return` rule (since the auto-fix is usually unwanted).
   */
  "no-useless-return": "off",

  "no-var": "warn",
  "no-void": "warn",

  /** Superseded by the `unicorn/expiring-todo-comments` rule. */
  "no-warning-comments": "off",

  "no-with": "warn",

  /** The `ignoreConstructors` option is disabled to make the rule stricter. */
  "object-shorthand": [
    "warn",
    "always",
    {
      ignoreConstructors: false,
    },
  ],

  /**
   * The `never` option is provided to disallow multi-variable declarations (since they can be
   * confusing).
   */
  "one-var": ["warn", "never"],

  "operator-assignment": "warn",
  "prefer-arrow-callback": "warn",

  /** Superseded by the `complete/prefer-const` rule (since the auto-fix is usually unwanted). */
  "prefer-const": "off",

  /** Superseded by the `@typescript-eslint/prefer-destructuring` rule. */
  "prefer-destructuring": "off",

  "prefer-exponentiation-operator": "warn",

  /**
   * Disabled because it is common to have a regex with only a single match, in which case a named
   * capture group can be needlessly verbose (and cause extra type narrowing).
   */
  "prefer-named-capture-group": "off",

  "prefer-numeric-literals": "warn",
  "prefer-object-has-own": "warn",
  "prefer-object-spread": "warn",

  /** Superseded by the `@typescript-eslint/prefer-promise-reject-errors` rule. */
  "prefer-promise-reject-errors": "off",

  /** The `disallowRedundantWrapping` option is enabled to make the rule stricter. */
  "prefer-regex-literals": [
    "warn",
    {
      disallowRedundantWrapping: true,
    },
  ],

  "prefer-rest-params": "warn",
  "prefer-spread": "warn",
  "prefer-template": "warn",
  radix: "warn",

  /** Superseded by the `@typescript-eslint/require-await` rule. */
  "require-await": "off",

  /**
   * Disabled because requiring the `u` or the `v` flag for ASCII text is verbose and cumbersome.
   * (Even though these flags would also enable regex strict mode, the marginal benefit is not worth
   * the verbosity.)
   */
  "require-unicode-regexp": "off",

  "require-yield": "warn",

  /** Disabled since this is automatically handled by `prettier-plugin-organize-imports`. */
  "sort-imports": "off",

  /** Disabled because object keys are often not meant to be sorted in alphabetical order. */
  "sort-keys": "off",

  /**
   * Disabled because variable declarations are often not meant to be sorted in alphabetical order.
   */
  "sort-vars": "off",

  /** The `never` option is provided to make the rule stricter. */
  strict: ["warn", "never"],

  "symbol-description": "warn",
  "vars-on-top": "warn",
  yoda: "warn",
};

/**
 * @see https://eslint.org/docs/latest/rules/#suggestions
 * @type {Record<string, import("@typescript-eslint/utils").TSESLint.SharedConfig.RuleEntry>}
 */
const LAYOUT_AND_FORMATTING = {
  "unicode-bom": "warn",
};

/**
 * This ESLint config only contains built-in rules from ESLint itself:
 * https://eslint.org/docs/latest/rules/
 *
 * Rules are separated into categories:
 * 1) Possible Problems
 * 2) Suggestions
 * 3) Layout & Formatting
 */
export const baseESLint = tseslint.config({
  rules: {
    ...POSSIBLE_PROBLEMS,
    ...SUGGESTIONS,
    ...LAYOUT_AND_FORMATTING,
  },
});
