import { useEffect } from "react";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { View } from "react-native";
import { RootStackParamList } from "@/src/types";
import * as SecureStore from 'expo-secure-store';
import { StyleSheet } from "react-native";
import commonBanner from '@/src/assets/images/ashara-hd.png'
import { Image } from "react-native";

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>(); 


  // useEffect(() => {
  //   const checkAuth = async () => {
  //     const token = await SecureStore.getItemAsync("metadata");
  //     if (!token) {
  //       navigation.reset({
  //         index: 0,
  //         routes: [{ name: "Login" }],
  //       });
  //     }
  //   };
  //   checkAuth();
  // }, []);

  return (
    <View style={styles.container}>
     <Image
        source={commonBanner}
        alt='ashara banner'
        style={styles.banner}
        resizeMode="cover" 
      />
  <View style={styles.content}>
        {children}
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
