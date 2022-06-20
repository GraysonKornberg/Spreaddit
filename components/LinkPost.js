import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';

const LinkPost = ({link, setLink}) => {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.textContainer}>
        <TextInput
          placeholder={'Url'}
          style={styles.text}
          onChangeText={setLink}
          value={link}
          multiline={true}
        />
      </View>
    </TouchableWithoutFeedback>
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
