import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Button,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
// import RedditImageUploader from 'reddit-api-image-upload';

const Uploading = ({
  navigation,
  accessToken,
  subreddits,
  postType,
  filePath,
}) => {
  // const redditImageUploader = new RedditImageUploader({
  //   token: accessToken,
  //   userAgent: 'multiposter:v1.0.0 by grayson',
  // });
  // useEffect(() => {
  //   const uploadPost = async subreddit => {
  //     const {mediaURL, webSocketURL} = await redditImageUploader.uploadMedia(
  //       filePath.uri,
  //     );
  //     fetch('https://oauth.reddit.com/api/submit', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/x-www-form-urlencoded',
  //         Authorization: `bearer ${accessToken}`,
  //       },
  //       json: {
  //         title: subreddit.title,
  //         url: mediaUrl,
  //         sr: subreddit.name,
  //         kind: 'link',
  //       },
  //     }).then(data => {
  //       console.log(webSocketURL);
  //     });
  //   };
  //   subreddits.map(subreddit => {
  //     uploadPost(subreddit);
  //   });
  // }, []);
  return (
    <View>
      <Text>Uploading...</Text>
    </View>
  );
};

export default Uploading;
