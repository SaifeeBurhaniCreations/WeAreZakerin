import { StyleSheet, View } from 'react-native'
import { getColor } from '@/src/constants/colors'
import Typography from '../../typography/Typography'

const LoaderScreen = () => {
    return (
        <View style={styles.pageContainer}>
            <View>
                <Typography variant='h1' color={getColor("dark")}>ذاكر حسين</Typography>
                <Typography variant='b2' color={getColor("dark")}>We are zakerin</Typography>
            </View>
        </View>
    )
}

export default LoaderScreen

const styles = StyleSheet.create({
    pageContainer: {
        backgroundColor: getColor("green"),
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

})