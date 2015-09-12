exports.config = {
  "modules": [
    "copy",
    "server",
    "jshint",
    "csslint",
    "require",
    "minify-js",
    "minify-css",
    "live-reload",
    "bower",
    "less",
    "react"
  ],
  "server": {
    "port": 3003,
    "views": {
      "compileWith": "html",
      "extension": "html"
    },
    "defaultServer": {
      "enabled": true
    }
  },
  "react": {
    "lib": undefined,
    "extensions": ["jsx"],
    "options": {
      "harmony": true,
      "sourceMap": true
    }
  },
  "bower": {
    "copy": {
      "mainOverrides": {
        "materialize": [
          "dist/css/materialize.css",
          "dist/js/materialize.js",
          { "dist/font": "./font" }
        ],
        "crossfilter": [
          "crossfilter.js"
        ]
      }
    }
  }
}