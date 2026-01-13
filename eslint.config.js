import nodePlugin from 'eslint-plugin-n';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import mochaPlugin from 'eslint-plugin-mocha';

export default [
  nodePlugin.configs['flat/recommended-module'],
  eslintPluginPrettierRecommended,
  mochaPlugin.configs.flat.recommended,
  {
    plugins: {
      n: nodePlugin,
    },
  },
];
