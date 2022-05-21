const rules = require('./_common');

module.exports = {
  root: true,
  extends: ['airbnb', 'prettier'],
  plugins: ['react-hooks'],
  parser: 'babel-eslint',
  env: {
    es6: true,
    browser: true,
  },
  settings: {
    react: {
      version: '16.8',
    },
  },
  rules: {
    ...rules,
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }], // airbnb wants jsx!
  },
};
