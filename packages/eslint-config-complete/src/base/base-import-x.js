import ESLintPluginImportX from "eslint-plugin-import-x";
import tseslint from "typescript-eslint";

/**
 * @see https://github.com/un-ts/eslint-plugin-import-x/blob/master/README.md#helpful-warnings
 * @type {Record<string, import("@typescript-eslint/utils").TSESLint.SharedConfig.RuleEntry>}
 */
const HELPFUL_WARNINGS = {
  "import-x/export": "warn",

  /**
   * Superseded by the `deprecation/deprecation` rule. (That rule is better because it catches
   * deprecated usage that does not come from import statements specifically.)
   */
  "import-x/no-deprecated": "off",

  "import-x/no-empty-named-blocks": "warn",

  /** We add common patterns to the "devDependencies" array. */
  "import-x/no-extraneous-dependencies": [
    "warn",
    {
      devDependencies: [
        // From:
        // https://github.com/airbnb/javascript/blob/master/packages/eslint-config-airbnb-base/rules/imports.js
        "test/**", // tape, common npm pattern
        "tests/**", // also common npm pattern
        "spec/**", // mocha, rspec-like pattern
        "**/__tests__/**", // jest pattern
        "**/__mocks__/**", // jest pattern
        "test.{js,jsx}", // repos with a single test file
        "test-*.{js,jsx}", // repos with multiple top-level test files
        "**/*{.,_}{test,spec}.{js,jsx}", // tests where the extension or filename suffix denotes that it is a test
        "**/jest.config.{js,cjs,mjs,ts,cts,mts}", // jest config // Modified for extra file extensions.
        "**/jest.setup.{js,cjs,mjs,ts,cts,mts}", // jest setup // Modified for extra file extensions.
        "**/vue.config.js", // vue-cli config
        "**/webpack.config.js", // webpack config
        "**/webpack.config.*.js", // webpack config
        "**/rollup.config.js", // rollup config
        "**/rollup.config.*.js", // rollup config
        "**/gulpfile.js", // gulp config
        "**/gulpfile.*.js", // gulp config
        "**/Gruntfile{,.js}", // grunt config
        "**/protractor.conf.js", // protractor config
        "**/protractor.conf.*.js", // protractor config
        "**/karma.conf.js", // karma config
        "**/.eslintrc.js", // eslint config

        "**/scripts/**/*.{js,cjs,mjs,ts,cts,mts}", // Files inside of a "scripts" directory.
        "**/tests/**/*.{js,cjs,mjs,ts,cts,mts}", // Files inside of a "tests" directory.
        "**/eslint.config.{js,cjs,mjs,ts,cts,mts}", // ESLint config
        "**/prettier.config.{js,cjs,mjs,ts,cts,mts}", // Prettier config
        "**/typedoc.config.{js,cjs,mjs,ts,cts,mts}", // TypeDoc config
        "**/typedoc.config.*.{js,cjs,mjs,ts,cts,mts}", // TypeDoc config
      ],
      optionalDependencies: false,
    },
  ],

  "import-x/no-mutable-exports": "warn",
  "import-x/no-named-as-default": "warn",

  /**
   * Disabled because this is [already handled by the TypeScript
   * compiler](https://typescript-eslint.io/linting/troubleshooting/performance-troubleshooting/#eslint-plugin-import).
   */
  "import-x/no-named-as-default-member": "off",

  /**
   * Temporarily disabled due to [false
   * positives](https://github.com/un-ts/eslint-plugin-import-x/pull/157).
   */
  "import-x/no-rename-default": "off",

  /**
   * Disabled since this check is better performed by the [`knip`](https://github.com/webpro/knip)
   * tool.
   */
  "import-x/no-unused-modules": "off",
};

/**
 * @see https://github.com/un-ts/eslint-plugin-import-x/blob/master/README.md#module-systems
 * @type {Record<string, import("@typescript-eslint/utils").TSESLint.SharedConfig.RuleEntry>}
 */
const MODULE_SYSTEMS = {
  "import-x/no-amd": "warn",
  "import-x/no-commonjs": "warn",
  "import-x/no-import-module-exports": "warn",

  /** Disabled because it is only used in specific environments (like the browser). */
  "import-x/no-nodejs-modules": "off",

  /** Disabled because this is already handled by the TypeScript compiler. */
  "import-x/unambiguous": "off",
};

