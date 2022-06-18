import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Loading from './Loading';

const HomeScreen = ({
  navigation,
  accessToken,
  setUsername,
  username,
  setIsSignedIn,
}) => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch(`https://oauth.reddit.com/api/me.json`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `bearer ${accessToken}`,
      },
    }).then(res => {
      if (res.status != 200) {
        console.log('ERROR');
        return;
      }
      res.json().then(data => {
        setUsername(data.data.subreddit.display_name_prefixed);
        setLoading(false);
      });
    });
  }, []);
  return loading ? (
    <Loading />
  ) : (
    <View style={styles.container}>
      <Text style={{fontSize: 40, fontWeight: 'bold', color: 'black', flex: 1}}>
        Hello {username}
      </Text>
      <View style={{flex: 3, justifyContent: 'flex-start'}}>
        <TouchableOpacity
          style={styles.button1}
          onPress={() => navigation.push('Create Post')}>
          <Text style={{color: 'black', fontSize: 20, fontWeight: 'bold'}}>
            Create Post
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button2}
          onPress={() => setIsSignedIn(false)}>
          <Text style={{color: 'black', fontSize: 17, fontWeight: 'bold'}}>
            Sign Out
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginTop: 40,
  },
  button1: {
    alignItems: 'center',
    backgroundColor: '#cee3f8',
    padding: 25,
    borderRadius: 10,
    marginBottom: 30,
  },
  button2: {
    alignItems: 'center',
    backgroundColor: '#cee3f8',
    padding: 25,
    borderRadius: 10,
  },
});

export default HomeScreen;
