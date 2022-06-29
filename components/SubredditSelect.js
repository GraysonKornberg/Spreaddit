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
import Snackbar from 'react-native-snackbar';
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
  }, []);
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
          });
        },
      );
    });
  };
  const ValidSubreddit = async subreddit => {
    fetch(`https://www.reddit.com/r/${subreddit}.json`).then(res => {
      if (res.status != 200) {
        console.log('ERROR');
        return false;
      }
      res.json().then(data => {
        if (data.data.after != null) {
          return true;
        } else {
          alert('Invalid subreddit. Check your spelling and try again.');
          return false;
        }
      });
    });
  };
  const FetchSubredditData = async subreddit => {
    if (!ValidSubreddit(subreddit)) {
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
        alert(`This subreddit doesn't allow text posts`);
      } else {
        if (text.length > 0) {
          if (subreddit.bodyRestrictionPolicy == 'notAllowed') {
            allowed = false;
            alert(`This subreddit does not allow body text.`);
          } else {
            allowed = true;
          }
        } else if (text.length == 0) {
          if (subreddit.submissionType == 'required') {
            allowed = false;
            alert(`This subreddit requires body text`);
          } else {
            allowed = true;
          }
        }
      }
    } else if (postType == 'ImagePost') {
      if (subreddit.allowImages == 0) {
        alowed = false;
        alert(`This subreddit doesn't allow image posts.`);
      } else {
        allowed = true;
      }
    } else if (postType == 'VideoPost') {
      if (subreddit.allowVideos == 0) {
        allowed = false;
        alert(`This subreddit doesn't allow video posts.`);
      } else {
        allowed = true;
      }
    } else if (postType == 'LinkPost') {
      if (subreddit.submissionType == 'self') {
        allowed = false;
        alert("This subreddit doesn't allow link posts.");
      } else {
        allowed = true;
      }
    }
    return allowed;
  };
  const AddSubredditSearch = async subreddit => {
    if (subreddits.some(sub => sub.name == subreddit && sub.selected)) {
      alert('Subreddit already added');
      setSubredditSearch('');
      return;
    }
    await db.transaction(async tx => {
      await tx.executeSql(
        `SELECT * FROM Subreddits WHERE subredditName='${subreddit}'`,
        [],
        async (tx, results) => {
          if (results.rows.length == 0) {
            console.log('fetching subreddit data');
            FetchSubredditData(subreddit);
          } else {
            console.log('subreddit already in database');
            let allowed = await CheckIfAllowed(results.rows.item(0));
            if (allowed) {
              let subredditCopy = subreddits.filter(sub => {
                return sub.name == subreddit;
              });
              subredditCopy[0].selected = true;
              const index = subreddits.findIndex(sub => sub.name == subreddit);
              setSubreddits([
                subredditCopy[0],
                ...subreddits.slice(0, index),
                ...subreddits.slice(index + 1),
              ]);
            }
          }
        },
      );
    });
    setSubredditSearch('');
  };
  return (
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
                alert('Field cannot be left blank');
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
