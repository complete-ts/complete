import { getTypeOfPropertyOfType } from "@typescript-eslint/type-utils";
import type {
  ImmutabilityCache,
  ImmutabilityOverrides,
} from "is-immutable-type";
import { Immutability, isImmutableType } from "is-immutable-type";
import ts from "typescript";

/**
 * TODO: Remove this workaround after https://github.com/RebeccaStevens/is-immutable-type/pull/637
 * is released.
 */
export function isImmutableTypeWithPrimitiveIntersectionPatch(
  program: ts.Program,
  type: ts.Type,
  overrides: ImmutabilityOverrides,
  cache: ImmutabilityCache,
): boolean {
  cacheImmutablePrimitiveIntersections(program, type, overrides, cache);
  return isImmutableType(program, type, overrides, cache);
}

function cacheImmutablePrimitiveIntersections(
  program: ts.Program,
  type: ts.Type,
  overrides: ImmutabilityOverrides,
  cache: ImmutabilityCache,
) {
  const checker = program.getTypeChecker();
  const seenTypes = new Set<ts.Type>();

  function visitType(typeToVisit: ts.Type) {
    if (seenTypes.has(typeToVisit)) {
      return;
    }
    seenTypes.add(typeToVisit);

    if (typeToVisit.isIntersection()) {
      for (const childType of typeToVisit.types) {
        if (!isPrimitiveType(childType)) {
          visitType(childType);
        }
      }

      if (
        typeToVisit.types.some((childType) => isPrimitiveType(childType))
        && typeToVisit.types.every(
          (childType) =>
            isPrimitiveType(childType)
            || isImmutableType(program, childType, overrides, cache),
        )
      ) {
        cache.set(typeToVisit, Immutability.Immutable);
        return;
      }
    } else if (typeToVisit.isUnion()) {
      for (const childType of typeToVisit.types) {
        visitType(childType);
      }
    }

    if (isTypeReference(typeToVisit)) {
      for (const typeArgument of checker.getTypeArguments(typeToVisit)) {
        visitType(typeArgument);
      }
    }

    for (const property of typeToVisit.getProperties()) {
      const propertyType = getTypeOfPropertyOfType(
        checker,
        typeToVisit,
        property,
      );
      if (propertyType !== undefined) {
        visitType(propertyType);
      }
    }

    for (const indexKind of [ts.IndexKind.String, ts.IndexKind.Number]) {
      const indexInfo = checker.getIndexInfoOfType(typeToVisit, indexKind);
      if (indexInfo !== undefined) {
        visitType(indexInfo.type);
      }
    }
  }

  visitType(type);
}

function isTypeReference(type: ts.Type): type is ts.TypeReference {
  return (
    (type.flags & ts.TypeFlags.Object) !== 0
    && ((type as ts.ObjectType).objectFlags & ts.ObjectFlags.Reference) !== 0
  );
}

function isPrimitiveType(type: ts.Type): boolean {
  const primitiveFlags =
    ts.TypeFlags.StringLike
    | ts.TypeFlags.NumberLike
    | ts.TypeFlags.BigIntLike
    | ts.TypeFlags.BooleanLike
    | ts.TypeFlags.ESSymbolLike
    | ts.TypeFlags.VoidLike
    | ts.TypeFlags.Null;

  return (type.flags & primitiveFlags) !== 0;
}
