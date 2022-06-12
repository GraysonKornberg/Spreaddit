import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
} from 'react-native';
import SubredditListTemp from './SubredditListTemp';

const SubredditSelect = ({
  navigation,
  subreddits,
  setSubreddits,
  accessToken,
  subredditSearch,
  setSubredditSearch,
  postType,
  text,
  title,
  link,
  filePath,
  nsfwToggle,
  spoilerToggle,
}) => {
  const [isAllowed, setIsAllowed] = useState(false);
  useEffect(() => {
    setSubredditSearch('');
    setSubreddits([]);
  }, []);
  useEffect(() => {
    setIsAllowed(false);
  }, [subreddits]);
  useEffect(() => {
    if (isAllowed) {
      if (subreddits.some(sub => sub.name === subredditSearch)) {
        alert('Subreddit already added!');
        setIsAllowed(false);
        setSubredditSearch('');
      } else {
        fetch(`https://www.reddit.com/r/${subredditSearch}/about.json`).then(
          res => {
            if (res.status != 200) {
              console.log('ERROR');
              return;
            }
            res.json().then(data => {
              setSubreddits([
                ...subreddits,
                {
                  name: data.data.display_name,
                  needFlair: false,
                  flairList: [],
                  selectedFlair: '',
                  nsfw: nsfwToggle,
                  spoiler: spoilerToggle,
                  spoilerEnabled: data.data.spoilers_enabled,
                  title: title,
                  text: text,
                  link: link,
                  filePath: filePath,
                },
              ]);
            });
          },
        );
        setSubredditSearch('');
      }
    }
  }, [isAllowed]);
  const checkBodyText = async subreddit => {
    fetch(
      `https://oauth.reddit.com/api/v1/${subreddit}/post_requirements.json`,
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
        if (text.length > 0) {
          if (data.body_restriction_policy == 'notAllowed') {
            setIsAllowed(false);
            alert(`This subreddit does not allow body text.`);
          } else {
            setIsAllowed(true);
          }
        } else if (text.length == 0) {
          if (data.body_restriction_policy == 'required') {
            setIsAllowed(false);
            alert(`This subreddit requires body text`);
          } else {
            setIsAllowed(true);
          }
        }
      });
    });
  };
  const checkIsAllowed = async subreddit => {
    fetch(`https://www.reddit.com/r/${subreddit}/about.json`).then(res => {
      if (res.status != 200) {
        console.log('ERROR');
        return;
      }
      res.json().then(data => {
        if (postType == 'TextPost') {
          if (data.data.submission_type == 'link') {
            setIsAllowed(false);
            alert(`This subreddit doesn't allow text posts`);
          } else {
            checkBodyText(subreddit);
          }
        } else if (postType == 'ImagePost') {
          if (data.data.allow_images == false) {
            setIsAllowed(false);
            alert(`This subreddit doesn't allow image posts.`);
          } else {
            setIsAllowed(true);
          }
        } else if (postType == 'VideoPost') {
          if (data.data.allow_videos == false) {
            setIsAllowed(false);
            alert(`This subreddit doesn't allow video posts.`);
          } else {
            setIsAllowed(true);
          }
        } else if (postType == 'LinkPost') {
          if (data.data.submission_type == 'self') {
            setIsAllowed(false);
            alert("This subreddit doesn't allow link posts.");
          } else {
            setIsAllowed(true);
          }
        }
      });
    });
  };
  const AddSubreddit = async subreddit => {
    fetch(`https://www.reddit.com/r/${subreddit}.json`).then(res => {
      if (res.status != 200) {
        console.log('ERROR');
        return;
      }
      res.json().then(data => {
        if (data.data.after != null) {
          checkIsAllowed(subreddit);
        } else {
          alert('Invalid subreddit');
        }
      });
    });
  };
  return (
    <View style={styles.container}>
      <View style={styles.input}>
        <TextInput
          placeholder={'Subreddit'}
          value={subredditSearch}
          onChangeText={setSubredditSearch}
          style={styles.inputText}
          multiline={false}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            if (subredditSearch) {
              AddSubreddit(subredditSearch);
            } else {
              alert('Field cannot be left blank');
            }
          }}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.scrollViewContainer}>
        <ScrollView style={styles.scrollView}>
          <SubredditListTemp
            style={styles.subredditsContainer}
            subreddits={subreddits}
            setSubreddits={setSubreddits}
          />
        </ScrollView>
      </View>
      <TouchableOpacity style={styles.nextButton}>
        <Text
          style={styles.nextButtonText}
          onPress={() => navigation.push('Flairs and Customization')}>
          Flairs and Customization
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContainer: {
    flex: 6,
    borderWidth: 2,
  },
  scrollView: {},
  input: {
    borderWidth: 1,
    height: 50,
    marginHorizontal: 10,
    flexDirection: 'row',
    marginBottom: 15,
    marginTop: 10,
  },
  inputText: {
    fontSize: 20,
    paddingLeft: 10,
    flex: 5,
    justifyContent: 'center',
  },
  addButton: {
    flex: 1,
    alignSelf: 'center',
    borderWidth: 2,
    marginRight: 10,
    backgroundColor: 'lightgreen',
  },
  addButtonText: {
    textAlign: 'center',
    fontSize: 20,
    color: 'black',
    textTransform: 'uppercase',
  },
  subredditsContainer: {marginBottom: 10},
  nextButtonText: {
    fontSize: 25,
    color: 'black',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  nextButton: {
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 2,
    marginLeft: 25,
    marginRight: 25,
    marginBottom: 15,
  },
});

export default SubredditSelect;
