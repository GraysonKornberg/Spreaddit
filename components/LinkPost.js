import React from 'react';
import {View, Text, Button, TextInput, StyleSheet} from 'react-native';

const LinkPost = ({link, setLink}) => {
  return (
    <View style={styles.textContainer}>
      <TextInput
        placeholder={'Url'}
        style={styles.text}
        onChangeText={setLink}
        value={link}
        multiline={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  textContainer: {
    height: 75,
    borderWidth: 1,
    margin: 10,
  },
  text: {
    fontSize: 18,
    padding: 10,
  },
});

export default LinkPost;
