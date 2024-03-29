module.exports = {
  extends: [
    // "stylelint-config-standard",
    // "stylelint-config-prettier",
    // "stylelint-config-html/vue",
    // "stylelint-config-recommended-vue/scss",
    'stylelint-config-recommended-less',
    // "stylelint-config-recommended-scss",
    'stylelint-config-prettier',
  ],
  plugins: ['stylelint-order'],
  overrides: [
    {
      files: ['**/*.vue'],
      customSyntax: 'postcss-html',
    },
    {
      files: ['**/*.less'],
      customSyntax: 'postcss-less',
    },
  ],
  ignoreFiles: ['**/*.js', '**/*.jsx', '**/*.tsx', '**/*.ts', '**/*.json'],
  rules: {
    'selector-pseudo-element-no-unknown': [
      //禁止使用未知的伪元素
      true,
      {
        ignorePseudoElements: ['v-deep', ':deep'],
      },
    ],
    'no-descending-specificity': null,
    'function-url-quotes': 'always',
    'color-hex-length': 'short', //允许缩写颜色
    'font-family-no-missing-generic-family-keyword': null, //允许在字体系列名称列表中缺少通用系列
    'property-no-unknown': true,
    'selector-class-pattern': null,
    'keyframes-name-pattern': null,
    'length-zero-no-unit': true, //0不需要单位
    'selector-type-no-unknown': [true, { ignoreTypes: ['drawer', 'setting'] }],
    'selector-pseudo-class-no-unknown': [true, { ignorePseudoClasses: ['global', 'deep', 'export'] }],
    'function-no-unknown': null,
    'order/properties-order': [
      'position',
      'top',
      'right',
      'bottom',
      'left',
      'z-index',
      'display',
      'justify-content',
      'align-items',
      'float',
      'clear',
      'overflow',
      'overflow-x',
      'overflow-y',
      'margin',
      'margin-top',
      'margin-right',
      'margin-bottom',
      'margin-left',
      'padding',
      'padding-top',
      'padding-right',
      'padding-bottom',
      'padding-left',
      'width',
      'min-width',
      'max-width',
      'height',
      'min-height',
      'max-height',
      'font-size',
      'font-family',
      'font-weight',
      'border',
      'border-style',
      'border-width',
      'border-color',
      'border-top',
      'border-top-style',
      'border-top-width',
      'border-top-color',
      'border-right',
      'border-right-style',
      'border-right-width',
      'border-right-color',
      'border-bottom',
      'border-bottom-style',
      'border-bottom-width',
      'border-bottom-color',
      'border-left',
      'border-left-style',
      'border-left-width',
      'border-left-color',
      'border-radius',
      'text-align',
      'text-justify',
      'text-indent',
      'text-overflow',
      'text-decoration',
      'white-space',
      'color',
      'background',
      'background-position',
      'background-repeat',
      'background-size',
      'background-color',
      'background-clip',
      'opacity',
      'filter',
      'list-style',
      'outline',
      'visibility',
      'box-shadow',
      'text-shadow',
      'resize',
      'transition',
    ],
  },
};
