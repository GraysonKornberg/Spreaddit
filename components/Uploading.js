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
  thumbnailPath,
}) => {
  const [websocket, setWebsocket] = useState();
  const [listen, setListen] = useState(false);
  const [socketURL, setSocketURL] = useState('');
  const redditImageUploader = new RedditImageUploader({
    token: accessToken,
    userAgent: 'multiposter:v1.0.0 by grayson',
  });
  useEffect(() => {
    const UploadImage = async subreddit => {
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
      setWebsocket(new WebSocket(webSocketURL));
      makePostRequest();
    };
    const UploadVideo = async subreddit => {
      let type = 'video';
      let {imageURL, webSocketURL} = await redditImageUploader.uploadMedia(
        filePath,
        type,
      );
      let videoURL = imageURL;
      type = 'image';
      imageURL = await redditImageUploader.uploadMedia(thumbnailPath, type);
      imageURL = imageURL.imageURL;
      const makePostRequest = () => {
        let formdata = new FormData();
        formdata.append('title', subreddit.title);
        formdata.append('url', videoURL);
        formdata.append('video_poster_url', imageURL);
        formdata.append('sr', subreddit.name);
        formdata.append('nsfw', subreddit.nsfw);
        formdata.append('spoiler', subreddit.spoiler);
        formdata.append('flair_id', subreddit.selectedFlair);
        formdata.append('kind', 'video');
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
            console.log(data.json);
            console.log('submitted');
          });
        });
      };
      setSocketURL(webSocketURL);
      setWebsocket(new WebSocket(webSocketURL));
      makePostRequest();
    };
    const UploadText = async subreddit => {
      const makePostRequest = () => {
        let formdata = new FormData();
        formdata.append('title', subreddit.title);
        formdata.append('sr', subreddit.name);
        formdata.append('nsfw', subreddit.nsfw);
        formdata.append('spoiler', subreddit.spoiler);
        formdata.append('flair_id', subreddit.selectedFlair);
        formdata.append('kind', 'self');
        formdata.append('api_type', 'json');
        formdata.append('resubmit', 'true');
        formdata.append('send_replies', 'true');
        formdata.append('validate_on_submit', 'false');
        if (subreddit.text.length > 0) {
          formdata.append('text', subreddit.text);
        }
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
      makePostRequest();
    };
    const UploadLink = async subreddit => {
      const makePostRequest = () => {
        let formdata = new FormData();
        formdata.append('title', subreddit.title);
        formdata.append('sr', subreddit.name);
        formdata.append('nsfw', subreddit.nsfw);
        formdata.append('spoiler', subreddit.spoiler);
        formdata.append('flair_id', subreddit.selectedFlair);
        formdata.append('kind', 'link');
        formdata.append('url', subreddit.link);
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
      makePostRequest();
    };
    if (postType == 'ImagePost') {
      subreddits.map(subreddit => {
        UploadImage(subreddit);
      });
    } else if (postType == 'TextPost') {
      subreddits.map(subreddit => {
        UploadText(subreddit);
      });
    } else if (postType == 'LinkPost') {
      subreddits.map(subreddit => {
        UploadLink(subreddit);
      });
    } else if (postType == 'VideoPost') {
      subreddits.map(subreddit => {
        UploadVideo(subreddit);
      });
    }
  }, []);
  useEffect(() => {
    if (websocket) {
      websocket.onmessage = e => {
        console.log('Message received: ' + e.data);
      };
    }
  }, [websocket]);
  return (
    <View>
      <Text>Uploading...</Text>
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
