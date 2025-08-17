// UsersScreen.tsx
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { getColor } from '../constants/colors';
import { Modal } from 'react-native';
import UserFlatList from '../components/ui/User/UserFlatList';
import Typography from '../components/typography/Typography';
import Button from '../components/ui/Button';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AddDataModalRef, RootStackParamList } from '../types';
import Select from '../components/ui/Select';
import BottomSheetModal from '../components/ui/modals/BottomSheetModal';
import { RouteProp, useRoute } from "@react-navigation/native";
import Overlay from "../components/ui/Overlay";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import {
    handleRemoveMemberFromGroup,
    handleUpdateGroup,
} from '../redux/slices/AddPartySlice';
import { Toast } from '../utils/Toast';
import Spinner from '../components/ui/loader/Spinner';
import ThreeDot from '../components/icons/ThreeDot';
import AddUserIcon from '../components/icons/AddUserIcon';
import RemoveUserIcon from '../components/icons/RemoveUserIcon';
import AdminIcon from '../components/icons/AdminIcon';
import ExitIcon from '../components/icons/ExitIcon';
import { ScrollView } from 'react-native-gesture-handler';
import { removeMemberFromGroup, transferAdminRole, leaveGroup } from '../service/GroupService';
import { handleUpdateUserRole, handleRemoveUserFromParty } from '../redux/slices/UserSlice';
import AddMemberModal from '../components/ui/AddMemberModal';


type UserScreenRouteProp = RouteProp<RootStackParamList, 'Users'>;

