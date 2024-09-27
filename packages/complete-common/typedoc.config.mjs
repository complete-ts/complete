import { getTypeDocConfig } from "../docs/typedoc.config.base.mjs"; // eslint-disable-line import-x/no-relative-packages

const config = getTypeDocConfig(import.meta.dirname);

/** @type {import("typedoc").TypeDocOptions} */
export default {
  ...config,
  intentionallyNotExported: [
    "_TupleOf",
    "BuildTuple",
    "Length",
    "ImmutableArray",
    "ImmutablePrimitive",
    "ImmutableMap",
    "ImmutableObject",
    "ImmutableSet",
    "ReadonlyMapConstructor",
    "ReadonlySetConstructor",
    "TranspiledEnum",
    "TupleEntry",
    "TupleKey",
  ],
};
