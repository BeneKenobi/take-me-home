import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  StyleSheet,
  Text,
  SafeAreaView,
  Image,
  Dimensions,
  TextInput,
  View,
  Button,
  Alert,
  ScrollView,
} from 'react-native';
import * as Location from 'expo-location';
import Constants from 'expo-constants';

const window = Dimensions.get('window');
const screen = Dimensions.get('screen');

const App = () => {
  const [destinationText, setDestinationText] = useState('');

  useEffect(() => {
    getDestinationTextFromStorage().then((storedDestinationText) => {
      setDestinationText(storedDestinationText);
    });
  }, []);

  let googleApiKey: string;

  if (Constants.platform?.ios != undefined) {
    googleApiKey = Constants?.manifest?.extra?.googleApiKeyIos;
  } else if (Constants.platform?.android != undefined) {
    googleApiKey = Constants?.manifest?.extra?.googleApiKeyAndroid;
  } else {
    googleApiKey = Constants?.manifest?.extra?.googleApiKeyWeb;
  }

  if (googleApiKey == undefined) {
    return (
      <SafeAreaView style={styles.page}>
        <Text style={styles.text}>API Key Error</Text>
        <StatusBar style='light' hidden={false} />
      </SafeAreaView>
    );
  }

  const [dimensions, setDimensions] = useState({ window, screen });
  useEffect(() => {
    const subscription = Dimensions.addEventListener(
      'change',
      ({ window, screen }) => {
        setDimensions({ window, screen });
      }
    );
    return () => subscription?.remove();
  });

  let [postitionStatus, location] = GetPosition();

  let image;

  if (location != undefined) {
    image = getGoogleMapsImage(googleApiKey, location, dimensions);
  }

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.header}>take me home</Text>
        <View style={styles.container}>
          {image}
          <Text style={styles.debug}>{postitionStatus}</Text>
          <Text style={{ color: 'white' }}>
            {'Please insert your destination'}
          </Text>
          <TextInput
            style={styles.input}
            onChangeText={setDestinationText}
            value={destinationText}
          />
          <Button
            onPress={() => setDestinationTextInStorage(destinationText)}
            title='Save Destination'
            color='#841584'
          />
          <StatusBar style='light' hidden={false} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const GetPosition = (): [string, Location.LocationObject | undefined] => {
  const [resultText, setResult] = useState('Waiting for permission...');
  const [location, setLocation] = useState<Location.LocationObject | undefined>(
    undefined
  );

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setResult(
          'Permission to access location was denied. Please change your settings manually to use this app.'
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
  dimensions: any
) => {
  let size = Math.min(dimensions.window.width, dimensions.window.height, 400);
  return (
    <Image
      style={{ width: size, height: size }}
      source={{
        uri:
          'https://maps.googleapis.com/maps/api/staticmap?center=' +
          location.coords.latitude +
          ', ' +
          location.coords.longitude +
          '&markers=' +
          location.coords.latitude +
          ', ' +
          location.coords.longitude +
          '&zoom=14&size=' +
          size +
          'x' +
          size +
          '&scale=2&key=' +
          googleApiKey,
      }}
    />
  );
};

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

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  header: {
    flex: 1,
    color: 'white',
    fontSize: 50,
  },
  text: {
    color: 'white',
    fontSize: 50,
  },
  debug: {
    color: 'white',
    fontSize: 10,
  },
  mapImage: {
    width: 400,
    height: 400,
  },
  input: {
    width: 250,
    height: 44,
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: '#e8e8e8',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  scrollView: {
    backgroundColor: '#000',
    marginHorizontal: 5,
  },
});

export default App;
