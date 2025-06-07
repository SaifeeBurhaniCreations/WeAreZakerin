import { useEffect } from "react";
import { NavigationProp, useNavigation,  useRoute, RouteProp } from "@react-navigation/native";
import {  View } from "react-native";
import { RootStackParamList, screenTitleMap } from "@/src/types";
import * as SecureStore from 'expo-secure-store';
import { StyleSheet } from "react-native";
import commonBanner from '@/src/assets/images/ashara-hd.png'
import { Image } from "react-native";
import PageHeader from "../ui/PageHeader";

import Fab from "../ui/Fab";


export function AuthGuard({ children }: { children: React.ReactNode }) {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>(); 

    const route = useRoute<RouteProp<RootStackParamList>>()
    const title = screenTitleMap[route.name] ?? route.name;

  useEffect(() => {
    const checkAuth = async () => {
      const token = await SecureStore.getItemAsync("metadata");
      if (!token) {
        navigation.reset({
          index: 0,
          routes: [{ name: "Login" }],
        });
      }
    };
    checkAuth();
  }, []);

  return (
    <View style={styles.container}>
          <PageHeader title={title} goBack={navigation.goBack} canGoBack={navigation.canGoBack()} />
          {route.name !== "Piano" && (<Image
            source={commonBanner}
            alt='ashara banner'
            style={styles.banner}
            resizeMode="cover" 
          />) }
      <View style={styles.content}>
            {children}
      {route.name !== "Piano" && (<Fab position="right" color="green" />) }
      
          </View>
      </View>
  );
}
export function AntiAuthGuard({ children }: { children: React.ReactNode }) {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>(); 


  useEffect(() => {
    const checkAuth = async () => {
      const token = await SecureStore.getItemAsync("metadata");
      if (token) {
        navigation.reset({
          index: 0,
          routes: [{ name: "Home" }],
        });
      }
    };
    checkAuth();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {children}
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  banner: {
    width: '100%',
    height: 200,
  },
  content: {
    flex: 1,
  },
});
