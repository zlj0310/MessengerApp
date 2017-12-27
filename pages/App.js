/**
 * Created by zhulijun on 2017/12/7.
 */

import React from 'react';
import { AppRegistry } from 'react-native';
import { StackNavigator } from 'react-navigation';
import storage from '../utils/storage'
global.storage = storage;

import LoginPage from './LoginPage';
import ChatList from './ChatList';
import ChatPage from './ChatPage';

const MessengerApp = StackNavigator({
    // Home: { screen: LoginPage },
    // ChatList: { screen: ChatList },
    Home: { screen: ChatList },
    LoginPage: { screen: LoginPage },
    ChatPage: { screen: ChatPage },
});

AppRegistry.registerComponent('MessengerApp', () => MessengerApp);