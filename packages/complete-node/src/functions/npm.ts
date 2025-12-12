/**
 * Helper functions for the [npm package manager](https://www.npmjs.com/).
 *
 * @module
 */

import { assertStringNotEmpty } from "complete-common";
import { $ } from "./execa.js";

/**
 * Helper function to ensure that the "NODE_AUTH_TOKEN" environment variable exists and the
 * "$HOME/.npmrc" file is set up properly to avoid 2FA prompts using a 90-day npm access token.
 *
 * This is useful in publishing scripts.
 */
export async function setNPMAccessToken(): Promise<void> {
  const nodeAuthToken = process.env["NODE_AUTH_TOKEN"];
  assertStringNotEmpty(
    nodeAuthToken,
    'You must set the "NODE_AUTH_TOKEN" environment variable equal to your npm access token.',
  );

  // This writes to the "~/.npmrc" file, not the ".npmrc" file in the current working directory.
  await $`npm config set //registry.npmjs.org/:_authToken ${nodeAuthToken}`;

  // Note that we do not want to use `npm whoami`, since it is not designed to work with access
  // tokens.
}
