import { getTypeOfPropertyOfType } from "@typescript-eslint/type-utils";
import type {
  ImmutabilityCache,
  ImmutabilityOverrides,
} from "is-immutable-type";
import { Immutability, isImmutableType } from "is-immutable-type";
import ts from "typescript";

/** TODO: Open a PR for this once the other PR is accepted. */
export function isImmutableTypeWithPatches(
  program: ts.Program,
  type: ts.Type,
  overrides: ImmutabilityOverrides,
  cache: ImmutabilityCache,
): boolean {
  cachePatchedImmutableTypes(program, type, overrides, cache);
  return isImmutableType(program, type, overrides, cache);
}

function cachePatchedImmutableTypes(
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

    // The ReadonlyArray override does not match tuples reached through the type checker.
    if (isTupleType(checker, typeToVisit)) {
      const typeArguments = checker.getTypeArguments(typeToVisit);
      for (const typeArgument of typeArguments) {
        visitType(typeArgument);
      }

      if (typeToVisit.target.readonly) {
        const isImmutable = typeArguments.every((typeArgument) =>
          isImmutableType(program, typeArgument, overrides, cache),
        );
        const genericAlias = getGenericTupleAlias(typeToVisit);

        if (!isImmutable && genericAlias !== undefined) {
          cache.set(genericAlias, Immutability.ReadonlyDeep);
        } else if (isImmutable) {
          const cacheKey = getTupleCacheKey(typeToVisit);
          if (cacheKey !== undefined) {
            cache.set(cacheKey, Immutability.Immutable);
          }
        }
        return;
      }
    }

    if (typeToVisit.isIntersection()) {
      for (const childType of typeToVisit.types) {
        if (!isPrimitiveType(childType)) {
          visitType(childType);
        }
      }

      if (
        isImmutablePrimitiveIntersection(program, typeToVisit, overrides, cache)
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

function isTupleType(
  checker: ts.TypeChecker,
  type: ts.Type,
): type is ts.TupleTypeReference {
  return checker.isTupleType(type);
}

function getTupleCacheKey(
  type: ts.TupleTypeReference,
): ts.Node | ts.Type | undefined {
  if (getGenericTupleAlias(type) !== undefined) {
    return undefined;
  }

  return type.node ?? type.target;
}

function getGenericTupleAlias(
  type: ts.TupleTypeReference,
): ts.TypeAliasDeclaration | undefined {
  const node: ts.Node | undefined = type.node;

  return node !== undefined
    && ts.isTypeAliasDeclaration(node)
    && node.typeParameters !== undefined
    ? node
    : undefined;
}

function isTypeReference(type: ts.Type): type is ts.TypeReference {
  return (
    (type.flags & ts.TypeFlags.Object) !== 0
    && ((type as ts.ObjectType).objectFlags & ts.ObjectFlags.Reference) !== 0
  );
}

/**
 * TODO: Remove this workaround after https://github.com/RebeccaStevens/is-immutable-type/pull/637
 * is released.
 */
function isImmutablePrimitiveIntersection(
  program: ts.Program,
  type: ts.IntersectionType,
  overrides: ImmutabilityOverrides,
  cache: ImmutabilityCache,
): boolean {
  return (
    type.types.some((childType) => isPrimitiveType(childType))
    && type.types.every(
      (childType) =>
        isPrimitiveType(childType)
        || isImmutableType(program, childType, overrides, cache),
    )
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
