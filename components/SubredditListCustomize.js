import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Flair from './Flair';
import Snackbar from 'react-native-snackbar';

const SubredditListCustomize = ({
  navigation,
  subreddits,
  accessToken,
  setSubreddits,
}) => {
  const [flairAfterLoading, setFlairAfterLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
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
        if (!subreddit.spoilerEnabled) {
          subreddit.spoiler = false;
        }
        if (subreddit.selected) await FetchFlairList(subreddit);
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
  const Upload = () => {
    let valid = true;
    let invalidSubs = [];
    subreddits.map(sub => {
      if (sub.needFlair && sub.selectedFlair == '' && sub.selected) {
        valid = false;
        invalidSubs.push(sub.name);
      }
    });
    if (valid) {
      navigation.navigate('Uploading');
    } else {
      let text = invalidSubs[0];
      invalidSubs.map(invalidSub => {
        if (invalidSub != text) {
          text = text + `, ${invalidSub}`;
        }
      });
      Snackbar.show({
        text: `The following subreddits require flairs: ${text}`,
        duration: Snackbar.LENGTH_LONG,
      });
    }
  };
  function renderFlair() {
    if (flairAfterLoading) {
      return (
        <View>
          <ScrollView style={{borderBottomWidth: 2}} nestedScrollEnabled={true}>
            {subreddits.map(
              (subreddit, index) =>
                subreddit.selected && (
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
                ),
            )}
          </ScrollView>
          <TouchableOpacity style={styles.button} onPress={() => Upload()}>
            <Text style={{color: 'black', fontSize: 25}}>UPLOAD</Text>
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
  button: {
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 2,
    marginLeft: 25,
    marginRight: 25,
    marginBottom: 15,
    backgroundColor: '#cee3f8',
    borderRadius: 10,
    alignSelf: 'center',
    width: 200,
  },
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
