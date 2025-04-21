import { Image, StyleSheet, View } from 'react-native'
import { getColor } from '../constants/colors'
import avatar from "@/src/assets/images/users/user-1.png"
import Typography from '../components/typography/Typography'
import MisqaatIcon from '../components/icons/MisqaatIcon'
import LocationIcon from '../components/icons/LocationIcon'
import Button from '../components/ui/Button'
import Tag from '../components/ui/Tag'
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from '../types'

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditProfile'>;

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();

  return (
    <View style={styles.pageContainer}>
      <Image source={avatar} style={styles.avatar} />
      <View style={[styles.Hstack]}>
      <Typography variant="h3" color={getColor("green", 700)}>Aliasger Baroor</Typography>
      <Tag size='sm'>Admin</Tag>
      </View>
      <View style={[styles.Hstack]}>
        <MisqaatIcon color={getColor("green", 500)} size={20} />
        <Typography variant="b2" color={getColor("green", 500)}>30346323</Typography>
      </View>
      <View style={[styles.Hstack]}>
        <LocationIcon color={getColor("green", 500)} size={20} />
        <Typography variant="b2" color={getColor("green", 500)}>Jamali mohalla, nurani nagar</Typography>
      </View>
      <View style={[styles.Hstack]}>
        <Button onPress={() => navigation.navigate("EditProfile")}>Edit profile</Button>
        <Button>View Party</Button>
      </View>
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
      alignItems: "center"
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
    borderWidth: 3,
    borderColor: getColor("green")
  },
})