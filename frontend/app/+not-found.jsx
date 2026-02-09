import { useNavigation } from '@react-navigation/native';
import { Link, Stack } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';


export default function NotFoundScreen() {
  const navigate = useNavigation();
  return (
    
      <ScrollView contentContainerStyle={{ justifyContent: 'center', alignItems: 'center', flex: 1, margin: 'auto' }}>
        <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1, margin: 'auto', gap: 20 }}>
          <Text variant='displayLarge' >Oops!</Text>
          <Button mode='contained' onPress={() => navigate.goBack()}>
            Got to home page
          </Button>
        </View>
      </ScrollView>
  
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
