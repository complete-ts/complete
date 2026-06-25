// @ts-check

/**
 * @typedef {{type: string, name?: string, value?: unknown}} RuleObjectKey
 * @typedef {{type: string, id?: unknown, key?: unknown}} RuleObjectParent
 * @typedef {{computed: boolean, key: RuleObjectKey}} RuleObjectProperty
 * @typedef {{parent?: unknown}} RuleObjectExpression
 */

/** @type {import("eslint").Rule.RuleModule} */
export const sortBaseRuleObjects = {
  create: (context) => ({
    ObjectExpression(node) {
      if (!isBaseRuleMap(node)) {
        return;
      }

      let previousName;
      for (const property of node.properties) {
        if (property.type === "SpreadElement") {
          previousName = undefined;
          continue;
        }

        const currentName = getPropertyName(property);
        if (currentName === undefined) {
          previousName = undefined;
          continue;
        }

        if (previousName !== undefined && currentName < previousName) {
          context.report({
            node: property.key,
            messageId: "incorrectOrder",
            data: {
              currentName,
              previousName,
            },
          });
        }

        previousName = currentName;
      }
    },
  }),
  meta: {
    type: "suggestion",
    docs: {
      description: "Require base ESLint rule maps to be sorted by rule name.",
    },
    schema: [],
    messages: {
      incorrectOrder:
        "Rule `{{ currentName }}` must be before `{{ previousName }}`.",
    },
  },
};

/**
 * @param {RuleObjectExpression} node
 * @returns {boolean}
 */
function isBaseRuleMap(node) {
  const { parent } = node;
  if (parent === undefined) {
    return false;
  }

  if (isRuleObjectParent(parent, "VariableDeclarator")) {
    const idName = getNodeName(parent.id);
    return idName !== undefined && /^[A-Z_]+$/v.test(idName);
  }

  return (
    isRuleObjectParent(parent, "Property")
    && getNodeName(parent.key) === "rules"
  );
}

/**
 * @param {unknown} value
 * @param {string} type
 * @returns {value is RuleObjectParent}
 */
function isRuleObjectParent(value, type) {
  return isRecord(value) && value["type"] === type;
}

/**
 * @param {unknown} value
 * @returns {string | undefined}
 */
function getNodeName(value) {
  if (!isRecord(value)) {
    return undefined;
  }

  const { name, type } = value;
  return type === "Identifier" && typeof name === "string" ? name : undefined;
}

/**
 * @param {RuleObjectProperty} property
 * @returns {string | undefined}
 */
function getPropertyName(property) {
  if (property.computed) {
    return undefined;
  }

  if (property.key.type === "Identifier") {
    return property.key.name;
  }

  if (
    property.key.type === "Literal"
    && typeof property.key.value === "string"
  ) {
    return property.key.value;
  }

  return undefined;
}

/**
 * @param {unknown} value
 * @returns {value is Record<string, unknown>}
 */
function isRecord(value) {
  return typeof value === "object" && value !== null;
}
