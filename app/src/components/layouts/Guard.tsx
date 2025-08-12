import React, { useEffect, useState, useRef, useMemo } from "react";
import { View, StyleSheet, Dimensions, Image, FlatList } from "react-native";
import { NavigationProp, useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import commonBanner from "@/src/assets/images/ashara-hd.png";
import PageHeader from "../ui/PageHeader";
import Fab from "../ui/Fab";
import { RootStackParamList, screenTitleMap } from "@/src/types";
import Carousel from "react-native-snap-carousel";
import { useDispatch } from "react-redux";
import { handleFetchGroup } from "@/src/redux/slices/AddPartySlice";
import { handleFetchMe, handleFetchUser } from "@/src/redux/slices/UserSlice";
import { fetchGroup } from "@/src/service/GroupService";
import { fetchMe, fetchUser } from "@/src/service/UserService";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { Text } from "react-native";
import { usePendingOccasions } from "@/src/hooks/useOccassion";

dayjs.extend(relativeTime);
dayjs.extend(advancedFormat);

const { width } = Dimensions.get("window");

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList>>();
  const title = screenTitleMap[route.name] ?? route.name;
  const dispatch = useDispatch();

  const [occasions, setOccasions] = useState<any[]>([]);
  const carouselRef = useRef(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await SecureStore.getItemAsync("metadata");
      if (token) {
        await fetchData(token);
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: "Login" }],
        });
      }
    };
    checkAuth();
  }, []);

  const fetchGroupData = async (token: string) => {
    const res = await fetchGroup(token);
    dispatch(handleFetchGroup(res.data));
  };
  const fetchUserData = async (token: string) => {
    const res = await fetchUser(token);
    dispatch(handleFetchUser(res.data));
  };
  const fetchMyData = async (token: string) => {
    const res = await fetchMe(token);
    dispatch(handleFetchMe(res.data));
  };
  const fetchData = async (token: string) => {
    await Promise.all([fetchGroupData(token), fetchUserData(token), fetchMyData(token)]);
  };

  const { data, isLoading } = usePendingOccasions()

  useEffect(()=>{
    if(!isLoading && data) {
      setOccasions(data)
      console.log(data);
      
    }
  },[isLoading])


  const renderOccasionCard = (item: any) => {
    const daysLeft = dayjs(item.start_at).diff(dayjs(), "day");
    return (
      <View style={styles.card}>
        <Text style={styles.ocName}>{item.name}</Text>
        <Text style={styles.timeLeft}>
          {daysLeft >= 0 ? `${daysLeft} days left` : "Started"}
        </Text>
        <Text style={styles.meta}>📍 {item.location}</Text>
        <Text style={styles.meta}>
          🗓 {dayjs(item.start_at).format("MMMM Do YYYY")} at {dayjs(item.time).format("hh:mm A")}
        </Text>
        <Text style={styles.meta}>
          👤 Created by: {item.created_by}
        </Text>
        <View style={styles.eventsContainer}>
          {item.events.map((ev: any, idx: number) => (
            <Text key={idx} style={styles.eventChip}>
              {ev.type} → {ev.party}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  const slides = useMemo(() => {
    let arr: any[] = [];
    arr.push({ type: "banner" });
    if (occasions.length > 0) {
      arr = arr.concat(
        occasions.map((o) => ({
          type: "occasion",
          data: o,
        }))
      );
    }
    return arr;
  }, [occasions]);

  return (
    <View style={styles.container}>
      <PageHeader title={title} goBack={navigation.goBack} canGoBack={navigation.canGoBack()} />

      {route.name !== "Piano" && (<Image
            source={commonBanner}
            alt='ashara banner'
            style={styles.banner}
            resizeMode="cover"
          />)}
      {/* {route.name !== "Piano" && (
        <Carousel
          ref={carouselRef}
          data={slides}
          renderItem={({ item }) =>
            item.type === "banner" ? (
              <Image source={commonBanner} resizeMode="cover" />
            ) : (
              renderOccasionCard(item.data)
            )
          }
          sliderWidth={width}
          itemWidth={width * 0.85}
          inactiveSlideScale={0.9}
          inactiveSlideOpacity={0.7}
          containerCustomStyle={{ marginTop: 10 }}
          loop
          autoplay
        />
      )} */}

      <View style={styles.content}>
        {children}
        {route.name !== "Piano" && <Fab position="right" color="green" />}
      </View>
    </View>
  );
}

// AntiAuthGuard remains unchanged unless you want a slider here too
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
  banner: { width: "100%", height: 200, borderRadius: 12 },
  content: { flex: 1, marginTop: 10 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4.65,
    elevation: 6,
  },
  ocName: { fontSize: 18, fontWeight: "700", color: "#333" },
  timeLeft: { fontSize: 14, fontWeight: "500", color: "#FF6B6B", marginVertical: 4 },
  meta: { fontSize: 13, color: "#555", marginTop: 2 },
  eventsContainer: { marginTop: 8, flexDirection: "row", flexWrap: "wrap" },
  eventChip: {
    backgroundColor: "#E0F7FA",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 12,
    color: "#00796B",
    margin: 2
  }
});

