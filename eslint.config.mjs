// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    name: 'curriculoai/base-rules',
    rules: {
      curly: ['error', 'all'],
      eqeqeq: ['error', 'always'],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'warn',
      'no-duplicate-imports': 'error',
      'object-shorthand': ['error', 'always'],
      'prefer-const': 'error',
      'prefer-template': 'warn',
    },
  },
  {
    name: 'curriculoai/typescript-rules',
    files: ['**/*.{ts,tsx,vue}'],
    rules: {
      '@typescript-eslint/consistent-type-imports': ['warn', { prefer: 'type-imports' }],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    name: 'curriculoai/vue-rules',
    files: ['**/*.vue'],
    rules: {
      'vue/attributes-order': 'warn',
      'vue/block-order': ['warn', { order: ['template', 'script', 'style'] }],
      'vue/component-name-in-template-casing': [
        'warn',
        'PascalCase',
        {
          registeredComponentsOnly: false,
          ignores: ['NuxtLink', 'NuxtPage', 'NuxtRouteAnnouncer'],
        },
      ],
      'vue/define-emits-declaration': ['warn', 'type-literal'],
      'vue/define-props-declaration': ['warn', 'type-based'],
      'vue/html-self-closing': [
        'warn',
        {
          html: {
            void: 'always',
            normal: 'never',
            component: 'always',
          },
          svg: 'always',
          math: 'always',
        },
      ],
      'vue/no-multiple-template-root': 'off',
      'vue/padding-line-between-blocks': 'warn',
    },
  },
)
