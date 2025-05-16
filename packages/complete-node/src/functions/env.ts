import dotenv from "dotenv";
import path from "node:path";
import type { z } from "zod";
import { dirOfCaller, findPackageRoot } from "./arkType.js";
import { isFile } from "./file.js";

/**
 * Helper function to get environment variables from a ".env" file that is located next to the
 * project's "package.json" file (i.e. at the root of the project repository).
 *
 * You must provide the Zod schema of the ".env" file. The contents of the file will be parsed and
 * validated with Zod. For example:
 *
 * ```ts
 * const envSchema = z.object({
 *   DOMAIN: z.string().min(1).default("localhost"),
 * });
 *
 * export const env = getEnv(envSchema);
 * ```
 *
 * This function contains logic to convert empty strings to `undefined` so that Zod default values
 * can work correctly.
 *
 * Under the hood, this uses the `dotenv` library to get the environment variables from the ".env"
 * file.
 */
// We use `z.infer<T>` instead of `z.objectOutputType<A, C, B>` to avoid the following error: Type
// instantiation is excessively deep and possibly infinite.ts(2589)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getEnv<T extends z.ZodObject<any>>(envSchema: T): z.infer<T> {
  const fromDir = dirOfCaller();
  const packageRoot = findPackageRoot(fromDir);
  const envPath = path.join(packageRoot, ".env");

  if (!isFile(envPath)) {
    throw new Error(
      `The "${envPath}" file does not exist. Copy the ".env.example" file to a ".env" file at the root of the repository and re-run this program.`,
    );
  }

  dotenv.config({
    path: envPath,
  });

  // Loading values from the ".env" file will result in non-filled-in values being empty strings.
  // Since we might want to Zod to populate default values, we first convert empty strings to
  // `undefined`.
  for (const [key, value] of Object.entries(process.env)) {
    if (value === "") {
      delete process.env[key]; // eslint-disable-line @typescript-eslint/no-dynamic-delete
    }
  }

  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error(`Failed to parse the file: ${envPath}`);
    throw new Error(result.error.toString());
  }

  return result.data;
}
