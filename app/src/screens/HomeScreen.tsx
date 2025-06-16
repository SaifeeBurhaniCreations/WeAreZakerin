import { StyleSheet, View } from 'react-native'
import { getColor } from '../constants/colors'
import GroupFlatList from '../components/ui/Group/GroupFlatList'
import SearchBar from '../components/ui/SearchBar'
import Typography from '../components/typography/Typography'
import Button from '../components/ui/Button'
import { GroupCardProps, RootStackParamList } from '../types'
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from "@react-navigation/native";
import Overlay from "../components/ui/Overlay"
import AddPartyModal from '../components/ui/AddPartyModal'
import AddAminModal from '../components/ui/AddAminModal'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../redux/store'

export type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ScheduleEvent'>;


const HomeScreen = () => {

  const { groups } = useSelector((state: RootState) => state.modal);

  
  const navigation = useNavigation<HomeScreenNavigationProp>();
  
  return (
    <View style={styles.pageContainer}>
        <View style={[styles.Hstack, styles.justifyBetween]}>
          <Typography variant='h3'>Parties</Typography>
          <Button size="sm" variant='outline' onPress={() => navigation.navigate("ScheduleEvent")}>Schedule Event</Button>
    </View>

        <View style={styles.Hstack}>
          <SearchBar />
        </View>
      <GroupFlatList groups={groups} pressable onPress="Users" />
        <AddPartyModal />
        <AddAminModal />
      <Overlay />

    </View>
  )
}

export default HomeScreen

const styles = StyleSheet.create({
  pageContainer: {
    backgroundColor: getColor('light', 200),
    flex: 1,
    padding: 16,
    gap: 16,
  },
  Hstack: {
    flexDirection: "row",
    gap: 8,
  },
  justifyBetween: {
    justifyContent: "space-between"
  }
})
