const { getTypeDocConfig } = require("../docs/typedoc.config.base.cjs");

/** @type {import("typedoc").TypeDocOptions} */
const config = {
  ...getTypeDocConfig(__dirname),

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

  intentionallyNotDocumented: [
    "types/KeysMatch.KeysMatch.__type.error",
    "types/KeysMatch.KeysMatch.__type.extra",
    "types/KeysMatch.KeysMatch.__type.missing",
  ],
};

module.exports = config;