/**
 * @see https://github.com/un-ts/eslint-plugin-import-x/blob/master/README.md#static-analysis
 * @type {Record<string, import("@typescript-eslint/utils").TSESLint.SharedConfig.RuleEntry>}
 */
const STATIC_ANALYSIS = {
  /**
   * Disabled because this is [already handled by the TypeScript
   * compiler](https://typescript-eslint.io/linting/troubleshooting/performance-troubleshooting/#eslint-plugin-import).
   */
  "import-x/default": "off",

  /**
   * Disabled because this is [already handled by the TypeScript
   * compiler](https://typescript-eslint.io/linting/troubleshooting/performance-troubleshooting/#eslint-plugin-import).
   */
  "import-x/named": "off",

  /**
   * Disabled because this is [already handled by the TypeScript
   * compiler](https://typescript-eslint.io/linting/troubleshooting/performance-troubleshooting/#eslint-plugin-import).
   */
  "import-x/namespace": "off",

  "import-x/no-absolute-path": "warn",
  "import-x/no-cycle": "warn",
  "import-x/no-dynamic-require": "warn",

  /** Disabled since a prescribed import pattern is not generalizable enough across projects. */
  "import-x/no-internal-modules": "off",

  "import-x/no-relative-packages": "warn",

  /**
   * Disabled since a forward import direction pattern is not generalizable enough across projects.
   */
  "import-x/no-relative-parent-imports": "off",

  /** Disabled since this rule should only contain a project-specific path restriction. */
  "import-x/no-restricted-paths": "off",

  "import-x/no-self-import": "warn",

  /**
   * Disabled because this is [already handled by the TypeScript
   * compiler](https://github.com/iamturns/eslint-config-airbnb-typescript/blob/master/lib/shared.js).
   */
  "import-x/no-unresolved": "off",

  "import-x/no-useless-path-segments": "warn",
  "import-x/no-webpack-loader-syntax": "warn",
};

/**
 * @see https://github.com/un-ts/eslint-plugin-import-x/blob/master/README.md#style-guide
 * @type {Record<string, import("@typescript-eslint/utils").TSESLint.SharedConfig.RuleEntry>}
 */
const STYLE_GUIDE = {
  "import-x/consistent-type-specifier-style": "warn",

  /** Disabled because it is only useful in environments that use webpack. */
  "import-x/dynamic-import-chunkname": "off",

  /** Disabled because this style is not generally used. */
  "import-x/exports-last": "off",

  /** Disabled because this is already handled by the TypeScript compiler. */
  "import-x/extensions": "off",

  "import-x/first": "warn",

  /** Disabled because this style is not generally used. */
  "import-x/group-exports": "off",

  /** Disabled because this rule is deprecated. */
  "import-x/imports-first": "off",

  /** Disabled since it will trigger false positives in codebases that prefer smaller files. */
  "import-x/max-dependencies": "off",

  "import-x/newline-after-import": "warn",

  /**
   * Disabled since we disallow default exports elsewhere in this config (in favor of named
   * exports).
   */
  "import-x/no-anonymous-default-export": "off",

  /**
   * The case against default exports is [laid out by Basarat Ali
   * Syed](https://basarat.gitbook.io/typescript/main-1/defaultisbad).
   */
  "import-x/no-default-export": "warn",

  "import-x/no-duplicates": "warn",
  "import-x/no-named-default": "warn",

  /**
   * Disabled since we disallow default exports elsewhere in this config (in favor of named
   * exports).
   */
  "import-x/no-named-export": "off",

  /**
   * Disabled since it is too prescriptive for a general audience. (Using `import * as` is common.)
   */
  "import-x/no-namespace": "off",

  "import-x/no-unassigned-import": "warn",

  /** Disabled because this is automatically handled by `prettier-plugin-organize-imports`. */
  "import-x/order": "off",

  /**
   * Disabled because we disallow default exports elsewhere in this config (in favor of named
   * exports).
   */
  "import-x/prefer-default-export": "off",

  "import-x/prefer-namespace-import": "warn",
};

