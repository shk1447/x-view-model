import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  tutorialSidebar: [
    {
      type: "category",
      label: "Introduction",
      link: {
        type: "generated-index",
      },
      items: ["introduction/summary", "introduction/quick_guide"],
    },
    {
      type: "category",
      label: "Guides",
      link: {
        type: "generated-index",
      },
      items: [
        "guides/installation",
        "guides/getting_started",
        "guides/api",
        "guides/options",
        "guides/advanced",
      ],
    },
    {
      type: "category",
      label: "Command-Line Interface (CLI)",
      link: {
        type: "generated-index",
      },
      items: ["cli/create", "cli/visualize", "cli/optimize"],
    },
    {
      type: "category",
      label: "Examples",
      link: {
        type: "generated-index",
      },
      items: ["examples/counter", "examples/signal_light"],
    },
  ],
};

export default sidebars;
