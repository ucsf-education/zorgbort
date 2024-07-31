const nodePlugin = require('eslint-plugin-n');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');
const mochaPlugin = require('eslint-plugin-mocha');

module.exports = [
  nodePlugin.configs['flat/recommended-script'],
  eslintPluginPrettierRecommended,
  mochaPlugin.configs.flat.recommended,
  {
    plugins: {
      n: nodePlugin,
    },
  },
];
