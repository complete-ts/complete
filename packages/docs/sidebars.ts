import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  docs: [
    {
      type: "category",
      label: "Overview",
      items: ["main/features", "main/right-for-me", "main/getting-started"],
    },
    {
      type: "category",
      label: "Basic Info",
      items: [
        "main/discord",
        "main/what-is-isaacscript-doing",
        "main/directory-structure",
      ],
    },
    {
      type: "category",
      label: "Tutorials",
      items: [
        "main/javascript-tutorial",
        "main/example-mod",
        "main/next-steps",
        "main/using-get-data",
        "main/enums-and-objects",
        "main/mod-feature",
      ],
    },
    {
      type: "category",
      label: "Other Info",
      items: [
        "main/converting-lua-code",
        "main/updating-isaacscript",
        "main/custom-stages",
        "main/publishing-to-the-workshop",
        "main/gotchas",
        "main/isaacscript-in-lua",
        "main/isaacscript-in-typescript",
      ],
    },
    "main/change-log",
  ],
};

export default sidebars;
