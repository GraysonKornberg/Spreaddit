import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Loading from './Loading';
import SQLite from 'react-native-sqlite-storage';
import Modal from 'react-native-modal';
import AccountList from './AccountList';
import {authorize, refresh} from 'react-native-app-auth';
import secrets from '../secrets';

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

const HomeScreen = ({
  navigation,
  setAccessToken,
  accessToken,
  setUsername,
  username,
  setIsSignedIn,
  currAccountID,
  setCurrAccountID,
  refreshToken,
  setRefreshToken,
}) => {
  const [loading, setLoading] = useState(true);
  const [accountsPopup, setAccountsPopup] = useState(false);
  const [refreshAccount, setRefreshAccount] = useState(false);
  const ClearUserTable = async () => {
    db.executeSql(`DROP TABLE IF EXISTS Users`);
    await db.transaction(async tx => {
      await tx.executeSql(`DELETE FROM Users`);
    });
  };
  const ClearSubredditsTable = async () => {
    db.executeSql(`DROP TABLE IF EXISTS Subreddits`);
    await db.transaction(async tx => {
      await tx.executeSql(`DELETE FROM Subreddits`);
    });
  };
  const ClearUserSubredditsTable = async () => {
    db.executeSql(`DROP TABLE IF EXISTS UserSubreddits`);
    await db.transaction(async tx => {
      await tx.executeSql(`DELETE FROM UserSubreddits`);
    });
  };
  const ClearGroupsSubredditsTable = async () => {
    db.executeSql(`DROP TABLE IF EXISTS GroupsSubreddits`);
    await db.transaction(async tx => {
      await tx.executeSql(`DELETE FROM GroupsSubreddits`);
    });
  };
  const ClearGroupsTable = async () => {
    db.executeSql(`DROP TABLE IF EXISTS Groups`);
    await db.transaction(async tx => {
      await tx.executeSql(`DELETE FROM Groups`);
    });
  };
  const ClearUserGroupsTable = async () => {
    db.executeSql(`DROP TABLE IF EXISTS UserGroups`);
    await db.transaction(async tx => {
      await tx.executeSql(`DELETE FROM UserGroups`);
    });
  };
  const AddAccount = async () => {
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
              `UPDATE Users SET signedIn=0 WHERE signedIn=1`,
              [],
              () => {},
              error => console.log(error),
            );
          });
          await db.transaction(async tx => {
            await tx.executeSql(
              'INSERT OR REPLACE INTO Users (accountID, username, refreshToken, signedIn) VALUES (?,?,?,?)',
              [accountID, username, refreshToken, '1'],
              () => {},
              error => console.log(error),
            );
          });
          setRefreshAccount(!refreshAccount);
        });
      });
    } catch (error) {
      console.log('Failed to log in', error.message);
    }
  };
  const DebugData = async () => {
    console.log('debugging');
    await db.transaction(async tx => {
      await tx.executeSql(`SELECT * FROM Users`, [], (tx, results) => {
        if (results.rows.length == 0) {
          setIsSignedIn(false);
        } else {
          DefaultSignIn();
        }
      });
    });
  };
  const DefaultSignIn = async () => {
    await db.transaction(async tx => {
      await tx.executeSql(
        `UPDATE Users SET signedIn=? WHERE accountID=(SELECT accountID FROM Users LIMIT 1)`,
        ['1'],
        () => {},
        error => {
          console.log(error);
        },
      );
    });
    setRefreshAccount(!refreshAccount);
  };
  const LoadAccount = async () => {
    let _refreshToken = '';
    await db.transaction(async tx => {
      await tx.executeSql(
        `SELECT accountID, username, refreshToken, signedIn FROM Users WHERE signedIn=1`,
        [],
        async (tx, results) => {
          var len = results.rows.length;
          if (len > 0) {
            _refreshToken = results.rows.item(0).refreshToken;
            setUsername(results.rows.item(0).username);
            setCurrAccountID(results.rows.item(0).accountID);
            setRefreshToken(_refreshToken);
            const result = await refresh(config, {
              refreshToken: _refreshToken,
            });
            setAccessToken(result.accessToken);
            setLoading(false);
          } else {
            DebugData();
          }
        },
        error => {
          console.log(error);
        },
      );
    });
  };
  const CreateTables = async () => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS ' +
          'Users ' +
          '(accountID TEXT PRIMARY KEY, username TEXT, refreshToken TEXT, signedIn INTEGER);',
      );
    });
    db.transaction(async tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS ' +
          'Groups ' +
          '(groupName TEXT PRIMARY KEY);',
      );
    });
    db.transaction(async tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS ' +
          'GroupsSubreddits ' +
          '(groupName TEXT, subredditID TEXT, accountID TEXT, PRIMARY KEY (groupName, subredditID, accountID), FOREIGN KEY (groupName) REFERENCES Groups (groupName) ON DELETE CASCADE ON UPDATE NO ACTION, FOREIGN KEY (subredditID) REFERENCES Subreddits (subredditID) ON DELETE CASCADE ON UPDATE NO ACTION, FOREIGN KEY (accountID) REFERENCES Users (accountID) ON DELETE CASCADE ON UPDATE NO ACTION);',
      );
    });
    db.transaction(async tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS ' +
          'UserGroups ' +
          '(accountID TEXT, groupName TEXT, PRIMARY KEY (accountID, groupName), FOREIGN KEY (accountID) REFERENCES Users (accountID) ON DELETE CASCADE ON UPDATE NO ACTION, FOREIGN KEY (groupName) REFERENCES Groups (groupName) ON DELETE CASCADE ON UPDATE NO ACTION);',
      );
    });
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS ' +
          'Subreddits ' +
          '(subredditID TEXT PRIMARY KEY, subredditName TEXT, submissionType TEXT, allowImages INTEGER, allowVideos INTEGER, bodyRestrictionPolicy TEXT, needFlair INTEGER, spoilersEnabled INTEGER);',
      );
    });
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS ' +
          'UserSubreddits ' +
          '(accountID TEXT, subredditID TEXT, PRIMARY KEY (accountID, subredditID), FOREIGN KEY (accountID) REFERENCES Users (accountID) ON DELETE CASCADE ON UPDATE NO ACTION, FOREIGN KEY (subredditID) REFERENCES Subreddits (subredditID) ON DELETE CASCADE ON UPDATE NO ACTION);',
      );
    });
  };
  useEffect(() => {
    // ClearUserTable();
    // ClearSubredditsTable();
    // ClearUserSubredditsTable();
    // ClearGroupsTable();
    // ClearGroupsSubredditsTable();
    // ClearUserGroupsTable();
    CreateTables();
    db.executeSql('PRAGMA foreign_keys = ON');
    if (loading) {
      LoadAccount();
    }
  }, [loading]);
  useEffect(() => {
    setLoading(true);
  }, [refreshAccount]);
  return loading ? (
    <Loading />
  ) : (
    <View style={styles.container}>
      <Text style={{fontSize: 40, fontWeight: 'bold', color: 'black', flex: 1}}>
        Hello u/{username}
      </Text>
      <View style={{flex: 3, justifyContent: 'flex-start'}}>
        <TouchableOpacity
          style={styles.button1}
          onPress={() => navigation.push('Create Post')}>
          <Text style={{color: 'black', fontSize: 20, fontWeight: 'bold'}}>
            Create Post
          </Text>
        </TouchableOpacity>
        <Modal isVisible={accountsPopup} style={{alignItems: 'center'}}>
          <View style={styles.accountContainer}>
            <View style={styles.accountHeaderBar}>
              <TouchableOpacity
                style={{flex: 1}}
                onPress={() => setAccountsPopup(false)}>
                <Text
                  style={{
                    color: 'black',
                    fontWeight: 'bold',
                    fontSize: 20,
                    textAlign: 'center',
                  }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <Text
                style={{
                  textAlign: 'center',
                  flex: 1,
                  fontWeight: 'bold',
                  color: 'black',
                  fontSize: 20,
                }}>
                Accounts
              </Text>
              <TouchableOpacity onPress={() => AddAccount()} style={{flex: 1}}>
                <Text
                  style={{
                    textAlign: 'center',
                    fontWeight: 'bold',
                    color: 'black',
                    fontSize: 20,
                  }}>
                  Add
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.accountList}>
              <AccountList
                setRefreshAccount={setRefreshAccount}
                setIsSignedIn={setIsSignedIn}
                refreshAccount={refreshAccount}
              />
            </View>
          </View>
        </Modal>
        <TouchableOpacity
          style={styles.button1}
          onPress={() => navigation.push('Presets')}>
          <Text style={{color: 'black', fontSize: 20, fontWeight: 'bold'}}>
            Presets
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button1}
          onPress={() => setAccountsPopup(true)}>
          <Text style={{color: 'black', fontSize: 20, fontWeight: 'bold'}}>
            Accounts
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  accountHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginTop: 40,
  },
  button1: {
    alignItems: 'center',
    backgroundColor: '#cee3f8',
    padding: 25,
    borderRadius: 10,
    marginBottom: 30,
  },
  button2: {
    alignItems: 'center',
    backgroundColor: '#cee3f8',
    padding: 25,
    borderRadius: 10,
  },
  button3: {
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: '#cee3f8',
    padding: 25,
    borderRadius: 10,
  },
  accountContainer: {
    position: 'absolute',
    height: 250,
    width: 300,
    backgroundColor: 'white',
    borderRadius: 20,
  },
});

export default HomeScreen;
