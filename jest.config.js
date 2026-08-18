module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native|@react-navigation|react-native-paper|react-native-safe-area-context|react-native-mmkv|react-native-document-picker|react-native-gesture-handler|react-native-screens|react-native-reanimated|react-native-worklets)/)',
  ],
};
