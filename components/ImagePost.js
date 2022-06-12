import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';

const chooseFile = setFilePath => {
  let options = {
    title: 'Select Image',
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
      setFilePath(source.assets[0]);
    }
  });
};

const ImagePost = ({filePath, setFilePath}) => {
  return (
    <View style={styles.container}>
      {filePath.uri && (
        <>
          <Image source={{uri: filePath.uri}} style={styles.imageStyle} />
        </>
      )}
      <TouchableOpacity
        activeOpacity={0.5}
        style={styles.buttonStyle}
        onPress={() => chooseFile(setFilePath)}>
        <Text style={styles.textStyle}>Choose Image</Text>
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

export default ImagePost;
