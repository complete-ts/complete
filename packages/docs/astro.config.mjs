import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import starlightLinksValidator from "starlight-links-validator";
import { createStarlightTypeDocPlugin } from "starlight-typedoc";
import completeCommonTypeDocConfig from "../complete-common/typedoc.config.mjs"; // eslint-disable-line import-x/no-relative-packages
import completeNodeTypeDocConfig from "../complete-node/typedoc.config.mjs"; // eslint-disable-line import-x/no-relative-packages
import typeDocPackageNames from "./typedoc-package-names.json" with { type: "json" };

const [completeCommonTypeDoc] = createStarlightTypeDocPlugin();
const [completeNodeTypeDoc] = createStarlightTypeDocPlugin();

const TYPE_DOC_CONFIGS = new Map([
  ["complete-common", completeCommonTypeDocConfig],
  ["complete-node", completeNodeTypeDocConfig],
]);
const TYPE_DOC_PLUGINS = new Map([
  ["complete-common", completeCommonTypeDoc],
  ["complete-node", completeNodeTypeDoc],
]);
const TYPE_DOC_SIDEBARS = new Map([
  [
    "complete-common",
    {
      items: [
        {
          label: "Overview",
          slug: "complete-common",
        },
        "complete-common/constants",
        {
          items: [
            {
              autogenerate: {
                directory: "complete-common/functions",
              },
            },
          ],
          label: "Functions",
        },
        {
          items: [
            {
              autogenerate: {
                directory: "complete-common/interfaces",
              },
            },
          ],
          label: "Interfaces",
        },
        {
          items: [
            {
              autogenerate: {
                directory: "complete-common/types",
              },
            },
          ],
          label: "Types",
        },
      ],
      label: "complete-common",
    },
  ],
  [
    "complete-node",
    {
      items: [
        {
          label: "Overview",
          slug: "complete-node",
        },
        {
          items: [
            {
              autogenerate: {
                directory: "complete-node/enums",
              },
            },
          ],
          label: "Enums",
        },
        {
          items: [
            {
              autogenerate: {
                directory: "complete-node/functions",
              },
            },
          ],
          label: "Functions",
        },
        {
          items: [
            {
              autogenerate: {
                directory: "complete-node/types",
              },
            },
          ],
          label: "Types",
        },
      ],
      label: "complete-node",
    },
  ],
]);

const LEGACY_TYPE_DOC_ROUTES = [
  "/complete-common/interfaces/SemanticVersion",
  "/complete-common/types/AddSubtract",
  "/complete-common/types/CompositionTypeSatisfiesEnum",
  "/complete-common/types/ERange",
  "/complete-common/types/Expect",
  "/complete-common/types/IRange",
  "/complete-common/types/Immutable",
  "/complete-common/types/KeysMatch",
  "/complete-common/types/NaturalNumbersLessThan",
  "/complete-common/types/NaturalNumbersLessThanOrEqualTo",
  "/complete-common/types/ObjectValues",
  "/complete-common/types/ReadonlyMap",
  "/complete-common/types/ReadonlyRecord",
  "/complete-common/types/ReadonlySet",
  "/complete-common/types/TranspiledEnum",
  "/complete-common/types/Tuple",
  "/complete-common/types/WidenLiteral",
  "/complete-common/types/Writeable",
  "/complete-node/enums/JavaScriptRuntime",
  "/complete-node/enums/PackageManager",
  "/complete-node/functions/monorepoPublish",
  "/complete-node/functions/monorepoUpdate",
  "/complete-node/functions/nukeDependencies",
  "/complete-node/functions/packageJSON",
  "/complete-node/functions/packageManager",
  "/complete-node/functions/readWrite",
  "/complete-node/functions/scriptHelpers",
  "/complete-node/types/DependencyType",
];

const redirects = Object.fromEntries(
  LEGACY_TYPE_DOC_ROUTES.map((route) => [route, route.toLowerCase()]),
);

export default defineConfig({
  site: "https://complete-ts.github.io",
  redirects: {
    ...redirects,
    "/blog": "/",
    "/search": "/",
  },
  integrations: [
    starlight({
      title: "Complete",
      description:
        "A collection of packages to make working with TypeScript easier.",
      logo: {
        src: "./src/assets/logo.png",
        alt: "Complete Logo",
      },
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/complete-ts/complete",
        },
        {
          icon: "discord",
          label: "Discord",
          href: "https://discord.gg/quxcs6gMN6",
        },
      ],
      sidebar: [
        "overview",
        "complete-cli",
        getTypeDocSidebar("complete-common"),
        "complete-lint",
        getTypeDocSidebar("complete-node"),
        "complete-tsconfig",
        "eslint-config-complete",
        {
          label: "eslint-plugin-complete",
          items: [
            {
              slug: "eslint-plugin-complete",
              label: "Overview",
            },
            "eslint-plugin-complete/comments",
            {
              label: "Rules",
              items: [
                {
                  autogenerate: {
                    directory: "eslint-plugin-complete/rules",
                  },
                },
              ],
            },
          ],
        },
        "markdownlint-config-complete",
        {
          label: "markdownlint-rule-complete",
          items: [
            {
              slug: "markdownlint-rule-complete",
              label: "Overview",
            },
            {
              label: "Rules",
              items: [
                {
                  autogenerate: {
                    directory: "markdownlint-rule-complete/rules",
                  },
                },
              ],
            },
          ],
        },
      ],
      head: [
        {
          tag: "script",
          attrs: {
            defer: true,
            src: "/js/hotkey.js",
          },
        },
      ],
      customCss: ["./src/styles/custom.css"],
      favicon: "/img/favicon.ico",
      expressiveCode: {
        themes: ["github-light", "github-dark"],
      },
      plugins: [
        ...typeDocPackageNames.map((packageName) =>
          getTypeDocPlugin(packageName),
        ),
        starlightLinksValidator(),
      ],
    }),
  ],
});

function getTypeDocPlugin(packageName) {
  const plugin = TYPE_DOC_PLUGINS.get(packageName);
  const config = TYPE_DOC_CONFIGS.get(packageName);
  if (plugin === undefined || config === undefined) {
    throw new Error(
      `Missing TypeDoc configuration for package: ${packageName}`,
    );
  }

  const { entryPoints, tsconfig, ...typeDoc } = config;
  return plugin({
    entryPoints,
    output: packageName,
    sidebar: {
      label: packageName,
      readmeLabel: "Overview",
    },
    pagination: true,
    tsconfig,
    typeDoc,
  });
}

function getTypeDocSidebar(packageName) {
  const sidebar = TYPE_DOC_SIDEBARS.get(packageName);
  if (sidebar === undefined) {
    throw new Error(`Missing TypeDoc sidebar for package: ${packageName}`);
  }

  return sidebar;
}
