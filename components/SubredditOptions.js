import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
} from 'react-native';
import SubredditListCustomize from './SubredditListCustomize';

const SubredditOptions = ({
  navigation,
  subreddits,
  accessToken,
  setSubreddits,
}) => {
  return (
    <View>
      <SubredditListCustomize
        subreddits={subreddits}
        accessToken={accessToken}
        setSubreddits={setSubreddits}
        navigation={navigation}
      />
    </View>
  );
};

const styles = StyleSheet.create({});

export default SubredditOptions;
