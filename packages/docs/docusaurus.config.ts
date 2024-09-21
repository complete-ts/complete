import type * as Preset from "@docusaurus/preset-classic";
import type { Config } from "@docusaurus/types";
import { themes } from "prism-react-renderer";

const lightCodeTheme = themes.github;
const darkCodeTheme = themes.vsDark;

const config: Config = {
  title: "Complete",
  tagline:
    "A collection of packages to make working with TypeScript projects easier.",
  favicon: "img/favicon.ico",

  url: "https://complete-ts.github.io",
  baseUrl: "/",

  organizationName: "complete-ts",
  projectName: "complete-ts.github.io",

  onBrokenAnchors: "throw",
  onBrokenLinks: "warn", // TODO: change to "throw"
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
  } satisfies Preset.ThemeConfig,

  // -------------------------
  // Added fields from vanilla
  // -------------------------

  scripts: [
    // We provide some keyboard shortcuts for easier navigation.
    "/js/hotkey.js",
  ],
};

export default config;
