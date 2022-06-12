import React, {useState} from 'react';
import {authorize} from 'react-native-app-auth';
import {
  View,
  Text,
  Button,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import secrets from '../secrets';

const config = {
  redirectUrl: 'com.spreaddit://oauthredirect',
  clientId: secrets.client_id,
  clientSecret: '', // empty string - needed for iOS
  scopes: ['identity, submit, flair'],
  serviceConfiguration: {
    authorizationEndpoint: 'https://old.reddit.com/api/v1/authorize.compact',
    tokenEndpoint: 'https://www.reddit.com/api/v1/access_token',
  },
  customHeaders: {
    token: {
      Authorization: secrets.authorization,
    },
  },
};

const LoginScreen = ({navigation, setIsSignedIn, setAccessToken}) => {
  const LoginButton = async () => {
    try {
      const authState = await authorize(config);
      setAccessToken(authState.accessToken);
      setIsSignedIn(true);
    } catch (error) {
      Alert.alert('Failed to log in', error.message);
    }
  };
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={authState => LoginButton()}>
        <Text style={styles.buttonText}>LOGIN WITH REDDIT</Text>
        <Icon
          name="reddit-alien"
          style={styles.icon}
          size={40}
          color={'#ff4500'}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#EBF4FC',
    paddingHorizontal: 20,
    paddingVertical: 325,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#cee3f8',
    padding: 25,
    borderRadius: 10,
    flex: 1,
    flexDirection: 'row',
  },
  buttonText: {
    alignItems: 'center',
    color: '#ff4500',
    fontWeight: 'bold',
    fontSize: 25,
    marginRight: 20,
  },
  icon: {
    top: -4,
  },
});

export default LoginScreen;
