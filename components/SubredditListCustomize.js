import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Flair from './Flair';

const SubredditListCustomize = ({
  navigation,
  subreddits,
  accessToken,
  setSubreddits,
}) => {
  const [flairAfterLoading, setFlairAfterLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const FetchFlairNeeded = async subreddit => {
      fetch(
        `https://oauth.reddit.com/api/v1/${subreddit.name}/post_requirements.json`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `bearer ${accessToken}`,
          },
        },
      ).then(res => {
        if (res.status != 200) {
          console.log('ERROR');
          return;
        }
        res.json().then(data => {
          subreddit.needFlair = data.is_flair_required;
        });
      });
    };
    const FetchFlairList = async subreddit => {
      return fetch(
        `https://oauth.reddit.com/r/${subreddit.name}/api/link_flair_v2.json`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `bearer ${accessToken}`,
          },
        },
      ).then(res => {
        if (res.status != 200) {
          subreddit.flairList = [];
          return;
        }
        res.json().then(data => {
          data.map(flair => {
            if (flair.type == 'text') {
              subreddit.flairList = [
                ...subreddit.flairList,
                {text: flair.text, id: flair.id},
              ];
            } else if (flair.type == 'richtext') {
              subreddit.flairList = [
                ...subreddit.flairList,
                {text: flair.richtext, id: flair.id},
              ];
            }
          });
        });
      });
    };
    const subredditLoop = async () => {
      const promises = await subreddits.map(async subreddit => {
        FetchFlairNeeded(subreddit);
        if (!subreddit.spoilerEnabled) {
          subreddit.spoiler = false;
        }
        await FetchFlairList(subreddit);
      });
      await Promise.all(promises).then(() => setIsLoading(false));
    };
    subredditLoop();
  }, []);
  useEffect(() => {
    if (!isLoading) {
      setFlairAfterLoading(true);
    }
  }, [isLoading]);
  function renderFlair() {
    if (flairAfterLoading) {
      return (
        <View style={{borderBottomWidth: 2}}>
          <ScrollView nestedScrollEnabled={true}>
            {subreddits.map((subreddit, index) => (
              <View
                key={index}
                style={[styles.subredditContainer, {zIndex: -index}]}>
                <Text style={styles.text}>{subreddit.name}</Text>
                <View style={styles.flairs}>
                  <Flair
                    flairList={subreddit.flairList}
                    subreddit={subreddit}
                    subreddits={subreddits}
                    setSubreddits={setSubreddits}
                  />
                </View>
                <View
                  style={{
                    flex: 1,
                    alignItems: 'flex-end',
                    alignSelf: 'flex-start',
                    top: 7,
                    marginRight: 5,
                  }}>
                  <TouchableOpacity
                    onPress={() => {
                      navigation.push('Subreddit Settings', {
                        subreddit: subreddit,
                      });
                    }}>
                    <Icon name="gear" size={40} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity onPress={() => navigation.navigate('Uploading')}>
            <Text>Upload</Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      return <Text>Loading</Text>;
    }
  }
  return renderFlair();
};

const styles = StyleSheet.create({
  flairs: {
    flex: 2,
    alignSelf: 'flex-end',
  },
  subredditContainer: {
    borderTopWidth: 2,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  text: {
    marginTop: 14,
    marginLeft: 10,
    flex: 4,
    fontSize: 20,
    color: 'black',
    alignSelf: 'flex-start',
  },
});

export default SubredditListCustomize;
