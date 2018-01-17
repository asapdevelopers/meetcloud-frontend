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
    "import/no-extraneous-dependencies": 0,
    "new-cap": [1],
    "import/no-unresolved": [1, { ignore: ["^@storybook/react"] }],
    "no-underscore-dangle": 0,
    "import/extensions": ["error", "never", { packages: "always" }],
    "jsx-a11y/media-has-caption": [0],
    "no-console": [0],
    "react/prop-types": [1],
    "react/forbid-prop-types": 0,
    "react/jsx-filename-extension": [
      1,
      {
        extensions: [".js", ".jsx"]
      }
    ],
    "no-unused-vars": [
      1,
      {
        argsIgnorePattern: "event|res|next|^err"
      }
    ]
  }
};
