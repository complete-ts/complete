interface LockedDependency {
  name: string;
  version: string;
  reason: string;
}

// eslint-disable-next-line complete/require-capital-const-assertions
export const LOCKED_DEPENDENCIES: readonly LockedDependency[] = [
  {
    name: "typescript",
    version: "5.7.3",
    reason:
      "https://github.com/typescript-eslint/typescript-eslint/issues/10884",
  },
];
