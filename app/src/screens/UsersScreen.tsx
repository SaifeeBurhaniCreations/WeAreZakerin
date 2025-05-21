import { StyleSheet, View } from 'react-native'
import { getColor } from '../constants/colors'
import UserFlatList from '../components/ui/User/UserFlatList'
import Typography from '../components/typography/Typography'
import Button from '../components/ui/Button'
import { useMemo, useRef, useState } from 'react'
import { AddDataModalRef, UserCardProps } from '../types'
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import BottomSheetModal from '../components/ui/modals/BottomSheetModal'
import Switch from '../components/ui/Switch'
import { RootStackParamList } from '../types'
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from "@react-navigation/native";
import Overlay from "../components/ui/Overlay"

export type UserScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;


const UsersScreen = () => {
    const users = useMemo(() => [
        { id: '1', image: require('@/src/assets/images/users/user-1.png'), name: "Aliasger Barood", title: "Support", its: "30532154", tag: "me" },
        { id: '2', image: require('@/src/assets/images/users/user-1.png'), name: "Jafarussadiq chandbhai", title: "Tipper", its: "30862154", tag: "" },
        { id: '3', image: require('@/src/assets/images/users/user-1.png'), name: "Mohammad banduk", title: "Support", its: "30905321", tag: "" },
      ], []) as UserCardProps[];
    
    const modalRef = useRef<AddDataModalRef>(null);
    const [selectedValue, setSelectedValue] = useState<string>("");
    const navigation = useNavigation<UserScreenNavigationProp>();

    return (
        <View style={styles.pageContainer}>
            <View style={[styles.Hstack, styles.justifyBetween]}>
                <Typography
                    variant='h3'
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={{ flex: 1, flexShrink: 1, marginRight: 24 }}
                >
                    Hakimi Members
                </Typography>

                <Button
                    size="sm"
                    variant='outline'
                    onPress={() => modalRef.current?.open()}
                >
                    Add Member
                </Button>
            </View>



            <UserFlatList users={users} pressable onPress={() => navigation.navigate("Profile")} />
            <BottomSheetModal title={"Add new member"} ref={modalRef} footer={"Add"}>

                <Input placeholder='Full name' />
                <Input placeholder='ITS number' />
                <Input placeholder="Phone Number" />
                <Input placeholder="Address" />
                <Select
                    options={[
                        { label: "Tipper", value: "tipper" },
                        { label: "Support", value: "support" },
                        { label: "Peaker", value: "peaker" },
                        { label: "Closer", value: "closer", disabled: true },
                    ]}
                    value={selectedValue}
                    onSelect={(val) => setSelectedValue(val)}
                    placeholder="Choose Title"
                />
                <Switch text={"admin"} />
            </BottomSheetModal>
        <Overlay />

        </View>
    )
}

export default UsersScreen

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