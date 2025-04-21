import { StyleSheet, View } from 'react-native'
import { getColor } from '../constants/colors'
import UserFlatList from '../components/ui/User/UserFlatList'
import Typography from '../components/typography/Typography'
import Button from '../components/ui/Button'
import { useRef, useState } from 'react'
import { AddDataModalRef } from '../types'
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import BottomSheetModal from '../components/ui/modals/BottomSheetModal'
import Switch from '../components/ui/Switch'
import { RootStackParamList } from '../types'
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from "@react-navigation/native";

export type UserScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;


const UsersScreen = () => {
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



            <UserFlatList pressable onPress={() => navigation.navigate("Profile")} />
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