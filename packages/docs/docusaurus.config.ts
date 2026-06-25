import type * as Preset from "@docusaurus/preset-classic";
import type { Config } from "@docusaurus/types";
import { themes } from "prism-react-renderer";

const lightCodeTheme = themes.github;
const darkCodeTheme = themes.vsDark;

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
    faster: true,
    v4: true,
  },

  onBrokenAnchors: "throw",
  onDuplicateRoutes: "throw",

  tagline: "A collection of packages to make working with TypeScript easier.",
  organizationName: "complete-ts",
  projectName: "complete-ts.github.io",

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

  presets: [
    [
      "classic",
      {
        docs: {
          routeBasePath: "/", // Serve the docs at the site's root.
          sidebarPath: "./sidebars.ts",
          editUrl: undefined,
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
