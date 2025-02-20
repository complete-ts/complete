import { $ } from "execa";

/** Alias for `$({ stdin: "pipe" })` from the `execa` library. */
export const $q = $({ stdin: "pipe" });
