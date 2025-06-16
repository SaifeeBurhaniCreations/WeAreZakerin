import { StyleSheet, View } from 'react-native';
import { getColor } from '../constants/colors';
import UserFlatList from '../components/ui/User/UserFlatList';
import Typography from '../components/typography/Typography';
import Button from '../components/ui/Button';
import { useEffect, useRef, useState } from 'react';
import { AddDataModalRef, UserCardProps } from '../types';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import BottomSheetModal from '../components/ui/modals/BottomSheetModal';
import Switch from '../components/ui/Switch';
import { RootStackParamList } from '../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import Overlay from "../components/ui/Overlay";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import userSchema, { UserFormData } from '../schemas/UserSchema';
import { createUser, fetchUserById } from '../service/UserService';
import { handleAddUser } from '../redux/slices/UserSlice';
import { handleAddMemberInGroup } from '../redux/slices/AddPartySlice';

type UserScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;
type UserScreenRouteProp = RouteProp<RootStackParamList, 'Users'>;

const UsersScreen = () => {
    const navigation = useNavigation<UserScreenNavigationProp>();
    const dispatch = useDispatch();
    const route = useRoute<UserScreenRouteProp>();
    const modalRef = useRef<AddDataModalRef>(null);
    const [loading, setLoading] = useState(false);
    const [allMembers, setAllMembers] = useState([]);
    const [adminData, setAdminData] = useState({});
    const { name, admin } = route.params || {};
    const { users, me } = useSelector((state: RootState) => state.users);
    const { groups } = useSelector((state: RootState) => state.modal);

    // const users = useMemo(() => [
    //     { id: '1', image: require('@/src/assets/images/users/user-1.png'), name: "Aliasger Barood", title: "Support", its: "30532154", tag: "me" },
    //     { id: '2', image: require('@/src/assets/images/users/user-1.png'), name: "Jafarussadiq chandbhai", title: "Tipper", its: "30862154", tag: "" },
    //     { id: '3', image: require('@/src/assets/images/users/user-1.png'), name: "Mohammad banduk", title: "Support", its: "30905321", tag: "" },
    // ], []) as UserCardProps[];
    const getGroup = groups?.find(value => value.name === name)
    const { members } = getGroup || []

    useEffect(() => {
        if (admin) {
            (async () => {
                const response = await fetchUserById(admin)
                setAdminData({ ...response?.data, tag: true })
            })()
        }
    }, [route])


    useEffect(() => {
        if (users && members?.length > 0) {
            setAllMembers(users?.filter((user => members?.includes(user?._id))))
        }
    }, [users, members])

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<UserFormData>({
        resolver: zodResolver(userSchema),
        mode: "onChange",
        defaultValues: {
            userid: "",
            title: "",
            fullname: "",
            phone: "",
            address: "",
            belongsto: name, // Pre-fill belongsto
            role: "member",   // default role
        },
    });

    const onSubmit: SubmitHandler<UserFormData> = async (data) => {
        try {
            setLoading(true);
            const response = await createUser(data);
            if (response.status === 201) {
                dispatch(handleAddUser(response.data?.user));
                const updateGroup = {
                    name,
                    id: response?.data?.user
                }
                dispatch(handleAddMemberInGroup(updateGroup))
                modalRef.current?.close();
                reset();
            }
        } catch (error: any) {
            console.log("Create group failed:", error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.pageContainer}>
            <View style={[styles.Hstack, styles.justifyBetween]}>
                <Typography
                    variant='h3'
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={{ flex: 1, flexShrink: 1, marginRight: 24 }}
                >
                    {name}
                </Typography>

                <Button
                    size="sm"
                    variant='outline'
                    onPress={() => {
                        reset(); // Clear previous inputs
                        modalRef.current?.open();
                    }}
                >
                    Add Member
                </Button>
            </View>

            <UserFlatList
                users={allMembers}
                admin={adminData?._id}
                me={me ? me?._id : null}
                pressable
                onPress="Profile"
            />

            <BottomSheetModal
                title={"Add new member"}
                ref={modalRef}
                footer="Add"
                onPress={handleSubmit(onSubmit)} // bind to handleSubmit
            >
                <Controller
                    control={control}
                    name="fullname"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                            placeholder="Full name"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            error={errors.fullname?.message}
                        />
                    )}
                />
                <Controller
                    control={control}
                    name="userid"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                            placeholder="Enter ITS number"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            error={errors.userid?.message}
                            keyboardType="number-pad"
                            maxLength={8}
                        />
                    )}
                />
                <Controller
                    control={control}
                    name="phone"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                            placeholder="Phone Number"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            error={errors.phone?.message}
                            keyboardType="number-pad"
                            maxLength={10}
                        />
                    )}
                />

                {/* Controlled Select */}
                <Controller
                    control={control}
                    name="title"
                    render={({ field: { onChange, value } }) => (
                        <Select
                            options={[
                                { label: "Tipper", value: "tipper" },
                                { label: "Support", value: "support" },
                                { label: "Peaker", value: "peaker" },
                                { label: "Closer", value: "closer", disabled: true },
                            ]}
                            value={value}
                            onSelect={onChange}
                            placeholder="Choose Title"
                        // error={errors.title?.message}
                        />
                    )}
                />

                <Controller
                    control={control}
                    name="address"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                            placeholder="Address"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            error={errors.address?.message}
                        />
                    )}
                />

                {/* Admin Switch */}
                <Controller
                    control={control}
                    name="role"
                    render={({ field: { onChange, value } }) => (
                        <Switch
                            text={"Admin"}
                            value={value === 'groupAdmin'}
                            onValueChange={(val) => onChange(val ? 'groupAdmin' : 'member')}
                        />
                    )}
                />
            </BottomSheetModal>

            <Overlay />
        </View>
    );
};

export default UsersScreen;

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
});
