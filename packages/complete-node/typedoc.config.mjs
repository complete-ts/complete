import { getTypeDocConfig } from "../docs/typedoc.config.base.mjs"; // eslint-disable-line import-x/no-relative-packages

const config = getTypeDocConfig(import.meta.dirname);

/** @type {import("typedoc").TypeDocOptions} */
export default {
  ...config,

  // TODO: https://discord.com/channels/508357248330760243/829307039447515176/1341981378581106771
  excludeExternals: true,
  externalPattern: "./src/execa.ts",
};
