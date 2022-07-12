import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
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

const SubredditListTemp = ({
  subreddits,
  setSubreddits,
  CheckIfAllowed,
  groups,
  setGroups,
}) => {
  const toggleGroup = async group => {
    let groupCopy = groups.filter(preset => {
      return preset.name == group.name;
    });
    groupCopy[0].selected = !groupCopy[0].selected;
    const index = groups.findIndex(preset => preset.name == group.name);
    setGroups([
      ...groups.slice(0, index),
      groupCopy[0],
      ...groups.slice(index + 1),
    ]);
    let subredditsTemp = [];
    if (group.selected) {
      let promise = await new Promise(async (resolve, reject) => {
        for (let i = 0; i < group.subreddits.rows.length; i++) {
          let subredditCopy = subreddits.filter(sub => {
            return (
              sub.name.toLowerCase() ==
              group.subreddits.rows.item(i).subredditName.toLowerCase()
            );
          });
          if (!subredditCopy[0].selected) subredditsTemp.push(subredditCopy[0]);
        }
        resolve();
      });
      enableSubreddits(subredditsTemp);
    } else {
      let promise = await new Promise(async (resolve, reject) => {
        for (let i = 0; i < group.subreddits.rows.length; i++) {
          let subredditCopy = subreddits.filter(sub => {
            return (
              sub.name.toLowerCase() ==
              group.subreddits.rows.item(i).subredditName.toLowerCase()
            );
          });
          if (subredditCopy[0].selected) subredditsTemp.push(subredditCopy[0]);
        }
        resolve();
      });
      disableSubreddits(subredditsTemp);
    }
  };
  const toggleSubreddit = async subredditToggle => {
    let subredditCopy = subreddits.filter(sub => {
      return sub.name == subredditToggle.name;
    });
    await db.transaction(async tx => {
      await tx.executeSql(
        `SELECT * FROM Subreddits WHERE subredditName='${subredditToggle.name}'`,
        [],
        async (tx, results) => {
          let allowed = await CheckIfAllowed(results.rows.item(0));
          if (allowed) {
            subredditCopy[0].selected = !subredditCopy[0].selected;
            const index = subreddits.findIndex(
              sub => sub.name == subredditToggle.name,
            );
            if (subredditCopy[0].selected) {
              setSubreddits([
                subredditCopy[0],
                ...subreddits.slice(0, index),
                ...subreddits.slice(index + 1),
              ]);
            } else {
              setSubreddits([
                ...subreddits.slice(0, index),
                ...subreddits.slice(index + 1),
                subredditCopy[0],
              ]);
            }
          }
        },
      );
    });
  };
  const enableSubreddits = async subredditsList => {
    let subredditsCopy = subreddits;
    const enableLoop = async subredditToggle => {
      return new Promise(async (resolve, reject) => {
        let subredditCopy = subreddits.filter(sub => {
          return sub.name == subredditToggle.name;
        });
        await db.transaction(async tx => {
          await tx.executeSql(
            `SELECT * FROM Subreddits WHERE subredditName='${subredditToggle.name}'`,
            [],
            async (tx, results) => {
              let allowed = await CheckIfAllowed(results.rows.item(0));
              if (allowed) {
                subredditCopy[0].selected = true;
                const index = subredditsCopy.findIndex(
                  sub => sub.name == subredditToggle.name,
                );
                subredditsCopy = [
                  subredditCopy[0],
                  ...subredditsCopy.slice(0, index),
                  ...subredditsCopy.slice(index + 1),
                ];
                resolve();
              } else {
                resolve();
              }
            },
          );
        });
      });
    };
    let promise = await new Promise(async (resolve, reject) => {
      for (let i = 0; i < subredditsList.length; i++) {
        await enableLoop(subredditsList[i]);
      }
      resolve();
    });
    setSubreddits(subredditsCopy);
  };
  const disableSubreddits = async subredditsList => {
    let subredditsCopy = subreddits;
    const disableLoop = async subredditToggle => {
      return new Promise(async (resolve, reject) => {
        let subredditCopy = subreddits.filter(sub => {
          return sub.name == subredditToggle.name;
        });
        subredditCopy[0].selected = false;
        const index = subredditsCopy.findIndex(
          sub => sub.name == subredditToggle.name,
        );
        subredditsCopy = [
          ...subredditsCopy.slice(0, index),
          ...subredditsCopy.slice(index + 1),
          subredditCopy[0],
        ];
        resolve();
      });
    };
    let promise = await new Promise(async (resolve, reject) => {
      for (let i = 0; i < subredditsList.length; i++) {
        await disableLoop(subredditsList[i]);
      }
      resolve();
    });
    setSubreddits(subredditsCopy);
  };
  return (
    <View>
      {groups.map(group => (
        <View key={group.name} style={styles.groupContainer}>
          <Text style={styles.grouptext}>{group.name}</Text>
          <TouchableOpacity
            style={styles.icon}
            onPress={() => toggleGroup(group)}>
            {group.selected ? (
              <Icon name="check-square" size={40} />
            ) : (
              <Icon name="square" size={40} />
            )}
          </TouchableOpacity>
        </View>
      ))}
      {subreddits.map(subreddit => (
        <View key={subreddit.name} style={styles.subredditContainer}>
          <Text style={styles.text}>{subreddit.name}</Text>
          <TouchableOpacity
            style={styles.icon}
            onPress={() => toggleSubreddit(subreddit)}>
            {subreddit.selected ? (
              <Icon name="check-square" size={40} />
            ) : (
              <Icon name="square" size={40} />
            )}
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  icon: {marginRight: 10},
  text: {
    fontSize: 20,
    color: 'black',
    flex: 1,
    alignSelf: 'center',
    marginLeft: 10,
  },
  grouptext: {
    fontSize: 20,
    color: 'black',
    flex: 1,
    alignSelf: 'center',
    marginLeft: 10,
    fontWeight: 'bold',
  },
  subredditContainer: {
    flexDirection: 'row',
    borderWidth: 2,
  },
  groupContainer: {
    flexDirection: 'row',
    borderWidth: 2,
    backgroundColor: '#b1b1b1',
  },
});

export default SubredditListTemp;
