import { Dimensions, StyleSheet, View } from 'react-native'
import { getColor } from '../constants/colors'
import Typography from '../components/typography/Typography'
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input'
import { EyeIcon, EyeOffIcon } from '@/components/ui/icon'
import Logo from '../components/ui/Logo'
import Button from '../components/ui/Button'
import { useState } from 'react'
import { RootStackParamList } from '../types'
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from "@react-navigation/native";
import { renderHexagonRow } from '../utils/hexagonUtils'
const SCREEN_WIDTH = Dimensions.get('window').width;

export type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [showPassword, setShowPassword] = useState(false)
  return (
    <View style={styles.pageContainer}>
   <View style={styles.hexagonBackground}>
        {Array.from({ length: 18 }, (_, index) => renderHexagonRow(index, SCREEN_WIDTH, getColor("green", 500, 0.5)))}
      </View>

      <View style={styles.loginContainer}>
      <Logo />

        <Typography variant='h2' color={getColor("green", 700)}>Login to your account</Typography>

        <View style={styles.loginInputContainer}>
        <Input
          variant="outline"
          size="xl"
          isInvalid={false}
          style={styles.input}
        >
          <InputField placeholder="ITS number" type={'text'}
          />
        </Input>
        <Input
          variant="outline"
          size="xl"
          isInvalid={false}
          style={styles.input}>
          <InputField placeholder="Password" type={showPassword? 'text' : 'password'}
          />

          <InputSlot onPress={() => setShowPassword(!showPassword)}>
            <InputIcon style={{ marginRight: 12 }} as={showPassword ? EyeOffIcon : EyeIcon }></InputIcon>
          </InputSlot>
        </Input>

        <Button full onPress={() => navigation.navigate("Home")}>Login</Button>
      </View>
      </View>
    </View>
  )
}

export default LoginScreen

const styles = StyleSheet.create({
  pageContainer: {
    backgroundColor: getColor("light", 200),
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24
  },
  hexagonBackground: {
    ...StyleSheet.absoluteFillObject, 
    justifyContent: "center",
    alignItems: "center",
  },
  loginContainer: {
    width: "100%",
    alignItems: "center",
    gap: 16,
    zIndex: 1,
  },
  loginInputContainer: {
    width: "100%",
    alignItems: "center",
    gap: 24,
  },
  input: {
    borderRadius: 8,
    backgroundColor: getColor("light", 200),
  },
})