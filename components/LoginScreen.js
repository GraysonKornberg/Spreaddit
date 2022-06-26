import React, {useEffect} from 'react';
import {authorize, refresh} from 'react-native-app-auth';
import {View, Text, Alert, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import secrets from '../secrets';
import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase(
  {
    name: 'mainDB',
    location: 'default',
  },
  () => {},
  error => {
    console.log(error);
  },
);

const config = {
  redirectUrl: 'com.spreaddit://oauthredirect',
  clientId: secrets.client_id,
  clientSecret: '', // empty string - needed for iOS
  scopes: ['identity', 'submit', 'flair'],
  serviceConfiguration: {
    authorizationEndpoint: 'https://old.reddit.com/api/v1/authorize.compact',
    tokenEndpoint: 'https://www.reddit.com/api/v1/access_token',
  },
  customHeaders: {
    token: {
      Authorization: secrets.authorization,
    },
  },
  additionalParameters: {
    duration: 'permanent',
  },
};

const LoginScreen = ({navigation, setIsSignedIn, setAccessToken}) => {
  useEffect(() => {
    createTable();
    db.transaction(tx => {
      tx.executeSql(`SELECT * FROM USERS`, [], (tx, results) => {
        if (results.rows.length > 0) {
          setIsSignedIn(true);
        }
      });
    });
  }, []);
  const LoginButton = async () => {
    try {
      const authState = await authorize(config);
      setAccessToken(authState.accessToken);
      await fetch(`https://oauth.reddit.com/api/me.json`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `bearer ${authState.accessToken}`,
        },
      }).then(res => {
        if (res.status != 200) {
          console.log('ERROR');
          return;
        }
        res.json().then(async data => {
          const accountID = data.data.id;
          const username = data.data.name;
          const refreshToken = authState.refreshToken;
          await db.transaction(async tx => {
            await tx.executeSql(
              'INSERT INTO Users (accountID, username, refreshToken, signedIn) VALUES (?,?,?,?)',
              [accountID, username, refreshToken, '1'],
            );
          });
        });
      });
      setIsSignedIn(true);
    } catch (error) {
      Alert.alert('Failed to log in', error.message);
    }
  };
  const createTable = () => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS ' +
          'Users ' +
          '(accountID TEXT PRIMARY KEY, username TEXT, refreshToken TEXT, signedIn INTEGER);',
      );
    });
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
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#cee3f8',
    alignSelf: 'center',
    borderRadius: 10,
    height: 100,
    width: 350,
    justifyContent: 'center',
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
