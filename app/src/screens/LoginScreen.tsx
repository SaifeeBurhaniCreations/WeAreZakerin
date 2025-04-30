import { Dimensions, StyleSheet, TextInput, View } from 'react-native'
import { getColor } from '../constants/colors'
import Typography from '../components/typography/Typography'
import Logo from '../components/ui/Logo'
import Button from '../components/ui/Button'
import { useState } from 'react'
import { RootStackParamList } from '../types'
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from "@react-navigation/native";
import { renderHexagonRow } from '../utils/hexagonUtils'
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as SecureStore from 'expo-secure-store';
import Input from '../components/ui/Input'
import loginSchema, { LoginFormData } from '../schemas/LoginSchema'
import EyeOffIcon from '../components/icons/EyeOffIcon'
import EyeIcon from '../components/icons/EyeIcon'

const SCREEN_WIDTH = Dimensions.get('window').width;

export type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });
  const onSubmit: SubmitHandler<LoginFormData> = async (data: any) => {
    try {
      setLoading(true);
      // const response = await LoginService(data);
      // if (response.status === 200) {
      //   const token = response.data.token;
      //   await SecureStore.setItemAsync('metadata', token);
      //   navigation.navigate('Main');
      // }
    } catch (error: any) {
      console.log('Login failed:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.pageContainer}>
   <View style={styles.hexagonBackground}>
        {Array.from({ length: 18 }, (_, index) => renderHexagonRow(index, SCREEN_WIDTH, getColor("green", 500, 0.5)))}
      </View>

      <View style={styles.loginContainer}>
      <Logo />

        <Typography variant='h2' color={getColor("green", 700)}>Login to your account</Typography>

        <View style={styles.loginInputContainer}>
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
                            keyboardType="phone-pad"
                            maxLength={8}
                          >
                            ITS number
                          </Input>
                        )}
                      />
        <Controller
                        control={control}
                        name="userpass"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <Input
                            placeholder="Enter Password"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            error={errors.userpass?.message}
                            secureTextEntry={true}
                            icon={showPassword ? <EyeOffIcon /> : <EyeIcon />}
                            post
                            onIconPress={() => setShowPassword(!showPassword)}>
                            Password
                          </Input>
                        )}
                      />
                          

<Button disabled={!isValid || loading} full onPress={handleSubmit(onSubmit)}>
  {loading ? 'Logging in...' : 'Login'}
</Button>
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
})