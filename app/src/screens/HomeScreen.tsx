import { StyleSheet, View } from 'react-native'
import { getColor } from '../constants/colors'
import GroupFlatList from '../components/ui/Group/GroupFlatList'
import SearchBar from '../components/ui/SearchBar'
import Typography from '../components/typography/Typography'
import Button from '../components/ui/Button'
import BottomSheetModal from '../components/ui/modals/BottomSheetModal'
import { useRef, useState } from 'react'
import { AddDataModalRef } from '../types'
import { RootStackParamList } from '../types'
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from "@react-navigation/native";
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';

export type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Users'>;

const HomeScreen = () => {
  const modalRef = useRef<AddDataModalRef>(null);
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [selectedValue, setSelectedValue] = useState<string>("");
  
  return (
    <View style={styles.pageContainer}>
        <View style={[styles.Hstack, styles.justifyBetween]}>
          <Typography variant='h3'>Parties</Typography>
          <Button size="sm" variant='outline' onPress={() => modalRef.current?.open()}>Add Party</Button>
    </View>

        <View style={styles.Hstack}>
          <SearchBar />
        </View>
      <GroupFlatList pressable onPress={() => navigation.navigate("Users")} />
      <BottomSheetModal title={"Add new party"} ref={modalRef} footer={"Add"}>
                
              <Input placeholder='Party Name' />

        <Select
          options={[
            { label: "Add Admin", value: "add_admin" },
            { label: "Aliasger", value: "h_member" },
            { label: "Jafarussadiq", value: "h_admin" },
            { label: "Hussain", value: "m_member", disabled: true },
          ]}
          value={selectedValue}
          onSelect={(val) => setSelectedValue(val)}
          placeholder="Choose Admin"
        />

        {selectedValue === "add_admin" && (
          <View style={{ gap: 16 }}>
            <Input placeholder="Full Name" />
            <Input placeholder="ITS number" />
            <Input placeholder="Phone Number" />
            <Input placeholder="Address" />
          </View>
        )}
      </BottomSheetModal>
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
