import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Loading from './Loading';
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

const AccountList = ({refreshAccount, setIsSignedIn, setRefreshAccount}) => {
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const SignOut = async account => {
    await db.transaction(async tx => {
      await tx.executeSql(
        `DELETE FROM Users WHERE accountID='${account.accountID}'`,
        [],
        () => {},
        error => {
          console.log(error);
        },
      );
    });
    if (account.signedIn == 1 && accounts.length > 1) {
      await db.transaction(async tx => {
        await tx.executeSql(
          `SELECT * FROM Users LIMIT 1`,
          [],
          (tx, results) => {
            DefaultSwitchAccount(results.rows.item(0).accountID);
          },
        );
      });
    } else {
      setRefreshAccount(!refreshAccount);
    }
    console.log('removed');
  };
  const DefaultSwitchAccount = async accountID => {
    console.log(accountID);
    await db.transaction(async tx => {
      await tx.executeSql(
        `UPDATE Users SET signedIn=? WHERE accountID='${accountID}'`,
        ['1'],
        () => {},
        error => {
          console.log(error);
        },
      );
    });
    setRefreshAccount(!refreshAccount);
  };
  const loadAccounts = async () => {
    console.log('loading accounts');
    let accountsTemp = [];
    let noneSignedIn = true;
    const accountLoop = async (len, results) => {
      return new Promise((resolve, reject) => {
        for (let i = 0; i < len; i++) {
          accountsTemp.push({
            accountID: results.rows.item(i).accountID,
            username: results.rows.item(i).username,
            signedIn: results.rows.item(i).signedIn,
          });
          if (results.rows.item(i).signedIn == 1) {
            noneSignedIn = false;
          }
        }
        resolve();
      });
    };
    await db.transaction(async tx => {
      await tx.executeSql(`SELECT * FROM Users`, [], (tx, results) => {
        var len = results.rows.length;
        accountLoop(len, results).then(() => {
          setAccounts(accountsTemp);
          if (len == 0) {
            setIsSignedIn(false);
          }
          if (noneSignedIn) {
            DefaultSwitchAccount(accountsTemp[0].accountID);
          }
        });
      });
    });
    setLoading(false);
  };
  const SwitchAccount = async account => {
    if (account.signedIn == 0) {
      await db.transaction(async tx => {
        await tx.executeSql(
          `UPDATE Users SET signedIn=?`,
          ['0'],
          () => {},
          error => {
            console.log(error);
          },
        );
      });
      await db.transaction(async tx => {
        await tx.executeSql(
          `UPDATE Users SET signedIn=? WHERE accountID='${account.accountID}'`,
          ['1'],
          () => {},
          error => {
            console.log(error);
          },
        );
      });
      setRefreshAccount(!refreshAccount);
    }
  };
  useEffect(() => {
    db.executeSql('PRAGMA foreign_keys = ON');
    setLoading(true);
  }, [refreshAccount]);
  useEffect(() => {
    if (loading) loadAccounts();
  }, [loading]);
  return loading ? (
    <Loading />
  ) : (
    <View>
      {accounts.map(account => {
        return (
          <View key={account.accountID}>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 5,
              }}
              onPress={() => SwitchAccount(account)}>
              <Text
                style={
                  account.signedIn == 1
                    ? {color: 'black', fontWeight: 'bold'}
                    : {color: 'black'}
                }>
                {account.username}
              </Text>
              <TouchableOpacity onPress={() => SignOut(account)}>
                <Text>Remove</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
};

export default AccountList;
