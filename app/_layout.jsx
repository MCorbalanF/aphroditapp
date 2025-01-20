import { ThemeProvider } from '@react-navigation/native';
import {
  Provider as PaperProvider,
  MD3LightTheme as DefaultTheme,
  MD3DarkTheme as DarkTheme,
  useTheme,
  IconButton,
  Portal
} from 'react-native-paper';
import * as SplashScreen from 'expo-splash-screen';
import { Drawer } from 'expo-router/drawer';
import { useColorScheme } from 'react-native';


// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const paperTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;


  return (
    <PaperProvider theme={DefaultTheme} >
      <ThemeProvider value={DefaultTheme}>

        <Drawer
          detachInactiveScreens
          screenOptions={(props) => {
            return ({
              headerShown: false
            });

          }}
        >

          <Drawer.Screen name="index" />
          <Drawer.Screen  name="auth"   />
          <Drawer.Screen name="login" />
          <Drawer.Screen name="signin" />

        </Drawer>

      </ThemeProvider>
    </PaperProvider>
  );
}
