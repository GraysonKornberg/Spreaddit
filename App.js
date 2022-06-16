import React, {useState} from 'react';
import {View, Text, Button} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import LoginScreen from './components/LoginScreen';
import HomeScreen from './components/HomeScreen';
import Post from './components/Post';
import SubredditSelect from './components/SubredditSelect';
import SubredditOptions from './components/SubredditOptions';
import SubredditSettings from './components/SubredditSettings';
import Uploading from './components/Uploading';

const Stack = createNativeStackNavigator();

const linking = {
  prefixes: ['multiposter://'],
  config: {
    initialRouteName: 'Multiposter',
    screens: {
      Multiposter: {
        path: 'home',
      },
      Post: {
        path: 'post',
      },
    },
  },
};

const App = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [accessToken, setAccessToken] = useState('');

  //Create post props
  const [title, setTitle] = useState('');
  const [postType, setPostType] = useState('TextPost');
  const [text, setText] = useState('');
  const [link, setLink] = useState('');
  const [filePath, setFilePath] = useState({});
  const [nsfwToggle, setNsfwToggle] = useState(false);
  const [spoilerToggle, setSpoilerToggle] = useState(false);
  const [thumbnailPath, setThumbnailPath] = useState('');

  //Select subreddit props
  const [subreddits, setSubreddits] = useState([]);
  const [subredditSearch, setSubredditSearch] = useState('');

  return isSignedIn ? (
    <NavigationContainer linking={linking}>
      <Stack.Navigator>
        <Stack.Screen name="Multiposter">
          {props => <HomeScreen {...props} accessToken={accessToken} />}
        </Stack.Screen>
        <Stack.Screen name="Create Post">
          {props => (
            <Post
              {...props}
              accessToken={accessToken}
              title={title}
              setTitle={setTitle}
              text={text}
              setText={setText}
              link={link}
              setLink={setLink}
              postType={postType}
              setPostType={setPostType}
              filePath={filePath}
              setFilePath={setFilePath}
              thumbnailPath={thumbnailPath}
              setThumbnailPath={setThumbnailPath}
              nsfwToggle={nsfwToggle}
              setNsfwToggle={setNsfwToggle}
              spoilerToggle={spoilerToggle}
              setSpoilerToggle={setSpoilerToggle}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Select Subreddits">
          {props => (
            <SubredditSelect
              {...props}
              setSubreddits={setSubreddits}
              subreddits={subreddits}
              accessToken={accessToken}
              subredditSearch={subredditSearch}
              setSubredditSearch={setSubredditSearch}
              postType={postType}
              text={text}
              title={title}
              link={link}
              filePath={filePath}
              nsfwToggle={nsfwToggle}
              spoilerToggle={spoilerToggle}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Flairs and Customization">
          {props => (
            <SubredditOptions
              {...props}
              subreddits={subreddits}
              setSubreddits={setSubreddits}
              accessToken={accessToken}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Subreddit Settings">
          {props => (
            <SubredditSettings
              {...props}
              subreddits={subreddits}
              setSubreddits={setSubreddits}
              postType={postType}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Uploading">
          {props => (
            <Uploading
              {...props}
              filePath={filePath}
              subreddits={subreddits}
              postType={postType}
              accessToken={accessToken}
              thumbnailPath={thumbnailPath}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  ) : (
    <LoginScreen
      setIsSignedIn={setIsSignedIn}
      setAccessToken={setAccessToken}
    />
  );
};

export default App;
