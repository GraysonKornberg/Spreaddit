import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import Snackbar from 'react-native-snackbar';
import Loading from './Loading';
import Icon from 'react-native-vector-icons/FontAwesome';
import SQLite from 'react-native-sqlite-storage';
import Dialog from 'react-native-dialog';

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

const Preset = ({navigation, currAccountID}) => {
  const [groups, setGroups] = useState([]);
  const [createPopUp, setCreatePopUp] = useState(false);
  const [loading, setLoading] = useState(true);
  const [inputName, setInputName] = useState('');
  const CreateTables = async () => {
    await db.transaction(async tx => {
      await tx.executeSql(
        'CREATE TABLE IF NOT EXISTS ' +
          'Groups ' +
          '(groupName TEXT PRIMARY KEY);',
      );
    });
    await db.transaction(async tx => {
      await tx.executeSql(
        'CREATE TABLE IF NOT EXISTS ' +
          'GroupsSubreddits ' +
          '(groupName TEXT, subredditID TEXT, accountID TEXT, PRIMARY KEY (groupName, subredditID, accountID), FOREIGN KEY (groupName) REFERENCES Groups (groupName) ON DELETE CASCADE ON UPDATE NO ACTION, FOREIGN KEY (subredditID) REFERENCES Subreddits (subredditID) ON DELETE CASCADE ON UPDATE NO ACTION, FOREIGN KEY (accountID) REFERENCES Users (accountID) ON DELETE CASCADE ON UPDATE NO ACTION);',
      );
    });
    await db.transaction(async tx => {
      await tx.executeSql(
        'CREATE TABLE IF NOT EXISTS ' +
          'UserGroups ' +
          '(accountID TEXT, groupName TEXT, PRIMARY KEY (accountID, groupName), FOREIGN KEY (accountID) REFERENCES Users (accountID) ON DELETE CASCADE ON UPDATE NO ACTION, FOREIGN KEY (groupName) REFERENCES Groups (groupName) ON DELETE CASCADE ON UPDATE NO ACTION);',
      );
    });
  };
  const LoadGroups = async () => {
    console.log('loading groups');
    let groupsTemp = [];
    const groupLoop = async (len, results) => {
      return new Promise((resolve, reject) => {
        for (let i = 0; i < len; i++) {
          groupsTemp.push(results.rows.item(i).groupName);
        }
        resolve();
      });
    };
    await db.transaction(async tx => {
      await tx.executeSql(
        `SELECT * FROM Groups LEFT JOIN UserGroups ON Groups.groupName = UserGroups.groupName WHERE UserGroups.accountID='${currAccountID}'`,
        [],
        (tx, results) => {
          var len = results.rows.length;
          if (len == 0) setLoading(false);
          groupLoop(len, results).then(() => {
            setGroups(groupsTemp);
            setLoading(false);
          });
        },
        error => console.log(error),
      );
    });
  };
  useEffect(() => {
    db.executeSql(`PRAGMA foreign_keys = ON`);
    CreateTables();
    LoadGroups();
  }, []);
  useEffect(() => {
    if (loading) LoadGroups();
  }, [loading]);
  useEffect(() => {
    const refreshPage = navigation.addListener('focus', () => {
      console.log('Refresh');
      LoadGroups();
    });
    return refreshPage;
  }, [navigation]);
  const handleCancel = () => {
    setCreatePopUp(false);
    setInputName('');
  };
  const handleOk = async () => {
    if (
      groups.some(group => {
        return inputName == group;
      })
    ) {
      Snackbar.show({
        text: 'Preset with this name already exists',
        duration: Snackbar.LENGTH_LONG,
      });
      setInputName('');
    } else {
      await db.transaction(async tx => {
        await tx.executeSql(
          `INSERT OR REPLACE INTO Groups (groupName) VALUES (?)`,
          [inputName],
        );
      });
      await db.transaction(async tx => {
        await tx.executeSql(
          `INSERT OR REPLACE INTO UserGroups (accountID, groupName) VALUES (?,?)`,
          [currAccountID, inputName],
        );
      });
      setInputName('');
      setLoading(true);
    }
    setCreatePopUp(false);
  };
  return loading ? (
    <Loading />
  ) : (
    <View style={{flex: 1}}>
      <Dialog.Container visible={createPopUp}>
        <Dialog.Title>Preset Name</Dialog.Title>
        <Dialog.Input
          onChangeText={setInputName}
          value={inputName}></Dialog.Input>
        <Dialog.Button
          label="Cancel"
          onPress={() => handleCancel()}></Dialog.Button>
        <Dialog.Button label="OK" onPress={() => handleOk()}></Dialog.Button>
      </Dialog.Container>
      <View>
        <TouchableOpacity
          style={{backgroundColor: '#cee3f8'}}
          onPress={() => setCreatePopUp(true)}>
          <Text
            style={{
              textAlign: 'center',
              fontWeight: 'bold',
              color: 'black',
              fontSize: 25,
            }}>
            Create New Preset
          </Text>
        </TouchableOpacity>
      </View>
      <View style={{marginTop: 5}}>
        <ScrollView style={{borderBottomWidth: 2}}>
          {groups.map(group => {
            return (
              <View
                key={group}
                style={{
                  borderTopWidth: 2,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    flex: 5,
                    marginLeft: 10,
                    fontSize: 20,
                    color: 'black',
                  }}>
                  {group}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    navigation.push('Preset Settings', {
                      group: group,
                    });
                  }}
                  style={{flex: 1}}>
                  <Icon name="gear" size={40} />
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

export default Preset;
