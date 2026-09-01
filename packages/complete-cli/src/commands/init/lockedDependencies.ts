interface LockedDependency {
  readonly name: string;
  readonly version: string;
  readonly reason: string;
}

// eslint-disable-next-line complete/require-capital-const-assertions
export const LOCKED_DEPENDENCIES: readonly LockedDependency[] = [
  {
    name: "typescript",
    version: "6.0.3",
    reason: "TypeScript 7 is not yet supported by the project tooling.",
  },
];
