import { getTypeDocConfig } from "../docs/typedoc.config.base.mjs"; // eslint-disable-line import-x/no-relative-packages

/** @type {import("typedoc").TypeDocOptions} */
const config = {
  ...getTypeDocConfig(import.meta.dirname),

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
    "TupleEntry",
    "TupleKey",
  ],
};

export default config;
