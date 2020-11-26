const dayjs = require('dayjs');

module.exports = {
  title: 'Lambda Handson',
  themeConfig: {
    domain: 'https://lambda-handson.ozaki25.vercel.app',
    repo: 'ozaki25/lambda-handson',
    repoLabel: 'GitHub',
    sidebar: ['/page1', '/page2', '/page3', '/page4'],
  },
  markdown: {
    lineNumbers: true,
  },
  plugins: {
    '@vuepress/last-updated': {
      transformer: (timestamp, lang) => {
        return dayjs(timestamp).format('YYYY/MM/DD');
      },
    },
    '@vuepress/back-to-top': {},
    '@vuepress/medium-zoom': {},
    '@vuepress/pwa': {
      serviceWorker: true,
      updatePopup: true,
    },
    seo: {
      description: () => 'ハンズオン資料',
    },
  },
  head: [['link', { rel: 'manifest', href: '/manifest.json' }]],
};
