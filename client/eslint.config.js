import antfu from '@antfu/eslint-config'
import betterTailwindcss from 'eslint-plugin-better-tailwindcss'
import jsxA11y from 'eslint-plugin-jsx-a11y'

export default antfu(
  {
    solid: true,
    typescript: {
      tsconfigPath: 'tsconfig.json',
      parserOptions: {
        projectService: {
          allowDefaultProject: ['*.js', '*.ts'],
          defaultProject: 'tsconfig.json',
        },
      },
    },
    stylistic: {
      indent: 2,
      quotes: 'single',
      semi: false,
    },
  },
  // Tailwind — full v4 support via better-tailwindcss
  {
    ...betterTailwindcss.configs.recommended,
    settings: {
      'better-tailwindcss': {
        entryPoint: 'src/styles.css',
      },
    },
    rules: {
      ...betterTailwindcss.configs.recommended.rules,
      'better-tailwindcss/enforce-consistent-line-wrapping': 'off',
      // Custom CSS classes defined in styles.css
      'better-tailwindcss/no-unknown-classes': ['error', {
        ignore: [
          'animate-fade-in',
          'animate-slide-in',
          'toast-exit',
        ],
      }],
    },
  },
  // Accessibility
  jsxA11y.flatConfigs.recommended,
  // Fix: antfu's solid config sets parserOptions.project while the typescript
  // config sets parserOptions.projectService — having both causes a parse error.
  // Override the solid config to remove the conflicting `project` setting.
  {
    files: ['**/*.tsx'],
    name: 'app/solid-parser-fix',
    languageOptions: {
      parserOptions: {
        project: null,
      },
    },
  },
  // Project overrides
  {
    rules: {
      'no-console': 'warn',
      // Too strict for this codebase — nullable strings/numbers as conditions
      // (e.g. `if (token)`, `if (userId)`) is idiomatic JS/TS.
      'ts/strict-boolean-expressions': 'off',
    },
  },
  // Markdown — disable rules that don't apply to our README
  {
    files: ['**/*.md'],
    rules: {
      'markdown/no-multiple-h1': 'off',
    },
  },
  // Markdown code blocks — disable type-aware linting (docs snippets, not app code)
  {
    files: ['**/*.md/**'],
    languageOptions: {
      parserOptions: {
        projectService: false,
      },
    },
  },
  // Ignore generated files + pnpm store volume (in container builds)
  {
    ignores: [
      'src/routeTree.gen.ts',
      'src/types/generated.ts',
      'public/mockServiceWorker.js',
      '.pnpm-store/',
    ],
  },
)
