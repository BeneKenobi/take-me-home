import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, SafeAreaView, Image } from 'react-native';
import * as Location from 'expo-location';
import Constants from 'expo-constants';

const App = () => {
  let googleApiKey = Constants?.manifest?.extra?.googleApiKey
  if (googleApiKey == undefined) {
    return(
      <SafeAreaView style={styles.page}>
        <Text style={styles.text}>API Key Error</Text>
      <StatusBar style="light" hidden={false} />
      </SafeAreaView>
    );
  }

 let [postitionStatus, location] = GetPosition()

let image

 if(location != undefined) {
   image = getGoogleMapsImage(googleApiKey, location)
 }

  return(
    <SafeAreaView style={styles.page}>
      <Text style={styles.text}>take me home</Text>
      {image}
      <Text style={styles.debug}>{postitionStatus}</Text>
      <StatusBar style="light" hidden={false} />
    </SafeAreaView>
  );
}

const GetPosition = () : [string, Location.LocationObject | undefined ] => {

  const [resultText, setResult] = useState('Waiting for permission...');
  const [location, setLocation] = useState<Location.LocationObject | undefined>(undefined);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setResult('Permission to access location was denied. Please change your settings manually to use this app.');
      } else {
        setResult('Getting your location...');
        (async () => {
          setLocation(await Location.getCurrentPositionAsync({}));
          setResult('done');
        })();
      }
    })();
  }, []);

  return(
    [resultText, location]
  );
}

const getGoogleMapsImage = (googleApiKey : string, location : Location.LocationObject) => {
  return(
    <Image
      style = {styles.mapImage}
      source = {{
          uri: 'https://maps.googleapis.com/maps/api/staticmap?center=' + location.coords.latitude + ', ' + location.coords.longitude + '&zoom=17&size=400x400&key=' + googleApiKey
      }}
    />
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  text: {
    color: 'white',
    fontSize: 100
  },
  debug: {
    color: 'white',
    fontSize: 10
  },
  mapImage:  {
    width: 400,
    height: 400,
  }
});

export default App;
