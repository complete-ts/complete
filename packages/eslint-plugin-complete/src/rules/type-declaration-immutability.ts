import type { TSESTree } from "@typescript-eslint/utils";
import { ESLintUtils } from "@typescript-eslint/utils";
import type { ImmutabilityCache } from "is-immutable-type";
import { getDefaultOverrides, Immutability } from "is-immutable-type";
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
      mustBeImmutable: "Interfaces must be immutable.",
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
        context.report({
          node: node.id,
          messageId: "mustBeImmutable",
        });
      }
    }

    return { TSInterfaceDeclaration: checkInterface };
  },
});
