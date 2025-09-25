import { getColor } from '@/src/constants/colors'
import { StyleSheet, View, Pressable } from 'react-native'
import Typography from '../typography/Typography'
import BackIcon from '../icons/BackIcon'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { RootStackParamList } from '@/src/types/navigation'
import { PageHeaderProps } from '@/src/types'
import { useSecureStorageState } from '@/src/hooks/useSecureStorageState'
import useAppNavigation from '@/src/hooks/useAppNavigation'

const PageHeader = ({ title, goBack, canGoBack }: PageHeaderProps) => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [, , removeMetaData] = useSecureStorageState<any>('metadata', null);
    const { goTo, resetTo } = useAppNavigation()


    const handleLogout = async() => {
        await removeMetaData();
        resetTo("Landing");
    }

    const handleBackPress = () => {
        if (canGoBack) {
            goBack?.();
        } else {
            navigation.navigate('Home');
        }
    };

    return (
        <View style={styles.header}>
            <Pressable style={styles.iconWrapper} onPress={handleBackPress}>
                <BackIcon size={24} />
            </Pressable>
            <View style={styles.titleWrapper}>
                <Typography variant='h3' color={getColor("light")}>{title}</Typography>
            </View>
        </View>
    )
}

export default PageHeader


const styles = StyleSheet.create({
    header: {
        padding: 16,
        paddingTop: 8,
        backgroundColor: getColor("green"),
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    },
    iconWrapper: {
        position: "absolute",
        left: 16,
        top: "50%",
        transform: [{ translateY: -4 }],
    },
    titleWrapper: {
        flex: 1,
        alignItems: "center",
    },
})