/**
 * Omit `.d.ts` because:
 * 1. TypeScript compilation already confirms that types are resolved.
 * 2. It would mask an unresolved `.ts`/`.tsx`/`.js`/`.jsx` implementation.
 */
const TYPESCRIPT_EXTENSIONS = [".ts", ".cts", ".mts", ".tsx"];

const ALL_EXTENSIONS = [
  ...TYPESCRIPT_EXTENSIONS,
  ".js",
  ".cjs",
  ".mjs",
  ".jsx",
];

/**
 * This ESLint config only contains rules from `eslint-plugin-import-x`:
 * https://github.com/un-ts/eslint-plugin-import-x
 *
 * Rules are separated into categories:
 * 1) Helpful warnings
 * 2) Module systems
 * 3) Static analysis
 * 4) Style guide
 */
export const baseImportX = tseslint.config(
  {
    plugins: {
      "import-x": ESLintPluginImportX,
    },

    // Beyond just specifying the plugin, additional configuration is necessary to make the plugin
    // work properly with TypeScript:

    // - First, the "eslint-import-resolver-typescript" package needs to be installed, or else an
    //   error will appear: "Resolve error: typescript with invalid interface loaded as resolver"
    // - However, it is discussed in this issue to include that dep as part of
    //   "eslint-plugin-import-x" itself:
    // https://github.com/un-ts/eslint-plugin-import-x/issues/150
    // - Second, we extend the upstream TypeScript configuration:
    // https://github.com/un-ts/eslint-plugin-import-x/blob/master/src/config/typescript.ts
    settings: {
      "import-x/extensions": ALL_EXTENSIONS,
      "import-x/external-module-folders": [
        "node_modules",
        "node_modules/@types",
      ],
      "import-x/parsers": {
        "@typescript-eslint/parser": TYPESCRIPT_EXTENSIONS,
      },
      "import-x/resolver": {
        typescript: true,
      },
    },

    rules: {
      ...HELPFUL_WARNINGS,
      ...MODULE_SYSTEMS,
      ...STATIC_ANALYSIS,
      ...STYLE_GUIDE,
    },
  },

  // Disable some TypeScript-specific rules in JavaScript files.
  {
    files: ["**/*.js", "**/*.cjs", "**/*.mjs", "**/*.jsx"],
    rules: {
      "import-x/no-commonjs": "off",
    },
  },

  // Some configuration files must export a default object as a design limitation.
  {
    files: [
      ".remarkrc.js",
      ".remarkrc.mjs",
      "docusaurus.config.js",
      "docusaurus.config.ts",
      "eslint.config.js",
      "eslint.config.cjs",
      "eslint.config.mjs",
      "eslint.config.ts",
      "eslint.config.cts",
      "eslint.config.mts",
      "jest.config.js",
      "jest.config.mjs",
      "knip.js",
      "knip.ts",
      "knip.config.js",
      "knip.config.ts",
      "prettier.config.js",
      "prettier.config.mjs",
      "rollup.config.js",
      "rollup.config.mjs",
      "sidebars.js", // Docusaurus config file
      "sidebars.ts", // Docusaurus config file
      "typedoc.config.js",
      "typedoc.config.mjs",
      "vite.config.js",
      "vite.config.mjs",
      "webpack.config.js",
      "webpack.config.mjs",
    ],
    rules: {
      "import-x/no-default-export": "off",
    },
  },

  {
    files: [
      "eslint.config.js",
      "eslint.config.cjs",
      "eslint.config.mjs",
      "eslint.config.ts",
      "eslint.config.cts",
      "eslint.config.mts",
    ],
    rules: {
      // ESLint configuration files that use "complete-lint" have a false positive with
      // "import-x/no-extraneous-dependencies".
      "import-x/no-extraneous-dependencies": [
        "warn",
        {
          devDependencies: ["**/eslint.config.{js,cjs,mjs,ts,cts,mts}"],
          optionalDependencies: false,
          whitelist: ["eslint-config-complete", "typescript-eslint"],
        },
      ],

      // ESLint configuration files in monorepos often intentionally import from the "packages"
      // subdirectory, because the config files are JavaScript so they cannot use tsconfig-paths.
      "import-x/no-relative-packages": "off",
    },
  },
);
