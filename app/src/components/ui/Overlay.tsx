import { StyleSheet } from 'react-native'
import { getColor } from '../../constants/colors'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/store'
import { TouchableOpacity } from 'react-native'

const Overlay = () => {
    const { isOpen } = useSelector((state: RootState) => state.fab)

    if (isOpen) {
        return <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
        />
    }
}

export default Overlay

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: getColor('green', 500, 0.1),
        zIndex: 2,
    },
})