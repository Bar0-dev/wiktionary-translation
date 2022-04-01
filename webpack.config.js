const path = require("path");

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "wiktionary-translations.js",
    library: { name: "wiktionaryTransations", type: "umd" },
    globalObject: "this",
  },
  externals: {
    axios: "axios",
    "iso-639-1": {
      commonjs: "iso-639-1",
      commonjs2: "iso-639-1",
      amd: "iso-639-1",
    },
  },
};
