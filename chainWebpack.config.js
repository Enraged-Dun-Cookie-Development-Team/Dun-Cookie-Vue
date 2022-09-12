const path = require('path');
const ExtensionReloader = require('webpack-ext-reloader');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const isDevMode = process.env.NODE_ENV === 'development';
const backgroundMode = process.env.BACKGROUND_MODE;

const chainWebpack = (config) => {
  if (backgroundMode === 'js') {
    config.entry('background').add(path.resolve(__dirname, './src/background/index.js'));
  }
  config.entry('contentScripts').add(path.resolve(__dirname, './src/contentScripts/index.js'));
  config.output.filename('[name].js');

  config.plugin('copy').tap((_args) => {
    return [
      {
        patterns: [
          { from: 'src/assets', to: 'assets' },
          { from: 'src/manifest.json', to: '[name][ext]' },
          { from: 'src/Dun-Cookies-Info.json', to: '[name][ext]' },
          { from: 'src/test', to: 'test' },
          { from: 'node_modules/element-ui/lib/theme-chalk/fonts/', to: 'css/fonts/[name][ext]' },
        ],
      },
    ];
  });

  if (isDevMode) {
    // development-mode
    config.plugin('ExtensionReloader').use(ExtensionReloader, [
      {
        contentScript: 'contentScripts',
        background: 'background',
        extensionPage: 'popup',
        options: 'options',
        donate: 'donate',
      },
    ]);

    config.plugin('CleanWebpackPlugin').use(CleanWebpackPlugin, [
      {
        cleanAfterEveryBuildPatterns: ['*hot-update*'],
        cleanStaleWebpackAssets: false,
      },
    ]);
  }
  config.performance.maxEntrypointSize(2_000_000).maxAssetSize(2_000_000);

  config.optimization.clear();
};

module.exports = chainWebpack;
