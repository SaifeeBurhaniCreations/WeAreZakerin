import { Image, StyleSheet, View } from 'react-native'
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
import { useSelector } from 'react-redux'
import { RootState } from '../redux/store'


type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditProfile'>;
type ProfileRouteProp = RouteProp<RootStackParamList, 'Profile'>;

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const route = useRoute<ProfileRouteProp>();

  const { id } = route.params || {};
  const { users } = useSelector((state: RootState) => state.users);

  const seletedUser = users?.find(value => value?._id === id)
  const {fullname, userid, address, title, phone} = seletedUser!

  const [, , removeMetaData] = useSecureStorageState<any>('metadata', null);
  const { resetTo } = useAppNavigation();


  const handleLogout = async() => {
    await removeMetaData();
    resetTo("Landing");
  }

  return (
    <View style={styles.pageContainer}>
      <Image source={avatar} style={styles.avatar} />
      <View style={[styles.Hstack]}>
      <Typography variant="h3" color={getColor("green", 700)}>{fullname}</Typography>
      <Tag size='sm'>{title}</Tag>
      </View>
      <View style={[styles.Hstack]}>
        <View style={[styles.Hstack]}>
          <MisqaatIcon color={getColor("green", 500)} size={20} />
          <Typography variant="b2" color={getColor("green", 700)}>ITS :</Typography>
        </View>
        <Typography variant="b2" color={getColor("green", 500)}>{userid}</Typography>
      </View>
      <View style={[styles.Hstack]}>
        <View style={[styles.Hstack]}>
          <PhoneIcon color={getColor("green", 500)} size={20} />
          <Typography variant="b2" color={getColor("green", 700)}>Contact :</Typography>
        </View>
        <Typography variant="b2" color={getColor("green", 500)}>{phone}</Typography>
      </View>
      <View style={[styles.Hstack]}>
        <View style={[styles.Hstack]}>
          <MailIcon color={getColor("green", 500)} size={20} />
          <Typography variant="b2" color={getColor("green", 700)}>Email :</Typography>
        </View>
        <Typography variant="b2" color={getColor("green", 500)}>a@sbcreations.com</Typography>
      </View>
      <View style={[styles.Hstack]}>
        <View style={[styles.Hstack]}>
          <LocationIcon color={getColor("green", 500)} size={20} />
          <Typography variant="b2" color={getColor("green", 700)}>Address :</Typography>
        </View>
        <Typography variant="b2" color={getColor("green", 600)}>{address}</Typography>
      </View>
      <View style={[styles.Hstack]}>
        <Button onPress={() => navigation.navigate("EditProfile")}>Edit profile</Button>
        <Button onPress={()=>handleLogout()} >Logout</Button>
      </View>
      <Overlay />

    </View>
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
  },
  justifyBetween: {
      justifyContent: "space-between"
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    borderWidth: 3,
    borderColor: getColor("green")
  },
})