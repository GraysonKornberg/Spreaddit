import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const SubredditListTemp = ({subreddits, setSubreddits}) => {
  const removeSubreddit = subredditRemove => {
    let newSubreddits = subreddits.filter(subreddit => {
      return subreddit != subredditRemove;
    });
    setSubreddits(newSubreddits);
  };
  return (
    <View>
      {subreddits.map(subreddit => (
        <View key={subreddit.name} style={styles.subredditContainer}>
          <Text style={styles.text}>{subreddit.name}</Text>
          <TouchableOpacity
            style={styles.icon}
            onPress={() => removeSubreddit(subreddit)}>
            <Icon name="remove" color={'red'} size={40} />
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
