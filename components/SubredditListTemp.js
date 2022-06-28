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

const SubredditListTemp = ({subreddits, setSubreddits, CheckIfAllowed}) => {
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
  return (
    <View>
      {subreddits.map(subreddit => (
        <View key={subreddit.name} style={styles.subredditContainer}>
          <Text style={styles.text}>{subreddit.name}</Text>
          <TouchableOpacity
            style={styles.icon}
            onPress={() => toggleSubreddit(subreddit)}>
            {subreddit.selected ? (
              <Icon name="check-square" color={'black'} size={40} />
            ) : (
              <Icon name="square" color={'black'} size={40} />
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
