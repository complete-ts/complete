interface LockedDependency {
  name: string;
  version: string;
  reason: string;
}

// eslint-disable-next-line complete/require-capital-const-assertions
export const LOCKED_DEPENDENCIES: readonly LockedDependency[] = [
  {
    name: "typescript",
    version: "6.0.3",
    reason: "TypeScript 7 is not yet supported by the project tooling.",
  },
];
