import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Text,
  SafeAreaView,
  Image,
  Dimensions,
  TextInput,
  View,
  Button,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as Location from 'expo-location';
import Constants from 'expo-constants';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import styles from './Styles';

const window = Dimensions.get('window');
const screen = Dimensions.get('screen');

const Stack = createNativeStackNavigator();

const setDestinationTextInStorage = async (value: string) => {
  try {
    await AsyncStorage.setItem('destinationText', value);
  } catch (e) {
    // save error
  }
  Alert.alert('Gespeichert');
};

const getDestinationTextFromStorage = async (): Promise<string> => {
  try {
    const value = await AsyncStorage.getItem('destinationText');
    if (value !== null) {
      return value;
    }
  } catch (e) {
    // error reading value
  }
  return '';
};

const GetPosition = (): [string, Location.LocationObject | undefined] => {
  const [resultText, setResult] = useState('Waiting for permission...');
  const [location, setLocation] = useState<Location.LocationObject | undefined>(
    undefined,
  );

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setResult(
          'Permission to access location was denied. Please change your settings manually to use this app.',
        );
      } else {
        setResult('Getting your location...');
        (async () => {
          setLocation(await Location.getCurrentPositionAsync({}));
          setResult('done');
        })();
      }
    })();
  }, []);

  return [resultText, location];
};

const getGoogleMapsImage = (
  googleApiKey: string,
  location: Location.LocationObject,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dimensions: any,
) => {
  const size = Math.min(dimensions.window.width, dimensions.window.height, 400);
  return (
    <Image
      style={{ width: size, height: size }}
      source={{
        uri:
        `https://maps.googleapis.com/maps/api/staticmap?center=${location.coords.latitude},${location.coords.longitude}&markers=${location.coords.latitude},${location.coords.longitude}&zoom=14&size=${size}x${size}&scale=2&key=${googleApiKey}`,
      }}
    />
  );
};

// eslint-disable-next-line react/prop-types
const HomeScreen = ({ navigation } ) => {
  const [destinationText, setDestinationText] = useState('');
  useEffect(() => {
    getDestinationTextFromStorage().then((storedDestinationText) => {
      setDestinationText(storedDestinationText);
    });
  }, []);

  const [dimensions, setDimensions] = useState({ window, screen });
  useEffect(() => {
    const subscription = Dimensions.addEventListener(
      'change',
      // eslint-disable-next-line no-shadow
      ({ window, screen }) => {
        setDimensions({ window, screen });
      },
    );
    // @ts-expect-error: Property 'remove' does not exist on type 'never'.
    return () => subscription?.remove();
  });

  let googleApiKey: string;

  if (Platform.OS === 'ios') {
    googleApiKey = Constants?.manifest?.extra?.googleApiKeyIos;
  } else if (Platform.OS === 'android') {
    googleApiKey = Constants?.manifest?.extra?.googleApiKeyAndroid;
  } else {
    googleApiKey = Constants?.manifest?.extra?.googleApiKeyWeb;
  }

  if (googleApiKey === undefined) {
    return (
      <SafeAreaView style={styles.page}>
        <Text style={styles.text}>API Key Error</Text>
        {/* eslint-disable-next-line react/style-prop-object */}
        <StatusBar style="light" hidden={false} />
      </SafeAreaView>
    );
  }

  const [postitionStatus, location] = GetPosition();

  let image;

  if (location !== undefined) {
    image = getGoogleMapsImage(googleApiKey, location, dimensions);
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardContainer}
    >
      <SafeAreaView style={styles.page}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.container}>
            <Button
              title="Go to Settings"
              // eslint-disable-next-line react/destructuring-assignment
              // eslint-disable-next-line react/prop-types
              onPress={() => navigation.navigate('settings')}
              color="#000"
            />
            {image}
            <Text style={styles.debug}>{postitionStatus}</Text>
            <Text style={{ color: 'white' }}>
              Please insert your destination
            </Text>
            <TextInput
              style={styles.input}
              onChangeText={setDestinationText}
              value={destinationText}
            />
            <Button
              onPress={() => setDestinationTextInStorage(destinationText)}
              title="Save Destination"
              color="#841584"
            />
            {/* eslint-disable-next-line react/style-prop-object */}
            <StatusBar style="light" hidden={false} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const SettingsScreen = () => (
  <View style={styles.page}>
    <Text style={{ color: 'white' }}>
      Here are the Settings
    </Text>
  </View>
);

const App = () => (
  <NavigationContainer>
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#000',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen name="take me home" component={HomeScreen} />
      <Stack.Screen name="settings" component={SettingsScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default App;
