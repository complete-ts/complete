/**
 * Helper functions for the [npm package manager](https://www.npmjs.com/).
 *
 * @module
 */

import { $q } from "./execa.js";

/**
 * Helper function to check if the npm CLI tool is logged in. This is useful to throw an error
 * before publishing.
 */
export async function isLoggedInToNPM(): Promise<boolean> {
  try {
    await $q`npm whoami`;
  } catch {
    return false;
  }

  return true;
}
