import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import vuePlugin from 'eslint-plugin-vue';
import { defineConfig } from "eslint/config";
import globals from 'globals';
import vueParser from 'vue-eslint-parser';

export default defineConfig([
  // Ignore patterns
  {
    name: 'ignore',
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/*.d.ts',
      '**/*.spec.ts',
      '**/.output/**',
      '**/.cache/**',
      './*.*',
    ]
  },

  // Base configuration
  {
    name: 'base',
    languageOptions: {
      globals: {
        ...globals.browser
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: vueParser,
      parserOptions: {
        parser: '@typescript-eslint/parser',
        extraFileExtensions: ['.vue'],
        project: './tsconfig.json'
      }
    }
  },

  // Base parser configuration
  {
    files: ['**/*.ts', '**/*.vue'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        extraFileExtensions: ['.vue']
      }
    }
  },

  // Core rules
  {
    name: 'js-core',
    ...js.configs.recommended
  },

  // TypeScript rules
  {
    name: 'ts-core',
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    files: ['**/*.ts', '**/*.vue'],
    languageOptions: {
      parserOptions: {
        project: true
      }
    },
    rules: {
      ...tsPlugin.configs['recommended'].rules,
      ...tsPlugin.configs['stylistic-type-checked'].rules,
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_' }
      ]
    }
  },


  // Vue rules
  ...vuePlugin.configs['flat/base'],
  ...vuePlugin.configs['flat/essential'],
  ...vuePlugin.configs['flat/recommended'],
  {
    name: 'vue-core',
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        extraFileExtensions: ['.vue'],
        project: './tsconfig.json'
      }
    },
    rules: {
      'vue/block-order': ['error', {
        order: ['template', 'script', 'style']
      }],
      'vue/component-api-style': ['error', ['script-setup']],
      'vue/define-macros-order': 'error'
    }
  },

  // Custom strict rules
  {
    name : 'custom-rules',
    files: ['**/*.ts', '**/*.vue'],
    rules: {
      'no-console': 'error',
      'no-debugger': 'error',
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'off',
      'vue/require-default-prop': 'off',
      'vue/require-explicit-emits': 'error',
      'vue/prefer-import-from-vue': 'error',
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: false }
      ],
      curly: ['error', 'all'],
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: 'return' },
        { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
        { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] }
      ]
    }
  }
]);
