module.exports = {
  preset: 'react-native',
  modulePathIgnorePatterns: ['<rootDir>/.kilo/worktrees/'],
  testPathIgnorePatterns: ['<rootDir>/.kilo/worktrees/'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native|@react-navigation|react-native-safe-area-context|react-native-mmkv|@react-native-documents|react-native-gesture-handler|react-native-screens|react-native-worklets|react-native-html-to-pDF|react-native-blob-util|react-native-webview)/)',
  ],
};
