import { ThemeProvider } from "@react-navigation/native";
import { Drawer } from "expo-router/drawer";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/use-color-scheme";
import * as React from "react";
import {
  MD3LightTheme as DefaultTheme,
  MD3DarkTheme as DarkTheme,
  PaperProvider,
  Icon,
} from "react-native-paper";
import NavBar from "@/components/nav/main_header";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
export default function RootLayout(props) {
  return (
    <GestureHandlerRootView >
      <RootContextProvider />
    </GestureHandlerRootView>
  );
};

function RootContextProvider(props) {
  return (
    <AuthProvider>
      <RootThemeProvider />
    </AuthProvider>
  );
}
function RootThemeProvider(props) {
  const { MDTheme } = useAuth();
  return (
    <PaperProvider
      theme={MDTheme}
      settings={{
        icon: (props) => <MaterialCommunityIcons {...props} />,
      }}>
      <ThemeProvider value={MDTheme}>
        <RootRoutes />
        <StatusBar style="auto" />
      </ThemeProvider>
    </PaperProvider>
  );
}
function RootRoutes() {
  return (
    <Drawer
    
      screenOptions={{
        headerShown: true,
        header: (prop) => <NavBar {...prop} />,
        
      }}
    >
      <Drawer.Screen name="index" options={{ title: "Home" }} />
      <Drawer.Screen name="auth" options={{ title: "Authentification" }} />
      <Drawer.Screen name="login" options={{ title: "Login" }} />
      <Drawer.Screen name="signin" options={{ title: "Sign In" }} />
    </Drawer>
  );
};