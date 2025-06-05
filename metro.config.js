// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = {
  ...getDefaultConfig(__dirname),
  resolver: {
    sourceExts: ["jsx", "js", "ts", "tsx", "cjs", "mjs", "json", "esm.js"],
  },
};

module.exports = config;
