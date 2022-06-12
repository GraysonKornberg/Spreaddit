import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

const HomeScreen = ({navigation}) => {
  return (
    <View>
      <Text>
        Multiposter is a tool that allows you to create a single post and post
        it to as many subreddits as you want. Subreddits have their own rules
        for what kind of posts they allow, so if you would like to adjust the
        contents for a particular subreddit, this app has the ability to do
        that.
      </Text>
      <Text>1. Create post</Text>
      <Text>2. Choose subreddits</Text>
      <Text>
        3. Edit flairs/adjust the post for individual subreddits if needed
      </Text>
      <Text>4. Submit</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.push('Create Post')}>
        <Text>Create Post</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: '#cee3f8',
    padding: 25,
    borderRadius: 10,
  },
});

export default HomeScreen;
