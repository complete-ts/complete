import { getTypeDocConfig } from "../docs/typedoc.config.base.mjs"; // eslint-disable-line import-x/no-relative-packages

/** @type {import("typedoc").TypeDocOptions} */
const config = {
  ...getTypeDocConfig(import.meta.dirname),

  // TypeDoc complains about the re-exported dollar sign function from "execa".
  intentionallyNotDocumented: [
    "functions/execa.$.__type.stdout",
    "functions/execa.$.__type.stderr",
  ],
};

export default config;
