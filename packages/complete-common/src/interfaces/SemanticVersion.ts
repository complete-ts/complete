/** @see https://semver.org/ */
export interface SemanticVersion {
  /** The first number inside of the semantic version. */
  majorVersion: number;

  /** The second number inside of the semantic version. */
  minorVersion: number;

  /** The third number inside of the semantic version. */
  patchVersion: number;
}
