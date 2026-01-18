// @ts-check
import eslint from '@eslint/js';
import pluginImport from 'eslint-plugin-import';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  {
    settings: {
      'import/resolver': {
        typescript: {},
      },
    },
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'simple-import-sort': simpleImportSortPlugin,
      import: pluginImport,
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      'prettier/prettier': ['error', { endOfLine: 'lf' }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'no-duplicate-imports': ['error', { includeExports: true }],
      '@typescript-eslint/explicit-member-accessibility': [
        'warn',
        { accessibility: 'explicit' },
      ],
    },
  },
  {
    files: ['**/*.dto.ts', '**/*.entity.ts'],
    rules: {
      '@typescript-eslint/explicit-member-accessibility': 'off',
    },
  },
);
