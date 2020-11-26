const dayjs = require('dayjs');

module.exports = {
  title: 'Lambda Handson',
  themeConfig: {
    domain: 'https://lambda-handson.ozaki25.vercel.app',
    repo: 'ozaki25/lambda-handson',
    repoLabel: 'GitHub',
    sidebar: [
      {
        title: 'TOP',
        children: ['/'],
      },
      {
        title: 'Subject1',
        children: ['/subject1/page1', '/subject1/page2', '/subject1/page3'],
      },
      {
        title: 'Subject2',
        children: ['/subject2/page1', '/subject2/page2', '/subject2/page3'],
      },
      {
        title: 'Subject3',
        children: ['/subject3/page1', '/subject3/page2', '/subject3/page3'],
      },
    ],
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
