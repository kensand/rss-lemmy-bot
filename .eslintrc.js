module.exports = {
  env: {
    node: true,
  },
  settings: {},
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  overrides: [],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "5",
    sourceType: "script",
  },
  plugins: ["@typescript-eslint"],
  rules: {},
};