const UsersScreen = () => {
    const dispatch = useDispatch();
    const route = useRoute<UserScreenRouteProp>();
    const modalRef = useRef<AddDataModalRef>(null);
    const addMemberRef = useRef<AddDataModalRef>(null);
    const removeMemberRef = useRef<AddDataModalRef>(null);
    const transferAdminRef = useRef<AddDataModalRef>(null);

    const [loading, setLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [transferAdminId, setTransferAdminId] = useState<string | null>(null);


    const { name, admin, id: groupId } = route.params || {};
    const { users, me } = useSelector((state: RootState) => state.users);
    const { groups } = useSelector((state: RootState) => state.party);

    const currentGroup = useMemo(() => {
        return groups.find(group => group.name === name);
    }, [groups, name]);

    const members = useMemo(() => currentGroup?.members || [], [currentGroup]);
    const adminData = useMemo(() => users.find(user => user._id === admin), [users, admin]);

    const allMembers = useMemo(() => {
        return users
            .filter((user: any) => members.includes(user._id))
            .map(user => ({
                ...user,
                id: user._id,
                tag: user._id === admin,
                image: { uri: user.profileImage?.s3Url || '' }
            }));
    }, [users, members, admin]);

    const handleRemoveMember = async () => {
        if (!selectedUserId) return;
        try {
            setLoading(true);
            await removeMemberFromGroup(groupId!, selectedUserId);
            Toast.show({ title: 'Removed', description: 'Member removed!', variant: 'success' });
            dispatch(handleRemoveMemberFromGroup({ name, id: selectedUserId }));
            dispatch(handleRemoveUserFromParty({ user: selectedUserId }));
            removeMemberRef.current?.close();
            modalRef.current?.close();
            setSelectedUserId('');
        } catch (error: any) {
            Toast.show({ title: 'Error', description: error.message, variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleTransferAdmin = async () => {
        if (!transferAdminId) return;
        try {
            setLoading(true);
            const response = await transferAdminRole(groupId!, transferAdminId);
            if (response.status === 200) {
                Toast.show({ title: 'Admin Transferred', description: 'Admin changed!', variant: 'success' });
                dispatch(handleUpdateGroup(response.data));
                dispatch(handleUpdateUserRole({ transferAdminId, admin: admin! }));
                transferAdminRef.current?.close();
                modalRef.current?.close();
                setTransferAdminId(null);
            }
        } catch (error: any) {
            Toast.show({ title: 'Error', description: error.message, variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleLeaveParty = async () => {
        try {
            setLoading(true);
            await leaveGroup(me?._id!);
            Toast.show({ title: 'Left', description: 'You left the party.', variant: 'success' });
            dispatch(handleRemoveMemberFromGroup({ name, id: me?._id }));
            setShowDeleteModal(false);
        } catch (error: any) {
            Toast.show({ title: 'Error', description: error.message, variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (!groupId) {
        Toast.show({ title: 'Error', description: 'Group ID is missing', variant: 'error' });
        return;
    }

    return (
        <View style={styles.pageContainer}>
            <View style={[styles.Hstack, styles.justifyBetween]}>
                <Typography
                    variant='h3'
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={{ flex: 1, marginRight: 24 }}
                >
                    {name}
                </Typography>

                <Button
                    size="sm"
                    style={{ paddingVertical: 6, paddingHorizontal: 6 }}
                    variant='outline'
                    onPress={() => {
                        modalRef.current?.open();
                    }}
                >
                    <ThreeDot />
                </Button>
            </View>

            {me || members.length > 0 || adminData ? (
                <UserFlatList
                    users={allMembers}
                    admin={admin!}
                    me={me?._id || ""}
                    pressable
                    onPress="Profile"
                />
            ) : (
                <Spinner size='large' />
            )}


            <BottomSheetModal
                title={"Manage Actions"}
                ref={modalRef}
            >
                <ScrollView>
                    <View style={[styles.Vstack]}>
                        <TouchableOpacity
                            style={[styles.card]} onPress={() => {
                                addMemberRef.current?.open();
                            }}
                        >
                            <AddUserIcon color={getColor('green')} />
                            <Typography variant="b4" color={getColor("green", 700)}> Add Member</Typography>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.card]} onPress={() => {
                                removeMemberRef.current?.open();
                            }}
                        >
                            <RemoveUserIcon color={getColor('green')} />
                            <Typography variant="b4" color={getColor("green", 700)}> Remove Member</Typography>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.card]} onPress={() => {
                                transferAdminRef.current?.open();
                            }}
                        >
                            <AdminIcon color={getColor('green')} />
                            <Typography variant="b4" color={getColor("green", 700)}> Transfer Admin</Typography>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.card]}
                            onPress={() => setShowDeleteModal(true)}
                        >
                            <ExitIcon color={getColor('green')} />
                            <Typography variant="b4" color={getColor("green", 700)}> Leave Party</Typography>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </BottomSheetModal>

            <AddMemberModal ref={addMemberRef} groupId={groupId} name={name!} />

            <BottomSheetModal
                title={"Remove Member"}
                ref={removeMemberRef}
                footer="Remove"
                onPress={handleRemoveMember}
            >
                <Select
                    options={allMembers
                        .filter((user: any) => user?._id !== me?._id && user?._id !== admin)
                        .map((user: any) => ({ label: user?.fullname, value: user?._id }))}
                    value={selectedUserId ?? undefined}
                    onSelect={setSelectedUserId}
                    placeholder="Choose Member"
                />
            </BottomSheetModal>

            <BottomSheetModal
                title={"Transfer Admin Role"}
                ref={transferAdminRef}
                footer="Make Admin"
                onPress={handleTransferAdmin}
            >
                <Select
                    options={allMembers
                        .filter((user: any) => user?._id !== admin)
                        .map((user: any) => ({ label: user?.fullname, value: user?._id }))}
                    value={transferAdminId ?? undefined}
                    onSelect={setTransferAdminId}
                    placeholder="Choose Admin"
                />
            </BottomSheetModal>

            <Modal
                transparent
                visible={showDeleteModal}
                animationType="fade"
                onRequestClose={() => setShowDeleteModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Typography variant="h5" color={getColor('green', 700)}>Confirm Leave</Typography>
                        <Typography variant="b4" color={getColor('green', 400)}>
                            Are you sure you want to leave ?
                        </Typography>
                        <View style={[styles.Hstack, { justifyContent: 'flex-end', marginTop: 16 }]}>
                            <Button size="sm" variant="outline" onPress={() => setShowDeleteModal(false)}>Cancel</Button>
                            <Button size="sm" color="red" onPress={handleLeaveParty}>{loading ? 'Leaving...' : 'Leave'}</Button>
                        </View>
                    </View>
                </View>
            </Modal>

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
    Vstack: {
        flexDirection: "column",
        gap: 8,
        alignItems: "flex-start",
        flexWrap: 'wrap'
    },
    justifyBetween: {
        justifyContent: "space-between"
    },
    card: {
        backgroundColor: getColor('light', 300),
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderRadius: 16,
        flexDirection: 'row',
        shadowColor: 'rgba(0, 17, 13, 0.3)',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 1,
        shadowRadius: 12,
        elevation: 6,
        alignItems: 'center',
        flex: 1,
        width: '100%',
        // borderColor: getColor('green', 700),
        // borderWidth: 0.6,
        gap: 8
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: getColor('light'),
        padding: 20,
        borderRadius: 12,
        width: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
        gap: 8,
    },
});
