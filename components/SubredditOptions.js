import React from 'react';
import {View} from 'react-native';
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

export default SubredditOptions;
