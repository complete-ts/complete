const { getTypeDocConfig } = require("../docs/typedoc.config.base.cjs");

/** @type {import("typedoc").TypeDocOptions} */
const config = {
  ...getTypeDocConfig(__dirname),

  // TypeDoc complains about the re-exported dollar sign function from "execa".
  intentionallyNotDocumented: [
    "functions/execa.$.__type.stdout",
    "functions/execa.$.__type.stderr",
  ],
};

module.exports = config;
