// Some of the functions are copy-pasted here from the `typescript-eslint` repository and slightly
// modified.

import {
  isPromiseLike,
  isTypeReferenceType,
} from "@typescript-eslint/type-utils";
import ts from "typescript";

/** Gets all of the type flags in a type, iterating through unions automatically. */
function getTypeFlags(type: ts.Type): number | ts.TypeFlags {
  let flags = 0;
  for (const t of unionTypeParts(type)) {
    flags |= t.flags;
  }
  return flags;
}

/** If the type is a `Promise`, this will unwrap it. */
export function getRealType(program: ts.Program, type: ts.Type): ts.Type {
  if (
    isPromiseLike(program, type)
    && isTypeReferenceType(type)
    && type.typeArguments !== undefined
  ) {
    const typeArgument = type.typeArguments[0];
    if (typeArgument !== undefined) {
      return typeArgument;
    }
  }

  return type;
}

export function getTypeName(type: ts.Type): string | undefined {
  const escapedName = type.getSymbol()?.escapedName as string | undefined;
  if (escapedName !== undefined && escapedName !== "__type") {
    return escapedName;
  }

  const aliasSymbolName = type.aliasSymbol?.getName();
  if (aliasSymbolName !== undefined) {
    return aliasSymbolName;
  }

  // The above checks do not work with boolean values.
  if ("intrinsicName" in type) {
    const { intrinsicName } = type;
    if (typeof intrinsicName === "string" && intrinsicName !== "") {
      return intrinsicName;
    }
  }

  return undefined;
}

/**
 * @param symbol The symbol to check.
 * @param flagsToCheck The composition of one or more `ts.SymbolFlags`.
 */
export function isSymbolFlagSet(
  symbol: ts.Symbol,
  flagsToCheck: number | ts.SymbolFlags,
): boolean {
  return isFlagSet(symbol.flags, flagsToCheck);
}

/**
 * Checks if the given type is either an array/tuple type, or a union made up solely of array/tuple
 * types.
 *
 * Based on the `isTypeArrayTypeOrUnionOfArrayTypes` from `typescript-eslint`, but modified to also
 * match tuples.
 */
export function isTypeArrayTupleTypeOrUnionOfArrayTupleTypes(
  type: ts.Type,
  checker: ts.TypeChecker,
): boolean {
  for (const t of unionTypeParts(type)) {
    if (!checker.isArrayType(t) && !checker.isTupleType(t)) {
      return false;
    }
  }

  return true;
}

export function isAny(type: ts.Type): boolean {
  return isTypeFlagSet(type, ts.TypeFlags.Any);
}

export function isVoid(type: ts.Type): boolean {
  return isTypeFlagSet(type, ts.TypeFlags.Void);
}

/** Returns all types of a union type or an array containing `type` itself if it's no union type. */
export function unionTypeParts(type: ts.Type): readonly ts.Type[] {
  return isUnion(type) ? type.types : [type];
}

function isUnion(type: ts.Type): type is ts.UnionType {
  // We cannot use the `isTypeFlagSet` function here, since that decomposes unions.
  return isFlagSet(type.flags, ts.TypeFlags.Union);
}

/**
 * Note that if the type is a union, this function will decompose it into the parts and get the
 * flags of every union constituent.
 *
 * @param type The type to check.
 * @param flagsToCheck The composition of one or more `ts.TypeFlags`.
 */
export function isTypeFlagSet(
  type: ts.Type,
  flagsToCheck: number | ts.TypeFlags,
): boolean {
  const flags = getTypeFlags(type);
  return isFlagSet(flags, flagsToCheck);
}

export function isFlagSet(flags: number, flag: number): boolean {
  return (flags & flag) !== 0;
}
