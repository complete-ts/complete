import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  docs: [
    "overview",
    "complete-lint",
    "complete-tsconfig",
    "eslint-config-complete",
    {
      type: "category",
      label: "eslint-plugin-complete",
      link: {
        type: "doc",
        id: "eslint-plugin-complete",
      },
      items: [
        {
          type: "autogenerated",
          dirName: "eslint-plugin-complete",
        },
      ],
    },
  ],
};

export default sidebars;
