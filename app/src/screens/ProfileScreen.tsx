import { Image, ScrollView, StyleSheet, View } from 'react-native'
import { Modal } from 'react-native';
import { getColor } from '../constants/colors'
import avatar from "@/src/assets/images/users/user-1.png"
import Typography from '../components/typography/Typography'
import MisqaatIcon from '../components/icons/MisqaatIcon'
import LocationIcon from '../components/icons/LocationIcon'
import Button from '../components/ui/Button'
import Tag from '../components/ui/Tag'
import { RouteProp, useRoute } from "@react-navigation/native";
import { AddDataModalRef, RootStackParamList } from '../types'
import MailIcon from '../components/icons/MailIcon'
import PhoneIcon from '../components/icons/PhoneIcon'
import Overlay from "../components/ui/Overlay"
import { useSecureStorageState } from '../hooks/useSecureStorageState'
import useAppNavigation from '../hooks/useAppNavigation'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../redux/store'
import { useEffect, useRef, useState } from 'react';
import { removeUser } from '../service/UserService';
import { handleFetchUser } from '../redux/slices/UserSlice';
import { handleFetchGroup } from '../redux/slices/AddPartySlice';
import { Toast } from '../utils/Toast';
import Select from '../components/ui/Select';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChooseAdminFormData, chooseAdminSchema } from '../schemas/UserSchema';
import BottomSheetModal from '../components/ui/modals/BottomSheetModal';
import AddMemberModal from '../components/ui/AddMemberModal';


type ProfileRouteProp = RouteProp<RootStackParamList, 'Profile'>;

