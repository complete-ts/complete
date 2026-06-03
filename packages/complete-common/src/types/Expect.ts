/**
 * Helper type used for testing other interfaces/types. Only `true` is assignable, anything else
 * errors.
 */
export type Expect<T extends true> = T;
