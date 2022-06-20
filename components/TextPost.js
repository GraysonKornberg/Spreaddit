import React from 'react';
import {View, TextInput, StyleSheet} from 'react-native';

const TextPost = ({setText, text}) => {
  return (
    <View style={styles.textContainer}>
      <TextInput
        placeholder={'Text (optional)'}
        style={styles.text}
        onChangeText={setText}
        value={text}
        multiline={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  textContainer: {
    height: 200,
    borderWidth: 1,
    margin: 10,
  },
  text: {
    fontSize: 18,
    padding: 10,
  },
});

export default TextPost;
