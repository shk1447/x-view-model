import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";
import path from "path";

const config: Config = {
  title: "x-view-model documents",
  tagline: "All documents are here.",
  favicon: "img/favicon.ico",

  // Set the production url of your site here
  url: "https://your-docusaurus-site.example.com",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/x-view-model/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "sh2.kim", // Usually your GitHub org/user name.
  projectName: "x-view-model", // Usually your repo name.

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en", "ko-kr", "zh"],
    // localeConfigs: {
    //   en: {
    //     label: 'English',
    //     direction: 'ltr',
    //   },
    //   'ko-kr': {
    //     label: '한국어',
    //     direction: 'ltr',
    //   },
    //   zh: {
    //     label: '중국어',
    //     direction: 'ltr',
    //   },
    // },
  },
  markdown: {
    mermaid: true,
  },
  themes: ["@docusaurus/theme-mermaid"],
  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
        },
        // blog: {
        //   showReadingTime: true,
        //   // Please change this to your repo.
        //   // Remove this to remove the "edit this page" links.
        //   editUrl:
        //     'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        // },
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],
  plugins: [
    // [
    //   '@docusaurus/plugin-content-docs',
    //   {
    //     id: 'manual',
    //     path: 'manual',
    //     routeBasePath: 'manual',
    //     sidebarPath: './sidebarsManual.ts',
    //     // ... other options
    //   },
    // ],
    [path.resolve(__dirname, "./plugins/generate-pdf/index.ts"), {}],
  ],
  themeConfig: {
    mermaid: {
      theme: { light: "neutral", dark: "forest" },
    },
    // Replace with your project's social card
    image: "img/docusaurus-social-card.jpg",
    navbar: {
      title: "",
      logo: {
        alt: "My Site Logo",
        src: "img/logo.svg",
      },
      items: [
        {
          type: "doc",
          position: "left",
          docId: "/category/getting-started",
          label: "Docs",
        },
        // {
        //   to: '/manual/', // To highlight the navbar item, you must link to a document, not a top-level directory
        //   position: 'left',
        //   label: 'Manual',
        //   activeBaseRegex: `/manual/`,
        // },
        // {
        //   label: 'SDK .Net',
        //   to: '/dotnet',
        // },
        // {
        //   label: 'SDK C++',
        //   to: '/cpp',
        // },
        // { to: '/blog', label: 'Blog', position: 'left' },
        {
          type: "docsVersionDropdown",
          position: "right",
        },
        {
          type: "localeDropdown",
          position: "right",
        },
        {
          href: "https://www.npmjs.com/package/x-view-model",
          label: "Npm Package",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        // {
        //   title: 'Docs',
        //   items: [
        //     {
        //       label: 'Tutorial',
        //       to: '/docs/intro',
        //     },
        //   ],
        // },
        // {
        //   title: 'Community',
        //   items: [
        //     {
        //       label: 'Stack Overflow',
        //       href: 'https://stackoverflow.com/questions/tagged/docusaurus',
        //     },
        //     {
        //       label: 'Discord',
        //       href: 'https://discordapp.com/invite/docusaurus',
        //     },
        //     {
        //       label: 'Twitter',
        //       href: 'https://twitter.com/docusaurus',
        //     },
        //   ],
        // },
        // {
        //   title: 'More',
        //   items: [
        //     {
        //       label: 'Blog',
        //       to: '/blog',
        //     },
        //     {
        //       label: 'GitHub',
        //       href: 'https://github.com/facebook/docusaurus',
        //     },
        //   ],
        // },
      ],
      copyright: `Copyright (C) Vases 2024-${new Date().getFullYear()}. All rights reserved.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
