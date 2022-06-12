import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {createThumbnail} from 'react-native-create-thumbnail';

const chooseFile = setFilePath => {
  let options = {
    title: 'Select Video',
    mediaType: 'video',
    customButtons: [
      {
        name: 'customOptionKey',
        title: 'Choose Photo from Custom Option',
      },
    ],
    storageOptions: {
      skipBackup: true,
      path: 'images',
    },
  };
  launchImageLibrary(options, response => {
    console.log('Response = ', response);

    if (response.didCancel) {
      console.log('User cancelled image picker');
    } else if (response.error) {
      console.log('ImagePicker Error: ', response.error);
    } else if (response.customButton) {
      console.log('User tapped custom button: ', response.customButton);
      alert(response.customButton);
    } else {
      let source = response;
      createThumbnail({
        url: source.assets[0].uri,
        timeStamp: 0,
      })
        .then(response => {
          console.log({response});
          setFilePath(response);
          alert(response.path);
        })
        .catch(err => console.log({err}));
    }
  });
};

const VideoPost = ({filePath, setFilePath}) => {
  return (
    <View style={styles.container}>
      {filePath.path && (
        <>
          <Image source={{uri: filePath.path}} style={styles.imageStyle} />
        </>
      )}
      <TouchableOpacity
        activeOpacity={0.5}
        style={styles.buttonStyle}
        onPress={() => chooseFile(setFilePath)}>
        <Text style={styles.textStyle}>Choose Video</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  textStyle: {
    padding: 10,
    color: 'black',
  },
  buttonStyle: {
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: '#DDDDDD',
    padding: 5,
  },
  imageStyle: {
    width: 200,
    height: 200,
    margin: 5,
  },
});

export default VideoPost;
