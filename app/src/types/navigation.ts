import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export type RootStackParamList = {
    Home: undefined;
    Login: undefined;
    Landing: undefined;
    Loader: undefined;
    Users: undefined;
};

export type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
