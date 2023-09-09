const chainWebpack = require('./chainWebpack.config.js');
const backgroundMode = process.env.BACKGROUND_MODE;
const devtoolMode = process.env.DEVTOOL_MODE;
const newtabMode = process.env.NEWTAB_MODE;

const config = {
  devServer: {
    hot: false,
    allowedHosts: 'all',
    devMiddleware: {
      writeToDisk: true,
    },
  },
  filenameHashing: false,
  lintOnSave: false, //关闭eslint检查
  pages: {
    options: {
      entry: 'src/options/index.js',
      template: 'public/index.html',
      filename: 'options.html',
      title: '设置蹲饼器',
      chunks: ['chunk-vendors', 'chunk-common', 'options'],
    },
    popup: {
      entry: 'src/popup/index.js',
      template: 'public/index.html',
      filename: 'popup.html',
      title: '列表',
      chunks: ['chunk-vendors', 'chunk-common', 'popup'],
    },
    // windowPopup: {
    //     entry: 'src/windowPopup/index.js',
    //     template: 'public/index.html',
    //     filename: 'windowPopup.html',
    //     title: '小刻食堂',
    //     chunks: ['chunk-vendors', 'chunk-common', 'windowPopup'],
    // },
    welcome: {
      entry: 'src/welcome/index.js',
      template: 'public/index.html',
      filename: 'welcome.html',
      title: '欢迎使用小刻食堂',
      chunks: ['chunk-vendors', 'chunk-common', 'welcome'],
    },
    update: {
      entry: 'src/update/index.js',
      template: 'public/index.html',
      filename: 'update.html',
      title: '蹲饼这次更新了什么？',
      chunks: ['chunk-vendors', 'chunk-common', 'update'],
    },
    viewImg: {
      entry: 'src/viewImg/index.js',
      template: 'public/index.html',
      filename: 'viewImg.html',
      title: '查看图片',
      chunks: ['chunk-vendors', 'chunk-common', 'viewImg'],
    },
    donate: {
      entry: 'src/donate/index.js',
      template: 'public/index.html',
      filename: 'donate.html',
      title: '博士，感谢您为我提供帮助',
      chunks: ['chunk-vendors', 'chunk-common', 'donate'],
    },
    time: {
      entry: 'src/time/index.js',
      template: 'public/index.html',
      filename: 'time.html',
      title: '倒计时模块',
      chunks: ['chunk-vendors', 'chunk-common', 'time'],
    },
    protocol: {
      entry: 'src/welcome/protocol.js',
      template: 'public/index.html',
      filename: 'protocol.html',
      title: '用户协议',
      chunks: ['chunk-vendors', 'chunk-common', 'protocol'],
    },
  },
  css: {
    extract: true,
    loaderOptions: {
      css: {
        url: false,
      },
    },
  },
  chainWebpack,
};

if (backgroundMode === 'html') {
  config.pages['background'] = {
    entry: 'src/background/index.js',
    template: 'public/index.html',
    filename: 'background.html',
    title: 'Background',
    chunks: ['chunk-vendors', 'chunk-common', 'background'],
  };
}

if (devtoolMode) {
  config.pages['devtool'] = {
    entry: 'src/devtool/index.js',
    template: 'public/index.html',
    filename: 'devtool.html',
    title: 'Devtool',
  };
}

if (newtabMode) {
  config.pages['newtab'] = {
    entry: 'src/newtab/index.js',
    template: 'public/index.html',
    filename: 'newtab.html',
    title: 'NewTab',
  };
}

module.exports = config;
