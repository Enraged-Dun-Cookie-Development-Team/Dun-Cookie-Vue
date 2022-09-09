const OFF = 0;
const WARN = 1;
const ERROR = 2;

module.exports = {
    root: true,
    parserOptions: {
        parser: '@babel/eslint-parser',
        sourceType: 'module'
    },
    env: {
        browser: true,
        node: true,
        es2022: true,
        webextensions: true,
    },
    globals:{
        PlatformHelper: true,
        DebugUtil: true,
        WorkerNavigator: true,
        Settings: true,
        ClipboardItem: true,
    },
    extends: ['plugin:vue/recommended', 'plugin:vue/strongly-recommended', 'eslint:recommended', 'prettier/prettier'],

    // add your custom rules here
    //it is base on https://github.com/vuejs/eslint-config-vue
    rules: {
        // 'no-unused-vars': [ERROR, { argsIgnorePattern: '^_|event' }], //禁止有没用的变量，除event和_标记
        'no-unused-vars': OFF,
        'no-debugger': process.env.NODE_ENV === 'production' ? ERROR : WARN, //生产环境禁止有debugger，测试环境警告
        "no-catch-shadow": ERROR,//禁止catch子句参数与外部作用域变量同名
        "no-dupe-keys": ERROR,//在创建对象字面量时不允许键重复 {a:1,a:1}
        "no-dupe-args": ERROR,//函数参数不能重复
        "no-duplicate-case": ERROR,//switch中的case标签不能重复
        "no-invalid-regexp": ERROR,//禁止无效的正则表达式
        "no-var": OFF,//禁用var，用let和const代替
        "no-prototype-builtins": OFF,//允许直接使用 Object.prototypes 的内置属性
        'new-cap': [ERROR, { //首字母大小写
            'newIsCap': true,
            'capIsNew': false
        }],

        "vue/component-definition-name-casing": [ERROR, "PascalCase"],  // 组件名字必须遵循大驼峰
        'vue/multi-word-component-names': OFF, // 不监测组件名字是否是多个单词
        "vue/no-v-html": OFF, //不检测是否有v-html
        "vue/require-prop-types": ERROR, //不检测prop是否给类型
        "vue/first-attribute-linebreak": [ERROR, {
            "singleline": "beside",
            "multiline": "below"
        }],
    }
};
