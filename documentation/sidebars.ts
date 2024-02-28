import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

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
      type: 'category',
      label: 'Getting Started',
      link: {
        type: 'generated-index',
      },
      items: [
        'getting_started/summary',
        'getting_started/menu_structure',
        'getting_started/model_types',
        'getting_started/quick_guide',
      ],
    },
    {
      type: 'category',
      label: 'Datasets',
      link: {
        type: 'generated-index',
      },
      items: ['datasets/manage_datasets'],
    },
    {
      type: 'category',
      label: 'Projects',
      link: {
        type: 'generated-index',
      },
      items: ['projects/manage_projects'],
    },
    {
      type: 'category',
      label: 'Training Queue',
      link: {
        type: 'generated-index',
      },
      items: ['training_queue/manage_training_queue'],
    },
    {
      type: 'category',
      label: 'Settings',
      link: {
        type: 'generated-index',
      },
      items: ['settings/manage_metadata'],
    },
  ],
};

export default sidebars;
