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

export default defineConfig({
  site: "https://complete-ts.github.io",
  redirects: {
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
