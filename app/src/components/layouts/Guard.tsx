import React, { useEffect, useState } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { NavigationProp, useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import PageHeader from "../ui/PageHeader";
import Fab from "../ui/Fab";
import { RootStackParamList, screenTitleMap } from "@/src/types";
import { useDispatch, useSelector } from "react-redux";
import { handleFetchGroup } from "@/src/redux/slices/AddPartySlice";
import { handleFetchMe, handleFetchUser } from "@/src/redux/slices/UserSlice";
import { fetchGroup } from "@/src/service/GroupService";
import { fetchMe, fetchUser } from "@/src/service/UserService";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import advancedFormat from "dayjs/plugin/advancedFormat";
import BannerCarousel from "../ui/BannerCarousel";
import { useRoleGuard } from "@/src/hooks/useAuthGuard";
import useAppNavigation from "@/src/hooks/useAppNavigation";
import { Toast } from "@/src/utils/Toast";

dayjs.extend(relativeTime);
dayjs.extend(advancedFormat);

type RouteNames = keyof RootStackParamList

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList>>();
  const { goTo } = useAppNavigation()
  const title = screenTitleMap[route.name] ?? route.name;
  const canAccess = useRoleGuard(route.name);
  const [initialChecked, setInitialChecked] = useState(false);
  const dispatch = useDispatch()

  const restrictCarousel: RouteNames[] = [
    "Piano", "ScheduleEvent", "OccasionList", "OccasionDetail", "ManageOccasion", "OccasionAttendance"
];
const restrictFab: RouteNames[] = [
    "Piano", "ScheduleEvent", "OccasionDetail", "ManageOccasion", "OccasionAttendance"
];



  useEffect(() => {
    const checkAuth = async () => {
      const token = await SecureStore.getItemAsync("metadata");
      if (token) {
        if (!canAccess) {
          goTo("Home");
          Toast.show({
            title: "Access Denied",
            description: "You do not have permission to access this section.",
            variant: "error",
          });          
        }
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: "Login" }],
        });
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const checkAuthOnce = async () => {
        const tokenValue = await SecureStore.getItemAsync("metadata");
        if (tokenValue) {
            await Promise.all([
                fetchMe(tokenValue).then(res => dispatch(handleFetchMe(res.data))),
                fetchUser(tokenValue).then(res => dispatch(handleFetchUser(res.data))),
                fetchGroup(tokenValue).then(res => dispatch(handleFetchGroup(res.data))),
            ]);
        }
        !initialChecked && setInitialChecked(true);
    };
    checkAuthOnce();
}, [dispatch]);

  return (
    <View style={styles.container}>
      <PageHeader title={title} goBack={navigation.goBack} canGoBack={navigation.canGoBack()} />

      {restrictCarousel.includes(route.name) || <BannerCarousel SCREEN_WIDTH={SCREEN_WIDTH} />}

      <View style={styles.content}>
        {children}
        {restrictFab.includes(route.name) || <Fab position="right" color="green" />}
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
        navigation.reset({ index: 0, routes: [{ name: "Home" }] });
      }
    };
    checkAuth();
  }, []);
  return <View style={{ flex: 1 }}>{children}</View>;
}



const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
});