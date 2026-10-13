import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Coconut Lab — Multi-Currency Digital Wallet',
  tagline: 'Architecture SSOT & Living Technical Specifications',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://coconutlab.sg',
  baseUrl: '/',

  organizationName: 'coconutlab',
  projectName: 'tc-coconut-lab',

  onBrokenLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          path: '../docs', // Point to docs in parent directory
          routeBasePath: '/', // Docs act as root landing page
          sidebarPath: './sidebars.ts',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Coconut Lab Wallet',
      logo: {
        alt: 'Coconut Lab Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Documentation (SSOT)',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Overview',
              to: '/',
            },
            {
              label: 'Architecture',
              to: '/architecture/system-architecture',
            },
            {
              label: 'API Contracts',
              to: '/api-contracts/wallet-endpoints',
            },
            {
              label: 'Testing Strategy',
              to: '/testing/testing-strategy',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Coconut Lab Challenge — Candidate: Muhamad Indra Setiabudi (Indra SB).`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
