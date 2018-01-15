module.exports = {
  extends: ["airbnb", "prettier", "prettier/react"],
  parser: "babel-eslint",
  parserOptions: {
    ecmaVersion: 8,
    ecmaFeatures: {
      experimentalObjectRestSpread: true,
      impliedStrict: true,
      classes: true
    }
  },
  env: {
    browser: true,
    node: true,
    jquery: true
  },
  rules: {
    "prefer-arrow-callback": 0,
    "import/no-extraneous-dependencies": 0,
    "import/no-unresolved": [1, { ignore: ["^@storybook/react"] }],
    "no-underscore-dangle": 0,
    "no-unused-expressions": 0,
    "import/extensions": ["error", "never", { packages: "always" }],
    "react/prop-types": [1],
    "react/display-name": 1,
    "react/react-in-jsx-scope": 0,
    "react/forbid-prop-types": 0,
    "react/no-unescaped-entities": 0,
    "react/jsx-filename-extension": [
      1,
      {
        extensions: [".js", ".jsx"]
      }
    ],
    "no-unused-vars": [
      1,
      {
        argsIgnorePattern: "res|next|^err"
      }
    ]
  }
};
