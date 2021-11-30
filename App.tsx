import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, SafeAreaView } from 'react-native';
import * as Location from 'expo-location';

const App = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>take me home</Text>
      {GetPosition()}
      <StatusBar style="light" hidden={false} />
    </SafeAreaView>
  );
}

const GetPosition = () => {

  const [resultText, setResultText] = useState('Waiting for permission...');

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setResultText('Permission to access location was denied. Please change your settings manually to use this app.');
      } else {
        setResultText('Getting your location...');
        (async () => {
          let location = await Location.getCurrentPositionAsync({});
          setResultText(JSON.stringify(location));
        })();
      }
    })();
  }, []);

  return (
    <Text style={styles.debug}>{resultText}</Text>
  );
}

const styles = StyleSheet.create({
  container: {
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
  }
});

export default App;
