import { getTypeDocConfig } from "../docs/typedoc.config.base.mjs"; // eslint-disable-line import-x/no-relative-packages

const config = {
  ...getTypeDocConfig(import.meta.dirname),

  intentionallyNotDocumented: [
    "types/KeysMatch.KeysMatch.__type.error",
    "types/KeysMatch.KeysMatch.__type.extra",
    "types/KeysMatch.KeysMatch.__type.missing",
  ],

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
