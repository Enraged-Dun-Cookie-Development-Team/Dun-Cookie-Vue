const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtensionReloader = require('webpack-extension-reloader');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const isDevMode = process.env.NODE_ENV === 'development'
const backgroundMode = process.env.BACKGROUND_MODE;

const chainWebpack = config => {
    if (backgroundMode === 'js') {
        config.entry('background').add(path.resolve(__dirname, './src/background/index.js'));
    }
    config.entry('contentScripts').add(path.resolve(__dirname, './src/contentScripts/index.js'));
    config.output.filename('[name].js');
    config.plugins.delete('copy');

    config.plugin('CopyWebpackPlugin').use(CopyWebpackPlugin, [[
        { from: 'src/assets', to: 'assets' },
        { from: 'src/manifest.json', to: 'manifest.json', flatten: true },
        { from: 'src/test', to: 'test' },
    ]]);

    if (isDevMode) {
        // development-mode
        config.plugin('ExtensionReloader').use(ExtensionReloader, [{
            contentScript: 'contentScripts',
            background: 'background',
            extensionPage: 'popup',
            options: 'options',
            donate: 'donate',
        }]);

        config.plugin('CleanWebpackPlugin').use(CleanWebpackPlugin, [{
            cleanAfterEveryBuildPatterns: ['*hot-update*'],
            cleanStaleWebpackAssets: false,
        }]);
    }

    config.optimization.clear();
    
}

module.exports = chainWebpack;
