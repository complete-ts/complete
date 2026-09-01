/** @see https://semver.org/ */
export interface SemanticVersion {
  /** The first number inside of the semantic version. */
  readonly majorVersion: number;

  /** The second number inside of the semantic version. */
  readonly minorVersion: number;

  /** The third number inside of the semantic version. */
  readonly patchVersion: number;
}
