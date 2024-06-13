const nodePlugin = require('eslint-plugin-n');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = [
  nodePlugin.configs['flat/recommended-script'],
  eslintPluginPrettierRecommended,
  {
    plugins: {
      n: nodePlugin,
    },
    rules: {
      // Make an exception for ESLint-related modules.
      'n/no-unpublished-require': [
        'error',
        {
          allowModules: ['eslint-plugin-n', 'eslint-plugin-prettier'],
        },
      ],
    },
  },
];
