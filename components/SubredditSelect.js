import React, {useState, useEffect} from 'react';
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
import SubredditListTemp from './SubredditListTemp';
import Loading from './Loading';
import Snackbar from 'react-native-snackbar';
import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(false);
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

const SubredditSelect = ({
  navigation,
  subreddits,
  setSubreddits,
  accessToken,
  subredditSearch,
  setSubredditSearch,
  postType,
  text,
  title,
  link,
  filePath,
  nsfwToggle,
  spoilerToggle,
  currAccountID,
  setCurrAccountID,
}) => {
  const [groups, setGroups] = useState([]);
  const [loading1, setLoading1] = useState(true);
  const [loading2, setLoading2] = useState(true);
  const CreateTables = () => {
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
    db.executeSql(`PRAGMA foreign_keys = ON`);
    CreateTables();
    setSubredditSearch('');
    LoadSubreddits();
    LoadGroups();
  }, []);
  const LoadGroups = async () => {
    console.log('loading groups');
    let groupsTemp = [];
    const groupLoop = async (len, results) => {
      return new Promise(async (resolve, reject) => {
        const subredditsLoop = async () => {
          for (let i = 0; i < len; i++) {
            let GroupSubreddits;
            let _groupName = results.rows.item(i).groupName;
            let _promise = await new Promise(async (resolve, reject) => {
              await db.transaction(async tx => {
                await tx.executeSql(
                  `SELECT * FROM Subreddits LEFT JOIN GroupsSubreddits ON Subreddits.SubredditID = GroupsSubreddits.SubredditID WHERE GroupsSubreddits.groupName='${_groupName}' AND GroupsSubreddits.accountID='${currAccountID}'`,
                  [],
                  (tx, results) => {
                    groupsTemp.push({
                      name: _groupName,
                      selected: false,
                      subreddits: results,
                    });
                    resolve();
                  },
                  error => console.log(error),
                );
              });
            });
          }
        };
        await subredditsLoop();
        resolve();
      });
    };
    await db.transaction(async tx => {
      await tx.executeSql(
        `SELECT * FROM UserGroups WHERE UserGroups.accountID = '${currAccountID}'`,
        [],
        (tx, results) => {
          var len = results.rows.length;
          groupLoop(len, results).then(() => {
            setGroups(groupsTemp);
            setLoading2(false);
          });
        },
      );
    });
  };
  const LoadSubreddits = async () => {
    console.log('loading subreddits');
    let subredditsTemp = [];
    const subredditLoop = async (len, results) => {
      return new Promise((resolve, reject) => {
        for (let i = 0; i < len; i++) {
          subredditsTemp.push({
            name: results.rows.item(i).subredditName,
            needFlair: results.rows.item(i).needFlair == 0 ? false : true,
            flairList: [],
            selectedFlair: '',
            nsfw: nsfwToggle,
            spoiler: spoilerToggle,
            spoilerEnabled: results.rows.item(i).spoilersEnabled,
            title: title,
            text: text,
            link: link,
            filePath: filePath,
            selected: false,
          });
        }
        resolve();
      });
    };
    await db.transaction(async tx => {
      await tx.executeSql(
        `SELECT * FROM Subreddits LEFT JOIN UserSubreddits ON Subreddits.subredditID = UserSubreddits.subredditID WHERE UserSubreddits.accountID='${currAccountID}'`,
        [],
        (tx, results) => {
          var len = results.rows.length;
          subredditLoop(len, results).then(() => {
            setSubreddits(subredditsTemp);
            setLoading1(false);
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
              text: 'Invalid Subreddit',
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
        `INSERT OR REPLACE INTO UserSubreddits (accountID, subredditID) VALUES (?,?)`,
        [currAccountID, id],
      );
    });
    let allowed = await CheckIfAllowed({
      id: id,
      subredditName: name,
      submissionType: submissionType,
      allowImages: allowImages,
      allowVideos: allowVideos,
      bodyRestrictionPolicy: bodyRestrictionPolicy,
    });
    if (allowed) {
      setSubreddits([
        {
          name: name,
          needFlair: needFlair == 0 ? false : true,
          flairList: [],
          selectedFlair: '',
          nsfw: nsfwToggle,
          spoiler: spoilerToggle,
          spoilerEnabled: spoilersEnabled,
          title: title,
          text: text,
          link: link,
          filePath: filePath,
          selected: true,
        },
        ...subreddits,
      ]);
    }
  };
  const CheckIfAllowed = async subreddit => {
    let allowed = false;
    if (postType == 'TextPost') {
      if (subreddit.submissionType == 'link') {
        allowed = false;
        Snackbar.show({
          text: subreddit.subredditName + ` doesn't allow text posts`,
          duration: Snackbar.LENGTH_LONG,
        });
      } else {
        if (text.length > 0) {
          if (subreddit.bodyRestrictionPolicy == 'notAllowed') {
            allowed = false;
            console.log(subreddit);
            Snackbar.show({
              text: subreddit.subredditName + ` does not allow body text.`,
              duration: Snackbar.LENGTH_LONG,
            });
          } else {
            allowed = true;
          }
        } else if (text.length == 0) {
          if (subreddit.submissionType == 'required') {
            allowed = false;
            Snackbar.show({
              text: subreddit.subredditName + ` requires body text`,
              duration: Snackbar.LENGTH_LONG,
            });
          } else {
            allowed = true;
          }
        }
      }
    } else if (postType == 'ImagePost') {
      if (subreddit.allowImages == 0) {
        allowed = false;
        Snackbar.show({
          text: subreddit.subredditName + ` doesn't allow image posts.`,
          duration: Snackbar.LENGTH_LONG,
        });
      } else {
        allowed = true;
      }
    } else if (postType == 'VideoPost') {
      if (subreddit.allowVideos == 0) {
        allowed = false;
        Snackbar.show({
          text: subreddit.subredditName + ` doesn't allow video posts.`,
          duration: Snackbar.LENGTH_LONG,
        });
      } else {
        allowed = true;
      }
    } else if (postType == 'LinkPost') {
      if (subreddit.submissionType == 'self') {
        allowed = false;
        Snackbar.show({
          text: subreddit.subredditName + ` doesn't allow link posts`,
          duration: Snackbar.LENGTH_LONG,
        });
      } else {
        allowed = true;
      }
    }
    return allowed;
  };
  const AddSubredditSearch = async subreddit => {
    if (
      subreddits.some(
        sub =>
          sub.name.toLowerCase() == subreddit.toLowerCase() && sub.selected,
      )
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
            FetchSubredditData(subreddit);
          } else {
            console.log('subreddit already in database');
            let allowed = await CheckIfAllowed(results.rows.item(0));
            await db.transaction(async tx => {
              await tx.executeSql(
                `INSERT OR REPLACE INTO UserSubreddits (accountID, subredditID) VALUES (?,?)`,
                [currAccountID, results.rows.item(0).subredditID],
              );
            });
            if (allowed) {
              await db.transaction(async tx => {
                await tx.executeSql(
                  `SELECT * FROM Subreddits LEFT JOIN UserSubreddits ON Subreddits.subredditID=UserSubreddits.subredditID WHERE accountID='${currAccountID}' AND subredditName='${subreddit}' COLLATE NOCASE`,
                  [],
                  async (tx, results2) => {
                    if (results2.rows.length == 0) {
                      setSubreddits([
                        {
                          name: results.rows.item(0).subredditName,
                          needFlair:
                            results.rows.item(0).needFlair == 0 ? false : true,
                          flairList: [],
                          selectedFlair: '',
                          nsfw: nsfwToggle,
                          spoiler: spoilerToggle,
                          spoilerEnabled: results.rows.item(0).spoilersEnabled,
                          title: title,
                          text: text,
                          link: link,
                          filePath: filePath,
                          selected: true,
                        },
                        ...subreddits,
                      ]);
                    } else {
                      let subredditCopy = subreddits.filter(sub => {
                        return (
                          sub.name.toLowerCase() == subreddit.toLowerCase()
                        );
                      });
                      subredditCopy[0].selected = true;
                      const index = subreddits.findIndex(
                        sub =>
                          sub.name.toLowerCase() == subreddit.toLowerCase(),
                      );
                      setSubreddits([
                        subredditCopy[0],
                        ...subreddits.slice(0, index),
                        ...subreddits.slice(index + 1),
                      ]);
                    }
                  },
                );
              });
            }
          }
        },
      );
    });
    setSubredditSearch('');
  };
  return !loading1 && !loading2 ? (
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
            <SubredditListTemp
              CheckIfAllowed={CheckIfAllowed}
              style={styles.subredditsContainer}
              subreddits={subreddits}
              groups={groups}
              setGroups={setGroups}
              setSubreddits={setSubreddits}
            />
          </ScrollView>
        </View>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => {
            if (subreddits.length != 0)
              navigation.push('Flairs and Customization');
            else
              Snackbar.show({
                text: 'Must add at least one subreddit',
                duration: Snackbar.LENGTH_LONG,
              });
          }}>
          <Text style={styles.nextButtonText}>Flairs and Customization</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  ) : (
    <Loading />
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
  nextButtonText: {
    fontSize: 25,
    color: 'black',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  nextButton: {
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 2,
    marginLeft: 25,
    marginRight: 25,
    marginBottom: 15,
    backgroundColor: '#cee3f8',
    borderRadius: 10,
  },
});

export default SubredditSelect;