const ProfileScreen = () => {
  const route = useRoute<ProfileRouteProp>();
  const id = route?.params?.id;

  const addMemberRef = useRef<AddDataModalRef>(null);
  
  const { users, me } = useSelector((state: RootState) => state.users);
  const { groups } = useSelector((state: RootState) => state.party);
  const selectedUser = users?.find(value => value?._id === id);
  const { goTo, resetTo } = useAppNavigation()

  const { fullname, userid, address, title, phone, belongsto, _id } = selectedUser || {};
  
  const userGroup = groups?.find(value => value.name === belongsto);
  
  const [, , removeMetaData] = useSecureStorageState<any>('metadata', null);
  const dispatch = useDispatch();
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [members, setMembers] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string>('');

  useEffect(() => {
    const filteredMembers = users?.filter(
      (value: any) =>
        userGroup?.members?.includes(value._id) && value?._id !== id
    );

    setMembers(filteredMembers)

  }, [groups, users])

  useEffect(() => {

    selectedValue === 'add_member' && addMemberRef.current?.open();

  }, [selectedValue])

  // if (!id) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
  //       <Typography variant="h5" color="red">No user ID provided.</Typography>
  //     </View>
  //   );
  // }

  // if (!selectedUser) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
  //       <Typography variant="h5" color="red">User not found.</Typography>
  //     </View>
  //   );
  // }

  const isAdminRequired = selectedUser?.role !== 'member';

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChooseAdminFormData>({
    resolver: zodResolver(chooseAdminSchema(isAdminRequired)),
    mode: "onChange",
    defaultValues: {
      fullname: "",
    },
  });


  const handleLogout = async() => {
    await removeMetaData();
    resetTo("Landing");
  }

  const onSubmit: SubmitHandler<ChooseAdminFormData> = async (data) => {
    if (!userid) return
    try {
      setLoading(true);

      const admin = selectedUser?.role !== 'member' ? data?.fullname : null

      const response = await removeUser({ id: userid!, admin: admin! })

      setLoading(true)
      if (response.status === 200) {
        const { user, group } = response.data
        Toast.show({
          title: 'Delete',
          description: 'User Delete Successfully!',
          variant: 'success',
        });
        setLoading(false)

        dispatch(handleFetchUser(user))
        dispatch(handleFetchGroup(group))

        goTo("Users", {...userGroup, id: userGroup?._id})
        setShowDeleteModal(false);
      }
      reset();

    } catch (error: any) {
      console.log("Create group failed:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const memberOptions =
    members && members.length > 0
      ? members.map((user: any) => ({ label: user?.fullname, value: user?._id }))
      : [
        { label: 'Add Member', value: 'add_member' },
      ];

  return (
    <ScrollView>
      <View style={styles.pageContainer}>
        <View style={styles.Vstack}>
          <View style={[styles.Hstack, { justifyContent: 'space-between', width: '100%' }]}>
            <Image source={avatar} style={styles.avatar} />
            <Button size='sm' onPress={() => goTo("EditProfile")}>Edit profile</Button>
          </View>
          <View style={[styles.Hstack]}>
            <Typography variant="h4" color={getColor("green", 700)}>{fullname!}</Typography>
            <Tag size='sm'>{title}</Tag>
          </View>
        </View>
        <View style={styles.cardLayout}>
          <View style={[styles.card]}>
            <View style={[styles.Hstack]}>
              <MisqaatIcon color={getColor("green", 500)} size={20} />
              <Typography variant="b4" color={getColor("green", 700)} style={{ fontWeight: 500 }}>ITS :</Typography>
            </View>
            <Typography variant="b4" color={getColor("green", 400)}>{userid}</Typography>
          </View>
          <View style={[styles.card]}>
            <View style={[styles.Hstack]}>
              <PhoneIcon color={getColor("green", 500)} size={20} />
              <Typography variant="b4" color={getColor("green", 700)} style={{ fontWeight: 500 }}>Contact :</Typography>
            </View>
            <Typography variant="b4" color={getColor("green", 400)}>{phone}</Typography>
          </View>
          <View style={[styles.card]}>
            <View style={[styles.Hstack]}>
              <MailIcon color={getColor("green", 500)} size={20} />
              <Typography variant="b4" color={getColor("green", 700)} style={{ fontWeight: 500 }}>Email :</Typography>
            </View>
            <Typography variant="b4" color={getColor("green", 400)}>a@sbcreations.com</Typography>
          </View>
          <View style={[styles.card]}>
            <View style={[styles.Hstack]}>
              <LocationIcon color={getColor("green", 500)} size={20} />
              <Typography variant="b4" color={getColor("green", 700)} style={{ fontWeight: 500 }}>Address :</Typography>
            </View>
            <Typography style={{ width: '70%' }} variant="b4" color={getColor("green", 400)}>{address}</Typography>
          </View>
          <View style={[styles.Hstack, { alignSelf: 'center' }]}>
            <Button size='md' onPress={() => handleLogout()} >Logout</Button>
            <Button variant='outline' color='red' size='md' onPress={() => setShowDeleteModal(true)}>Delete</Button>
          </View>
        </View>
        <Overlay />
      </View>


      <Modal
        transparent
        visible={showDeleteModal}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Typography variant="h5" color={getColor('green', 700)}>Confirm Delete</Typography>
            <Typography variant="b4" color={getColor('green', 400)}>
              Are you sure you want to delete {fullname}?
            </Typography>
            {
              selectedUser?.role !== 'member' &&
              <View>
                <Typography variant="b4" style={{ marginBottom: 8 }} color={getColor('green', 600)}>
                  (Select a member from your party to assign as the new admin)
                </Typography>
                <Controller
                  control={control}
                  name="fullname"
                  render={({ field: { onChange, value } }) => (
                    <Select
                      options={memberOptions ?? []}
                      value={value ?? undefined}
                      onSelect={(val) => {
                        setSelectedValue(val);
                        onChange(val);
                      }}
                      placeholder="Choose Admin"
                    />
                  )}
                />
                {errors.fullname?.message && <Typography variant='b4' color={getColor("red", 700)}>{errors.fullname?.message}</Typography>}
              </View>
            }
            <View style={[styles.Hstack, { justifyContent: 'flex-end', marginTop: 16 }]}>
              <Button size="sm" variant="outline" onPress={() => setShowDeleteModal(false)}>Cancel</Button>
              <Button size="sm" color="red" onPress={handleSubmit(onSubmit)}>{loading ? 'Deleting...' : 'Delete'}</Button>
            </View>
          </View>
        </View>
      </Modal>

      <AddMemberModal ref={addMemberRef} groupId={userGroup?._id!} name={userGroup?.name!} />
    </ScrollView>
  )
}

export default ProfileScreen


const styles = StyleSheet.create({
  pageContainer: {
      backgroundColor: getColor('light', 200),
      flex: 1,
      padding: 16,
      gap: 8,
      alignItems: "flex-start"
  },
  Hstack: {
      flexDirection: "row",
      gap: 8,
      alignItems: "center",
    flexWrap: 'wrap'
  },
  Vstack: {
    flexDirection: "column",
    gap: 8,
    alignItems: "flex-start",
    flexWrap: 'wrap'
  },
  borderB: {
    borderBottomWidth: 0.5,
    borderBottomColor: getColor('green'),
    paddingBottom: 8,
  },
  justifyBetween: {
      justifyContent: "space-between"
  },
  avatar: {
    width: 100,
    height: 100,
    shadowColor: 'rgba(0, 27, 23, 10)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
    borderRadius: 50,
    alignSelf: 'flex-start',
    borderWidth: 3,
    borderColor: getColor("green")
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
    flex: 1,
    width: '100%',
    borderColor: getColor('green', 700),
    borderWidth: 0.6,
    gap: 8
  },
  cardLayout: {
    gap: 16,
    flex: 1,
    width: '100%',

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
  
})