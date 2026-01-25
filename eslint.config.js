// @ts-check
import eslint from '@eslint/js';
import pluginImport from 'eslint-plugin-import';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort';
import unicorn from 'eslint-plugin-unicorn';
import unusedImports from 'eslint-plugin-unused-imports';

export default tseslint.config(
  {
    ignores: [
      'eslint.config.mjs',
      'typeorm-cli.js',
      'dist/**',
      'node_modules/**',
    ],
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
      unicorn: unicorn,
      'unused-imports': unusedImports,
    },
  },
  {
    rules: {
      'unicorn/filename-case': [
        'error',
        {
          case: 'kebabCase',
          ignore: ['^.*\\.config\\.(js|ts|mjs)$', '^.*\\.d\\.ts$'],
        },
      ],

      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      'prettier/prettier': ['error', { endOfLine: 'lf' }],

      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      'import/newline-after-import': 'error',
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
