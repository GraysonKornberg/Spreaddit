import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Button,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import RedditImageUploader from 'reddit-api-image-upload';

const Uploading = ({
  navigation,
  accessToken,
  subreddits,
  postType,
  filePath,
}) => {
  const [websocket, setWebsocket] = useState();
  const [num, setNum] = useState(0);
  const [listen, setListen] = useState(false);
  const [socketURL, setSocketURL] = useState('');
  const redditImageUploader = new RedditImageUploader({
    token: accessToken,
    userAgent: 'multiposter:v1.0.0 by grayson',
  });
  useEffect(() => {
    console.log(filePath.uri);
    const uploadPost = async subreddit => {
      const {imageURL, webSocketURL} = await redditImageUploader.uploadMedia(
        filePath.uri,
      );
      const makePostRequest = () => {
        let formdata = new FormData();
        formdata.append('title', subreddit.title);
        formdata.append('url', imageURL);
        formdata.append('sr', subreddit.name);
        formdata.append('nsfw', subreddit.nsfw);
        formdata.append('spoiler', subreddit.spoiler);
        formdata.append('flair_id', subreddit.selectedFlair);
        formdata.append('kind', 'image');
        formdata.append('api_type', 'json');
        formdata.append('resubmit', 'true');
        formdata.append('send_replies', 'true');
        formdata.append('validate_on_submit', 'false');
        fetch('https://oauth.reddit.com/api/submit', {
          method: 'POST',
          headers: {
            Authorization: `bearer ${accessToken}`,
            'user-agent': 'multiposter:v1.0.0 by grayson',
            'Content-Type': 'multipart/form-data',
          },
          body: formdata,
        }).then(res => {
          if (res.status != 200) {
            console.log('ERROR');
            return;
          }
          res.json().then(data => {
            console.log('submitted');
          });
        });
      };
      setSocketURL(webSocketURL);
      setListen(true);
      console.log(imageURL, webSocketURL);
      makePostRequest();
    };
    subreddits.map(subreddit => {
      uploadPost(subreddit);
    });
  }, []);
  useEffect(() => {
    if (listen) {
      setWebsocket(new WebSocket(socketURL));
    }
  }, [listen]);
  useEffect(() => {
    if (websocket) {
      websocket.onopen = e => {
        console.log('open');
      };
      websocket.onmessage = e => {
        console.log('received');
        console.log(e.data);
      };
    }
  }, [websocket, num]);
  return (
    <View>
      <Text>Uploading...</Text>
      <Text onPress={() => setNum(num + 1)}>{num}</Text>
      <Image source={{uri: filePath.uri}} style={styles.imageStyle} />
    </View>
  );
};

const styles = StyleSheet.create({
  imageStyle: {
    width: 200,
    height: 200,
    margin: 5,
  },
});

export default Uploading;
