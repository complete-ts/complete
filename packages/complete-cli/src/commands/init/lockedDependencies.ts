interface LockedDependency {
  name: string;
  version: string;
  reason: string;
}

// eslint-disable-next-line complete/require-capital-const-assertions
export const LOCKED_DEPENDENCIES: readonly LockedDependency[] = [];
