import "@/global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import React, { useEffect, useState, Suspense } from "react";
import * as Font from "expo-font";
import { createStackNavigator } from "@react-navigation/stack";
import { Platform, View, StatusBar as RNStatusBar } from "react-native";
import { StatusBar } from "expo-status-bar";
import { getColor } from "@/src/constants/colors";
import { AntiAuthGuard, AuthGuard } from "@/src/components/layouts/Guard";
import 'react-native-gesture-handler';

// Lazy load screens
const LoginScreen = React.lazy(() => import('@/src/screens/LoginScreen'));
const LandingScreen = React.lazy(() => import('@/src/screens/LandingScreen'));
const LoaderScreen = React.lazy(() => import('@/src/components/ui/loader/LoaderScreen'));
const HomeScreen = React.lazy(() => import('@/src/screens/HomeScreen'));
const UsersScreen = React.lazy(() => import('@/src/screens/UsersScreen'));
const ProfileScreen = React.lazy(() => import('@/src/screens/ProfileScreen'));
const EditProfileScreen = React.lazy(() => import('@/src/screens/EditProfileScreen'));

const Stack = createStackNavigator();

export default function RootLayout() {
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    async function loadResources() {
      try {
        // Load fonts asynchronously
        await Font.loadAsync({
          "FunnelSans-Regular": require("@/src/assets/fonts/FunnelSans-Regular.ttf"),
          "FunnelSans-SemiBold": require("@/src/assets/fonts/FunnelSans-SemiBold.ttf"),
          "FunnelSans-Bold": require("@/src/assets/fonts/FunnelSans-Bold.ttf"),
        });

        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsAppReady(true);
      } catch (e) {
        console.error("App load error", e);
      }
    }

    loadResources();
  }, []);

  if (!isAppReady) {
    return (
      <Suspense fallback={<LoaderScreen />}>
        <LoaderScreen />
      </Suspense>
    );
  }

  return (
    <GluestackUIProvider mode="light">
      <View style={{ flex: 1, paddingTop: Platform.OS === "android" ? RNStatusBar.currentHeight : 0 }}>
        <StatusBar backgroundColor={getColor("green")} style="light" />
        <Suspense fallback={<LoaderScreen />}>
          <Stack.Navigator initialRouteName="EditProfile">
            <Stack.Screen name="Home" options={{ headerShown: false }}>
              {() => (
                <AuthGuard>
                  <HomeScreen />
                </AuthGuard>
              )}
            </Stack.Screen>
            <Stack.Screen name="Users" options={{ headerShown: false }}>
              {() => (
                <AuthGuard>
                  <UsersScreen />
                </AuthGuard>
              )}
            </Stack.Screen>
            <Stack.Screen name="Profile" options={{ headerShown: false }}>
              {() => (
                <AuthGuard>
                  <ProfileScreen />
                </AuthGuard>
              )}
            </Stack.Screen>
            <Stack.Screen name="EditProfile" options={{ headerShown: false }}>
              {() => (
                <AuthGuard>
                  <EditProfileScreen />
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
        </Suspense>
      </View>
    </GluestackUIProvider>
  );
}
