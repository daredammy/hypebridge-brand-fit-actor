import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

export default [
    {
        ignores: ['dist/**', 'node_modules/**', '.actor/**', 'storage/**', 'test/**'],
    },
    js.configs.recommended,
    {
        files: ['**/*.ts'],
        languageOptions: {
            parser: tsParser,
            globals: {
                URL: 'readonly',
                fetch: 'readonly',
                RequestInit: 'readonly',
                Buffer: 'readonly',
                console: 'readonly',
                process: 'readonly',
                setTimeout: 'readonly',
                Response: 'readonly',
            },
            parserOptions: {
                project: './tsconfig.json',
                tsconfigRootDir: import.meta.dirname,
            },
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
        },
        rules: {
            ...tsPlugin.configs['recommended-type-checked'].rules,
            'indent': ['error', 4],
            'quotes': ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
            'no-console': 'off',
            'no-plusplus': 'off',
            'no-await-in-loop': 'off',
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/restrict-template-expressions': ['error', {
                allowNumber: true,
                allowBoolean: true,
                allowNullish: true,
            }],
        },
    },
    {
        files: ['eslint.config.mjs'],
        rules: {
            'import/no-default-export': 'off',
        },
    },
];
