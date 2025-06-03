const path = require('path');
const file = require('fs');
const ExtensionReloader = require('webpack-ext-reloader');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { execSync } = require('child_process');

const isDevMode = process.env.NODE_ENV === 'development';
const browserTarget = process.env.BROWSER_TARGET?.toLowerCase() ?? 'chrome';
if (browserTarget !== 'chrome' && browserTarget !== 'firefox') {
  throw new Error(`BROWSER_TARGET只能是以下值之一：chrome、firefox，当前值：${browserTarget}`);
}
process.env.VUE_APP_BROWSER_TARGET = browserTarget;
const PROJECT_VERSION = JSON.parse(file.readFileSync('./package.json').toString()).version;
process.env.VUE_APP_PROJECT_VERSION = PROJECT_VERSION;
const enableFeatures = (process.env.VUE_APP_ENABLE_FEATURES || '').split(',').filter((v) => v.length > 0);
// 注意改这里的话要同时考虑更改Constants.js中的ENABLE_FEATURES部分
// 这段的本意是将启用且仅启用local_fetch的情况作为默认功能列表，不满足这种情况的都是自定义构建
const showCustomBuildTip = JSON.stringify(['local_fetch'].sort()) !== JSON.stringify(enableFeatures.sort());
process.env.VUE_APP_BUILD_BY = process.env.BUILD_BY || '本地构建';
let hash = execSync('git rev-parse --short HEAD').toString().trim();
let buildType = process.env.BUILD_TYPE || 'local#' + Math.floor(Math.random() * 1000);
process.env.VUE_APP_BUILD_SIGN = buildType + '_' + hash;

if (enableFeatures.includes('dev_api')) {
  let data;
  try {
    data = require('@enraged-dun-cookie-development-team/private-data/data.json');
  } catch (e) {
    throw new Error('未安装@enraged-dun-cookie-development-team/private-data包，无法启用dev_api特性');
  }
  process.env.VUE_APP_API_SERVER_BASE = data.api.dev.server;
  process.env.VUE_APP_API_CDN_BASE = data.api.dev.cdn;
  process.env.VUE_APP_API_SERVER_CDN_BASE = data.api.dev.server_cdn;
} else {
  process.env.VUE_APP_API_SERVER_BASE = 'https://server.ceobecanteen.top/api/v1/';
  process.env.VUE_APP_API_CDN_BASE = 'https://cdn.ceobecanteen.top/';
  process.env.VUE_APP_API_SERVER_CDN_BASE = 'https://server-cdn.ceobecanteen.top/api/v1/';
}

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
  if (enableFeatures.length > 0) {
    console.log('\n已启用特性', enableFeatures, '\n');
    if (enableFeatures.includes('local_fetch')) {
      try {
        require('@enraged-dun-cookie-development-team/cookie-fetcher');
      } catch (e) {
        throw new Error('未安装@enraged-dun-cookie-development-team/cookie-fetcher包，无法启用local_fetch特性');
      }
    }
    if (enableFeatures.includes('custom_datasource') && !enableFeatures.includes('local_fetch')) {
      throw new Error('若要启用custom_datasource特性，必须同时启用local_fetch特性');
    }
  }
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
              if (showCustomBuildTip) {
                manifest.description = `【自定义构建 By：${process.env.VUE_APP_BUILD_BY}】` + manifest.description;
              }
              const platformData = manifest['$platform'];
              delete manifest['$platform'];
              return JSON.stringify({ ...manifest, ...platformData[browserTarget] }, undefined, 2);
            },
          },
          { from: 'src/Dun-Cookies-Info.json', to: '[name][ext]' },
          { from: 'node_modules/element-ui/lib/theme-chalk/fonts/', to: 'css/fonts/[name][ext]' },
        ],
      },
    ];
  });

  if (isDevMode) {
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

  if (!config.experiments) config.experiments = {};
  config.experiments.topLevelAwait = true;

  insertLoaderToFirst(
    config,
    'js',
    'js-conditional-compile-loader',
    Object.fromEntries([...enableFeatures.map((v) => [`feature__${v}`, true])])
  );

  config.optimization.clear();
};

module.exports = chainWebpack;
