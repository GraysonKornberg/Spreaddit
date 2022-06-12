import React, {useState} from 'react';
import {
  View,
  Text,
  Button,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import TextPost from './TextPost';
import ImagePost from './ImagePost';
import VideoPost from './VideoPost';
import LinkPost from './LinkPost';

const Post = ({
  navigation,
  accessToken,
  title,
  setTitle,
  postType,
  setPostType,
  text,
  setText,
  link,
  setLink,
  filePath,
  setFilePath,
  nsfwToggle,
  setNsfwToggle,
  spoilerToggle,
  setSpoilerToggle,
}) => {
  const textPostSelected =
    postType == 'TextPost'
      ? styles.postTypeButtonSelected
      : styles.postTypeButton;
  const imagePostSelected =
    postType == 'ImagePost'
      ? styles.postTypeButtonSelected
      : styles.postTypeButton;
  const videoPostSelected =
    postType == 'VideoPost'
      ? styles.postTypeButtonSelected
      : styles.postTypeButton;
  const linkPostSelected =
    postType == 'LinkPost'
      ? styles.postTypeButtonSelected
      : styles.postTypeButton;
  return (
    <View style={styles.container}>
      <View style={styles.postTypeContainer}>
        <TouchableOpacity
          style={textPostSelected}
          onPress={() => setPostType('TextPost')}>
          <Text style={styles.postTypeText}>Text</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={imagePostSelected}
          onPress={() => setPostType('ImagePost')}>
          <Text style={styles.postTypeText}>Image</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={videoPostSelected}
          onPress={() => setPostType('VideoPost')}>
          <Text style={styles.postTypeText}>Video</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={linkPostSelected}
          onPress={() => setPostType('LinkPost')}>
          <Text style={styles.postTypeText}>Link</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.input}>
        <TextInput
          placeholder={'Title'}
          style={styles.inputText}
          onChangeText={setTitle}
          value={title}
          multiline={true}
          maxLength={300}
        />
        <Text style={styles.charCount}>{title.length}/300</Text>
      </View>
      {postType == 'TextPost' && <TextPost setText={setText} text={text} />}
      {postType == 'ImagePost' && (
        <ImagePost filePath={filePath} setFilePath={setFilePath} />
      )}
      {postType == 'VideoPost' && (
        <VideoPost filePath={filePath} setFilePath={setFilePath} />
      )}
      {postType == 'LinkPost' && <LinkPost setLink={setLink} link={link} />}
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
            style={{transform: [{scaleX: 1.5}, {scaleY: 1.5}]}}
            value={spoilerToggle}
            onValueChange={() => setSpoilerToggle(!spoilerToggle)}
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
            value={nsfwToggle}
            onValueChange={() => setNsfwToggle(!nsfwToggle)}
          />
        </View>
      </View>
      <TouchableOpacity
        style={styles.nextButton}
        onPress={() => {
          if (title.trim().length == 0) {
            alert('Title cannot be left blank');
          } else if (
            (postType == 'ImagePost' || postType == 'VideoPost') &&
            Object.keys(filePath).length == 0
          ) {
            alert('Must select media file');
          } else if (postType == 'LinkPost' && link.length == 0) {
            alert('URL cannot be left blank');
          } else navigation.push('Select Subreddits');
        }}>
        <Text style={styles.nextButtonText}>Select Subreddits</Text>
      </TouchableOpacity>
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
  container: {
    flex: 1,
  },
  postTypeContainer: {
    flexDirection: 'row',
    height: 67,
    marginBottom: 20,
  },
  postTypeButton: {
    flex: 1,
    backgroundColor: '#cee3f8',
    justifyContent: 'center',
    borderWidth: 1,
  },
  postTypeButtonSelected: {
    flex: 1,
    backgroundColor: '#90C0EF',
    justifyContent: 'center',
    borderWidth: 1,
  },
  postTypeText: {
    fontSize: 18,
    textAlign: 'center',
    justifyContent: 'center',
    color: '#000000',
    fontWeight: 'bold',
  },
  nextButtonText: {
    fontSize: 25,
    color: 'black',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  nextButton: {
    borderWidth: 2,
    marginLeft: 25,
    marginRight: 25,
  },
});

export default Post;
