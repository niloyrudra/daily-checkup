module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript"
  ],
  plugins: ["@typescript-eslint", "import"],
  parserOptions: {
    project: ["tsconfig.eslint.json"],    // your lint-only TS config
    tsconfigRootDir: __dirname,            // ← ensures __dirname/functions is base
    sourceType: "module",
  },
  ignorePatterns: [
    "lib/**",
    "generated/**",
    "*.config.js",
    ".eslintrc.js",
    "tsconfig.json",
    "tsconfig.dev.json"
  ],
  rules: {
    // Critical
    "no-console": ["error", { allow: ["warn","error"] }],
    "@typescript-eslint/strict-boolean-expressions": "error",
    // Demoted
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "import/no-unresolved": "off",
    "max-len": ["warn",{ code: 120 }],
    "quotes": ["error","double"],
    "indent": ["error",2],
    "object-curly-spacing": ["error","always"]
  },
  overrides: [
    {
      files: [
        "lib/**",
        "functions/lib/**",
        "functions/src/utils/**"
      ],
      rules: {
        "@typescript-eslint/*": "off",
        "import/no-unresolved": "off",
        "@typescript-eslint/no-non-null-assertion": "off"
      }
    }
  ]
};
