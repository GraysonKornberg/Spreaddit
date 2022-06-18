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

const Flair = ({flairList, subreddit, subreddits, setSubreddits}) => {
  const [showFlairs, setShowFlairs] = useState(false);
  const updateFlairSelected = flair => {
    const index = subreddits.findIndex(sub => sub.name == subreddit.name);
    const subredditCopy = subreddit;
    subredditCopy.selectedFlair = flair.id;
    setSubreddits([
      ...subreddits.slice(0, index),
      subredditCopy,
      ...subreddits.slice(index + 1),
    ]);
  };
  return (
    <View style={styles.mainContainer}>
      <TouchableOpacity
        style={
          flairList.length == 0
            ? styles.noFlairsTextButton
            : styles.flairsTextButton
        }
        disabled={flairList.length == 0}
        onPress={() => {
          if (flairList.length > 0) {
            setShowFlairs(!showFlairs);
          }
        }}>
        {subreddit.needFlair && (
          <Text
            style={{
              color: 'red',
              fontSize: 22,
              marginLeft: -3,
              marginRight: 3,
              top: 3,
            }}>
            *
          </Text>
        )}
        <Text
          style={
            flairList.length == 0 ? styles.noFlairsText : styles.flairsText
          }>
          Flair
        </Text>
      </TouchableOpacity>
      {showFlairs && (
        <View style={styles.flairContainer}>
          <ScrollView nestedScrollEnabled={true} style={styles.scrollView}>
            {flairList.map((flair, index) => {
              return (
                <View
                  key={index}
                  style={
                    subreddit.selectedFlair == flair.id
                      ? styles.individualFlairSelected
                      : styles.individualFlair
                  }>
                  <TouchableOpacity
                    key={index}
                    style={styles.individualFlairButton}
                    onPress={() => updateFlairSelected(flair)}>
                    {Array.isArray(flair.text) ? (
                      flair.text.map((flairComponent, index) => {
                        return (
                          <View key={index} style={styles.mapped}>
                            {flairComponent.e == 'emoji' && (
                              <Image
                                style={{width: 25, height: 25}}
                                source={{uri: flairComponent.u}}
                              />
                            )}
                            {flairComponent.e == 'text' && (
                              <Text
                                style={
                                  subreddit.selectedFlair == flair.id &&
                                  styles.textSelected
                                }>
                                {flairComponent.t}
                              </Text>
                            )}
                          </View>
                        );
                      })
                    ) : (
                      <Text
                        style={
                          subreddit.selectedFlair == flair.id &&
                          styles.textSelected
                        }>
                        {flair.text}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    width: 80,
    alignSelf: 'center',
    margin: 2,
  },
  flairsTextButton: {
    borderRadius: 25,
    borderWidth: 2,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textSelected: {
    fontWeight: 'bold',
    color: 'black',
  },
  noFlairsTextButton: {
    borderRadius: 25,
    borderWidth: 2,
    padding: 10,
    borderColor: 'lightgrey',
  },
  flairsText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    color: 'black',
  },
  noFlairsText: {
    fontSize: 20,
    textAlign: 'center',
    color: 'lightgrey',
  },
  individualFlair: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  individualFlairButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  individualFlairSelected: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  scrollView: {
    flexDirection: 'column',
    width: 200,
  },
  flairContainer: {
    marginTop: 2,
    width: 200,
    minHeight: 0,
    maxHeight: 100,
    alignItems: 'center',
    borderWidth: 1,
    alignSelf: 'center',
  },
  mapped: {alignItems: 'center', justifyContent: 'center'},
});

export default Flair;
