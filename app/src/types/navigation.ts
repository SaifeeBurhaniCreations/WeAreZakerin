import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Occassion } from "../redux/slices/OccassionSlice";

export type RootStackParamList = {
    Home: undefined;
    Login: undefined;
    Landing: undefined;
    Loader: undefined;
    Users?: { name: string, members: string[], admin: string, id: string } | undefined;
    Profile?: { id: string } | undefined;
    EditProfile: undefined;
    ScheduleEvent: undefined;
    OccasionList: undefined;
    OccasionDetail: {data: Occassion};
    ManageOccasion: {data: Occassion};
    OccasionAttendance: {data: Occassion};
    Piano: undefined;
};

export type NavigationProp = NativeStackNavigationProp<RootStackParamList>;


export const screenTitleMap: Record<string, string> = {
    EditProfile: 'Edit Profile',
    Home: 'Home',
    Users: 'User',
    Profile: 'Profile',
    ScheduleEvent: 'Schedule Event',
  }