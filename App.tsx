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
import {default as humanizeDuration} from 'humanize-duration'
import styles from './Styles';

const window = Dimensions.get('window');
const screen = Dimensions.get('screen');

const share = async (messageToShare: string) => {
  try {
    const result = await Share.share({
      message: `${messageToShare}`,
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

const formatTravelTime = (value: number) => {
  return humanizeDuration(value*1000, { largest: 2 , delimiter: " and ", units: ["d", "h", "m"], round: true });
};

const GoogleMapsImage = (props: {
  location:
    | {
        lat: number,
        lng: number,
      }
    | undefined,
  width: number,
  height: number,
  googleApiKey: string,
  destination:
    | {
        lat: number,
        lng: number,
      }
    | undefined,
}) => {
  const { location, width, height, googleApiKey, destination } = props;
  if (location === undefined) {
    return null;
  }
  const size = Math.min(width, height, 400);
  const params: {
    size: string,
    scale: number,
    key: string,
    markers: string,
    path: string,
  } = {
    size: `${size}x${size}`,
    scale: 2,
    key: googleApiKey,
    markers: '',
    path: '',
  };
  let markers = `${location.lat},${location.lng}`;
  if (destination !== undefined) {
    markers += `|${destination.lat},${destination.lng}`;
    params.path = `color:0x0000ff80|weight:5|${location.lat},${location.lng}|${destination.lat},${destination.lng}`;
  }
  params.markers = markers;
  let imageUri = 'https://maps.googleapis.com/maps/api/staticmap?';
  Object.entries(params).forEach(([paramsKey, paramsValue]) => {
    imageUri += `${paramsKey}=${paramsValue}&`;
  });
  return (
    <Image style={{ width: size, height: size }} source={{ uri: imageUri }} />
  );
};

const TravelTimeShareButton = (props: {
  destination: string,
  time: number,
  mode: string,
}) => {
  let shareText = '';
  let buttonTitle = '';
  switch(props.mode) {
    case 'driving': {
      shareText = `I need ${formatTravelTime(props.time)} to drive to ${props.destination} 🚗`;
      buttonTitle = `🚗 ${formatTravelTime(props.time)}`;
      break;
    }
    case 'walking': {
      shareText = `I need ${formatTravelTime(props.time)} to walk to ${props.destination} 🚶`;
      buttonTitle = `🚶 ${formatTravelTime(props.time)}`;
      break;
    }
    case 'transit': {
      shareText = `I need ${formatTravelTime(props.time)} with public transport to ${props.destination} 🚌`;
      buttonTitle = `🚌 ${formatTravelTime(props.time)}`;
      break;
    }
    case 'bicycling': {
      shareText = `I need ${formatTravelTime(props.time)} on my bike to ${props.destination} 🚴`;
      buttonTitle = `🚴 ${formatTravelTime(props.time)}`;
      break;
    }
  }
  return (
  <Button
    onPress={() =>
      share(shareText
      )
    }
    title={buttonTitle}
    color="#841584"
  />
  )
}

const getGoogleApiKey = () => {
  if (Platform.OS === 'ios') {
    return Constants?.manifest?.extra?.googleApiKeyIos;
  }
  if (Platform.OS === 'android') {
    return Constants?.manifest?.extra?.googleApiKeyAndroid;
  }
  return Constants?.manifest?.extra?.googleApiKeyWeb;
};

const googleApiKey = getGoogleApiKey();

const App = () => {
  const [location, setLocation] = useState<
    { lat: number, lng: number } | undefined
  >(undefined);
  const [locationStatus, setLocationStatus] = useState('Loading...');
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationStatus(
          'Permission to access location was denied. Please change your settings manually to use this app.'
        );
      } else {
        setLocationStatus('Getting your location...');
        (async () => {
          const resultLocation = await Location.getCurrentPositionAsync({});
          setLocation({
            lat: resultLocation.coords.latitude,
            lng: resultLocation.coords.longitude,
          });
          setLocationStatus('done');
        })();
      }
    })();
  }, []);

  const [destinationText, setDestinationText] = useState('');
  const [destinationTextSaved, setDestinationTextSaved] = useState('');
  useEffect(() => {
    getDestinationTextFromStorage().then((storedDestinationText) => {
      setDestinationText(storedDestinationText);
      setDestinationTextSaved(storedDestinationText);
    });
  }, []);

  const [dimensions, setDimensions] = useState({ window, screen });
  useEffect(() => {
    const subscription = Dimensions.addEventListener(
      'change',
      // eslint-disable-next-line no-shadow
      ({ window, screen }) => {
        setDimensions({ window, screen });
      }
    );
    // @ts-expect-error: Property 'remove' does not exist on type 'never'.
    return () => subscription?.remove();
  });

  const [destinationCoords, setDestinationCoords] = useState<
    { lat: number, lng: number } | undefined
  >(undefined);
  useEffect(() => {
    (async () => {
      if (destinationTextSaved.length > 0) {
        const request = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${destinationTextSaved}&key=${googleApiKey}`
        );
        const response = await request.json();
        if (response.results.length > 0) {
          if (
            response.status === 'OK' &&
            response.results[0]?.geometry?.location !== undefined
          ) {
            setDestinationCoords(response.results[0].geometry.location);
          }
        }
      }
    })();
  }, [destinationTextSaved]);

  const [travelTime, setTravelTime] = useState<{
    driving: number | undefined,
    walking: number | undefined,
    bicycling: number | undefined,
    transit: number | undefined,
  }>({
    driving: undefined,
    walking: undefined,
    bicycling: undefined,
    transit: undefined,
  });
  useEffect(() => {
    (async () => {
      if (
        destinationCoords !== undefined &&
        locationStatus === 'done' &&
        location !== undefined
      ) {
        let results: {
          driving: number | undefined,
          walking: number | undefined,
          bicycling: number | undefined,
          transit: number | undefined,
        } = {
          driving: undefined,
          walking: undefined,
          bicycling: undefined,
          transit: undefined,
        };
        // we need a for loop because we need to await each request
        // eslint-disable-next-line no-restricted-syntax
        for (const mode of Object.keys(results)) {
          // eslint-disable-next-line no-await-in-loop
          const request = await fetch(
            'https://europe-west3-take-me-home-334010.cloudfunctions.net/getTravelDurations',
            {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                origin: `${location.lat},${location.lng}`,
                destination: `${destinationCoords.lat},${destinationCoords.lng}`,
                mode,
                key: googleApiKey,
              }),
            }
          );
          // eslint-disable-next-line no-await-in-loop
          const response = await request.json();
          if (response.rows.length > 0) {
            if (response.status === 'OK') {
              if (
                response?.rows[0]?.elements[0]?.duration?.value !== undefined
              ) {
                results = {
                  ...results,
                  [mode]: response.rows[0].elements[0].duration.value,
                };
              }
            }
          }
        }
        setTravelTime(results);
      }
    })();
  }, [destinationCoords, location, locationStatus]);

  if (googleApiKey === undefined) {
    return (
      <SafeAreaView style={styles.page}>
        <Text style={styles.text}>API Key Error</Text>
        {/* eslint-disable-next-line react/style-prop-object */}
        <StatusBar style="light" hidden={false} />
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardContainer}
    >
      <SafeAreaView style={styles.page}>
        <ScrollView style={styles.scrollView}>
          <Text style={styles.header}>take me home</Text>
          <View style={styles.container}>
            {locationStatus !== 'done' ? (
              <Text style={styles.debug}>{locationStatus}</Text>
            ) : null}
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
              onPress={() => {
                setDestinationTextInStorage(destinationText);
                setDestinationTextSaved(destinationText);
              }}
              title="💾 Save Destination"
              color="#841584"
            />
            {travelTime.walking !== undefined ? (
              <TravelTimeShareButton destination={destinationTextSaved} mode='walking' time={travelTime.walking} />
            ) : null}
            {travelTime.bicycling !== undefined ? (
              <TravelTimeShareButton destination={destinationTextSaved} mode='bicycling' time={travelTime.bicycling} />
            ) : null}
            {travelTime.transit !== undefined ? (
              <TravelTimeShareButton destination={destinationTextSaved} mode='transit' time={travelTime.transit} />
            ) : null}
            {travelTime.driving !== undefined ? (
              <TravelTimeShareButton destination={destinationTextSaved} mode='driving' time={travelTime.driving} />
            ) : null}
            {/* eslint-disable-next-line react/style-prop-object */}
            <StatusBar style="light" hidden={false} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default App;
