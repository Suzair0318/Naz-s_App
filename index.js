/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
// npx react-native start --host 192.168.18.11
AppRegistry.registerComponent(appName, () => App);
