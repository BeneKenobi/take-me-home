import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Share,
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
import styles from './Styles';

const window = Dimensions.get('window');
const screen = Dimensions.get('screen');

const onShare = async (messageToShare: string) => {
  try {
    const result = await Share.share({
      message: `Destination ${messageToShare}`,
    });
    if (result.action === Share.sharedAction) {
      if (result.activityType) {
        // shared with activity type of result.activityType
      } else {
        // shared
      }
    } else if (result.action === Share.dismissedAction) {
      // dismissed
    }
  } catch (e) {
    Alert.alert('Error while sharing');
  }
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

const GetPosition = (): [string, { lat: string, lng: string } | undefined] => {
  const [resultText, setResult] = useState('Waiting for permission...');
  const [location, setLocation] = useState<{ lat: string, lng: string } | undefined>(
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
          const resultLocation = await Location.getCurrentPositionAsync({});
          setLocation({
            lat: resultLocation.coords.latitude.toString(),
            lng: resultLocation.coords.longitude.toString(),
          });
          setResult('done');
        })();
      }
    })();
  }, []);

  return [resultText, location];
};

const GoogleMapsImage = (
  props: {
    location: {
      lat: string;
      lng: string;
    } | undefined;
    width: number;
    height: number;
    googleApiKey: string;
    destination: {
      lat: string;
      lng: string;
    } | undefined;
  },
) => {
  const {
    location, width, height, googleApiKey, destination,
  } = props;
  if (location === undefined) {
    return null;
  }
  const size = Math.min(width, height, 400);
  const params: { size: string, scale: number, key: string, markers: string } = {
    size: `${size}x${size}`, scale: 2, key: googleApiKey, markers: '',
  };
  let markers = `${location.lat},${location.lng}`;
  if (destination !== undefined) {
    markers += `|${destination.lat},${destination.lng}`;
  }
  params.markers = markers;
  let imageUri = 'https://maps.googleapis.com/maps/api/staticmap?';
  Object.entries(params).forEach(([paramsKey, paramsValue]) => {
    imageUri += `${paramsKey}=${paramsValue}&`;
  });
  return (
    <Image
      style={{ width: size, height: size }}
      source={{ uri: imageUri }}
    />
  );
};

const getGoogleApiKey = () => {
  if (Platform.OS === 'ios') {
    return Constants?.manifest?.extra?.googleApiKeyIos;
  }
  if (Platform.OS === 'android') {
    return Constants?.manifest?.extra?.googleApiKeyAndroid;
  }
  return Constants?.manifest?.extra?.googleApiKeyWeb;
};

const App = () => {
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

  const googleApiKey = getGoogleApiKey();

  // eslint-disable-next-line max-len
  const [destinationCoords, setDestinationCoords] = useState<{ lat: string, lng: string } | undefined>(
    undefined,
  );
  useEffect(() => {
    (async () => {
      if (destinationText.length > 0) {
        const request = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${destinationText}&key=${googleApiKey}`,
        );
        const response = await request.json();
        if (response.results.length > 0) {
          if (response.status === 'OK') {
            setDestinationCoords(response.results[0].geometry.location);
          }
        }
      }
    })();
  }, [destinationText, googleApiKey]);

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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardContainer}
    >
      <SafeAreaView style={styles.page}>
        <ScrollView style={styles.scrollView}>
          <Text style={styles.header}>take me home</Text>
          <View style={styles.container}>
            {postitionStatus !== 'done' ? <Text style={styles.debug}>{postitionStatus}</Text> : null}
            <GoogleMapsImage
              width={dimensions.window.width}
              height={dimensions.window.height}
              googleApiKey={googleApiKey}
              location={location}
              destination={destinationCoords}
            />
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
            <Button
              onPress={() => onShare(destinationText)}
              title="Share"
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

export default App;
