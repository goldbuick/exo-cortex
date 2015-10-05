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
    "react",
    "babel"
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
        ],
        "jquery.terminal": [
          "js/jquery.terminal-min.js",
          "css/jquery.terminal.css"
        ]
      }
    }
  },
  "babel": {
    "extensions": ["jsx"],
    "options": {
      "modules": "amd"
    }
  },
  "copy": {
  "extensions":
    ["js",  "css", "png", "jpg",
     "jpeg","gif", "html","php",
     "eot", "svg", "ttf", "woff", "woff2",
     "otf", "yaml","kml", "ico",
     "htc", "htm", "json","txt",
     "xml", "xsd", "map", "md",
     "mp4", "apng", "mng", "phtml",
     "volt", "fnt"],
    "exclude":[]
  }
}