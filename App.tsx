import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>take me home</Text>
      <StatusBar style="auto" />
    </View>
  );
}

// this is a comment in order to test the pull request feature

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
  }
});
