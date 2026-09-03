import { getTypeDocConfig } from "../docs/typedoc.config.base.mjs"; // eslint-disable-line import-x/no-relative-packages

const config = {
  ...getTypeDocConfig(import.meta.dirname),

  intentionallyNotDocumented: [
    "functions/execa.$.__type.stdout",
    "functions/execa.$.__type.stderr",
  ],
};

export default config;
