import {
    Image,
    Pressable,
    StyleSheet,
    View,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import { getColor } from '../constants/colors';
import avatar from '@/src/assets/images/users/user-1.png';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import CameraIcon from '../components/icons/CameraIcon';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Overlay from "../components/ui/Overlay";

const EditProfileScreen = () => {
    const [avatarUri, setAvatarUri] = useState<string | null>(null);
    const [isPicking, setIsPicking] = useState(false);

    const handlePickImage = async () => {
        try {
            setIsPicking(true);
            const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                const { status: newStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (newStatus !== 'granted') {
                    alert('Permission is required to upload a profile photo.');
                    return;
                }
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

            if (!result.canceled) {
                setAvatarUri(result.assets[0].uri);
            }
        } catch (error) {
            console.error("Error picking image:", error);
        } finally {
            setIsPicking(false);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAwareScrollView
                contentContainerStyle={styles.pageContainer}
                keyboardShouldPersistTaps="handled"
                enableOnAndroid={true}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.avatarContainer}>
                    <Image source={avatarUri ? { uri: avatarUri } : avatar} style={styles.avatar} />
                    <Pressable style={styles.cameraIconWrapper} onPress={handlePickImage} disabled={isPicking}>
                        <CameraIcon color={getColor("green")} size={24} />
                    </Pressable>
                </View>

                <View style={styles.formContainer}>
                    <Input value="Aliasger Baroor" onChangeText={() => { }} placeholder="Your name">Name</Input>
                    <Input value="30346323" onChangeText={() => { }} placeholder="Your ITS">ITS</Input>
                    <Input value="1234567890" onChangeText={() => { }} placeholder="Your phone number" >Phone number</Input>
                    <Input value="a@sbcreations.com" onChangeText={() => { }} placeholder="Your Email" >Email</Input>
                    <Input value="Jamali mohalla, nurani nagar" onChangeText={() => { }} placeholder="Your Location" >Location</Input>
                </View>

                <View style={[styles.Hstack, styles.justifyCenter, styles.paddingTop20]}>
                    <Button>Save changes</Button>
                </View>
      <Overlay />
            </KeyboardAwareScrollView>
        </TouchableWithoutFeedback>
    );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
    pageContainer: {
        backgroundColor: getColor('light', 200),
        flexGrow: 1,
        padding: 16,
        gap: 16,
        paddingBottom: 24,
    },
    Hstack: {
        flexDirection: 'row',
        gap: 8,
    },
    justifyCenter: {
        justifyContent: 'center',
    },
    paddingTop20: {
        paddingTop: 20,
    },
    avatarContainer: {
        alignSelf: 'center',
        position: 'relative',
        width: 120,
        height: 120,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: getColor('green', 200),
    },
    cameraIconWrapper: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: getColor('light'),
        borderRadius: 20,
        padding: 6,
        borderWidth: 1,
        borderColor: getColor('green', 200),
    },
    formContainer: {
        gap: 16,
    },
});
