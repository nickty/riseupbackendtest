module.exports = {
  'import/no-extraneous-dependencies': [
    'error',
    {
      devDependencies: ['**/.eslintrc.*', '**/*.test.*'],
    },
  ],
  'arrow-body-style': 'off',
};
