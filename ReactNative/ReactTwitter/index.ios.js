/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import { AppRegistry } from 'react-native'

var MainNavigator = require('./core/views/main-navigator.js')

AppRegistry.registerComponent('ReactTwitter', () => MainNavigator)
