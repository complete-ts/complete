import { getTypeDocConfig } from "../docs/typedoc.config.base.mjs"; // eslint-disable-line import-x/no-relative-packages

const config = getTypeDocConfig(import.meta.dirname);

/** @type {import("typedoc").TypeDocOptions} */
export default {
  ...config,

  // TypeDoc complains about the re-exported dollar sign function from "execa".
  intentionallyNotDocumented: [
    "functions/execa.$.__type.stdout",
    "functions/execa.$.__type.stderr",
    "functions/execa.$.sync.__type.stdout",
    "functions/execa.$.sync.__type.stderr",
    "functions/execa.$.s.__type.stdout",
    "functions/execa.$.s.__type.stderr",
  ],
};
