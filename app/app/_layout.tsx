import "@/global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { useEffect } from "react";
import * as Font from "expo-font";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "@/src/screens/LoginScreen";
import LandingScreen from "@/src/screens/LandingScreen";
import LoaderScreen from "@/src/components/ui/loader/LoaderScreen";
import HomeScreen from "@/src/screens/HomeScreen";
// import Fab from "@/src/components/ui/Fab";
import { Platform, View, StatusBar as RNStatusBar } from "react-native";
// import { store } from "@/src/redux/store";
import { StatusBar } from "expo-status-bar";
import { getColor } from "@/src/constants/colors";
import { AntiAuthGuard, AuthGuard } from "@/src/components/layouts/Guard";
import 'react-native-gesture-handler';

const Stack = createStackNavigator();


export default function RootLayout() {

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        "FunnelSans-Regular": require("@/src/assets/fonts/FunnelSans-Regular.ttf"),
        "FunnelSans-SemiBold": require("@/src/assets/fonts/FunnelSans-SemiBold.ttf"),
        "FunnelSans-Bold": require("@/src/assets/fonts/FunnelSans-Bold.ttf"),
      });

    }
    loadFonts();
  }, []);

  return (
    <GluestackUIProvider mode="light"><View style={{ flex: 1, paddingTop: Platform.OS === "android" ? RNStatusBar.currentHeight : 0, }}>
      <StatusBar backgroundColor={getColor("green")} style="light" />
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" options={{ headerShown: false }}>
          {() => (
            <AuthGuard>
              <HomeScreen />
            </AuthGuard>
          )}
        </Stack.Screen>


        <Stack.Screen name="Login" options={{ headerShown: false }}>
          {() => (
            <AntiAuthGuard>
              <LoginScreen />
            </AntiAuthGuard>
          )}
        </Stack.Screen>

        <Stack.Screen name="Landing" options={{ headerShown: false }}>
          {() => (
            <AntiAuthGuard>
              <LandingScreen />
            </AntiAuthGuard>
          )}
        </Stack.Screen>
        <Stack.Screen name="Loader" options={{ headerShown: false }}>
          {() => (
            <AntiAuthGuard>
              <LoaderScreen />
            </AntiAuthGuard>
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </View></GluestackUIProvider>
  );
}
