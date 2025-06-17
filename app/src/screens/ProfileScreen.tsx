import { Image, ScrollView, StyleSheet, View } from 'react-native'
import { Modal, Pressable, Text } from 'react-native';
import { getColor } from '../constants/colors'
import avatar from "@/src/assets/images/users/user-1.png"
import Typography from '../components/typography/Typography'
import MisqaatIcon from '../components/icons/MisqaatIcon'
import LocationIcon from '../components/icons/LocationIcon'
import Button from '../components/ui/Button'
import Tag from '../components/ui/Tag'
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { RootStackParamList } from '../types'
import MailIcon from '../components/icons/MailIcon'
import PhoneIcon from '../components/icons/PhoneIcon'
import Overlay from "../components/ui/Overlay"
import { useSecureStorageState } from '../hooks/useSecureStorageState'
import useAppNavigation from '../hooks/useAppNavigation'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../redux/store'
import { useEffect, useState } from 'react';
import { removeUser } from '../service/UserService';
import { handleRemoveUser } from '../redux/slices/UserSlice';
import { handleRemoveMemberFromGroup } from '../redux/slices/AddPartySlice';

const NavigationComp = () => {
  const { goTo } = useAppNavigation();

  useEffect(() => {
      goTo('Home');
  }, []);

  return (
    <View>
      <Typography variant='b3'>
        No Data
      </Typography>
    </View>
  )
}


type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditProfile'>;
type ProfileRouteProp = RouteProp<RootStackParamList, 'Profile'>;

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const route = useRoute<ProfileRouteProp>();

  const { id } = route.params || {};
  const { users } = useSelector((state: RootState) => state.users);
  const { groups } = useSelector((state: RootState) => state.modal);
  
  const { resetTo, goTo } = useAppNavigation();
  const seletedUser = users?.find(value => value?._id === id)

  useEffect(() => {
    if (!seletedUser) {
      goTo('Home');
    }
  }, [seletedUser]);

  if (!seletedUser) {
    return <NavigationComp />
  }

  const {fullname, userid, address, title, phone, belongsto, _id} = seletedUser!
  
  
  const userGroup = groups?.find(value => value.name === belongsto)
  const [, , removeMetaData] = useSecureStorageState<any>('metadata', null);
  const dispatch = useDispatch();
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);


  const handleLogout = async() => {
    await removeMetaData();
    resetTo("Landing");
  }

  const handleConfirmDelete = async() => {
    const response = await removeUser(userid)
    setLoading(true)
    if(response.status === 200) {
      setLoading(false)
      
      // setTimeout(()=>{dispatch(handleRemoveUser(userid))}, 2000)
      dispatch(handleRemoveMemberFromGroup({ name: userGroup?.name, id: _id }))
      goTo("Users", userGroup)
      setShowDeleteModal(false);
    }
  };
  

  return (
    <ScrollView>
      <View style={styles.pageContainer}>
        <View style={styles.Vstack}>
          <View style={[styles.Hstack, { justifyContent: 'space-between', width: '100%' }]}>
            <Image source={avatar} style={styles.avatar} />
            <Button size='sm' onPress={() => navigation.navigate("EditProfile")}>Edit profile</Button>
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
            <View style={[styles.Hstack, { justifyContent: 'flex-end', marginTop: 16 }]}>
              <Button size="sm" variant="outline" onPress={() => setShowDeleteModal(false)}>Cancel</Button>
              <Button size="sm" color="red" onPress={handleConfirmDelete}>{loading ? 'Deleting...' : 'Delete'}</Button>
            </View>
          </View>
        </View>
      </Modal>
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
    // paddingTop: 8,
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
    backgroundColor: getColor('light'),
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