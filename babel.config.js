const path = require('path');

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    'react-native-worklets/plugin',
    '@babel/plugin-transform-class-static-block',
    ['module:react-native-dotenv', {
      moduleName: 'react-native-dotenv',
      path: path.resolve(__dirname, '.env'),
      whitelist: ['GEMINI_API_KEY', 'APP_ENV'],
      safe: false,
      allowUndefined: true,
    }],
  ],
};