import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import Snackbar from 'react-native-snackbar';
import Dialog from 'react-native-dialog';
import Loading from './Loading';

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

const PresetSettings = ({navigation, route, accessToken, currAccountID}) => {
  const {group} = route.params;
  const [loading, setLoading] = useState(true);
  const [subreddits, setSubreddits] = useState([]);
  const [deletePopUp, setDeletePopUp] = useState(false);
  const [subredditSearch, setSubredditSearch] = useState('');
  const LoadGroup = async () => {
    console.log('loading subreddits');
    let subredditsTemp = [];
    const subredditLoop = async (len, results) => {
      return new Promise((resolve, reject) => {
        for (let i = 0; i < len; i++) {
          subredditsTemp.push(results.rows.item(i).subredditName);
        }
        resolve();
      });
    };
    await db.transaction(async tx => {
      await tx.executeSql(
        `SELECT * FROM Subreddits LEFT JOIN GroupsSubreddits ON Subreddits.SubredditID = GroupsSubreddits.SubredditID WHERE GroupsSubreddits.groupName='${group}' AND GroupsSubreddits.accountID='${currAccountID}' COLLATE NOCASE`,
        [],
        (tx, results) => {
          var len = results.rows.length;
          subredditLoop(len, results).then(() => {
            setSubreddits(subredditsTemp);
            setLoading(false);
          });
        },
      );
    });
  };
  const ValidSubreddit = async subreddit => {
    let valid = false;
    await fetch(`https://www.reddit.com/r/${subreddit}.json`).then(
      async res => {
        if (res.status != 200) {
          console.log('ERROR: res.status != 200');
          valid = false;
        }
        await res.json().then(async data => {
          if (data.data.after != null) {
            valid = true;
            console.log(valid);
          } else {
            Snackbar.show({
              text: 'Invalid subreddit',
              duration: Snackbar.LENGTH_LONG,
            });
            valid = false;
          }
        });
      },
    );
    return valid;
  };
  const FetchSubredditData = async subreddit => {
    let isValidSubreddit = await ValidSubreddit(subreddit);
    if (!isValidSubreddit) {
      return;
    }
    let submissionType = '';
    let allowImages = 0;
    let allowVideos = 0;
    let bodyRestrictionPolicy = '';
    let needFlair = 0;
    let name = '';
    let spoilersEnabled = 0;
    let id = '';
    await fetch(`https://www.reddit.com/r/${subreddit}/about.json`).then(
      res => {
        if (res.status != 200) {
          console.log('ERROR');
          return;
        }
        res.json().then(data => {
          submissionType = data.data.submission_type;
          data.data.allow_images == false
            ? (allowImages = 0)
            : (allowImages = 1);
          data.data.allow_videos == false
            ? (allowVideos = 0)
            : (allowVideos = 1);
          name = data.data.display_name;
          id = data.data.id;
          data.data.spoilers_enabled == false
            ? (spoilersEnabled = 0)
            : (spoilersEnabled = 1);
        });
      },
    );
    await fetch(
      `https://oauth.reddit.com/api/v1/${subreddit}/post_requirements.json`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `bearer ${accessToken}`,
        },
      },
    ).then(async res => {
      if (res.status != 200) {
        console.log('ERROR');
        return;
      }
      await res.json().then(data => {
        bodyRestrictionPolicy = data.body_restriction_policy;
        data.is_flair_required == false ? (needFlair = 0) : (needFlair = 1);
      });
    });
    await db.transaction(async tx => {
      await tx.executeSql(
        `INSERT OR REPLACE INTO Subreddits (subredditID, subredditName, submissionType, allowImages, allowVideos, bodyRestrictionPolicy, needFlair, spoilersEnabled) VALUES (?,?,?,?,?,?,?,?)`,
        [
          id,
          name,
          submissionType,
          allowImages,
          allowVideos,
          bodyRestrictionPolicy,
          needFlair,
          spoilersEnabled,
        ],
      );
    });
    await db.transaction(async tx => {
      await tx.executeSql(
        `INSERT OR REPLACE INTO GroupsSubreddits (groupName, subredditID, accountID) VALUES (?,?,?)`,
        [group, id, currAccountID],
      );
    });
    await db.transaction(async tx => {
      await tx.executeSql(
        `INSERT OR REPLACE INTO UserSubreddits (accountID, subredditID) VALUES (?,?)`,
        [currAccountID, id],
      );
    });
  };
  const AddSubredditSearch = async subreddit => {
    if (
      subreddits.some(sub => {
        sub.toLowerCase() == subreddit.toLowerCase() && sub.selected;
      })
    ) {
      Snackbar.show({
        text: 'Subreddit already added',
        duration: Snackbar.LENGTH_LONG,
      });
      setSubredditSearch('');
      return;
    }
    await db.transaction(async tx => {
      await tx.executeSql(
        `SELECT * FROM Subreddits WHERE subredditName='${subreddit}' COLLATE NOCASE`,
        [],
        async (tx, results) => {
          if (results.rows.length == 0) {
            console.log('fetching subreddit data');
            await FetchSubredditData(subreddit);
            setLoading(true);
          } else {
            console.log('subreddit already in database');
            await db.transaction(async tx => {
              await tx.executeSql(
                `INSERT OR REPLACE INTO GroupsSubreddits (groupName, subredditID, accountID) VALUES (?,?,?)`,
                [group, results.rows.item(0).subredditID, currAccountID],
                () => {
                  setLoading(true);
                },
                error => console.log(error),
              );
            });
            await db.transaction(async tx => {
              await tx.executeSql(
                `INSERT OR REPLACE INTO UserSubreddits (accountID, subredditID) VALUES (?,?)`,
                [currAccountID, results.rows.item(0).subredditID],
              );
            });
          }
        },
      );
    });
    setSubredditSearch('');
  };
  useEffect(() => {
    navigation.setOptions({title: `${group}`});
  }, []);
  useEffect(() => {
    if (loading) LoadGroup();
  }, [loading]);
  const handleCancel = () => {
    setDeletePopUp(false);
  };
  const handleDelete = async () => {
    await db.transaction(async tx => {
      await tx.executeSql(`DELETE FROM Groups WHERE groupName='${group}'`);
    });
    setDeletePopUp(false);
    navigation.pop();
  };
  return loading ? (
    <Loading />
  ) : (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.input}>
          <TextInput
            placeholder={'Subreddit'}
            value={subredditSearch}
            onChangeText={setSubredditSearch}
            style={styles.inputText}
            multiline={false}
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              if (subredditSearch) {
                AddSubredditSearch(subredditSearch);
              } else {
                Snackbar.show({
                  text: 'Field cannot be left blank',
                  duration: Snackbar.LENGTH_LONG,
                });
              }
            }}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.scrollViewContainer}>
          <ScrollView style={styles.scrollView}>
            {subreddits.map(subreddit => {
              return (
                <View key={subreddit}>
                  <Text style={{fontSize: 20}}>{subreddit}</Text>
                </View>
              );
            })}
          </ScrollView>
        </View>
        <Dialog.Container visible={deletePopUp}>
          <Dialog.Title>Preset Delete</Dialog.Title>
          <Dialog.Description>
            Do you want to delete this preset?
          </Dialog.Description>
          <Dialog.Button
            label="Cancel"
            onPress={() => handleCancel()}></Dialog.Button>
          <Dialog.Button
            label="Delete"
            onPress={() => handleDelete()}></Dialog.Button>
        </Dialog.Container>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => {
              setDeletePopUp(true);
            }}>
            <Text style={styles.confirmButtonText}>DELETE</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={() => {
              navigation.pop();
            }}>
            <Text style={styles.confirmButtonText}>CONFIRM</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContainer: {
    flex: 6,
    borderWidth: 2,
  },
  scrollView: {},
  input: {
    borderWidth: 1,
    height: 50,
    marginHorizontal: 10,
    flexDirection: 'row',
    marginBottom: 15,
    marginTop: 10,
  },
  inputText: {
    fontSize: 20,
    paddingLeft: 10,
    flex: 5,
    justifyContent: 'center',
  },
  addButton: {
    flex: 1,
    alignSelf: 'center',
    borderWidth: 2,
    marginRight: 10,
    backgroundColor: 'lightgreen',
  },
  addButtonText: {
    textAlign: 'center',
    fontSize: 20,
    color: 'black',
    textTransform: 'uppercase',
  },
  subredditsContainer: {marginBottom: 10},
  confirmButtonText: {
    fontSize: 25,
    color: 'black',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  confirmButton: {
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 2,
    marginLeft: 25,
    marginRight: 25,
    marginBottom: 15,
    backgroundColor: '#cee3f8',
    borderRadius: 10,
    padding: 10,
  },
  deleteButton: {
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 2,
    marginLeft: 25,
    marginRight: 25,
    marginBottom: 15,
    backgroundColor: 'red',
    borderRadius: 10,
    padding: 10,
  },
});

export default PresetSettings;
