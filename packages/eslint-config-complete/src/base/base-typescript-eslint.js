import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

/**
 * This ESLint config only contains rules from `@typescript-eslint/eslint-plugin`:
 * https://typescript-eslint.io/rules/
 */
export const baseTypeScriptESLint = defineConfig(
  {
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },

    // We need to provide some special configuration to ESLint in order for it to parse TypeScript
    // files. From:
    // https://typescript-eslint.io/packages/typescript-eslint/#advanced-usage
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: {
          // We whitelist some specific configuration files that downstream users may have in their
          // projects. These files should be linted but should not be included in compiled output.
          allowDefaultProject: [
            "*.config.{js,cjs,mjs,ts,cts,mts}", // Config files like "eslint.config.mjs"
            "*.config.*.{js,cjs,mjs,ts,cts,mts}", // Config files like "eslint.config.json.mjs"
            "Gruntfile.js",
            "Gruntfile.cjs",
            "Gruntfile.mjs",
          ],

          // By default, the whitelisted files above will use the default TypeScript compiler
          // options. However, certain ESLint rules such as
          // "@typescript-eslint/no-unnecessary-condition" and
          // "@typescript-eslint/prefer-nullish-coalescing" require "strictNullChecks", which is not
          // a default option. Thus, we need to specify that whitelisted files should use the
          // "tsconfig.json" file that is beside the file in the same directory.
          defaultProject: "tsconfig.json",
        },
      },
    },

    rules: {
      "@typescript-eslint/adjacent-overload-signatures": "error",

      /**
       * The default value is `array`. We choose `array-simple` because it makes complicated arrays
       * easier to understand. This is worth the cost of deviating from the base rule configuration.
       */
      "@typescript-eslint/array-type": [
        "error",
        {
          default: "array-simple",
        },
      ],

      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/ban-ts-comment": "error",
      "@typescript-eslint/ban-tslint-comment": "error",
      "@typescript-eslint/class-literal-property-style": "error",
      "@typescript-eslint/class-methods-use-this": "error",
      "@typescript-eslint/consistent-generic-constructors": "error",
      "@typescript-eslint/consistent-indexed-object-style": "error",

      /**
       * Disabled since this is handled by the `noImplicitReturns` TypeScript compiler flag. (The
       * compiler flag does not technically handle all cases that the rule does. However, in most
       * cases, it will result in duplicate error messages being thrown, so we disable it.
       * Additionally, more coverage of this nature is also provided by the
       * `complete/strict-void-functions` rule.)
       */
      "@typescript-eslint/consistent-return": "off",

      "@typescript-eslint/consistent-type-assertions": "error",
      "@typescript-eslint/consistent-type-definitions": "error",
      "@typescript-eslint/consistent-type-exports": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/default-param-last": "error",
      "@typescript-eslint/dot-notation": "error",

      /**
       * Disabled since it would be to cumbersome to require return types for non-exported
       * functions. (It is more reasonable to require it for exported functions only, since it
       * speeds up the type-checker in large codebases.)
       */
      "@typescript-eslint/explicit-function-return-type": "off",

      /**
       * Disabled since many programs may have internal-only classes that would not benefit from an
       * explicit public/private distinction.
       */
      "@typescript-eslint/explicit-member-accessibility": "off",

      "@typescript-eslint/explicit-module-boundary-types": "error",

      /**
       * Disabled since it is superfluous to require an `= undefined` during variable initialization
       * (and TypeScript will take care of the non-undefined cases).
       */
      "@typescript-eslint/init-declarations": "off",

      /**
       * Disabled because enforcing an arbitrary parameter number threshold for every function in a
       * project does not provide much value. (Additionally, using TypeScript reduces the value of
       * such a check.)
       */
      "@typescript-eslint/max-params": "off",

      /** Disabled since prescribed class ordering is too project-specific. */
      "@typescript-eslint/member-ordering": "off",

      "@typescript-eslint/method-signature-style": "error",

      /**
       * The options are [copied from
       * Airbnb](https://github.com/iamturns/eslint-config-airbnb-typescript/blob/master/lib/shared.js).
       * We also allow a leading underscore, which signifies that the element is temporarily not
       * being used.
       */
      "@typescript-eslint/naming-convention": [
        "error",
        // Allow camelCase variables (23.2), PascalCase variables (23.8), and UPPER_CASE variables
        // (23.10).
        {
          selector: "variable",
          format: ["camelCase", "PascalCase", "UPPER_CASE"],
          leadingUnderscore: "allow",
        },
        // Allow camelCase functions (23.2), and PascalCase functions (23.8).
        {
          selector: "function",
          format: ["camelCase", "PascalCase"],
          leadingUnderscore: "allow",
        },
        // Airbnb recommends PascalCase for classes (23.3), and although Airbnb does not make
        // TypeScript recommendations, we are assuming this rule would similarly apply to anything
        // "type like", including interfaces, type aliases, and enums.
        {
          selector: "typeLike",
          format: ["PascalCase"],
          leadingUnderscore: "allow",
        },
      ],

      "@typescript-eslint/no-array-constructor": "error",
      "@typescript-eslint/no-array-delete": "error",
      "@typescript-eslint/no-base-to-string": "error",
      "@typescript-eslint/no-confusing-non-null-assertion": "error",
      "@typescript-eslint/no-confusing-void-expression": "error",
      "@typescript-eslint/no-deprecated": "error",

      /**
       * Disabled since it is superfluous when using TypeScript according to [the ESLint
       * documentation](https://eslint.org/docs/latest/rules/no-dupe-class-members#when-not-to-use-it).
       */
      "@typescript-eslint/no-dupe-class-members": "off",

      "@typescript-eslint/no-duplicate-enum-values": "error",
      "@typescript-eslint/no-duplicate-type-constituents": "error",
      "@typescript-eslint/no-dynamic-delete": "error",
      "@typescript-eslint/no-empty-function": "error",

      /**
       * The `allowSingleExtends` option is enabled to allow for the common pattern of using using
       * interfaces to provide an opaque type. (This can be useful with type-builders such as Zod,
       * since `z.infer` uses `Expand`, which is sometimes not desired since it can lead to
       * verbose/confusing mouseover tooltips and TypeScript errors.)
       */
      "@typescript-eslint/no-empty-interface": [
        "error",
        {
          allowSingleExtends: true,
        },
      ],

      "@typescript-eslint/no-empty-object-type": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-extra-non-null-assertion": "error",
      "@typescript-eslint/no-extraneous-class": "error",

      /**
       * - The `ignoreVoid` option is disabled to make the rule stricter.
       * - The rule is disabled in "*.test.ts" files because the built-in Node test runner returns a
       *   promise that is not meant to be awaited.
       */
      "@typescript-eslint/no-floating-promises": [
        "error",
        {
          ignoreVoid: false,
        },
      ],

      "@typescript-eslint/no-for-in-array": "error",
      "@typescript-eslint/no-implied-eval": "error",
      "@typescript-eslint/no-import-type-side-effects": "error",
      "@typescript-eslint/no-inferrable-types": "error",

      /** The `capIsConstructor` option is disabled to make the rule stricter. */
      "@typescript-eslint/no-invalid-this": [
        "error",
        {
          capIsConstructor: false,
        },
      ],

      "@typescript-eslint/no-invalid-void-type": "error",
      "@typescript-eslint/no-loop-func": "error",
      "@typescript-eslint/no-loss-of-precision": "error",

      /** Disabled since it results in too many false positives. */
      "@typescript-eslint/no-magic-numbers": "off",

      "@typescript-eslint/no-meaningless-void-operator": "error",
      "@typescript-eslint/no-misused-new": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/no-misused-spread": "error",
      "@typescript-eslint/no-mixed-enums": "error",
      "@typescript-eslint/no-namespace": "error",
      "@typescript-eslint/no-non-null-asserted-nullish-coalescing": "error",
      "@typescript-eslint/no-non-null-asserted-optional-chain": "error",
      "@typescript-eslint/no-non-null-assertion": "error",

      /**
       * Disabled since it is handled by the combination of the TypeScript compiler and the `no-var`
       * ESLint rule.
       */
      "@typescript-eslint/no-redeclare": "off",

      "@typescript-eslint/no-redundant-type-constituents": "error",
      "@typescript-eslint/no-require-imports": "error",

      /**
       * Configured to prevent importing with some common patterns that are almost always a mistake:
       *
       * - "src" directories (but allowed in test files that are in a separate "tests" directory)
       * - "dist" directories
       * - "index" files (things in the same package should directly import instead of use the
       *   public API)
       */
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: [
            // Some "src" directories have an "index.ts" file, which means that importing from the
            // directory is valid. Thus, we check for the "src" directory with no suffix.
            {
              group: ["**/src"],
              message:
                'You cannot import from a "src" directory. If this is a monorepo, import using the package name like you would in a non-monorepo project.',
            },

            {
              group: ["**/src/**"],
              message:
                'You cannot import from a "src" directory. If this is a monorepo, import using the package name like you would in a non-monorepo project.',
            },

            // Some "dist" directories have an "index.ts" file, which means that importing from the
            // directory is valid. Thus, we check for the "dist" directory with no suffix.
            {
              group: ["**/dist"],
              message:
                'You cannot import from a "dist" directory. If this is a monorepo, import using the package name like you would in a non-monorepo project.',
            },

            {
              group: ["**/dist/**"],
              message:
                'You cannot import from a "dist" directory. If this is a monorepo, import using the package name like you would in a non-monorepo project.',
            },

            {
              group: ["**/index"],
              message:
                "You cannot import from a package index. Instead, import directly from the file where the code is located.",
            },

            {
              group: ["**/index.{js,cjs,mjs,ts,cts,mts}"],
              message:
                "You cannot import from a package index. Instead, import directly from the file where the code is located.",
            },
          ],
        },
      ],

      /** Disabled since this rule is intended to be used for project-specific types. */
      "@typescript-eslint/no-restricted-types": "off",

      "@typescript-eslint/no-shadow": "error",
      "@typescript-eslint/no-this-alias": "error",

      /** Disabled because this rule is deprecated. */
      "@typescript-eslint/no-type-alias": "off",

      "@typescript-eslint/no-unnecessary-boolean-literal-compare": "error",
      "@typescript-eslint/no-unnecessary-condition": "error",
      "@typescript-eslint/no-unnecessary-parameter-property-assignment":
        "error",
      "@typescript-eslint/no-unnecessary-qualifier": "error",
      "@typescript-eslint/no-unnecessary-template-expression": "error",
      "@typescript-eslint/no-unnecessary-type-arguments": "error",
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
      "@typescript-eslint/no-unnecessary-type-constraint": "error",
      "@typescript-eslint/no-unnecessary-type-conversion": "error",
      "@typescript-eslint/no-unnecessary-type-parameters": "error",
      "@typescript-eslint/no-unsafe-argument": "error",
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-declaration-merging": "error",
      "@typescript-eslint/no-unsafe-enum-comparison": "error",
      "@typescript-eslint/no-unsafe-function-type": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-return": "error",

      /**
       * Disabled because this rule causes too many false positives. The rule prevents a narrowing
       * type assertion, but often times this is precisely the point of the assertion.
       */
      "@typescript-eslint/no-unsafe-type-assertion": "off",

      "@typescript-eslint/no-unsafe-unary-minus": "error",

      /**
       * The `allowTaggedTemplates` option is enabled to allow the rule to work with libraries like
       * `execa`.
       */
      "@typescript-eslint/no-unused-expressions": [
        "error",
        {
          allowTaggedTemplates: true,
        },
      ],

      "@typescript-eslint/no-unused-private-class-members": "error",

      /**
       * The `args` option is set to `all` make the rule stricter. Additionally, we ignore things
       * that begin with an underscore, since this matches the behavior of the `--noUnusedLocals`
       * TypeScript compiler flag.
       */
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all", // "after-used" is the default.
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],

      /** Disabled because it can prevent code from being structured sequentially. */
      "@typescript-eslint/no-use-before-define": "off",

      "@typescript-eslint/no-useless-constructor": "error",
      "@typescript-eslint/no-useless-empty-export": "error",
      "@typescript-eslint/no-var-requires": "error",
      "@typescript-eslint/no-wrapper-object-types": "error",
      "@typescript-eslint/non-nullable-type-assertion-style": "error",
      "@typescript-eslint/only-throw-error": "error",
      "@typescript-eslint/parameter-properties": "error",
      "@typescript-eslint/prefer-as-const": "error",

      /**
       * Object destructuring is enforced but array destructuring is not. This matches usage in the
       * general TypeScript ecosystem.
       */
      "@typescript-eslint/prefer-destructuring": [
        "error",
        {
          VariableDeclarator: {
            array: false,
            object: true,
          },
          AssignmentExpression: {
            array: false,
            object: true,
          },
        },
        {
          // We disable this for renamed properties, since code like the following should be valid:
          // `const someSpecificMyEnum = MyEnum.Value1;`
          enforceForRenamedProperties: false,
        },
      ],

      "@typescript-eslint/prefer-enum-initializers": "error",
      "@typescript-eslint/prefer-find": "error",
      "@typescript-eslint/prefer-for-of": "error",
      "@typescript-eslint/prefer-function-type": "error",
      "@typescript-eslint/prefer-includes": "error",
      "@typescript-eslint/prefer-literal-enum-member": "error",
      "@typescript-eslint/prefer-namespace-keyword": "error",
      "@typescript-eslint/prefer-nullish-coalescing": "error",

      /**
       * Disabled because it can modify the type of `boolean` declarations, which is [undesired in
       * some
       * circumstances](https://github.com/typescript-eslint/typescript-eslint/issues/5269).
       */
      "@typescript-eslint/prefer-optional-chain": "off",

      /** The `allowEmptyReject` option is enabled since this is a common pattern. */
      "@typescript-eslint/prefer-promise-reject-errors": [
        "error",
        {
          allowEmptyReject: true,
        },
      ],

      "@typescript-eslint/prefer-readonly": "error",

      /** Superseded by the `complete/prefer-readonly-parameter-types` rule. */
      "@typescript-eslint/prefer-readonly-parameter-types": "off",

      "@typescript-eslint/prefer-reduce-type-parameter": "error",

      /** Disabled since using the `String.match` form might make code easier to read. */
      "@typescript-eslint/prefer-regexp-exec": "off",

      "@typescript-eslint/prefer-return-this-type": "error",
      "@typescript-eslint/prefer-string-starts-ends-with": "error",
      "@typescript-eslint/prefer-ts-expect-error": "error",
      "@typescript-eslint/promise-function-async": "error",
      "@typescript-eslint/related-getter-setter-pairs": "error",
      "@typescript-eslint/require-array-sort-compare": "error",
      "@typescript-eslint/require-await": "error",

      /** The various "allow" options are disabled to make the rule stricter. */
      "@typescript-eslint/restrict-plus-operands": [
        "error",
        {
          allowAny: false,
          allowBoolean: false,
          allowNullish: false,
          allowNumberAndString: false,
          allowRegExp: false,
        },
      ],

      /**
       * Disabled since a common use-case of template strings is to coerce everything to a string.
       */
      "@typescript-eslint/restrict-template-expressions": "off",

      /**
       * Even though the core rule was deprecated, the extended rule uses type information, so it is
       * much better.
       *
       * Additionally, we opt for the "always" option instead of the default of "in-try-catch", for
       * reasons described in [this
       * issue](https://github.com/typescript-eslint/typescript-eslint/issues/10165#issuecomment-2525288217).
       */
      "@typescript-eslint/return-await": ["error", "always"],

      /** Disabled since in it does not make sense to sort a union alphabetically in many cases. */
      "@typescript-eslint/sort-type-constituents": "off",

      /** The `allowString` and `allowNumber` options are disabled to make the rule stricter. */
      "@typescript-eslint/strict-boolean-expressions": [
        "error",
        {
          allowString: false,
          allowNumber: false,
          allowNullableObject: true,
          allowNullableBoolean: false,
          allowNullableString: false,
          allowNullableNumber: false,
          allowNullableEnum: false,
          allowAny: false,
          allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing: false,
        },
      ],

      /**
       * The `allowDefaultCaseForExhaustiveSwitch` option is disabled and the
       * `requireDefaultForNonUnion` option is enabled to make the rule stricter. The
       * `considerDefaultExhaustiveForUnions` option is enabled since it is not intended to be used
       * when `allowDefaultCaseForExhaustiveSwitch` is disabled.
       */
      "@typescript-eslint/switch-exhaustiveness-check": [
        "error",
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: true,
          considerDefaultExhaustiveForUnions: true,
        },
      ],

      "@typescript-eslint/triple-slash-reference": "error",

      /**
       * Disabled since it is not recommended by the `typescript-eslint` team. (They recommend using
       * the `noImplicitAny` and `strictPropertyInitialization` TypeScript compiler options
       * instead.)
       */
      "@typescript-eslint/typedef": "off",

      "@typescript-eslint/unbound-method": "error",
      "@typescript-eslint/unified-signatures": "error",
      "@typescript-eslint/use-unknown-in-catch-callback-variable": "error",
    },

    // Rules that require type information will throw an error on ".json" files. (This is needed
    // when using `eslint-plugin-package-json`. Even though this config does not currently use the
    // plugin, we include it here defensively.)
    ignores: ["**/*.json", "**/*.jsonc"],
  },

  // Enable linting on TypeScript file extensions.
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"],
  },

  // Disable some TypeScript-specific rules in JavaScript files.
  {
    files: ["**/*.js", "**/*.cjs", "**/*.mjs", "**/*.jsx"],
    rules: {
      "@typescript-eslint/consistent-type-imports": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/strict-boolean-expressions": "off",
    },
  },

  // The built-in Node.js test-runner returns a promise which is not meant to be awaited.
  {
    files: ["**/*.test.{js,cjs,mjs,ts,cts,mts}"],
    rules: {
      "@typescript-eslint/no-floating-promises": "off",
    },
  },

  {
    files: [
      // ESLint configs in monorepos often intentionally import from the "src" subdirectory (because
      // the config files are JavaScript so they cannot use tsconfig-paths).
      "eslint.config.mjs",

      // We want to be allowed to import from the "src" directory in script files that are located
      // in a separate "scripts" directory.
      "**/scripts/**",

      // We want to be allowed to import from the "src" directory in test files that are located in
      // a separate "tests" directory.
      "**/tests/**",
    ],
    rules: {
      "@typescript-eslint/no-restricted-imports": "off",
    },
  },
);
