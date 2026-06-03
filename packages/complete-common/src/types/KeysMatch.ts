/**
 * Helper type to ensure that an array of keys matches an interface.
 *
 * For example:
 *
 * ```ts
 * interface Foo {
 *   arg1: string;
 *   arg2: string;
 * }
 *
 * const FOO_KEYS = ["arg1", "arg2"] as const;
 * type _ = Expect<KeysMatch<Foo, typeof FOO_KEYS>>;
 * ```
 */
export type KeysMatch<T, Keys extends readonly PropertyKey[]> = [
  keyof T,
] extends [Keys[number]]
  ? [Keys[number]] extends [keyof T]
    ? true
    : {
        error: "Extra keys not in interface";
        extra: Exclude<Keys[number], keyof T>;
      }
  : {
      error: "Missing keys from interface";
      missing: Exclude<keyof T, Keys[number]>;
    };
