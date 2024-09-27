import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  docs: [
    "overview",
    {
      type: "category",
      label: "complete-common",
      link: {
        type: "doc",
        id: "complete-common",
      },
      items: [
        {
          type: "autogenerated",
          dirName: "complete-common",
        },
      ],
    },
    "complete-lint",
    {
      type: "category",
      label: "complete-node",
      link: {
        type: "doc",
        id: "complete-node",
      },
      items: [
        {
          type: "autogenerated",
          dirName: "complete-node",
        },
      ],
    },
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
