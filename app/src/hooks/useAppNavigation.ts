import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';

type AppNavigation = NativeStackNavigationProp<RootStackParamList>;

export default function useAppNavigation() {
  const navigation = useNavigation<AppNavigation>();

  const goTo = (route: keyof RootStackParamList, params?: any) => {
    navigation.navigate(route, params);
  };

  const resetTo = (route: keyof RootStackParamList, params?: any) => {
    navigation.reset({
      index: 0,
      routes: [{ name: route, params }],
    });
  };

  const replaceWith = (route: keyof RootStackParamList, params?: any) => {
    navigation.replace(route, params);
  };

  return { goTo, resetTo, replaceWith };
}
