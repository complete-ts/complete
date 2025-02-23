import { getTypeDocConfig } from "../docs/typedoc.config.base.mjs"; // eslint-disable-line import-x/no-relative-packages

const config = getTypeDocConfig(import.meta.dirname);

/** @type {import("typedoc").TypeDocOptions} */
export default {
  ...config,

  // TODO: https://github.com/TypeStrong/typedoc/issues/2863
  excludeExternals: true,
  externalPattern: "./src/functions/execa.ts",
};
