import { StyleSheet, Text, View } from 'react-native'
import { getColor } from '../constants/colors'
import UserFlatList from '../components/ui/User/UserFlatList'

const UsersScreen = () => {
    return (
        <View style={styles.pageContainer}>
            <Text>UsersScreen</Text>
            <UserFlatList />
        </View>
    )
}

export default UsersScreen

const styles = StyleSheet.create({
    pageContainer: {
        backgroundColor: getColor('light', 200),
        flex: 1,
        padding: 16,
        gap: 16,
    },
})