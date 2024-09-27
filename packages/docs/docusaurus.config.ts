import type * as Preset from "@docusaurus/preset-classic";
import type { Config } from "@docusaurus/types";
import { themes } from "prism-react-renderer";

const lightCodeTheme = themes.github;
const darkCodeTheme = themes.vsDark;

const config: Config = {
  title: "Complete",
  tagline: "A collection of packages to make working with TypeScript easier.",
  favicon: "img/favicon.ico",

  url: "https://complete-ts.github.io",
  baseUrl: "/",

  organizationName: "complete-ts",
  projectName: "complete-ts.github.io",

  onBrokenAnchors: "throw",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "throw",
  onDuplicateRoutes: "throw",

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          routeBasePath: "/", // Serve the docs at the site's root.
          sidebarPath: "./sidebars.ts",
          editUrl:
            "https://github.com/complete-ts/complete/edit/main/packages/docs",
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    navbar: {
      title: "complete",
      logo: {
        alt: "Complete Logo",
        src: "img/logo.png",
      },
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
    },

    footer: undefined,

    prism: {
      theme: lightCodeTheme,
      darkTheme: darkCodeTheme,
      additionalLanguages: ["lua"],
    },

    colorMode: {
      defaultMode: "dark",
    },

    algolia: {
      appId: "TLPQBRNPUR", // cspell: disable-line
      apiKey: "ddb9ff0a6c852e16bfe82b06c353fe56",
      indexName: "complete",
      contextualSearch: false, // Enabled by default; only useful for versioned sites.
    },
  } satisfies Preset.ThemeConfig,

  // -------------------------
  // Added fields from vanilla
  // -------------------------

  // Needed so that the following text works properly: `1 << -1 (0)`
  // https://github.com/tgreyuk/typedoc-plugin-markdown/issues/502
  markdown: {
    format: "detect",
  },

  scripts: [
    // We provide some keyboard shortcuts for easier navigation.
    "/js/hotkey.js",
  ],
};

export default config;
