import { getTypeOfPropertyOfType } from "@typescript-eslint/type-utils";
import type { TSESTree } from "@typescript-eslint/utils";
import { ESLintUtils } from "@typescript-eslint/utils";
import type { ImmutabilityCache } from "is-immutable-type";
import { getDefaultOverrides, Immutability } from "is-immutable-type";
import { isPropertyReadonlyInType } from "ts-api-utils";
import ts from "typescript";
import { isImmutableTypeWithPatches } from "../patch.js";
import { createRule } from "../utils.js";

type Options = [];
type MessageIds = "mustBeImmutable";

const IMMUTABILITY_OVERRIDES = [
  ...getDefaultOverrides(),
  {
    type: {
      from: "lib",
      name: "ReadonlyArray",
    },
    from: Immutability.ReadonlyDeep,
    to: Immutability.Immutable,
  },
  {
    type: {
      from: "lib",
      name: "ReadonlyMap",
    },
    from: Immutability.ReadonlyDeep,
    to: Immutability.Immutable,
  },
  {
    type: {
      from: "lib",
      name: "ReadonlySet",
    },
    from: Immutability.ReadonlyDeep,
    to: Immutability.Immutable,
  },
] as const;

export const typeDeclarationImmutability = createRule<Options, MessageIds>({
  name: "type-declaration-immutability",
  meta: {
    type: "problem",
    docs: {
      description: "Enforces that interfaces are immutable",
      recommended: true,
      requiresTypeChecking: true,
    },
    schema: [],
    messages: {
      mustBeImmutable:
        'Interface must be immutable. Found {{violationCount}} field {{violationNoun}}; the first offending field is "{{firstFieldName}}".',
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = ESLintUtils.getParserServices(context);
    const { program } = parserServices;
    const checker = program.getTypeChecker();

    function checkInterface(node: TSESTree.TSInterfaceDeclaration) {
      const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
      const type = checker.getTypeAtLocation(tsNode);
      const immutabilityCache: ImmutabilityCache = new WeakMap();

      if (
        !isImmutableTypeWithPatches(
          program,
          type,
          IMMUTABILITY_OVERRIDES,
          immutabilityCache,
        )
      ) {
        const offendingFields = getOffendingFields(type);
        const firstFieldName = offendingFields[0] ?? "(unknown)";
        const violationCount =
          offendingFields.length === 0 ? 1 : offendingFields.length;

        context.report({
          node: node.id,
          messageId: "mustBeImmutable",
          data: {
            firstFieldName,
            violationCount,
            violationNoun: violationCount === 1 ? "violation" : "violations",
          },
        });
      }
    }

    function getOffendingFields(type: ts.Type): readonly string[] {
      const offendingFields = type
        .getProperties()
        .filter((property) => isOffendingProperty(type, property))
        .map((property) => property.getName());

      for (const indexKind of [ts.IndexKind.String, ts.IndexKind.Number]) {
        const indexInfo = checker.getIndexInfoOfType(type, indexKind);
        if (
          indexInfo !== undefined
          && (!indexInfo.isReadonly || !isImmutable(indexInfo.type))
        ) {
          offendingFields.push(
            indexKind === ts.IndexKind.String
              ? "[string index]"
              : "[number index]",
          );
        }
      }

      return offendingFields;
    }

    function isOffendingProperty(
      containingType: ts.Type,
      property: ts.Symbol,
    ): boolean {
      if (
        !isPropertyReadonlyInType(
          containingType,
          property.getEscapedName(),
          checker,
        )
      ) {
        return true;
      }

      const propertyType = getTypeOfPropertyOfType(
        checker,
        containingType,
        property,
      );
      return propertyType !== undefined && !isImmutable(propertyType);
    }

    function isImmutable(type: ts.Type): boolean {
      return isImmutableTypeWithPatches(
        program,
        type,
        IMMUTABILITY_OVERRIDES,
        new WeakMap(),
      );
    }

    return { TSInterfaceDeclaration: checkInterface };
  },
});
