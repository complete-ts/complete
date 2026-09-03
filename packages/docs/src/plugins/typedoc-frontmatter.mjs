import path from "node:path";
import { ReflectionKind } from "typedoc";
import { MarkdownPageEvent } from "typedoc-plugin-markdown";

const CUSTOM_PAGE_TITLES = {
  env: "Environment",
  jsonc: "JSONC",
  monorepoPublish: "Monorepo Publishing",
  monorepoUpdate: "Monorepo Updating",
  npm: "npm",
  nukeDependencies: "Nuke Dependencies",
  packageJSON: "Package JSON",
  packageManager: "Package Manager",
  readWrite: "Read/Write",
  scriptHelpers: "Script Helpers",
};

const DECLARATION_KINDS = {
  enums: {
    kind: ReflectionKind.Enum,
    label: "Enum",
  },
  interfaces: {
    kind: ReflectionKind.Interface,
    label: "Interface",
  },
  types: {
    kind: [ReflectionKind.TypeAlias, ReflectionKind.Variable],
    label: "Type",
  },
};

export function load(app) {
  app.renderer.on(
    MarkdownPageEvent.BEGIN,
    (event) => {
      if (
        event.frontmatter === undefined
        || !event.model.kindOf(ReflectionKind.Module)
      ) {
        return;
      }

      const { frontmatter } = event;
      frontmatter.title = getModuleTitle(event.model);
    },
    -100,
  );
}

function getModuleTitle(model) {
  const rawName = model.name;
  const moduleName = path.posix.basename(rawName);
  const customTitle = CUSTOM_PAGE_TITLES[moduleName];
  const title =
    customTitle ?? moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  const declarationKind = getMatchingDeclarationKind(model, moduleName);

  return declarationKind === undefined
    ? title
    : `${title} (${declarationKind})`;
}

function getMatchingDeclarationKind(model, moduleName) {
  const directoryName = path.posix.dirname(model.name);
  const declaration = DECLARATION_KINDS[directoryName];
  if (declaration === undefined || model.children === undefined) {
    return undefined;
  }

  const kinds = Array.isArray(declaration.kind) // eslint-disable-line complete/prefer-is-array
    ? declaration.kind
    : [declaration.kind];
  const hasMatchingDeclaration = model.children.some(
    (child) => child.name === moduleName && kinds.includes(child.kind),
  );

  return hasMatchingDeclaration ? declaration.label : undefined;
}
