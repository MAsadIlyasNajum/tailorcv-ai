const path = require('path');

const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  resolver: {
    sourceExts: [...defaultConfig.resolver.sourceExts, 'mjs'],
    extraNodeModules: {
      semver: path.resolve(
        __dirname,
        'node_modules/react-native-reanimated/node_modules/semver',
      ),
    },
  },
};

module.exports = mergeConfig(defaultConfig, config);
