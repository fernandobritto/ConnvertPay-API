module.exports = {
  env: {
    es2021: true,
    node: true
  },
  extends: [
    'standard',
	  'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: [
    '@typescript-eslint',
	  'prettier'
  ],
  rules: {
	  'no-console': 'warn',
    'import/first': 'off',
	  'prettier/prettier': 'error',
	  camelcase: 'off'
  }
}
