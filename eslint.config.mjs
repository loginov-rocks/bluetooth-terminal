import eslint from '@eslint/js';
import google from 'eslint-config-google';
import jsdoc from 'eslint-plugin-jsdoc';
import tseslint from 'typescript-eslint';

// @see https://stackoverflow.com/a/79327789
delete google.rules['valid-jsdoc'];
delete google.rules['require-jsdoc'];

export default tseslint.config(
    eslint.configs.recommended,
    google,
    tseslint.configs.recommended,
    jsdoc.configs['flat/recommended-typescript'],
    {
      rules: {
        'max-len': ['error', {
          code: 120,
        }],
      },
    },
);
