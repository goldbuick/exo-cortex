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
    "port": 3002,
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
        ]
      }
    }
  },
  "copy": {
    "extensions": [
        "js",  "css",  "png",  "jpg",
      "jpeg",  "gif", "html",  "php",
       "eot",  "svg",  "ttf", "woff",
       "otf", "yaml","  kml",  "ico",
       "htc",  "htm", "json",  "txt",
       "xml",  "xsd",  "map",   "md",
       "mp4",  "dae"
    ],
    "exclude": [ ]
  }
}
