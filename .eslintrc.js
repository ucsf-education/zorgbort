'use strict';

module.exports = {
  env: {
    commonjs: true,
    node: true,
    es2021: true,
  },
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  parserOptions: {
    ecmaVersion: 13,
  },
  rules: {},
};
