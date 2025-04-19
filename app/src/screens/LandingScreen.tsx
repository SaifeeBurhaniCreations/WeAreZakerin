import React from 'react'
import { StyleSheet, View, ImageBackground } from 'react-native'
import landingBg from '@/src/assets/images/landing-image.jpg'
import Button from '@/src/components/ui/Button'
import Typography from '../components/typography/Typography'
import { getColor } from '../constants/colors'
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from '../types'
import Logo from '../components/ui/Logo'

export type LandingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const LandingScreen = () => {
    const navigation = useNavigation<LandingScreenNavigationProp>();

    return (
        <ImageBackground source={landingBg} style={styles.background}>
            <View style={styles.overlay}>
                <View style={styles.contentContainer}>
                <Logo />

                    
                    <Typography variant='h2' color={getColor("light")}>
                        Login to  
                        <Typography variant='h2' color={getColor("green", 200)}>
                            { " " } WeAreZakereen
                        </Typography>
                    </Typography>

                    <Button full onPress={() => navigation.navigate("Login")}>Login</Button>
                </View>
            </View>
        </ImageBackground>
    )
}

export default LandingScreen

const styles = StyleSheet.create({
    background: {
        flex: 1,
        resizeMode: 'cover',
    },
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)', 
        padding: 20,
        paddingBottom: 120
    },
    contentContainer: {
        alignItems: 'center',  
        gap: 12,              
    },
})
