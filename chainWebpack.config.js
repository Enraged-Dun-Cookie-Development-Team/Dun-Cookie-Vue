const path = require('path');
const file = require('fs');
const ExtensionReloader = require('webpack-ext-reloader');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const isDevMode = process.env.NODE_ENV === 'development';
const PROJECT_VERSION = JSON.parse(file.readFileSync('./package.json').toString()).version;
process.env.VUE_APP_PROJECT_VERSION = PROJECT_VERSION;
const enableFeatures = (process.env.VUE_APP_ENABLE_FEATURES || '').split(',').filter((v) => v.length > 0);
console.log('已启用特性', enableFeatures);

// 由于vue默认增加loader是加到最后一个，这里提供插入到最前面的功能
function insertLoaderToFirst(config, ruleName, loaderName, loaderOptions) {
  const rule = config.module.rule(ruleName);
  const entries = rule.uses.values();
  rule.uses.clear();
  const loader = rule.use(loaderName).loader(loaderName);
  if (loaderOptions && typeof loaderOptions === 'object' && !Array.isArray(loaderOptions)) {
    loader.tap(() => loaderOptions);
  }
  entries.forEach((item) => {
    // noinspection JSUnresolvedVariable
    rule.uses.set(item.name, item);
  });
}

const chainWebpack = (config) => {
  config.entry('background').add(path.resolve(__dirname, './src/background/index.js'));
  config.entry('contentScripts').add(path.resolve(__dirname, './src/contentScripts/index.js'));
  config.output.filename('[name].js');

  config.plugin('copy').tap((_args) => {
    return [
      {
        patterns: [
          { from: 'src/assets', to: 'assets' },
          {
            from: 'src/manifest.json',
            to: '[name][ext]',
            transform(content) {
              const manifest = JSON.parse(content.toString());
              manifest.version = PROJECT_VERSION;
              return JSON.stringify(manifest, undefined, 2);
            },
          },
          { from: 'src/Dun-Cookies-Info.json', to: '[name][ext]' },
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

  insertLoaderToFirst(
    config,
    'js',
    'js-conditional-compile-loader',
    Object.fromEntries(enableFeatures.map((v) => [`feature__${v}`, true]))
  );

  config.optimization.clear();
};

module.exports = chainWebpack;
