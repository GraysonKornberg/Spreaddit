import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import RedditImageUploader from 'reddit-api-image-upload';
import Snackbar from 'react-native-snackbar';

const Uploading = ({
  navigation,
  accessToken,
  subreddits,
  postType,
  filePath,
  thumbnailPath,
  setSubreddits,
  setTitle,
  setLink,
  setText,
  setFilePath,
  setThumbnailPath,
  setNsfwToggle,
  setSpoilerToggle,
  setPostType,
  setSubredditSearch,
}) => {
  const [error, setError] = useState(false);
  const [complete, setComplete] = useState(false);
  const [successCount, setSuccessCount] = useState(subreddits.length);
  const [websocket, setWebsocket] = useState();
  const redditImageUploader = new RedditImageUploader({
    token: accessToken,
    userAgent: 'multiposter:v1.0.0 by grayson',
  });
  useEffect(() => {
    const UploadImage = async subreddit => {
      const {imageURL, webSocketURL} = await redditImageUploader.uploadMedia(
        filePath.uri,
        'image',
        Platform.OS,
      );
      const makePostRequest = async () => {
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
        return fetch('https://oauth.reddit.com/api/submit', {
          method: 'POST',
          headers: {
            Authorization: `bearer ${accessToken}`,
            'user-agent': 'multiposter:v1.0.0 by grayson',
            'Content-Type': 'multipart/form-data',
          },
          body: formdata,
        }).then(res => {
          if (res.status != 200) {
            setError(true);
            console.log('ERROR');
            return;
          }
          res.json().then(data => {
            console.log('submitted');
          });
        });
      };
      setWebsocket(new WebSocket(webSocketURL));
      await makePostRequest();
    };
    const UploadVideo = async subreddit => {
      let videoReturn = await redditImageUploader.uploadMedia(
        filePath,
        'video',
        Platform.OS,
      );
      let videoURL = videoReturn.imageURL;
      let webSocketURL = videoReturn.webSocketURL;
      let imageURL = await redditImageUploader.uploadMedia(
        thumbnailPath,
        'image',
        Platform.OS,
      );
      imageURL = imageURL.imageURL;
      const makePostRequest = async () => {
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
        return fetch('https://oauth.reddit.com/api/submit', {
          method: 'POST',
          headers: {
            Authorization: `bearer ${accessToken}`,
            'user-agent': 'multiposter:v1.0.0 by grayson',
            'Content-Type': 'multipart/form-data',
          },
          body: formdata,
        }).then(res => {
          if (res.status != 200) {
            setError(true);
            console.log('ERROR');
            return;
          }
          res.json().then(data => {
            console.log('submitted');
          });
        });
      };
      setWebsocket(new WebSocket(webSocketURL));
      await makePostRequest();
    };
    const UploadText = async subreddit => {
      const makePostRequest = async () => {
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
        return fetch('https://oauth.reddit.com/api/submit', {
          method: 'POST',
          headers: {
            Authorization: `bearer ${accessToken}`,
            'user-agent': 'multiposter:v1.0.0 by grayson',
            'Content-Type': 'multipart/form-data',
          },
          body: formdata,
        }).then(res => {
          if (res.status != 200) {
            setError(true);
            console.log('ERROR');
            return;
          }
          res.json().then(data => {
            if (data.json.errors.length != 0) {
              setError(true);
            }
            console.log('submitted');
          });
        });
      };
      await makePostRequest();
    };
    const UploadLink = async subreddit => {
      const makePostRequest = async () => {
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
        return fetch('https://oauth.reddit.com/api/submit', {
          method: 'POST',
          headers: {
            Authorization: `bearer ${accessToken}`,
            'user-agent': 'multiposter:v1.0.0 by grayson',
            'Content-Type': 'multipart/form-data',
          },
          body: formdata,
        }).then(res => {
          if (res.status != 200) {
            setError(true);
            console.log('ERROR');
            return;
          }
          res.json().then(data => {
            if (data.json.errors.length != 0) {
              setError(true);
            }
            console.log('submitted');
          });
        });
      };
      await makePostRequest();
    };
    const mapLoop = async () => {
      if (postType == 'ImagePost') {
        const promises = await subreddits.map(async subreddit => {
          await UploadImage(subreddit);
        });
        await Promise.all(promises).then(() => {
          console.log('done');
          setComplete(true);
        });
      } else if (postType == 'TextPost') {
        const promises = await subreddits.map(async subreddit => {
          await UploadText(subreddit);
        });
        await Promise.all(promises).then(() => {
          console.log('done');
          setComplete(true);
        });
      } else if (postType == 'LinkPost') {
        const promises = await subreddits.map(async subreddit => {
          await UploadLink(subreddit);
        });
        await Promise.all(promises).then(() => {
          console.log('done');
          setComplete(true);
        });
      } else if (postType == 'VideoPost') {
        const promises = await subreddits.map(async subreddit => {
          await UploadVideo(subreddit);
        });
        await Promise.all(promises).then(() => {
          console.log('done');
          setComplete(true);
        });
      }
    };
    mapLoop();
  }, []);
  useEffect(() => {
    if (websocket) {
      websocket.onmessage = e => {
        console.log(e.data);
        if (JSON.parse(e.data).type != 'success') {
          setError(true);
        }
      };
    }
  }, [websocket]);
  useEffect(() => {
    if (complete && !error) {
      Snackbar.show({
        text: 'Submissions Complete',
        duration: Snackbar.LENGTH_INDEFINITE,
        action: {
          text: 'X',
          onPress: () => {
            Snackbar.dismiss();
          },
        },
      });
    }
  }, [complete]);
  useEffect(() => {
    if (error) {
      Snackbar.show({
        text: "There was an error submitting at least one of your posts. Make sure you follow all of the subreddits' rules",
        numberOfLines: 3,
        duration: Snackbar.LENGTH_INDEFINITE,
        action: {
          text: 'X',
          onPress: () => {
            Snackbar.dismiss();
          },
        },
      });
    }
  }, [error]);
  const StartOver = () => {
    setTitle('');
    setPostType('TextPost');
    setText('');
    setLink('');
    setFilePath({});
    setNsfwToggle(false);
    setSpoilerToggle(false);
    setThumbnailPath('');
    setSubreddits([]);
    setSubredditSearch('');
    navigation.navigate('Spreaddit');
  };
  return (
    <View>
      {complete ? (
        <TouchableOpacity onPress={() => StartOver()}>
          <Text>Home</Text>
        </TouchableOpacity>
      ) : (
        <Text>Uploading...</Text>
      )}
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
