const path = require("path");

module.exports = {
  mode: "development",
  entry: "./dist/src/index.js",
  output: {
    filename: "xvm.js",
    path: path.resolve(__dirname, "docs"),
  },
};
