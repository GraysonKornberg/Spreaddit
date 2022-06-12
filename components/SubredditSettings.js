import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Image,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';

const SubredditSettings = ({
  navigation,
  route,
  postType,
  subreddits,
  setSubreddits,
}) => {
  const {subreddit} = route.params;
  const [currNsfwToggle, setCurrNsfwToggle] = useState(subreddit.nsfw);
  const [currSpoilerToggle, setCurrSpoilerToggle] = useState(subreddit.spoiler);
  const [currTitle, setCurrTitle] = useState(subreddit.title);
  useEffect(() => {
    navigation.setOptions({title: `${subreddit.name} Settings`});
  }, []);
  const confirmChanges = () => {
    const index = subreddits.findIndex(sub => sub.name == subreddit.name);
    const subredditCopy = subreddit;
    subredditCopy.title = currTitle;
    subredditCopy.nsfw = currNsfwToggle;
    subredditCopy.spoiler = currSpoilerToggle;
    setSubreddits([
      ...subreddits.slice(0, index),
      subredditCopy,
      ...subreddits.slice(index + 1),
    ]);
    navigation.pop();
  };
  return (
    <View>
      <View style={styles.input}>
        <TextInput
          placeholder={'Title'}
          style={styles.inputText}
          value={currTitle}
          onChangeText={setCurrTitle}
          multiline={true}
          maxLength={300}
        />
        <Text style={styles.charCount}>{currTitle.length}/300</Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          margin: 20,
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text style={{color: 'black', fontSize: 20}}>Spoiler: </Text>
          <CheckBox
            disabled={!subreddit.spoilerEnabled}
            style={{transform: [{scaleX: 1.5}, {scaleY: 1.5}]}}
            value={currSpoilerToggle}
            onValueChange={() => setCurrSpoilerToggle(!currSpoilerToggle)}
          />
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text style={{color: 'black', fontSize: 20, paddingLeft: 20}}>
            NSFW:{' '}
          </Text>
          <CheckBox
            style={{transform: [{scaleX: 1.5}, {scaleY: 1.5}]}}
            value={currNsfwToggle}
            onValueChange={() => setCurrNsfwToggle(!currNsfwToggle)}
          />
        </View>
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-around',
          margin: 20,
        }}>
        <TouchableOpacity
          style={{
            borderWidth: 2,
            width: 100,
            height: 60,
            justifyContent: 'center',
          }}
          onPress={() => navigation.pop()}>
          <Text style={{textAlign: 'center', color: 'black', fontSize: 20}}>
            Cancel
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            borderWidth: 2,
            width: 100,
            height: 60,
            justifyContent: 'center',
          }}
          onPress={() => confirmChanges()}>
          <Text style={{textAlign: 'center', color: 'black', fontSize: 20}}>
            Confirm Changes
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    marginHorizontal: 10,
    flexDirection: 'row',
  },
  inputText: {
    flex: 5,
    fontSize: 20,
    paddingLeft: 10,
  },
  charCount: {
    flex: 1,
    alignSelf: 'flex-start',
    textAlign: 'center',
    marginTop: 15,
  },
});

export default SubredditSettings;
