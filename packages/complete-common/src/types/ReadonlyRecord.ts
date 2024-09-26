/**
 * Helper type to specify that a record should be read-only.
 *
 * This is the same thing as `Readonly<Record<K, V>>`.
 */
export type ReadonlyRecord<K extends string | number | symbol, V> = Readonly<
  Record<K, V>
>;
