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
import Preset from './components/Preset';
import PresetSettings from './components/PresetSettings';

const Stack = createNativeStackNavigator();

const linking = {
  prefixes: ['spreaddit://'],
  config: {
    initialRouteName: 'Spreaddit',
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
  const [currAccountID, setCurrAccountID] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [username, setUsername] = useState('');
  const [refreshToken, setRefreshToken] = useState('');

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
        <Stack.Screen name="Spreaddit">
          {props => (
            <HomeScreen
              {...props}
              setAccessToken={setAccessToken}
              accessToken={accessToken}
              username={username}
              setUsername={setUsername}
              setIsSignedIn={setIsSignedIn}
              currAccountID={currAccountID}
              setCurrAccountID={setCurrAccountID}
              refreshToken={refreshToken}
              setRefreshToken={setRefreshToken}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Presets">
          {props => <Preset {...props} currAccountID={currAccountID} />}
        </Stack.Screen>
        <Stack.Screen name="Preset Settings">
          {props => (
            <PresetSettings
              {...props}
              currAccountID={currAccountID}
              accessToken={accessToken}
            />
          )}
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
              setSubreddits={setSubreddits}
              setSubredditSearch={setSubredditSearch}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Select Subreddits">
          {props => (
            <SubredditSelect
              {...props}
              currAccountID={currAccountID}
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
              setSubreddits={setSubreddits}
              thumbnailPath={thumbnailPath}
              setTitle={setTitle}
              setText={setText}
              setLink={setLink}
              setPostType={setPostType}
              setSubredditSearch={setSubredditSearch}
              setFilePath={setFilePath}
              setNsfwToggle={setNsfwToggle}
              setSpoilerToggle={setSpoilerToggle}
              setThumbnailPath={setThumbnailPath}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  ) : (
    <LoginScreen
      setIsSignedIn={setIsSignedIn}
      setAccessToken={setAccessToken}
      setCurrAccountID={setCurrAccountID}
    />
  );
};

export default App;
