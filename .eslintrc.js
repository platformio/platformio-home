module.exports = {
  "env": {
    "browser": true,
    "es6": true,
    "node": true
  },
  "globals": {
    "APP_VERSION": true,
    "getQueryVariable": true
  },
  "plugins": [
    "import",
    "react"
  ],
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:import/errors",
    "plugin:import/warnings"
  ],
  "parser": "@babel/eslint-parser",
  "parserOptions": {
    "ecmaVersion": 6,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "settings": {
    "import/resolver": {
      "webpack": {
        "config": "scripts/webpack.dev.config.js"
      }
    },
    "import/ignore": [
      "node_modules"
    ],
    "react": {
      "version": "detect",
    }
  },
  "rules": {
    "curly": [
      "warn",
      "all"
    ],
    "linebreak-style": [
      "error",
      "unix"
    ],
    "no-console": [
      "error",
      {
        "allow": ["warn", "error", "info"]
      }
    ],
    "prefer-const": "error",
    "quotes": [
      "error",
      "single",
      "avoid-escape"
    ],
    "semi": [
      "error",
      "always"
    ],
    "sort-imports": [
      "warn",
      {
        "ignoreCase": false,
        "ignoreMemberSort": false,
        "memberSyntaxSortOrder": ["none", "all", "multiple", "single"]
      }
    ],
    "no-useless-escape": [
      "off"
    ],
    "no-empty": [
      "warn",
      {
        "allowEmptyCatch": true
      }
    ],
    "import/no-named-as-default-member": [
      "off"
    ],
    "react/prop-types": [
      "off"
    ]
  }
};
