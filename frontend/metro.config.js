const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Fix for PKCE resolution issues on some Windows setups with non-ASCII paths
config.resolver.alias = {
  "../PKCE": "./node_modules/expo-auth-session/build/PKCE.js"
};

module.exports = withNativeWind(config, { input: "./global.css" });
