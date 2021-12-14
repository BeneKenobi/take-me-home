import { StyleSheet } from 'react-native';

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
  keyboardContainer: {
    flex: 1,
  },
});

export default styles;
