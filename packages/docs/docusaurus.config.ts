import type * as Preset from "@docusaurus/preset-classic";
import type { Config } from "@docusaurus/types";
import { themes } from "prism-react-renderer";
import typeDocConfigCompleteCommon from "../complete-common/typedoc.config.cjs"; // eslint-disable-line import-x/no-relative-packages
import typeDocConfigCompleteNode from "../complete-node/typedoc.config.cjs"; // eslint-disable-line import-x/no-relative-packages
import typeDocPackageNamesJSON from "./typedoc-package-names.json";

const lightCodeTheme = themes.github;
const darkCodeTheme = themes.vsDark;

const TYPE_DOC_PACKAGE_NAMES: ReadonlySet<string> = new Set(
  typeDocPackageNamesJSON,
);
const TYPE_DOC_PACKAGE_INDEX_IDS: ReadonlySet<string> = new Set(
  typeDocPackageNamesJSON.map((name) => `${name}/index`),
);

const config: Config = {
  title: "Complete",
  url: "https://complete-ts.github.io",
  baseUrl: "/",
  favicon: "img/favicon.ico",

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  future: {
    v4: true,
    faster: true,
  },

  onBrokenAnchors: "throw",
  onDuplicateRoutes: "throw",

  tagline: "A collection of packages to make working with TypeScript easier.",
  organizationName: "complete-ts",
  projectName: "complete-ts.github.io",

  themeConfig: {
    navbar: {
      title: "complete",
      items: [
        {
          href: "https://github.com/complete-ts/complete",
          className: "header-github-link",
          position: "right",
        },
        {
          href: "https://discord.gg/quxcs6gMN6",
          className: "header-discord-link",
          position: "right",
        },
      ],
      logo: {
        alt: "Complete Logo",
        src: "img/logo.png",
      },
    },

    colorMode: {
      defaultMode: "dark",
    },

    prism: {
      theme: lightCodeTheme,
      darkTheme: darkCodeTheme,
      additionalLanguages: ["lua"],
    },

    footer: undefined,

    // From: https://dashboard.algolia.com/account/api-keys/all
    algolia: {
      appId: "M5MCRT0J4H", // cspell: disable-line
      apiKey: "7710ae64f8d9560b308377f575ce451b",
      indexName: "complete-tsio", // cspell: disable-line
      contextualSearch: false, // Enabled by default; only useful for versioned sites.
    },
  } satisfies Preset.ThemeConfig,

  plugins: [
    [
      "docusaurus-plugin-typedoc",
      {
        ...typeDocConfigCompleteCommon,
        id: "complete-common",
        sidebar: {
          autoConfiguration: false,
        },
      },
    ],
    [
      "docusaurus-plugin-typedoc",
      {
        ...typeDocConfigCompleteNode,
        id: "complete-node",
        sidebar: {
          autoConfiguration: false,
        },
      },
    ],
  ],

  presets: [
    [
      "classic",
      {
        docs: {
          routeBasePath: "/", // Serve the docs at the site's root.
          editUrl: undefined,
          sidebarPath: "./sidebars.ts",

          // Docusaurus requires a mutable array from this third-party callback.
          // eslint-disable-next-line complete/no-mutable-return
          async sidebarItemsGenerator({
            defaultSidebarItemsGenerator,
            ...args
          }) {
            const sidebarItems = await defaultSidebarItemsGenerator(args);
            const filteredSidebarItems = sidebarItems.filter(
              (item) =>
                item.type !== "doc" || !TYPE_DOC_PACKAGE_INDEX_IDS.has(item.id),
            );

            if (!TYPE_DOC_PACKAGE_NAMES.has(args.item.dirName)) {
              return filteredSidebarItems;
            }

            return filteredSidebarItems.map((item) =>
              item.type === "category"
                ? {
                    ...item,
                    label: item.label.replace(/^./v, (firstCharacter) =>
                      firstCharacter.toUpperCase(),
                    ),
                  }
                : item,
            );
          },
        },

        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  scripts: [
    // We provide some keyboard shortcuts for easier navigation.
    "/js/hotkey.js",
  ],

  markdown: {
    // Needed so that the following text works properly: `1 << -1 (0)`
    // https://github.com/tgreyuk/typedoc-plugin-markdown/issues/502
    format: "detect",

    hooks: {
      onBrokenMarkdownLinks: "throw",
      onBrokenMarkdownImages: "throw",
    },
  },
};

export default config;
