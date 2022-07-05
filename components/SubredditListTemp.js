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
    console.log(group.selected);
    if (group.selected) {
      for (let i = 0; i < group.subreddits.rows.length; i++) {
        let subredditCopy = subreddits.filter(sub => {
          return (
            sub.name.toLowerCase() ==
            group.subreddits.rows.item(i).subredditName.toLowerCase()
          );
        });
        enableSubreddit(subredditCopy[0]);
      }
    } else {
      for (let i = 0; i < group.subreddits.rows.length; i++) {
        let subredditCopy = subreddits.filter(sub => {
          return (
            sub.name.toLowerCase() ==
            group.subreddits.rows.item(i).subredditName.toLowerCase()
          );
        });
        disableSubreddit(subredditCopy[0]);
      }
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
          console.log(allowed);
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
  const disableSubreddit = async subredditToggle => {
    let subredditCopy = subreddits.filter(sub => {
      return sub.name == subredditToggle.name;
    });
    await db.transaction(async tx => {
      await tx.executeSql(
        `SELECT * FROM Subreddits WHERE subredditName='${subredditToggle.name}'`,
        [],
        async (tx, results) => {
          let allowed = await CheckIfAllowed(results.rows.item(0));
          console.log(allowed);
          if (allowed) {
            subredditCopy[0].selected = false;
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
  const enableSubreddit = async subredditToggle => {
    console.log(subredditToggle);
    let subredditCopy = subreddits.filter(sub => {
      return sub.name == subredditToggle.name;
    });
    await db.transaction(async tx => {
      await tx.executeSql(
        `SELECT * FROM Subreddits WHERE subredditName='${subredditToggle.name}'`,
        [],
        async (tx, results) => {
          let allowed = await CheckIfAllowed(results.rows.item(0));
          console.log(allowed);
          if (allowed) {
            subredditCopy[0].selected = true;
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
  return (
    <View>
      {groups.map(group => (
        <View key={group.name} style={styles.subredditContainer}>
          <Text style={styles.text}>{group.name}</Text>
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
  subredditContainer: {
    flexDirection: 'row',
    borderWidth: 2,
  },
});

export default SubredditListTemp;
