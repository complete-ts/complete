import esLintPluginPerfectionist from "eslint-plugin-perfectionist";
import { defineConfig } from "eslint/config";

/**
 * This ESLint config only contains rules from `eslint-plugin-perfectionist`:
 * https://perfectionist.dev/rules
 */
export const basePerfectionist = defineConfig({
  plugins: {
    perfectionist: esLintPluginPerfectionist,
  },

  rules: {
    "perfectionist/sort-array-includes": "error",

    /** Disabled because class member ordering can be semantically significant. */
    "perfectionist/sort-classes": "off",

    /** Disabled because decorator ordering can be semantically significant. */
    "perfectionist/sort-decorators": "off",

    /** Disabled because enum ordering can be semantically significant. */
    "perfectionist/sort-enums": "off",

    "perfectionist/sort-export-attributes": "error",

    /** Disabled since this is automatically handled by `prettier-plugin-organize-imports`. */
    "perfectionist/sort-exports": "off",

    "perfectionist/sort-heritage-clauses": "error",
    "perfectionist/sort-import-attributes": "error",

    /** Disabled since this is automatically handled by `prettier-plugin-organize-imports`. */
    "perfectionist/sort-imports": "off",

    /** Disabled because interface ordering can be semantically significant. */
    "perfectionist/sort-interfaces": "off",

    "perfectionist/sort-intersection-types": "error",
    "perfectionist/sort-jsx-props": "error",
    "perfectionist/sort-maps": "error",
    "perfectionist/sort-modules": "error",

    /** Disabled since this is automatically handled by `prettier-plugin-organize-imports`. */
    "perfectionist/sort-named-exports": "off",

    /** Disabled since this is automatically handled by `prettier-plugin-organize-imports`. */
    "perfectionist/sort-named-imports": "off",

    /** Disabled because type ordering can be semantically significant. */
    "perfectionist/sort-object-types": "off",

    /** Disabled because object keys are often not meant to be sorted in alphabetical order. */
    "perfectionist/sort-objects": "off",

    "perfectionist/sort-sets": "error",
    "perfectionist/sort-switch-case": "error",
    "perfectionist/sort-union-types": "error",
    "perfectionist/sort-variable-declarations": "error",
  },
});
