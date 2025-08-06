module.exports = {
  extends: ['stylelint-config-standard'],
  plugins: ['stylelint-order'],
  overrides: [
    {
      files: ['src/**/*.{css,scss}'],
      rules: {
        'order/order': [
          'custom-properties',
          'dollar-variables',
          'declarations',
          'rules',
          'at-rules'
        ],
        'order/properties-alphabetical-order': true,
        'no-descending-specificity': null,
        'selector-class-pattern': null,
        'selector-pseudo-class-no-unknown': [
          true,
          {
            ignorePseudoClasses: ['global']
          }
        ]
      }
    }
  ]
};
