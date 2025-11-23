import { assertDefined } from "complete-common";
import dotenv from "dotenv";
import path from "node:path";
import { packageDirectory } from "package-directory";
import { isFile } from "./file.js";

/**
 * Helper function to get environment variables from a ".env" file that is located next to the
 * project's "package.json" file (i.e. at the root of the project repository) and inject them into
 * the `process.env` object.
 *
 * Typically, once you have used this function, you would validate the `process.env` object with a
 * Zod schema. This function contains logic to convert environment variables that are empty strings
 * to `undefined` so that Zod default values can work correctly.
 *
 * Under the hood, this uses the `dotenv` library to get the environment variables from the ".env"
 * file.
 *
 * @param importMetaDirname The value of `import.meta.dirname` (so that this function can find the
 *                          package root).
 * @rejects If the ".env" file cannot be found.
 */
export async function getEnv(importMetaDirname: string): Promise<void> {
  const packageRoot = await packageDirectory({ cwd: importMetaDirname });
  assertDefined(
    packageRoot,
    `Failed to find the package root from the directory of: ${packageRoot}`,
  );

  const envPath = path.join(packageRoot, ".env");
  const envExists = await isFile(envPath);
  if (!envExists) {
    throw new Error(
      `The "${envPath}" file does not exist. Copy the ".env.example" file to a ".env" file at the root of the repository and re-run this program.`,
    );
  }

  dotenv.config({
    path: envPath,

    // By default, dotenv will unhelpfully spam you with tips like: [dotenv@17.2.0] injecting env
    // (0) from .env (tip: 🔐 prevent building .env in docker: https://dotenvx.com/prebuild)
    quiet: true,
  });

  // Loading values from the ".env" file will result in non-filled-in values being empty strings.
  // Since we might want to Zod to populate default values, we first convert empty strings to
  // `undefined`.
  for (const [key, value] of Object.entries(process.env)) {
    if (value === "") {
      delete process.env[key]; // eslint-disable-line @typescript-eslint/no-dynamic-delete
    }
  }
}
