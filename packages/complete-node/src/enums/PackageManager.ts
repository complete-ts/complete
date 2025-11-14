/** The package manager for a JavaScript/TypeScript project. */
export enum PackageManager {
  /**
   * The default package manager for Node.js.
   *
   * @see https://www.npmjs.com/
   */
  npm = "npm",

  /** @see https://yarnpkg.com/ */
  yarn = "yarn",

  /** @see https://pnpm.io/ */
  pnpm = "pnpm",

  /** @see https://bun.com/ */
  bun = "bun",
}
